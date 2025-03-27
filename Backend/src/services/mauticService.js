const axios = require("axios");
require("dotenv").config();

const baseURL = process.env.MAUTIC_BASE_URL;
const auth = {
  username: process.env.MAUTIC_USER,
  password: process.env.MAUTIC_PASS,
};

// Policy type → Segment ID mapping
const segmentMap = {
  Health: 3,
  Life: 4,
  Travel: 5,
  Auto: 7,
  Business: 6,
};

// Get segment ID for a policy type
function getSegmentId(policyType) {
  return segmentMap[policyType] || 3;
}

// Create a contact in Mautic and optionally assign to segments
async function createContact({ name, email, segmentIds }) {
  try {
    // Check if contact already exists
    const existing = await axios.get(`${baseURL}/api/contacts`, {
      params: { search: email },
      auth
    });

    const existingContact = Object.values(existing.data.contacts || {}).find(
      (contact) => contact.email === email
    );

    let contactId;

    if (existingContact) {
      contactId = existingContact.id;
      console.log(`Contact already exists with ID: ${contactId}`);
    } else {
      // Create new contact
      const res = await axios.post(`${baseURL}/api/contacts/new`, {
        firstname: name,
        email: email,
      }, { auth });

      contactId = res.data.contact.id;
      console.log(`New contact created with ID: ${contactId}`);
    }

    // Add to segment(s)
    if (segmentIds) {
      const ids = Array.isArray(segmentIds) ? segmentIds : [segmentIds];

      for (const id of ids) {
        await axios.post(`${baseURL}/api/segments/${id}/contact/${contactId}/add`, null, { auth });
        console.log(`Added contact ${contactId} to segment ${id}`);
      }
    }

    return contactId;
  } catch (err) {
    console.error("Mautic error:", err.response?.data || err.message);
    throw err;
  }
}

// Add user to Mautic contact & relevant segment based on policy type
async function addUserToSegment(name, email, policyType) {
  const segmentId = getSegmentId(policyType);
  if (!segmentId) {
    console.warn(`No segment mapped for policy type: ${policyType}`);
    return null;
  }

  return await createContact({ name, email, segmentIds: segmentId });
}

module.exports = {
  createContact,
  getSegmentId,
  addUserToSegment
};
