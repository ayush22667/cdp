console.log("Cron jobs loaded");

const cron = require("node-cron");
const sendPolicyReminders = require("./sendReminders");
const runUnomiToMauticSync = require("./unomiToMauticSync");

cron.schedule("0 9 * * *", async () => {
  console.log("Sending reminders...");
  await sendPolicyReminders();
});

cron.schedule("0 9 * * *", async () => {
  console.log("Syncing Unomi users to Mautic...");
  await runUnomiToMauticSync();
});
