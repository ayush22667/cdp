const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config(); // Load .env variables

const { getPolicyCountHandler } = require("../controllers/unomiController2");
const { getActiveProfiles } = require("../controllers/unomiController");
const {checkPolicyClickCountAndSegment} = require("../controllers/unomiController");

router.get("/policy-count", getPolicyCountHandler);
router.get("/active-profiles", getActiveProfiles);

router.post("/track", async (req, res) => {
  try {
    const baseUrl = process.env.UNOMI_API_URL;
    const url = `${baseUrl}/cxs/eventcollector`;

    const response = await axios.post(url, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error forwarding to Unomi:", err.message);
    res.status(500).json({ error: "Failed to send event to Unomi" });
  }
});

router.post("/check-clicks", checkPolicyClickCountAndSegment);


module.exports = router;
