const Admin = require('../models/admin.model.js');
const handler = require('./handlers');

// @desc    Get all admins
// @route   GET /api/v1/admin/getAllAdmins
// @access  Private
exports.getAllAdmins = handler.getAll(Admin);

// @desc    Add new admin
// @route   POST /api/v1/admin/addAdmin
// @access  Private
exports.addAdmin = handler.createOne(Admin);

// @desc    Update specific admin
// @route   PATCH /api/v1/admin/updateAdmin/:id
// @access  Private
exports.updateAdmin = handler.updateOne(Admin);

// @desc    Delete specific admin
// @route   DELETE /api/v1/admin/deleteAdmin/:id
// @access  Private
exports.deleteAdmin = handler.deleteOne(Admin);
