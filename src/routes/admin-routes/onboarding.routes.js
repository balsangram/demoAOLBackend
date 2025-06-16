import express from "express";
import { addOnBoarding } from "../../controllers/flutter/onBoading.controller";
import { upload_V2 } from "../../utils/multer/multer";

const router = express.Router();

router.post("/", upload_V2.array("img"), addOnBoarding);

export default router;

// OnBoarding images
// router.post("/add_On_Boarding", upload_V2.array("img"), addOnBoarding);
