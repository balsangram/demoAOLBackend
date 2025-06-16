import { futureNotificaton } from "../../controllers/notification/group.controller.js";
import express from "express";
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
} from "../../controllers/notification/sendNotificationToAll.controller.js";

const router = express.Router();

router.get("/", displayAllNotification);
router.post("/", sendNotificationToAll);

router.get("/token", countDeviceTokens);
router.post("/token", saveAndSubscribeToken);

router.get("/all-user", displayUser);

router.get("/up-coming", futureNotificaton);

router.post("/single", sendSingleNotification); // send notification to particular users
router.get("/user/:deviceId", getUserNotifications); // get notification based on user
router.get("/user-count/:deviceId", userNotificationCount); //how many notification are pending that display

router.get("/searchUser", searchUser);

router.post("/group", sendGroupNotification); //send notification to perticular group

export default router;

// notification
// router.post("/sendNotificationToAll", sendNotificationToAll);
// router.post("/sendSingleNotification", sendSingleNotification);
// router.post("/deviceToken", saveAndSubscribeToken);
// router.get("/display_notification", displayAllNotification);
// router.get("/countDeviceTokens", countDeviceTokens);
// router.get("/displayAllUSer", displayUser);
// router.get("/future-notification", futureNotificaton);
// router.get("/searchUser", searchUser);
// router.get("/notifications/:deviceId", getUserNotifications);
// router.get("/userNotificationCount/:deviceId", userNotificationCount);
// router.post("/sendGroupNotification", sendGroupNotification);
