const Category = require("../model/category.model");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("name is required"));
    }
    const category = await Category.create({ name, description });
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Category created", category));
  } catch (error) {
    return failure(res, HTTP_STATUS.BAD_REQUEST, error.message);
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("id is required"));
    }
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("name is required"));
    }
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { name, description },
      { new: true }
    );
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Category updated", category));
  } catch (error) {
    return failure(res, HTTP_STATUS.BAD_REQUEST, error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("id is required"));
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Category deleted", category));
  } catch (error) {
    return failure(res, HTTP_STATUS.BAD_REQUEST, error.message);
  }
};

const getCategoryById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("id is required"));
    }
    const category = await Category.findById(req.params.id);
    return res.status(HTTP_STATUS.OK).send(success("Category found", category));
  } catch (error) {
    return failure(res, HTTP_STATUS.BAD_REQUEST, error.message);
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Categories found", categories));
  } catch (error) {
    return failure(res, HTTP_STATUS.BAD_REQUEST, error.message);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
};
