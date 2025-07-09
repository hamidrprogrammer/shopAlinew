// const Product = require('../models/Product');
// const User = require('../models/User');
// const Image = require('../models/Image'); // If you have a dedicated Image model
const cloudinary = require('cloudinary').v2;
const config = require('../config');
// const AppError = require('../utils/appError');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

/**
 * Records information about a successfully uploaded Cloudinary file.
 * This service method is called after the client uploads directly to Cloudinary
 * and sends the successful upload response data to our server.
 *
 * @param {object} cloudinaryData - The response data from Cloudinary.
 * @param {string} [userId] - Optional: ID of the user who uploaded the file.
 * @param {string} [associatedEntityId] - Optional: ID of an entity (e.g., Product) this image is associated with.
 * @param {string} [associatedEntityType] - Optional: Type of the associated entity (e.g., 'Product', 'Category', 'UserAvatar').
 * @returns {object} The created database record for the uploaded image (or relevant info).
 */
exports.recordCloudinaryUpload = async (cloudinaryData, userId, associatedEntityId, associatedEntityType) => {
  // This is a placeholder. The actual implementation depends on how you store image references.
  // Option 1: Dedicated 'Image' or 'Upload' collection
  //   const newImage = await Image.create({
  //     public_id: cloudinaryData.public_id,
  //     url: cloudinaryData.secure_url,
  //     format: cloudinaryData.format,
  //     resource_type: cloudinaryData.resource_type,
  //     bytes: cloudinaryData.bytes,
  //     width: cloudinaryData.width,
  //     height: cloudinaryData.height,
  //     uploadedBy: userId, // If tracking uploader
  //     associatedEntity: associatedEntityId,
  //     associatedEntityType: associatedEntityType,
  //   });
  //   return newImage;

  // Option 2: Update an existing entity (e.g., Product's image array)
  //   if (associatedEntityType === 'Product' && associatedEntityId) {
  //     const product = await Product.findById(associatedEntityId);
  //     if (!product) throw new AppError('Product not found for image association', 404);
  //     product.images.push({
  //         url: cloudinaryData.secure_url,
  //         public_id: cloudinaryData.public_id, // Store public_id if you need to delete from Cloudinary later
  //         altText: cloudinaryData.original_filename || 'product image', // Or get from client
  //         isPrimary: product.images.length === 0 // Example: make first image primary
  //     });
  //     await product.save();
  //     return product.images[product.images.length -1]; // Return the added image info
  //   }

  console.log('UploadService: Recording Cloudinary upload:', cloudinaryData);
  // For now, just log and return the data as a placeholder.
  // This needs to be integrated with your actual data models.
  return {
    message: 'Placeholder: Upload recorded. Integrate with DB models.',
    data: cloudinaryData,
    userId,
    associatedEntityId,
    associatedEntityType
  };
};


/**
 * Retrieves a list of uploaded files (from your database).
 * @param {object} queryParams - Query parameters for filtering, pagination.
 */
exports.getAllFiles = async (queryParams) => {
  // --- TODO: Implement this based on how you store image/file references ---
  // Example if you have an 'Image' model:
  // const features = new APIFeatures(Image.find(), queryParams).filter().sort().paginate();
  // const files = await features.query;
  // return files;

  console.log('UploadService: Get all files (placeholder). Query:', queryParams);
  return [];
};

/**
 * Deletes a file from Cloudinary and its record from the database.
 * @param {string} fileIdentifier - Could be DB ID of the image record or Cloudinary public_id.
 * @param {string} [resourceType='image'] - Cloudinary resource type ('image', 'video', 'raw').
 * @returns {object} Result of the deletion.
 */
exports.deleteFile = async (fileIdentifier, resourceType = 'image') => {
  let publicIdToDelete = fileIdentifier;

  // --- TODO: Implement this based on how you store image/file references ---
  // Step 1: If fileIdentifier is a DB ID, fetch the record to get Cloudinary public_id.
  //   const imageRecord = await Image.findById(fileIdentifier);
  //   if (!imageRecord) throw new AppError('File record not found in database.', 404);
  //   publicIdToDelete = imageRecord.public_id;
  //   resourceType = imageRecord.resource_type || resourceType; // Get resource_type from DB if stored

  console.log(`UploadService: Attempting to delete file. Identifier: ${fileIdentifier}, Cloudinary public_id: ${publicIdToDelete}, Type: ${resourceType}`);

  try {
    const cloudinaryResult = await cloudinary.uploader.destroy(publicIdToDelete, { resource_type: resourceType });
    console.log('Cloudinary deletion result:', cloudinaryResult);

    if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
      // 'not found' is acceptable, means it's already gone from Cloudinary.
      // throw new AppError('Failed to delete file from Cloudinary.', 500);
      console.warn(`Cloudinary deletion for ${publicIdToDelete} resulted in: ${cloudinaryResult.result}`);
    }

    // Step 2: Delete the record from your database.
    //   if (imageRecord) await imageRecord.remove(); // Or Image.findByIdAndDelete(fileIdentifier);

    return {
        message: `File ${publicIdToDelete} processed for deletion. Cloudinary status: ${cloudinaryResult.result}. DB record deletion pending implementation.`,
        cloudinaryStatus: cloudinaryResult.result
    };

  } catch (error) {
    console.error(`Error in UploadService.deleteFile for ${publicIdToDelete}:`, error);
    // throw new AppError(`Error deleting file: ${error.message}`, 500);
    return { message: `Error deleting file ${publicIdToDelete}: ${error.message}`, error: true };
  }
};

// Add other utility functions related to uploads if needed, e.g., generating signed URLs for direct client upload.
// exports.generateCloudinarySignature = (paramsToSign) => {
//   return cloudinary.utils.api_sign_request(paramsToSign, config.cloudinary.apiSecret);
// };
