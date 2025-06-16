import express from "express";
import { addPopUp, displayAllPopUp, displayPopUp } from "../../controllers/popUp.controller.js";
import { upload_V2 } from "../../utils/multer/multer.js";

const router = express.Router();

router.get("/", displayPopUp);
router.post("/", upload_V2.array("img"), addPopUp);
router.get("/history", displayAllPopUp);

export default router;


// //pop-up
// router.post("/addPopUp", upload_V2.array("img"), addPopUp);
// router.get("/displayPopUp", displayPopUp);
// router.get("/displayAllPopUp", displayAllPopUp);
