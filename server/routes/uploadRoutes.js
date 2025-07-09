const express = require('express');
// const uploadController = require('../controllers/uploadController'); // Will be created later
const { protect, authorize } = require('../middleware/authMiddleware');
// const { CloudinaryStorage } = require('multer-storage-cloudinary'); // If using server-side Cloudinary upload via multer
// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const config = require('../config');

// // Configure Cloudinary (if doing server-side upload directly)
// cloudinary.config({
//   cloud_name: config.cloudinary.cloudName,
//   api_key: config.cloudinary.apiKey,
//   api_secret: config.cloudinary.apiSecret,
// });

// // Configure Multer storage for Cloudinary (example, if server handles upload)
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'furniture_store/products', // Example folder in Cloudinary
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
//     // transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Example transformation
//     public_id: (req, file) => `product-${Date.now()}-${file.originalname.split('.')[0]}`,
//   },
// });
// const parser = multer({ storage: storage });


const router = express.Router();

// This route is for client-side uploads to Cloudinary, where client informs server about the uploaded file.
// POST /api/v1/uploads/cloudinary-success
router.post('/cloudinary-success', protect, authorize('admin'), (req, res) => {
  // Placeholder for uploadController.handleCloudinarySuccess
  // req.body should contain info like public_id, url, resource_type, etc. from Cloudinary response
  // This controller would then save this info to the database, perhaps linking to a product or user.
  const { public_id, version, signature, width, height, format, resource_type, created_at, bytes, type, etag, placeholder, url, secure_url, original_filename } = req.body;

  // Basic validation example
  if (!secure_url || !public_id) {
    return res.status(400).json({ status: 'fail', message: 'Missing secure_url or public_id for Cloudinary upload.' });
  }

  // Log or process the received data
  console.log('Received Cloudinary upload success data:', req.body);

  // TODO: Implement controller logic to save this information
  // For example, create an Image record, or update a Product's images array.

  res.status(200).json({
    status: 'success',
    message: 'Cloudinary upload information received successfully. Controller logic pending.',
    data: { secure_url, public_id },
  });
});


// Admin routes for managing uploaded files (listing, deleting from Cloudinary and DB)
// These require admin privileges.
router.use(protect);
router.use(authorize('admin'));

// GET /api/v1/uploads - List uploaded files (from DB, which stores Cloudinary links)
router.get('/', (req, res) => {
  // Placeholder for uploadController.getAllUploadedFiles
  res.status(200).json({
    status: 'success',
    message: 'Get all uploaded files endpoint placeholder. Controller to be implemented.',
    // data: { files: [] }
  });
});

// DELETE /api/v1/uploads/:fileId - Delete a file (from Cloudinary and DB)
// :fileId could be the DB ID of the image record, or Cloudinary public_id if managed directly.
router.delete('/:fileId', (req, res) => {
  // Placeholder for uploadController.deleteUploadedFile
  const { fileId } = req.params;
  // TODO: Implement controller logic to:
  // 1. Delete from Cloudinary using its API.
  // 2. Delete the record from your database.
  res.status(200).json({
    status: 'success',
    message: `Delete file ${fileId} endpoint placeholder. Controller to be implemented.`,
  });
});

// Example if server handles direct upload to Cloudinary (less preferred for this project)
// router.post('/direct-upload-example', protect, authorize('admin'), parser.single('image'), (req, res) => {
//   // Placeholder for uploadController.directUploadExample
//   if (!req.file) {
//     return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
//   }
//   res.status(201).json({
//     status: 'success',
//     message: 'File uploaded successfully to Cloudinary via server.',
//     data: {
//       url: req.file.path, // URL from Cloudinary
//       public_id: req.file.filename // Public ID from Cloudinary
//     }
//   });
// });

module.exports = router;
