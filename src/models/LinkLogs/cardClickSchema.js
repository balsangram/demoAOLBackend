// // models/CardClick.js
// import mongoose from "mongoose";

// const cardClickSchema = new mongoose.Schema(
//   {
//     card: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Card",
//       required: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "DeviceToken",
//       required: true,
//     },
//     clickedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("CardClick", cardClickSchema);

import mongoose from "mongoose";

const cardClickSchema = new mongoose.Schema(
  {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviceToken",
      required: true,
    },
    clickedAt: {
      type: Date,
      default: () =>
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }), // Store IST time
    },
  },
  { timestamps: true }
);

// Middleware to convert timestamps to IST before saving
cardClickSchema.pre("save", function (next) {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  this.createdAt = now;
  this.updatedAt = now;
  next();
});

export default mongoose.model("CardClick", cardClickSchema);
