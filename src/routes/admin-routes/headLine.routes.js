import express from "express";
import { displayHeadlines } from "../../controllers/head.controller.js";

const router = express.Router();

router.get("/", displayHeadlines);

export default router;
