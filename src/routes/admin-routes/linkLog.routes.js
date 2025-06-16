import express from "express";
import {
  displayHomeLinkLog,
  displayLinkLog,
} from "../../controllers/linkLogs/linkLog.controller.js";

const router = express.Router();

router.get("/", displayLinkLog);
router.get("/home", displayHomeLinkLog);

export default router;

//linkLog
// router.get("/displayClick", displayLinkLog);
// router.get("/displayHomeClick", displayHomeLinkLog);
