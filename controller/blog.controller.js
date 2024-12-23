const { failure, success } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Blog = require("../model/blog.model");

const getAllBlogs = async (req, res) => {
  try {
    const blog = await Blog.find();
    if (!blog.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("blog not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("blog fetched successfully", blog));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const addBlog = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("title and description are required"));
    }

    let imageFileName = "";
    if (req.files && req.files["image"]) {
      if (req.files.image[0]) {
        // Add public/uploads link to the image file
        imageFileName = `public/uploads/images/${req.files.image[0].filename}`;
      }
    }
    const blog = new Blog({
      title,
      description,
      image: imageFileName || "",
    });
    await blog.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("blog added successfully", blog));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const updateBlogById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("id is required"));
    }
    const { title, description } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("blog not found"));
    }
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    let imageFileName = "";
    if (req.files && req.files["image"]) {
      if (req.files.image[0]) {
        // Add public/uploads link to the image file
        imageFileName = `public/uploads/images/${req.files.image[0].filename}`;
        blog.image = imageFileName;
      }
    }
    await blog.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("blog updated successfully", blog));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const deleteBlogById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("id is required"));
    }
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("blog not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("blog deleted successfully", deletedBlog));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const getBlogById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("id is required"));
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("blog not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("blog fetched successfully", blog));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

module.exports = {
  addBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  getAllBlogs,
};
