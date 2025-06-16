import express from "express";
import {
  addSOSNumber,
  getLastSOSNumber,
} from "../../controllers/sosController.controller.js";

const router = express.Router();

router.get("/", getLastSOSNumber);
router.post("/", addSOSNumber);

export default router;

// // sos
// router.post("/sos", addSOSNumber);
// router.get("/sos/latest", getLastSOSNumber);
