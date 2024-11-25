const Help = require("../model/help.model");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

const addHelp = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Both question and answer are required."));
    }

    const newHelp = await Help.create({
      question,
      answer,
    });

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Help added successfully", newHelp));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Update an existing FAQ
const updateHelp = async (req, res) => {
  try {
    const { helpId, question, answer } = req.body;

    if (!helpId || !question || !answer) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Help ID and question and answer are required."));
    }

    const updatedHelp = await Help.findByIdAndUpdate(
      helpId,
      { question, answer },
      { new: true }
    );

    if (!updatedHelp) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Help not found."));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Help updated successfully", updatedHelp));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Get all FAQs
const getAllHelps = async (req, res) => {
  try {
    const helps = await Help.find().sort({ createdAt: -1 });

    return res
      .status(HTTP_STATUS.OK)
      .send(success("helps fetched successfully", helps));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Delete an FAQ
const deleteHelp = async (req, res) => {
  try {
    const { helpId } = req.params;

    const deletedHelp = await Help.findByIdAndDelete(helpId);

    if (!deletedHelp) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(failure("help not found."));
    }

    return res
      .status(HTTP_STATUS.OK)
      .json(success("help deleted successfully", deletedHelp));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("Internal server error"));
  }
};
module.exports = {
  addHelp,
  updateHelp,
  getAllHelps,
  deleteHelp,
};
