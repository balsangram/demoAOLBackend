import express from "express";
import { loginAdmin, registerAdmin } from "../controllers/admin.controller.js";
import { displayHeadlines } from "../controllers/head.controller.js";
import {
  cardSearch,
  createCard,
  removeCard,
  searchCard,
  showAllCards,
  updateCard,
} from "../controllers/card.controller.js";
import {
  addUserType,
  changeHomeLikeOrDislike,
  changeLikeOrDislike,
  changeStaticLikeOrDislike,
  deleteUserType,
  favouriteCardDisplay,
  favouriteHomeCardDisplay,
  singleHomeuserType,
  singleuserType,
  updateUserType,
  userType,
} from "../controllers/userType.controller.js";
import {
  addYoutubeLinks,
  deleteYoutubeLink,
  showMobileYoutubeLinks,
  showWebYoutubeLinks,
  updateYoutubeLink,
} from "../controllers/youTube.controller.js";
import {
  addAdvertisement,
  displayHistoryOfAdvertisement,
  getAdvertisements,
} from "../controllers/adv.controller.js";
// import UserType from "../models/UserType.model.js";
import {
  action,
  addAction,
  deleteAction,
  updateAction,
} from "../controllers/action.contoller.controller.js";

import {
  addPopUp,
  displayAllPopUp,
  displayPopUp,
} from "../controllers/popUp.controller.js";

import multer from "multer";
import {
  addSOSNumber,
  getLastSOSNumber,
} from "../controllers/sosController.controller.js";
import {
  addLiveLink,
  addLiveNewUpdate,
  clearnewLive,
  displayHistoryOfLive,
  displayLiveLink,
  displayLiveNewUpdates,
  stopLiveLink,
} from "../controllers/liveLink.controller.js";
import {
  addContactWithUS,
  deleteContactWithUS,
  displayAllContactWithUS,
  displayFooterCall,
  displayFooterDrop,
  displayFooterEmail,
  displayFooterMessage,
  updateContactWithUS,
} from "../controllers/footerConnectWithUS.controller.js";
import {
  addSocialMedia,
  deleteSocialMedia,
  displayAllSocialMedia,
  updateSocialMedia,
} from "../controllers/socialMedia.controller.js";
import {
  addOnBoarding,
  displayOnBoarding,
} from "../controllers/flutter/onBoading.controller.js";
import {
  get_action,
  get_Cards,
  get_LiveNewUpdates,
  get_searchCard,
  get_userType,
} from "../controllers/translation/allTranslated.controller.js";
import {
  add_direction,
  delete_direction,
  get_direction,
  getNames,
  getSingelCard,
  update_direction,
} from "../controllers/Direction/direction.controller.js";
import {
  countDeviceTokens,
  displayAllNotification,
  displayUser,
  getUserNotifications,
  saveAndSubscribeToken,
  searchUser,
  sendGroupNotification,
  sendNotificationToAll,
  sendSingleNotification,
  userNotificationCount,
} from "../controllers/notification/sendNotificationToAll.controller.js";
import {
  createGroupExcel,
  createGroupWithUser,
  deleteGroup,
  futureNotificaton,
  getAllGroupsWithDeviceTokens,
  updateGroupUser,
} from "../controllers/notification/group.controller.js";
import {
  deleteUser,
  loginUser,
  logoutuser,
  OTPCheck,
  registerUser,
  updateDetails,
  userDetails,
} from "../controllers/user/user.controller.js";
import {
  addLinkLog,
  displayHomeLinkLog,
  displayLinkLog,
} from "../controllers/linkLogs/linkLog.controller.js";
import {
  add_audioTour,
  audioTour,
  delete_audioTour,
  get_audioTour,
  update_audioTour,
} from "../controllers/Direction/audiotour.controller.js";
import AudioTour from "../models/direction/AudioTour.model.js";

//using multer for file handeling
const storage = multer.memoryStorage();
export const upload_V2 = multer({ storage });

// console.log(upload_V2, "upload_V2");

const router = express.Router();

// admin functionality
// router.post("/adminRegister", registerAdmin);
router.post("/adminLogin", loginAdmin);

// user
router.post("/userLogin", loginUser);
router.post("/userRegister", registerUser);
router.delete("/userDelete/:id", deleteUser);
router.get("/getdetails/:id", userDetails);
router.patch("/updateUserDetails/:id", updateDetails);

// user auth
router.post("/OTPCheck/:id", OTPCheck);
router.patch("/logout", logoutuser);

// Headings
router.get("/displayHeading", displayHeadlines);

//containers
router.get("/showAllCards/:headline", showAllCards);
// router.post("/createCard", upload_V2.single("img"), createCard);
router.post("/createCard", upload_V2.array("img"), createCard); //😊
router.patch("/updateCard/:id", upload_V2.array("img"), updateCard); //😊
router.delete("/removeCard/:id", removeCard);
router.get("/card_search", cardSearch);

//user Types
router.get("/userType", userType);
router.get("/userType/:id", singleuserType);
router.get("/userTypeHome/:id", singleHomeuserType);
router.post("/addUserType", upload_V2.array("img"), addUserType); //😊
router.patch("/updateUSerType/:id", upload_V2.array("img"), updateUserType); //😊
router.delete("/deleteUSerType/:id", deleteUserType);

// favorite
router.post("/userType_importance/:id", changeLikeOrDislike);
router.post("/homeCard_importance/:id", changeHomeLikeOrDislike);
router.post("/staticCard_importance/:id", changeStaticLikeOrDislike);

router.get("/displayFavouriteInternal/:id", favouriteCardDisplay);
router.get("/displayFavouriteHome/:id", favouriteHomeCardDisplay);
// router.get("/displayFavouriteStatic/:id", favouriteStaticCardDisplay);

