import express from "express";
import { loginAdmin } from "../../controllers/admin.controller.js";
import { createGroupExcel, createGroupWithUser, deleteGroup, getAllGroupsWithDeviceTokens, updateGroupUser } from "../../controllers/notification/group.controller.js";

const router = express.Router();

router.get("/", getAllGroupsWithDeviceTokens);
router.post("/", createGroupWithUser);
router.post("/exel", createGroupExcel);
router.delete("/:id", deleteGroup);
router.patch("/:id", updateGroupUser);

export default router;


// group
// router.get("/displayAllGroup", getAllGroupsWithDeviceTokens);
// router.post("/createGroup", createGroupWithUser);
// router.post("/createGroupExel", createGroupExcel);
// router.delete("/deleteGroup/:id", deleteGroup);
// router.patch("/updateGroup/:id", updateGroupUser);
// router.post("/sendGroupNotification", sendGroupNotification);
