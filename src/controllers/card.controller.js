import Card from "../models/Card.model.js";
// import Card from "../models/translate/Card.model.js";
import HomeCard from "../models/HomeCard.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
import translateText from "../utils/translation.js";

// searchCard

export const cardSearch = async (req, res) => {
  try {
    const { query } = req.query;
    console.log("🚀 ~ cardSearch ~ query:", query);

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const results = await Card.find({
      $or: [{ name: { $regex: query, $options: "i" } }],
    });
    console.log("🚀 ~ cardSearch ~ results:", results);

    res.status(200).json({
      message: "Search results fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Show All Cards
export const showAllCards = async (req, res) => {
  try {
    const { headline } = req.params;
    // console.log("Received headline:", headline);

    // Find all cards that match the given headline
    const cards = await Card.find({ headline });
    // console.log("Matching cards:", cards);

    // If no cards are found, return a 404 error
    if (cards.length === 0) {
      return res
        .status(404)
        .json({ message: `No cards found with headline: ${headline}` });
    }

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create Card
// export const createCard = async (req, res) => {
//   try {
//     // console.log(req.file, "card file show");
//     const file = req.file;
//     console.log(file, "file");

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }
//     console.log(file, "file");

//     const { name, link, headline } = req.body;
//     const result = await uploadToCloudinary(file.buffer, file.originalname);

//     console.log("imageUplode", result);

//     console.log("req", req.file.img);

//     const existingCard = await Card.findOne({ name });
//     if (existingCard) {
//       return res.status(400).json({ message: "Card name already exists" });
//     }

//     const translations = {
//       en: name,
//       hi: await translateText(name, "hi"),
//       kn: await translateText(name, "kn"),
//       ta: await translateText(name, "ta"),
//       te: await translateText(name, "te"),
//       gu: await translateText(name, "gu"),
//       mr: await translateText(name, "mr"),
//       ml: await translateText(name, "ml"),
//       pa: await translateText(name, "pa"),
//       bn: await translateText(name, "bn"),
//       ru: await translateText(name, "ru"),
//       es: await translateText(name, "es"),
//       zh: await translateText(name, "zh"),
//       mn: await translateText(name, "mn"),
//       pl: await translateText(name, "pl"),
//       bg: await translateText(name, "bg"),
//       fr: await translateText(name, "fr"),
//       de: await translateText(name, "de"),
//       nl: await translateText(name, "nl"),
//       it: await translateText(name, "it"),
//       pt: await translateText(name, "pt"),
//       ja: await translateText(name, "ja"),
//       vi: await translateText(name, "vi"),
//     };
//     console.log(translations, "translations");

//     const newCard = new Card({
//       name: translations,
//       link,
//       headline,
//       img: result.secure_url,
//     });

//     await newCard.save();
//     res.status(201).json({ message: "Card created successfully", newCard });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

export const createCard = async (req, res) => {
  try {
    // console.log(req.file, "card file show");
    const file = req.file;
    console.log(file, "file");

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    console.log(file, "file");

    const { name, link, headline } = req.body;
    const result = await uploadToCloudinary(file.buffer, file.originalname);

    console.log("imageUplode", result);

    console.log("req", req.file.img);

    const existingCard = await Card.findOne({ name });
    if (existingCard) {
      return res.status(400).json({ message: "Card name already exists" });
    }
    const newCard = new Card({ name, link, headline, img: result.secure_url });
    console.log(newCard, "newcard");

    await newCard.save();
    res.status(201).json({ message: "Card created successfully", newCard });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params, "id");

    const { name, link } = req.body;
    console.log(req.body, "req.body");

    let imageUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      ); // ✅ Corrected this line
      imageUrl = result.secure_url; // ✅ Make sure this matches your Cloudinary response
    }

    const updateData = { name, link };
    if (imageUrl) {
      updateData.img = imageUrl;
    }

    const updatedCard = await Card.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card updated successfully", updatedCard });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(400).json({ message: error.message });
  }
};

// export const updateCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(req.params, "id");

//     const { name, link } = req.body;
//     console.log(req.body, "req.body");

//     let imageUrl = null;

//     if (req.file) {
//       const result = await uploadToCloudinary(file.buffer, file.originalname);

//       // const imageUpload = await uploadCloudinary(req.file.path);
//       // imageUrl = imageUpload.url; // Assuming Cloudinary returns an object with a `url` field

//     }

//     const updateData = { name, link };
//     if (imageUrl) {
//       updateData.img = imageUrl; // Updating image only if a new file is uploaded
//     }

//     const updatedCard = await Card.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     console.log(updatedCard, "updatedCard");

//     if (!updatedCard) {
//       return res.status(404).json({ message: "Card not found" });
//     }

//     res.status(200).json({ message: "Card updated successfully", updatedCard });
//   } catch (error) {
//     console.error("Error updating card:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// Delete Card
export const removeCard = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");

    const deletedCard = await Card.findByIdAndDelete(id);
    if (!deletedCard)
      return res.status(404).json({ message: "Card not found" });
    res.status(200).json({ message: "Card removed successfully", deletedCard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const displayHomeCard = async (req, res) => {
  try {
    const { headline } = req.params;
    const cards = await HomeCard.find({ headline });
    if (cards.length === 0) {
      return res
        .status(404)
        .json({ message: `No cards found with headline: ${headline}` });
    }

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addHomeCard = async (req, res) => {
  try {
    console.log(req.file, "card file show");

    const { name, link, headline } = req.body;
    const imageUplode = await uploadCloudinary(req.file.path);
    // console.log("imageUplode", imageUplode);

    console.log("req", req.file);

    const existingCard = await HomeCard.findOne({ name });
    if (existingCard) {
      return res.status(400).json({ message: "Card name already exists" });
    }
    const newCard = new HomeCard({
      name,
      link,
      headline,
      img: imageUplode.url,
    });
    console.log(newCard, "newcard");

    await newCard.save();
    res.status(201).json({ message: "Card created successfully", newCard });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const updateHomeCard = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params, "id");

    const { name, link } = req.body;
    console.log(req.body, "req.body");

    let imageUrl = null;

    if (req.file) {
      const imageUpload = await uploadCloudinary(req.file.path);
      imageUrl = imageUpload.url; // Assuming Cloudinary returns an object with a `url` field
    }

    const updateData = { name, link };
    if (imageUrl) {
      updateData.img = imageUrl; // Updating image only if a new file is uploaded
    }

    const updatedCard = await HomeCard.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    console.log(updatedCard, "updatedCard");

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card updated successfully", updatedCard });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(400).json({ message: error.message });
  }
};
export const removeHomeCard = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");

    const deletedCard = await HomeCard.findByIdAndDelete(id);
    if (!deletedCard)
      return res.status(404).json({ message: "Card not found" });
    res.status(200).json({ message: "Card removed successfully", deletedCard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchCard = async (req, res) => {
  console.log(req.body, "req.body", req.query);

  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Case-insensitive partial match on name
    const cards = await Card.find({
      name: { $regex: query, $options: "i" },
    });

    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
