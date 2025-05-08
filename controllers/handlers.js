const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/ApiFeatures");

exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findById(id);
    if (!document)
      return next(new ApiError(`${model.modelName} is not found`, 404));
    const removed = await document.deleteOne();
    if (!removed)
      return next(
        new ApiError(
          `Error occurred while deleting the ${model.modelName.toLowerCase()}`,
          400
        )
      );
    res.status(200).json({
      success: true,
    });
  });

exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const updated = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return next(new ApiError(`${model.modelName} is not found`, 404));
    await updated.save();
    res.status(200).json({
      success: true,
      data: updated,
    });
  });

exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await model.create(req.body);
    const saved = await newDocument.save();
    res.status(201).json({
      success: true,
      data: saved.toJSON(),
    });
  });

exports.getOne = (model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    // Query
    let query = model.findById(req.params.id);
    // In user model remove password value
    if (model.modelName === "User") query = query.select("-password");
    // Population
    if (populationOpt) query = query.populate(populationOpt);
    // Api Features
    const apiFeatures = new ApiFeatures(query, req.query)
      .limitFields()
      .mongooseQueryExec();
    // Execute the query
    let doc = await apiFeatures.mongooseQuery;
    if (!doc[0] || doc.length === 0) return next(new ApiError(`${model.modelName} is not found`, 404));
    // Check if the item exists
    doc = doc[0].toJSON();
    // Response
    res.status(200).json({
      success: true,
      data: doc,
    });
  });

exports.getAll = (model) =>
  asyncHandler(async (req, res) => {
    // Filter Object
    let filter = {};
    if (req.filterObj) filter = req.filterObj;
    // ApiFeatures instance
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .limitFields()
      .sort();
    // Clone apiFeatures to get documents count after filterations
    const clonedApiFeatures = apiFeatures.clone().mongooseQueryExec();
    const docsCount = await clonedApiFeatures.mongooseQuery.countDocuments();
    // Paginate filtered documents
    apiFeatures.pagination(docsCount).mongooseQueryExec();
    // Fetch data
    const { mongooseQuery, paginationResult } = apiFeatures;
    let docs = await mongooseQuery;
    // Response
    res.status(200).json({
      success: true,
      results: docsCount,
      paginationResult,
      data: docs,
    });
  });
