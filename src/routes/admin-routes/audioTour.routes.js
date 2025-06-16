import express from "express";
import {
  add_audioTour,
  delete_audioTour,
  get_audioTour,
  update_audioTour,
} from "../../controllers/Direction/audiotour.controller.js";
import { upload_V2 } from "../../utils/multer/multer.js";

const router = express.Router();

router.post("/", get_audioTour);
router.post(
  "/",
  upload_V2.fields([
    { name: "audioDirectionImg", maxCount: 1 },
    { name: "audioLink", maxCount: 1 },
  ]),
  add_audioTour
);
router.patch(
  "/:id",
  upload_V2.fields([
    { name: "audioDirectionImg", maxCount: 1 },
    { name: "audioLink", maxCount: 1 },
  ]),
  update_audioTour
);
router.delete("/:id", delete_audioTour);

export default router;

// audio tour
// router.get("/display_audioTour", get_audioTour);
// router.post(
//   "/add_audioTour",
//   upload_V2.fields([
//     { name: "audioDirectionImg", maxCount: 1 },
//     { name: "audioLink", maxCount: 1 },
//   ]),
//   add_audioTour
// );
// router.patch(
//   "/update_audioTour/:id",
//   upload_V2.fields([
//     { name: "audioDirectionImg", maxCount: 1 },
//     { name: "audioLink", maxCount: 1 },
//   ]),
//   update_audioTour
// );
// router.delete("/delete_audioTour/:id", delete_audioTour);
// router.post("/audioTour", audioTour);
