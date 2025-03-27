const { getAllUserProfiles, getPurchasedPolicyCount, getTotalClaimAmount, getInactiveUsers } = require("../services/unomiService")
const { createContact } = require("../services/mauticService")

module.exports = async function runUnomiToMauticSync() {
  try {
    const users = await getAllUserProfiles()

    for (const user of users) {
      try {
        const count = await getPurchasedPolicyCount(user.userId)
        const totalClaimAmount = await getTotalClaimAmount(user.userId)

        if (count > 10) {
          console.log(`${user.email} has ${count} purchases. Adding to segment 8.`)
          await createContact({
            name: user.name,
            email: user.email,
            segmentIds: 8
          })
        }

        if (totalClaimAmount > 15000) {
          console.log(`${user.email} has claims worth ₹${totalClaimAmount}. Adding to segment 9.`)
          await createContact({
            name: user.name,
            email: user.email,
            segmentIds: 9
          })
        }

      } catch (err) {
        console.error(`Error for user ${user.email}: ${err.message}`)
      }
    }

    const inactiveUsers = await getInactiveUsers()
    for (const user of inactiveUsers) {
      console.log(`${user.email} is inactive since ${user.loginTime}. Adding to segment 11.`)
      await createContact({
        name: user.name,
        email: user.email,
        segmentIds: 11
      })
    }

  } catch (err) {
    console.error(`Sync job failed: ${err.message}`)
  }
}
