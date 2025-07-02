// import mongoose from "mongoose";

// const deviceTokenSchema = new mongoose.Schema(
//   {
//     token: { type: String },
//     first_name: { type: String, required: true },
//     last_name: { type: String, required: false },
//     email: { type: String, required: true, unique: true },
//     country_code: { type: String, required: true },
//     phone: { type: String, required: true, unique: true },
//     aadhar: { type: String, required: false, default: "" },
//     count: { type: Number, default: 0 },
//     staticType: [
//       {
//         type: String,
//       },
//     ],
//     userTypes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "UserType",
//       },
//     ],
//     CardTypes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Card",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("DeviceToken", deviceTokenSchema);

import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    country_code: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    aadhar: { type: String, required: false, default: "" },
    count: { type: Number, default: 0 },
    staticType: [
      {
        type: String,
      },
    ],
    userTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserType",
      },
    ],
    CardTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to lowercase email and phone
deviceTokenSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

export default mongoose.model("DeviceToken", deviceTokenSchema);
