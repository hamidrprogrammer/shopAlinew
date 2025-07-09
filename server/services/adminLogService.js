const AdminLog = require('../models/AdminLog');
const APIFeatures = require('../utils/apiFeatures'); // Assuming you have this utility

/**
 * Creates a new admin log entry.
 * @param {string} userId - The ID of the admin user performing the action.
 * @param {string} action - A string code representing the action (e.g., 'CREATE_PRODUCT').
 * @param {string} [entity] - Optional: The type of entity affected (e.g., 'Product').
 * @param {string|mongoose.Types.ObjectId} [entityId] - Optional: The ID of the affected entity.
 * @param {object} [details] - Optional: An object containing additional details about the action.
 * @param {string} [ipAddress] - Optional: IP address of the admin.
 */
exports.createLog = async (userId, action, entity, entityId, details, ipAddress) => {
  try {
    await AdminLog.create({
      user: userId,
      action,
      entity,
      entityId,
      details,
      ipAddress,
      timestamp: new Date(),
    });
    // No need to return the log usually, but you can if needed for some reason.
  } catch (error) {
    // Log the error, but don't let logging failure break the main operation.
    console.error('Failed to create admin log:', error);
    // Depending on severity, you might want to use a more robust logging system (e.g., Winston)
    // or send an alert if admin logging consistently fails.
  }
};

/**
 * Retrieves all admin logs with filtering, sorting, and pagination.
 * @param {object} queryParams - Query parameters from the request (e.g., req.query).
 */
exports.getAllLogs = async (queryParams) => {
  // Example: Using APIFeatures utility if you have one
  const features = new APIFeatures(AdminLog.find().populate('user', 'name email'), queryParams)
    .filter() // Allow filtering by user, action, entity, date range etc.
    .sort()   // Default sort by timestamp descending
    .limitFields() // Should not be needed much for logs, but good practice
    .paginate();

  const logs = await features.query;

  // If you need total count for pagination metadata:
  // const totalLogs = await new APIFeatures(AdminLog.find(), queryParams).filter().count();
  // return { logs, totalLogs };

  return logs; // Or return an object { data: logs, total: ... } for pagination
};

/**
 * Retrieves a single admin log by its ID.
 * (Less common to fetch single logs by ID, usually queried by context)
 * @param {string} logId - The ID of the log entry.
 */
// exports.getLogById = async (logId) => {
//   return await AdminLog.findById(logId).populate('user', 'name email');
// };

// Note: Admin logs are typically not updated or deleted via API to maintain audit trail integrity.
// Old logs might be archived or deleted via a separate scheduled process/script.
