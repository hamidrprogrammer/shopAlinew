// const UploadService = require('../services/uploadService'); // If complex logic is needed
// const Product = require('../models/Product'); // Example if linking uploads to products
// const User = require('../models/User'); // Example if linking uploads to users (e.g. avatars)
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configure Cloudinary - this should ideally be in a central config file or service
// but placed here for visibility if this controller directly interacts with Cloudinary API for deletion.
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});


exports.handleCloudinarySuccess = catchAsync(async (req, res, next) => {
  const uploadData = req.body;

  // Basic validation of received data from client-side Cloudinary upload
  if (!uploadData.secure_url || !uploadData.public_id) {
    return next(new AppError('Cloudinary upload data is missing secure_url or public_id.', 400));
  }

  // --- TODO: Implement Service Logic ---
  // const savedImageRecord = await UploadService.recordCloudinaryUpload(uploadData, req.user.id);
  // This service method would:
  // 1. Potentially create a record in an 'Images' or 'Uploads' collection.
  // 2. Or, if the upload is tied to a specific entity (e.g., product being created/updated),
  //    it might update that entity's image array. This often requires context (e.g., productId).
  //    For instance, the client might send `productId` along with `uploadData`.

  console.log('Cloudinary success data received by server:', uploadData);
  // For now, just return success with the key data.
  // Actual DB interaction will be in the service.

  res.status(200).json({
    status: 'success',
    message: 'Cloudinary upload data processed by server.',
    data: {
      public_id: uploadData.public_id,
      url: uploadData.secure_url,
      format: uploadData.format,
      resource_type: uploadData.resource_type,
      // Potentially return a DB record ID if one was created.
    },
  });
});

exports.getAllUploadedFiles = catchAsync(async (req, res, next) => {
  // --- TODO: Implement Service Logic ---
  // This would typically fetch records from your 'Images' or 'Uploads' collection,
  // or aggregate image URLs from other collections like Products.
  // const files = await UploadService.getAllFiles(req.query); // req.query for pagination/filtering

  console.log('Request to get all uploaded files (placeholder)');
  res.status(200).json({
    status: 'success',
    message: 'Placeholder: Get all uploaded files. Service logic to be implemented.',
    results: 0,
    data: {
      files: [],
    },
  });
});

exports.deleteUploadedFile = catchAsync(async (req, res, next) => {
  const { fileId } = req.params; // This could be a DB ID or Cloudinary public_id

  // --- TODO: Implement Service Logic ---
  // const result = await UploadService.deleteFile(fileId, req.user.id);
  // The service method would:
  // 1. If fileId is a DB ID, retrieve the Cloudinary public_id.
  // 2. Call Cloudinary API to delete the file:
  //    await cloudinary.uploader.destroy(public_id, { resource_type: 'image' or 'raw' or 'video' });
  // 3. Delete the record from your database.

  console.log(`Request to delete file: ${fileId} (placeholder)`);

  // Example direct Cloudinary deletion (if fileId is public_id and you know resource_type)
  // For a real app, this logic should be in a service and be more robust.
  // try {
  //   const result = await cloudinary.uploader.destroy(fileId); // Assumes image, add resource_type if not
  //   console.log('Cloudinary deletion result:', result);
  //   if (result.result !== 'ok' && result.result !== 'not found') { // 'not found' is okay if already deleted
  //       return next(new AppError('Failed to delete file from Cloudinary.', 500));
  //   }
  //   // Then delete from DB
  // } catch (error) {
  //   return next(new AppError(`Error deleting file from Cloudinary: ${error.message}`, 500));
  // }

  res.status(200).json({ // Should be 204 if successful and no content returned.
                         // Or 200 with a success message.
    status: 'success',
    message: `Placeholder: File ${fileId} deletion. Service logic to be implemented.`,
  });
});
