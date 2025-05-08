const express = require("express");
const {
  GENDER_LIST_EN,
  GENDER_LIST_AR,
  maritalStatusList,
  religionList,
  typesValues,
  MIN_AGE,
  permissions,
  maxMinWatchTime,
} = require("../utils/constants");

const getConstants = (req, res, next) => {
  res.status(200).json({
    success: true,
    GENDER_LIST_EN,
    GENDER_LIST_AR,
    religionList,
    permissions,
    maritalStatusList,
    typesValues,
    MIN_AGE,
    maxMinWatchTime,
  });
};

// Router
const router = express.Router();

//  Routes
router.route("/").get(getConstants);

module.exports = router;
