import express from "express";
import { upload_V2 } from "../router.js";
import {
  addYoutubeLinks,
  deleteYoutubeLink,
  showWebYoutubeLinks,
  updateYoutubeLink,
} from "../../controllers/youTube.controller.js";

const router = express.Router();

router.get("/web", showWebYoutubeLinks);
router.post("/", upload_V2.array("thumbnail"), addYoutubeLinks);
router.patch("/:id", upload_V2.single("thumbnail"), updateYoutubeLink);
router.delete("/:id", deleteYoutubeLink);

export default router;

// // YouTube Link
// router.post("/addYoutubeLinks", upload_V2.array("thumbnail"), addYoutubeLinks);
// router.get("/displayWebYoutubeLinks", showWebYoutubeLinks);
// router.patch(
//   "/updateYoutubeLink/:id",
//   upload_V2.single("thumbnail"),
//   updateYoutubeLink
// );
// router.delete("/deleteYoutubeLink/:id", deleteYoutubeLink);
