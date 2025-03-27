const axios = require('axios');
require("dotenv").config();
const { createContact, addUserToSegment } = require("../services/mauticService");
const User = require("../models/User");

const baseURL = process.env.UNOMI_API_URL;
// Create or Update Unomi Profile
exports.createOrUpdateProfile = async ({ userId, firstName, lastName, email }) => {
  if (!userId || !firstName || !lastName || !email) {
    throw new Error("Missing required fields for Unomi profile update.");
  }

  try {
    const response = await axios.post(
      `${baseURL}/cxs/profiles`,
      {
        properties: {
          userId,
          firstName,
          lastName,
          email
        }
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Unomi Profile Update Error:", error.message);
    throw error;
  }
};




exports.getActiveProfiles = async (req, res) => {
  try {

    const response = await axios.post(
      `${baseURL}/cxs/profiles/search`,
      {
        offset: 0,
        limit: 100,
        condition: {
          type: 'booleanCondition',
          parameterValues: {
            operator: 'and',
            subConditions: []
          }
        }
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );


    const profiles = response.data?.list || [];

    // Extract and count valid emails
    const emailCounts = profiles
      .map(profile => profile.properties?.email)
      .filter(email => email)
      .reduce((acc, email) => {
        acc[email] = (acc[email] || 0) + 1;
        return acc;
      }, {});

    // Convert to array and sort by count in descending order
    const sortedEmails = Object.entries(emailCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([email, count]) => ({ email, count }));

    res.status(200).json(sortedEmails);
  } catch (error) {
    console.error('POST request failed. Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};


exports.checkPolicyClickCountAndSegment = async (req, res) => {
  const { userId, policyType } = req.body

  console.log("Received check-clicks request with:", { userId, policyType })

  if (!userId || !policyType) {
    console.error("Missing userId or policyType in request")
    return res.status(400).json({ error: "Missing userId or policyType" })
  }

  const unomiHeaders = {
    Authorization: "Basic " + Buffer.from("karaf:karaf").toString("base64"),
    "Content-Type": "application/json"
  }

  const policyClickQuery = {
    type: "booleanCondition",
    parameterValues: {
      operator: "and",
      subConditions: [
        {
          type: "profilePropertyCondition",
          parameterValues: {
            propertyName: "properties.policyName",
            comparisonOperator: "equals",
            propertyValue: policyType
          }
        },
        {
          type: "profilePropertyCondition",
          parameterValues: {
            propertyName: "properties.userID",
            comparisonOperator: "equals",
            propertyValue: userId
          }
        }
      ]
    }
  }

  const totalClickQuery = {
    type: "profilePropertyCondition",
    parameterValues: {
      propertyName: "properties.userID",
      comparisonOperator: "equals",
      propertyValue: userId
    }
  }

  try {
    const user = await User.findById(userId).select("name email")
    if (!user) {
      console.error("User not found in DB with ID:", userId)
      return res.status(404).json({ error: "User not found" })
    }

    console.log("Sending Unomi policy-specific click count query...")
    const policyClickRes = await axios.post(
      process.env.UNOMI_API_URL + "/cxs/query/profile/count",
      policyClickQuery,
      { headers: unomiHeaders }
    )

    const policyClickCount = policyClickRes.data
    console.log("User clicked " + policyClickCount + " times on " + policyType)

    if (policyClickCount === 10) {
      console.log("Click threshold 10 reached. Adding to policy-based segment...")
      await addUserToSegment(user.name, user.email, policyType)
    }

    console.log("Sending Unomi total click count query...")
    const totalClickRes = await axios.post(
      process.env.UNOMI_API_URL + "/cxs/query/profile/count",
      totalClickQuery,
      { headers: unomiHeaders }
    )

    const totalClicks = totalClickRes.data
    console.log("Total clicks across all policies: " + totalClicks)

    if (totalClicks >= 100) {
      console.log("Checking if user has purchased any policy...")

      const purchaseQuery = {
        type: "booleanCondition",
        parameterValues: {
          operator: "and",
          subConditions: [
            {
              type: "profilePropertyCondition",
              parameterValues: {
                propertyName: "properties.itemType",
                comparisonOperator: "equals",
                propertyValue: "Purchased Policy"
              }
            },
            {
              type: "profilePropertyCondition",
              parameterValues: {
                propertyName: "properties.userId",
                comparisonOperator: "equals",
                propertyValue: userId
              }
            }
          ]
        }
      }

      const purchaseCheck = await axios.post(
        process.env.UNOMI_API_URL + "/cxs/query/profile/count",
        purchaseQuery,
        { headers: unomiHeaders }
      )

      const purchaseCount = purchaseCheck.data

      if (purchaseCount === 0) {
        console.log("User has 100+ clicks and no purchase. Adding to segment 12.")
        await createContact({
          name: user.name,
          email: user.email,
          segmentIds: 10
        })
      } else {
        console.log("User has purchased at least one policy. Not adding to segment 12.")
      }
    }

    res.json({
      specificPolicyClickCount: policyClickCount,
      totalClickCount: totalClicks
    })
  } catch (error) {
    console.error("Error occurred in Unomi segment check:", error.response ? error.response.data : error.message)
    res.status(500).json({ error: "Failed to check clicks" })
  }
}