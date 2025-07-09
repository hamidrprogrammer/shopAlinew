class APIFeatures {
  /**
   * Constructor for APIFeatures.
   * @param {mongoose.Query} query - The Mongoose query object (e.g., Model.find()).
   * @param {object} queryString - The query string object from Express (req.query).
   */
  constructor(query, queryString) {
    this.query = query; // Mongoose query
    this.queryString = queryString; // req.query from Express
  }

  /**
   * Filters the query based on query string parameters.
   * Excludes special parameters like 'page', 'sort', 'limit', 'fields'.
   * Allows for advanced filtering like [gte], [gt], [lte], [lt].
   * Example: /api/products?price[gte]=100&ratingsAverage[lt]=4.5&difficulty=easy
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // Example: { price: { $gte: 100 } }

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // Return the entire object to allow chaining
  }

  /**
   * Sorts the query results.
   * Allows sorting by multiple fields, separated by commas.
   * Default sort order is ascending. Prefix with '-' for descending.
   * Example: /api/products?sort=-price,ratingsAverage  (sort by price descending, then ratingsAverage ascending)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // Mongoose expects space-separated fields for sorting
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort if nothing is specified (e.g., by creation date descending)
      this.query = this.query.sort('-createdAt _id'); // _id for tie-breaking
    }
    return this;
  }

  /**
   * Limits the fields returned in the query results (projection).
   * Allows selecting specific fields, separated by commas.
   * Prefix with '-' to exclude fields.
   * Example: /api/products?fields=name,price,ratingsAverage  (include only these fields)
   * Example: /api/products?fields=-description,-slug (exclude these fields)
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Default: exclude the __v field
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Paginates the query results.
   * Uses 'page' and 'limit' query parameters.
   * Example: /api/products?page=2&limit=10 (show 10 results on page 2)
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100; // Default limit (e.g., 100)
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // Note: If you need to know the total number of documents for pagination on the client,
    // you would typically run a countDocuments query separately *before* pagination.
    // Example:
    // if (this.queryString.page) {
    //   const numDocuments = await this.query.model.countDocuments(); // Get model from query
    //   if (skip >= numDocuments && numDocuments > 0) { // numDocuments > 0 check to avoid error on empty collection
    //      // Throw an error or handle appropriately if page is out of bounds
    //      // For now, Mongoose will just return an empty array if skip is too large.
    //   }
    // }
    return this;
  }
}

module.exports = APIFeatures;
