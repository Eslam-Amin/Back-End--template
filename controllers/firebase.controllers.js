const dotenv = require("dotenv");
dotenv.config();

const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

initializeApp(config);

const storage = getStorage();

const folderName = "posts";

exports.firebaseUpload = asyncHandler(async (req, res, next) => {
  try {
    const image = req.files?.find((file) => file.fieldname === "media");
    req.body.url = await uploadImageAndGetUrl(image);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

const uploadImageAndGetUrl = async (image) => {
  // Downgrade image quality
  const processedImageBuffer = await sharp(image.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toBuffer();
  // Upload image
  const storageRef = ref(
    storage,
    `${folderName}/${`image-${uuidv4()}-${Date.now()}-cover.jpeg`}`
  );
  const metadata = { contentType: "image/jpeg" };
  // Add image download URL to request body
  const snapshot = await uploadBytesResumable(
    storageRef,
    processedImageBuffer,
    metadata
  );
  return await getDownloadURL(snapshot.ref);
};

exports.firebaseDelete = async (fileUrl) => {
  try {
    const fullPath = new URL(fileUrl).pathname;
    const startIndex = fullPath.indexOf("image-");
    const fileName = fullPath.substring(startIndex);
    const storageRef = ref(storage, `${folderName}/${fileName}`);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    return false;
  }
};
