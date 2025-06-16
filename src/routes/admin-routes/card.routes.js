import express from "express";
import {
  get_Cards,
  get_searchCard,
} from "../../controllers/translation/allTranslated.controller.js";
import {
  createCard,
  removeCard,
  showAllCards,
  updateCard,
} from "../../controllers/card.controller.js";
import { upload_V2 } from "../../utils/multer/multer.js";

const router = express.Router();

router.get("/getcard/:headline/:language", get_Cards);
router.get("/all/:headline", showAllCards);
router.post("/", upload_V2.array("img"), createCard);
router.patch("/:id", upload_V2.array("img"), updateCard);
router.delete("/:id", removeCard);
router.get("/search/:language", get_searchCard);

export default router;

// search
// router.get("/searchCard", searchCard);
