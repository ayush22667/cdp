const axios = require("axios")
const { subDays } = require("date-fns")
require("dotenv").config()

const baseURL = process.env.UNOMI_API_URL
const auth = {
  username: process.env.UNOMI_USER,
  password: process.env.UNOMI_PASS
}

async function getAllUserProfiles() {
  const payload = {
    offset: 0,
    limit: 1000,
    condition: {
      type: "matchAllCondition",
      parameterValues: {}
    }
  }

  const res = await axios.post(baseURL + "/cxs/profiles/search", payload, { auth })

  const uniqueUsers = new Map()
  res.data.list.forEach(profile => {
    const props = profile.properties || {}
    if (props.email && props.firstName && props.userId) {
      uniqueUsers.set(props.userId, {
        userId: props.userId,
        name: props.firstName + (props.lastName ? " " + props.lastName : ""),
        email: props.email
      })
    }
  })

  return Array.from(uniqueUsers.values())
}

async function getPurchasedPolicyCount(userId) {
  const payload = {
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

  const res = await axios.post(baseURL + "/cxs/query/profile/count", payload, { auth })
  return res.data.totalSize
}

async function getTotalClaimAmount(userId) {
  const payload = {
    condition: {
      type: "booleanCondition",
      parameterValues: {
        operator: "and",
        subConditions: [
          {
            type: "profilePropertyCondition",
            parameterValues: {
              propertyName: "properties.status",
              comparisonOperator: "exists"
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
  }

  try {
    const res = await axios.post(baseURL + "/cxs/profiles/search", payload, { auth })
    const profiles = res.data.list || []
    let totalAmount = 0

    profiles.forEach(profile => {
      const amount = profile.properties?.amount || 0
      totalAmount += amount
    })

    return totalAmount
  } catch (err) {
    console.error("Error fetching claim amount", err.response?.data || err.message)
    return 0
  }
}

async function getInactiveUsers() {
    const payload = {
      condition: {
        type: "profilePropertyCondition",
        parameterValues: {
          propertyName: "properties.loginTime",
          comparisonOperator: "exists"
        }
      },
      offset: 0,
      limit: 1000
    }
  
    try {
      const res = await axios.post(baseURL + "/cxs/profiles/search", payload, { auth })
      const oneMonthAgo = subDays(new Date(), 30).toISOString()
      const inactiveProfiles = []
  
      res.data.list.forEach(profile => {
        const loginTime = profile.properties?.loginTime
        const userId = profile.properties?.userId
        const email = profile.properties?.email
        const name = profile.properties?.firstName
  
        if (loginTime && loginTime < oneMonthAgo && email && userId && name) {
          inactiveProfiles.push({
            userId,
            email,
            name,
            loginTime
          })
        }
      })
  
      return inactiveProfiles
    } catch (err) {
      console.error("Error fetching inactive users:", err.response?.data || err.message)
      return []
    }
  }

  module.exports = {
    getAllUserProfiles,
    getPurchasedPolicyCount,
    getTotalClaimAmount,
    getInactiveUsers
  }
  