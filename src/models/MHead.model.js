import mongoose from "mongoose";

const HeadlineSchema = new mongoose.Schema(
  {
    headline: {
      en: { type: String, required: true }, // English
      hi: { type: String }, // Hindi
      kn: { type: String }, // Kannada
      ta: { type: String }, // Tamil
      te: { type: String }, // Telugu
      gu: { type: String }, // Gujarati
      mr: { type: String }, // Marathi
      ml: { type: String }, // Malayalam
      pa: { type: String }, // Punjabi
      bn: { type: String }, // Bengali
      ru: { type: String }, // Russian
      es: { type: String }, // Spanish
      zh: { type: String }, // Mandarin Chinese
      mn: { type: String }, // Mongolian
      pl: { type: String }, // Polish
      bg: { type: String }, // Bulgarian
      fr: { type: String }, // French
      de: { type: String }, // German
      nl: { type: String }, // Dutch
      it: { type: String }, // Italian
      pt: { type: String }, // Portuguese
      ja: { type: String }, // Japanese
      vi: { type: String }, // Vietnamese
    },
  },
  {
    timestamps: true,
  }
);

// Avoid recompilation error during development
const MHead = mongoose.models.MHead || mongoose.model("MHead", HeadlineSchema);

export default MHead;
