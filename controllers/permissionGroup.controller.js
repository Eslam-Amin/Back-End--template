const PermissionGroup = require('../models/permissionGroup.model');
const handler = require('./handlers');

// @desc    Get all permission groups
// @route   GET /api/v1/permissionGroup
// @access  Private
exports.getPermissionGroups = handler.getAll(PermissionGroup);

// @desc    Add new permission group
// @route   POST /api/v1/permissionGroup
// @access  Private
exports.addPermissionGroup = handler.createOne(PermissionGroup);

// @desc    Update specific permission group
// @route   PATCH /api/v1/permissionGroup/:id
// @access  Private
exports.updatePermissionGroup = handler.updateOne(PermissionGroup);

// @desc    Delete specific permission group
// @route   DELETE /api/v1/permissionGroup/:id
// @access  Private
exports.deletePermissionGroup = handler.deleteOne(PermissionGroup);