//actions
router.get("/displayAction/:usertype", action);
router.post("/addAction", upload_V2.array("img"), addAction); //😊
router.patch("/updateAction/:id", upload_V2.array("img"), updateAction); //😊
router.delete("/deleteAction/:id", deleteAction);

// YouTube Link
router.post("/addYoutubeLinks", upload_V2.array("thumbnail"), addYoutubeLinks); //😊
router.get("/displayMobYoutubeLinks", showMobileYoutubeLinks);
router.get("/displayWebYoutubeLinks", showWebYoutubeLinks);
router.patch(
  "/updateYoutubeLink/:id",
  upload_V2.single("thumbnail"),
  updateYoutubeLink
);
router.delete("/deleteYoutubeLink/:id", deleteYoutubeLink);

// Advertising
router.post(
  "/addAdv",
  upload_V2.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
  ]),
  addAdvertisement
); //😊
router.get("/advertisement_history", displayHistoryOfAdvertisement);

// router.post("/addAdv", upload_V2.any(), addAdvertisement);
router.get("/displayAdvertisement", getAdvertisements);

// sos
router.post("/sos", addSOSNumber);
router.get("/sos/latest", getLastSOSNumber);

//pop-up
router.post("/addPopUp", upload_V2.array("img"), addPopUp); //👍
router.get("/displayPopUp", displayPopUp);
router.get("/displayAllPopUp", displayAllPopUp);

// notification
router.post("/sendNotificationToAll", sendNotificationToAll);
router.post("/sendSingleNotification", sendSingleNotification);
router.post("/deviceToken", saveAndSubscribeToken);
router.get("/display_notification", displayAllNotification);
router.get("/countDeviceTokens", countDeviceTokens);
router.get("/displayAllUSer", displayUser);

router.get("/future-notification", futureNotificaton);
// router.patch("/logout", logoutAndUnsubscribeToken);

router.get("/searchUser", searchUser);

router.get("/notifications/:deviceId", getUserNotifications);

router.get("/userNotificationCount/:deviceId", userNotificationCount);

// group
router.get("/displayAllGroup", getAllGroupsWithDeviceTokens);
router.post("/createGroup", createGroupWithUser);
router.post("/createGroupExel", createGroupExcel);
router.delete("/deleteGroup/:id", deleteGroup);
router.patch("/updateGroup/:id", updateGroupUser);

router.post("/sendGroupNotification", sendGroupNotification);

// search
router.get("/searchCard", searchCard);

// live videos
router.get("/display_live_link", displayLiveLink);
router.post("/add_live_link", addLiveLink);
router.delete("/clear_live_link", stopLiveLink);

router.post("/add_live_date_time", addLiveNewUpdate);
router.get("/display_live_date_time", displayLiveNewUpdates);
router.delete("/clear_live_link_date_time", clearnewLive);

router.get("/displayHistoryOfLive", displayHistoryOfLive);

// footer  =====
// social media handel
router.get("/social_media", displayAllSocialMedia);
router.post("/social_media", upload_V2.array("mediaImage"), addSocialMedia); //👍
router.patch(
  "/social_media/:id",
  upload_V2.array("mediaImage"),
  updateSocialMedia
); //👍
router.delete("/social_media/:id", deleteSocialMedia);
// contact with us

router.get("/footer_email", displayFooterEmail);
router.get("/footer_Call", displayFooterCall);
router.get("/footer_Message", displayFooterMessage);
router.get("/footer_Drop", displayFooterDrop);

router.get("/contact_with_us", displayAllContactWithUS);
router.post(
  "/contact_with_us",
  upload_V2.array("contactImage"),
  addContactWithUS
); //👍
router.patch(
  "/contact_with_us/:id",
  upload_V2.single("contactImage"),
  updateContactWithUS
); //
router.delete("/contact_with_us/:id", deleteContactWithUS);

// OnBoarding images
router.get("/display_On_Boarding", displayOnBoarding);
router.post("/add_On_Boarding", upload_V2.array("img"), addOnBoarding); //👍

// translate

// card
router.get("/Card_language/:headline/:language", get_Cards);
// action
router.get("/action_language/:usertype/:language", get_action);

// userType
router.get("/userType_language/:language", get_userType);

// search
router.get("/searchCard_language/:language", get_searchCard);

// live new update
router.get("/display_live_date_time_language/:language", get_LiveNewUpdates);

// direction
router.get("/display_direction", get_direction);
router.post("/add_direction", upload_V2.array("directionImg"), add_direction); // 👍
router.patch(
  "/update_direction/:id",
  upload_V2.array("directionImg"),
  update_direction
);
router.delete("/delete_direction/:id", delete_direction);

router.get("/get_direction_names/:directionusertype", getNames);
router.get("/get_perticular_card/:cardName", getSingelCard);

// audio tour
router.get("/display_audioTour", get_audioTour);
router.post(
  "/add_audioTour",
  upload_V2.fields([
    { name: "audioDirectionImg", maxCount: 1 },
    { name: "audioLink", maxCount: 1 },
  ]),
  add_audioTour
);
router.patch(
  "/update_audioTour/:id",
  upload_V2.fields([
    { name: "audioDirectionImg", maxCount: 1 },
    { name: "audioLink", maxCount: 1 },
  ]),
  update_audioTour
);
router.delete("/delete_audioTour/:id", delete_audioTour);
router.post("/audioTour", audioTour);

// linkLog

router.post("/addClick", addLinkLog);
router.get("/displayClick", displayLinkLog);

// router.post("/addHomeClick", addHomeLinkLog);
router.get("/displayHomeClick", displayHomeLinkLog);

export default router;
