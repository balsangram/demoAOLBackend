import mongoose from "mongoose";
import { type } from "os";

const audioTourSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      default: "en",
    },
    audioDirectionName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    audioDirectionImg: {
      type: String,
      required: true,
      trim: true,
    },
    audioTourModel: {
      type: String,
      enum: ["Vehicle Tour", "Walk Tour", "Video Tour"],
      required: true,
    },
    audioLink: {
      type: String,
    },
    videoLink: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true,
      trim: true,
    },
    longitude: {
      type: Number,
      required: true,
      trim: true,
    },
    audioDirectionText: {
      type: String,
      required: true,
      trim: true,
    },

    directionUserModel: {
      type: String,
      enum: ["Tour and Maps", "Audio Tour only"],
      default: "Audio Tour only",
    },
  },
  {
    timestamps: true,
  }
);

const AudioTour = mongoose.model("AudioTour", audioTourSchema);

export default AudioTour;
