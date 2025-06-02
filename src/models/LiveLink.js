// import mongoose from "mongoose";

// const { Schema, model, models } = mongoose;

// const liveLinkSchema = new Schema({
//   link: { type: String, required: true },

//   createdAt: { type: Date, default: Date.now },
// });

// export default models.LiveLink || model("LiveLink", liveLinkSchema);

import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const liveLinkSchema = new Schema({
  link: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  liveTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.LiveLink || model("LiveLink", liveLinkSchema);
