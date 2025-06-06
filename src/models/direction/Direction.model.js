import mongoose from "mongoose";

const directionSchema = new mongoose.Schema(
  {
    directionName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    directionImg: {
      type: String,
      required: true,
      trim: true,
    },
    directionDescription: {
      type: String,
      required: true,
      trim: true,
    },

    directionusertype: {
      type: String,
      enum: ["Visitor", "Participant", "Both"],
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const Direction = mongoose.model("Direction", directionSchema);

export default Direction;
