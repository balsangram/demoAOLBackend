import express from "express";
import {
  addLiveLink,
  addLiveNewUpdate,
  clearnewLive,
  displayHistoryOfLive,
  displayLiveLink,
  stopLiveLink,
} from "../../controllers/liveLink.controller.js";
import { get_LiveNewUpdates } from "../../controllers/translation/allTranslated.controller.js";

const router = express.Router();

router.get("/", displayLiveLink);
router.post("/", addLiveLink);
router.delete("/", stopLiveLink);
router.get("/history", displayHistoryOfLive);

router.get("/text/:language", get_LiveNewUpdates);
router.post("/text", addLiveNewUpdate);
router.delete("/text", clearnewLive);

export default router;

// live videos
// router.get("/display_live_link", displayLiveLink);
// router.post("/add_live_link", addLiveLink);
// router.delete("/clear_live_link", stopLiveLink);
// router.post("/add_live_date_time", addLiveNewUpdate);
// router.get("/display_live_date_time", displayLiveNewUpdates);
// router.delete("/clear_live_link_date_time", clearnewLive);
// router.get("/displayHistoryOfLive", displayHistoryOfLive);
// router.get("/display_live_date_time_language/:language", get_LiveNewUpdates);
