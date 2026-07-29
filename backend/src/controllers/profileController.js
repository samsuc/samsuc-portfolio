
const { getProfile, updateProfile } = require('../services/profileStore');

function readProfile(req, res) {
  res.json({ success: true, profile: getProfile() });
}

function saveProfile(req, res) {
  try {
    const profile = updateProfile(req.body || {});
    res.json({ success: true, profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to save profile' });
  }
}

function uploadPortrait(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const url = '/uploads/' + req.file.filename;
  const profile = updateProfile({ portraitUrl: url });
  res.json({ success: true, url, profile });
}

function uploadCv(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const url = '/uploads/' + req.file.filename;
  const profile = updateProfile({ cvUrl: url });
  res.json({ success: true, url, profile });
}

module.exports = { readProfile, saveProfile, uploadPortrait, uploadCv };
