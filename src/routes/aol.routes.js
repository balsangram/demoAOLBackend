import { Router } from "express";
import {
  deleteUser,
  loginUser,
  logoutuser,
  OTPCheck,
  registerUser,
  updateDetails,
  userDetails,
} from "../controllers/user/user.controller.js";
import { displayHeadlines } from "../controllers/head.controller.js";
import { searchCard, showAllCards } from "../controllers/card.controller.js";
import {
  changeHomeLikeOrDislike,
  changeLikeOrDislike,
  changeStaticLikeOrDislike,
  favouriteCardDisplay,
  favouriteHomeCardDisplay,
  userType,
} from "../controllers/userType.controller.js";
import { action } from "../controllers/action.contoller.controller.js";
import YouTube from "../models/Youtube.model.js";
import { showMobileYoutubeLinks } from "../controllers/youTube.controller.js";
import { getAdvertisements } from "../controllers/adv.controller.js";
import { addSOSNumber } from "../controllers/sosController.controller.js";
import { displayPopUp } from "../controllers/popUp.controller.js";
import {
  getUserNotifications,
  userNotificationCount,
} from "../controllers/notification/sendNotificationToAll.controller.js";
import {
  addLiveLink,
  addLiveNewUpdate,
  clearnewLive,
  displayLiveLink,
  displayLiveNewUpdates,
  stopLiveLink,
} from "../controllers/liveLink.controller.js";
import { displayAllSocialMedia } from "../controllers/socialMedia.controller.js";
import {
  displayFooterCall,
  displayFooterDrop,
  displayFooterEmail,
  displayFooterMessage,
} from "../controllers/footerConnectWithUS.controller.js";
import { displayOnBoarding } from "../controllers/flutter/onBoading.controller.js";
import {
  getNames,
  getSingelCard,
} from "../controllers/Direction/direction.controller.js";
import { audioTour } from "../controllers/Direction/audiotour.controller.js";
import { addLinkLog } from "../controllers/linkLogs/linkLog.controller.js";

const router = Router();

//user
router.post("/userLogin", loginUser);
router.post("/userRegister", registerUser);
router.get("/getdetails/:id", userDetails);
router.patch("/updateUserDetails/:id", updateDetails);
router.post("/OTPCheck/:id", OTPCheck);
router.patch("/logout", logoutuser);
router.delete("/userDelete/:id", deleteUser);

//home card
router.get("/showAllCards/:headline", showAllCards);

//user Types
router.get("/userType", userType);

// favorite
router.post("/userType_importance/:id", changeLikeOrDislike);
router.post("/homeCard_importance/:id", changeHomeLikeOrDislike);
router.post("/staticCard_importance/:id", changeStaticLikeOrDislike);
router.get("/displayFavouriteInternal/:id", favouriteCardDisplay);
router.get("/displayFavouriteHome/:id", favouriteHomeCardDisplay);

// action
router.get("/displayAction/:usertype", action);

// YouTube links
router.get("/displayMobYoutubeLinks", showMobileYoutubeLinks);

// Advertising
router.get("/displayAdvertisement", getAdvertisements);

// sos
router.post("/sos", addSOSNumber);

// PopUp
router.get("/displayPopUp", displayPopUp);

//notifications
router.get("/notifications/:deviceId", getUserNotifications);
router.get("/userNotificationCount/:deviceId", userNotificationCount);

// search
router.get("/searchCard", searchCard);

// live videos
router.get("/display_live_link", displayLiveLink);
router.post("/add_live_link", addLiveLink);
router.delete("/clear_live_link", stopLiveLink);

// new live
router.post("/add_live_date_time", addLiveNewUpdate);
router.get("/display_live_date_time", displayLiveNewUpdates);
router.delete("/clear_live_link_date_time", clearnewLive);

// footer
// social media handel
router.get("/social_media", displayAllSocialMedia);
// contact with us
router.get("/footer_email", displayFooterEmail);
router.get("/footer_Call", displayFooterCall);
router.get("/footer_Message", displayFooterMessage);
router.get("/footer_Drop", displayFooterDrop);

// OnBoarding images
router.get("/display_On_Boarding", displayOnBoarding);

//direction
router.get("/get_direction_names/:directionusertype", getNames);
router.get("/get_perticular_card/:cardName", getSingelCard);

//audio tour
router.post("/audioTour", audioTour);

// linkLog
router.post("/addClick", addLinkLog);

export default router;
