const { failure, success } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

const homeContentModel = require("../model/homeContent.model");

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

module.exports = { getHomeContent, updateHomeContent };
