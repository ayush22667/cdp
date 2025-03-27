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
  const { userId, policyType } = req.body;

  console.log("Received check-clicks request with:", { userId, policyType });

  if (!userId || !policyType) {
    console.error("Missing userId or policyType in request");
    return res.status(400).json({ error: "Missing userId or policyType" });
  }
  const queryPayload = {
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
  };
  
  try {
    console.log("Sending Unomi event count query...");
    const response = await axios.post(
      `${process.env.UNOMI_API_URL}/cxs/query/profile/count`,
      queryPayload,
      {
        headers: {
          Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
          "Content-Type": "application/json"
        }
      }
    );

    const count = response.data;
    console.log(`Policy ${policyType} clicked ${count} times by user ${userId}`);

    if (count === 10) {
      console.log("Click threshold reached. Fetching user details...");
      const user = await User.findById(userId).select("name email");

      if (!user) {
        console.error("User not found in DB with ID:", userId);
        return res.status(404).json({ error: "User not found" });
      }

      console.log("User found. Adding to Mautic segment...");
      await addUserToSegment(user.name, user.email, policyType);

      console.log(`User ${user.email} added to segment for ${policyType}`);
    }

    res.json({ count });
  } catch (error) {
    console.error("Error occurred in Unomi segment check:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to check clicks" });
  }
};
