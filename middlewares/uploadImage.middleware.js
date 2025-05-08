const multer = require("multer");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();
  const upload = multer({ storage: multerStorage });
  return upload;
};

exports.uploadSingleFile = (fieldName) => multerOptions().single(fieldName);
