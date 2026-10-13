/**
 * Very small image upload used by the admin "Add / Edit Product" screen.
 *
 * expo-image-picker can return a picked photo as a base64 string, so we avoid
 * multipart form uploads entirely (fewer libraries, works fine in Expo Go).
 * The file is written to backend/uploads and served as a static URL.
 */
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const uploadController = {
  /** POST /api/uploads  body: { base64, mimeType } */
  uploadImage(req, res) {
    const { base64, mimeType = 'image/jpeg' } = req.body || {};

    if (typeof base64 !== 'string' || base64.length < 50) {
      throw ApiError.badRequest('No image data was received.');
    }
    const extension = ALLOWED_TYPES[mimeType];
    if (!extension) throw ApiError.badRequest('Only JPG, PNG or WEBP images are allowed.');

    // Accept both a raw base64 string and a full "data:image/...;base64,..." URI.
    const raw = base64.includes(',') ? base64.split(',').pop() : base64;
    const buffer = Buffer.from(raw, 'base64');
    if (buffer.length > MAX_BYTES) throw ApiError.badRequest('Image is larger than 4 MB.');

    const fileName = `item-${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buffer);

    // A relative URL keeps the database independent of the computer's IP address.
    res.status(201).json({ success: true, url: `/uploads/${fileName}` });
  },
};

module.exports = uploadController;
