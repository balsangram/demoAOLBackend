import express from "express";
import {
  deleteUser,
  loginUser,
  logoutuser,
  OTPCheck,
  registerUser,
  updateDetails,
  userDetails,
} from "../../controllers/user/user.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.delete("/:id", deleteUser);
router.get("/:id", userDetails);
router.patch("/:id", updateDetails);
router.post("/OTPCheck/:id", OTPCheck);
router.patch("/logout", logoutuser);

export default router;
