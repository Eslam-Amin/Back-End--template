class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    // Mongoose query
    this.mongooseQuery = mongooseQuery;
    // req.query
    this.queryString = queryString;
    // find query string (filter)
    this.findQuery = {};
    // Language
    this.mongooseQuery.lang = this.queryString.lang
      ? queryString.lang.split(",").join(" ")
      : "en";
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-updatedAt");
    }
    return this;
  }

  limitFields() {
    const lang = this.mongooseQuery.lang;
    const noFieldLang = lang === "en" ? "-ar" : lang === "ar" ? "-en" : "";
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(`${fields} ${lang}`);
    } else {
      this.mongooseQuery = this.mongooseQuery.select(`${noFieldLang} -__v`);
    }
    return this;
  }

  pagination(docCount) {
    // Values
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;
    // Pagination object
    const pagination = {};
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(docCount / limit);
    pagination.currentPage = page;
    if (endIndex < docCount) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;
    // Add pagination values to mongoose query
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    // Final pagination object values
    this.paginationResult = pagination;
    return this;
  }

  mongooseQueryExec() {
    this.mongooseQuery = this.mongooseQuery.find(this.findQuery);
    return this;
  }

  clone() {
    // Create a new mongoose query instance
    const clonedMongooseQuery = this.mongooseQuery.model.find();
    // Clone the conditions
    clonedMongooseQuery._conditions = { ...this.mongooseQuery._conditions };
    // Clone other properties as needed
    clonedMongooseQuery.options = { ...this.mongooseQuery.options };
    clonedMongooseQuery._fields = { ...this.mongooseQuery._fields };
    clonedMongooseQuery._update = { ...this.mongooseQuery._update };
    // Create a new ApiFeatures instance
    const clonedApiFeatures = new ApiFeatures(
      clonedMongooseQuery,
      this.queryString
    );
    // Clone the find query
    clonedApiFeatures.findQuery = { ...this.findQuery };
    // Return the cloned ApiFeatures instance
    return clonedApiFeatures;
  }
}

module.exports = ApiFeatures;
