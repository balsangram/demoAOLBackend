import express from "express";
import {
  add_direction,
  delete_direction,
  get_direction,
  getNames,
  getSingelCard,
  update_direction,
} from "../../controllers/Direction/direction.controller";

const router = express.Router();

router.get("/", get_direction);
router.post(
  "/",
  upload_V2.fields([
    { name: "directionImg", maxCount: 1 },
    { name: "audioLink", maxCount: 1 },
  ]),
  add_direction
);
router.patch("/:id", upload_V2.array("directionImg"), update_direction);
router.delete("/:id", delete_direction);
router.get("/:directionusertype", getNames);
router.get("/:cardName", getSingelCard);

export default router;

// direction
// router.get("/display_direction", get_direction);
// router.post(
//   "/add_direction",
//   upload_V2.fields([
//     { name: "directionImg", maxCount: 1 },
//     { name: "audioLink", maxCount: 1 },
//   ]),
//   add_direction
// );
// router.patch(
//   "/update_direction/:id",
//   upload_V2.array("directionImg"),
//   update_direction
// );
// router.delete("/delete_direction/:id", delete_direction);
// router.get("/get_direction_names/:directionusertype", getNames);
// router.get("/get_perticular_card/:cardName", getSingelCard);
