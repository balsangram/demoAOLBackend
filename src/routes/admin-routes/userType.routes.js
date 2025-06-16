import express from "express";
import { get_userType } from "../../controllers/translation/allTranslated.controller.js";
import { upload_V2 } from "../../utils/multer/multer.js";
import {
  addUserType,
  deleteUserType,
  updateUserType,
} from "../../controllers/userType.controller.js";

const router = express.Router();

router.get("/:language", get_userType);
router.post("/", upload_V2.array("img"), addUserType); //add
router.patch("/:id", upload_V2.array("img"), updateUserType); //update
router.delete("/:id", deleteUserType); //delete

export default router;

//user Types
// router.get("/userType_language/:language", get_userType);
// router.get("/userType/:id", singleuserType);
// router.get("/userTypeHome/:id", singleHomeuserType);
// router.post("/addUserType", upload_V2.array("img"), addUserType);
// router.patch("/updateUSerType/:id", upload_V2.array("img"), updateUserType);
// router.delete("/deleteUSerType/:id", deleteUserType);
