import express from "express";
import { loginAdmin } from "../../controllers/admin.controller.js";
import {
  addAdvertisement,
  displayHistoryOfAdvertisement,
  getAdvertisements,
} from "../../controllers/adv.controller.js";

const router = express.Router();

router.get("/", getAdvertisements);
router.post(
  "/",
  upload_V2.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
  ]),
  addAdvertisement
);
router.get("/history", displayHistoryOfAdvertisement);

export default router;

// // Advertising
// router.post(
//   "/addAdv",
//   upload_V2.fields([
//     { name: "img1", maxCount: 1 },
//     { name: "img2", maxCount: 1 },
//     { name: "img3", maxCount: 1 },
//   ]),
//   addAdvertisement
// );
// router.get("/advertisement_history", displayHistoryOfAdvertisement);
// router.get("/displayAdvertisement", getAdvertisements);
