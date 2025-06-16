import express from "express";
import {
  addSocialMedia,
  deleteSocialMedia,
  displayAllSocialMedia,
  updateSocialMedia,
} from "../../controllers/socialMedia.controller";
import { upload_V2 } from "../../utils/multer/multer";
import {
  addContactWithUS,
  deleteContactWithUS,
  displayAllContactWithUS,
  displayFooterCall,
  displayFooterDrop,
  displayFooterEmail,
  displayFooterMessage,
  updateContactWithUS,
} from "../../controllers/footerConnectWithUS.controller";

const router = express.Router();

router.get("/", displayAllSocialMedia);
router.post("/", upload_V2.array("mediaImage"), addSocialMedia);
router.patch("/:id", upload_V2.array("mediaImage"), updateSocialMedia);
router.delete("/:id", deleteSocialMedia);
// contact us
router.get("/email", displayFooterEmail);
router.get("/call", displayFooterCall);
router.get("/message", displayFooterMessage);
router.get("/drop", displayFooterDrop);
router.get("/contact", displayAllContactWithUS);
router.post("/contact", upload_V2.array("contactImage"), addContactWithUS);
router.patch(
  "/contact/:id",
  upload_V2.single("contactImage"),
  updateContactWithUS
);
router.delete("/contact/:id", deleteContactWithUS);

export default router;

//footer
// social media handel
// router.get("/social_media", displayAllSocialMedia);
// router.post("/social_media", upload_V2.array("mediaImage"), addSocialMedia);
// router.patch(
//   "/social_media/:id",
//   upload_V2.array("mediaImage"),
//   updateSocialMedia
// );
// router.delete("/social_media/:id", deleteSocialMedia);
// contact with us
// router.get("/footer_email", displayFooterEmail);
// router.get("/footer_Call", displayFooterCall);
// router.get("/footer_Message", displayFooterMessage);
// router.get("/footer_Drop", displayFooterDrop);
// router.get("/contact_with_us", displayAllContactWithUS);
// router.post(
//   "/contact_with_us",
//   upload_V2.array("contactImage"),
//   addContactWithUS
// );
// router.patch(
//   "/contact_with_us/:id",
//   upload_V2.single("contactImage"),
//   updateContactWithUS
// );
// router.delete("/contact_with_us/:id", deleteContactWithUS);
