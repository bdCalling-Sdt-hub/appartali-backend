const { failure, success } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

const homeContentModel = require("../model/homeContent.model");
const aboutContentModel = require("../model/aboutContent.model");

const getHomeContent = async (req, res) => {
  try {
    const homeContent = await homeContentModel.findOne();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("home content retrieved", homeContent));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const updateHomeContent = async (req, res) => {
  try {
    const { heroTitle, heroDescription, roomsTitle, propertyTitle } = req.body;
    const homeContent = await homeContentModel.findOne();

    if (homeContent) {
      homeContent.heroTitle = heroTitle || homeContent.heroTitle;
      homeContent.heroDescription =
        heroDescription || homeContent.heroDescription;
      homeContent.roomsTitle = roomsTitle || homeContent.roomsTitle;
      homeContent.propertyTitle = propertyTitle || homeContent.propertyTitle;
      await homeContent.save();
      return res
        .status(HTTP_STATUS.OK)
        .send(success(homeContent, "home content updated"));
    }

    const newHomeContent = new homeContentModel({
      heroTitle,
      heroDescription,
      roomsTitle,
      propertyTitle,
    });
    await newHomeContent.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success(newHomeContent, "home content created"));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const getAboutContent = async (req, res) => {
  try {
    const aboutContent = await aboutContentModel.findOne();
    if (!aboutContent) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("about content not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("about content retrieved", aboutContent));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const updateAboutContent = async (req, res) => {
  try {
    const {
      heroTitle,
      heroDescription,
      mainTitle,
      firstStepTitle,
      firstStepDescription,
      secondStepTitle,
      secondStepDescription,
    } = req.body;
    const aboutContent = await aboutContentModel.findOne();
    if (aboutContent) {
      aboutContent.heroTitle = heroTitle || aboutContent.heroTitle;
      aboutContent.heroDescription =
        heroDescription || aboutContent.heroDescription;
      aboutContent.mainTitle = mainTitle || aboutContent.mainTitle;
      aboutContent.firstStepTitle =
        firstStepTitle || aboutContent.firstStepTitle;
      aboutContent.firstStepDescription =
        firstStepDescription || aboutContent.firstStepDescription;
      aboutContent.secondStepTitle =
        secondStepTitle || aboutContent.secondStepTitle;
      aboutContent.secondStepDescription =
        secondStepDescription || aboutContent.secondStepDescription;
      await aboutContent.save();
      return res
        .status(HTTP_STATUS.OK)
        .send(success(aboutContent, "about content updated"));
    }
    if (
      !heroTitle ||
      !heroDescription ||
      !mainTitle ||
      !firstStepTitle ||
      !firstStepDescription ||
      !secondStepTitle ||
      !secondStepDescription
    ) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("all fields are required"));
    }
    const newAboutContent = new aboutContentModel({
      heroTitle,
      heroDescription,
      mainTitle,
      firstStepTitle,
      firstStepDescription,
      secondStepTitle,
      secondStepDescription,
    });
    await newAboutContent.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success(newAboutContent, "about content created"));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

module.exports = {
  getHomeContent,
  updateHomeContent,
  getAboutContent,
  updateAboutContent,
};
