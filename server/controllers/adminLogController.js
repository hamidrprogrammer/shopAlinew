// const AdminLog = require('../models/AdminLog'); // Will be used by the service
const adminLogService = require('../services/adminLogService');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');

exports.getAllAdminLogs = catchAsync(async (req, res, next) => {
  // TODO: Implement pagination, filtering (by user, action, entity, date range), sorting
  // const features = new APIFeatures(AdminLog.find(), req.query)
  //   .filter()
  //   .sort()
  //   .limitFields()
  //   .paginate();
  // const logs = await features.query;

  const logs = await adminLogService.getAllLogs(req.query); // Pass query for filtering/pagination

  res.status(200).json({
    status: 'success',
    results: logs.length, // This might be total results if paginated in service
    data: {
      logs,
    },
  });
});

// It's unlikely we'd need to get a single log by ID often, but if so:
// exports.getAdminLogById = catchAsync(async (req, res, next) => {
//   const log = await adminLogService.getLogById(req.params.id);
//   if (!log) {
//     return next(new AppError('No log found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       log,
//     },
//   });
// });

// Admin logs are typically append-only, no update/delete via API for integrity.
// Deletion might be a cron job for old logs.
// Creation is done programmatically within other service/controller actions.
// e.g., await adminLogService.createLog(adminUserId, 'CREATE_PRODUCT', 'Product', newProduct._id, { name: newProduct.name });
