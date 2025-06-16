import Card from "../models/Card.model.js";
// import Card from "../models/translate/Card.model.js";
import HomeCard from "../models/HomeCard.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
import { putObject } from "../utils/aws/putObject.js";
import translateText from "../utils/translation.js";
import fs from "fs";
import path from "path";
import { deleteObject } from "../utils/aws/deleteObject.js";

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
    console.log("req.body", req.body);
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

export const createCard = async (req, res) => {
  try {
    const files = req.files;

    if (!files) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const { name, link, headline } = req.body;
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          // Use buffer directly (no temp file needed)
          const fileBuffer = file.buffer;

          const { url } = await putObject(
            { data: fileBuffer, mimetype: file.mimetype },
            `cards/${Date.now()}-${file.originalname}`
          );

          uploadedFiles.push({
            file_name: file.originalname,
            file_url: url,
          });
        }
      } catch (error) {
        // throw new ApiError(500, `File upload failed: ${error.message}`);
        return res.status(500).json({ success: false, message: "Error" });
      }
    }
    const existingCard = await Card.findOne({ name });
    if (existingCard) {
      return res.status(400).json({ message: "Card name already exists" });
    }
    const newCard = new Card({
      name,
      link,
      headline,
      img: uploadedFiles[0].file_url,
    });
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
    const { name, link } = req.body;

    const existingWorkOrder = await Card.findById(id).lean();
    if (!existingWorkOrder) {
      return res.status(404).json({ message: `Card with ID ${id} not found` });
    }

    // Delete old image from S3 if a new one is being uploaded
    if (req.files && req.files.length > 0 && existingWorkOrder.img) {
      const urlParts = existingWorkOrder.img.split("cards/");
      console.log("🚀 ~ updateCard ~ urlParts:", urlParts);
      if (urlParts.length > 1) {
        const key = `cards/${urlParts[1]}`; // FIXED LINE
        await deleteObject(key); // Delete previous image
        console.log("🚀 ~ updateCard ~ key:", key);
      } else {
        console.warn("Invalid image URL format:", existingWorkOrder.img);
      }
    }

    let imageUrl = null;

    // Upload new image and get URL
    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // Assuming only 1 image per card
      const { buffer, mimetype, originalname } = file;

      const { url } = await putObject(
        { data: buffer, mimetype },
        `cards/${Date.now()}-${originalname}`
      );

      imageUrl = url;
    }

    // Prepare update data
    const updateData = { name, link };
    if (imageUrl) {
      updateData.img = imageUrl;
    }

    const updatedCard = await Card.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found after update" });
    }

    res.status(200).json({ message: "Card updated successfully", updatedCard });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete Card
// export const removeCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(id, "id");

//     const deletedCard = await Card.findByIdAndDelete(id);
//     if (!deletedCard)
//       return res.status(404).json({ message: "Card not found" });
//     res.status(200).json({ message: "Card removed successfully", deletedCard });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const removeCard = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");

    // Step 1: Find the card first
    const existingCard = await Card.findById(id);
    console.log("🚀 ~ removeCard ~ existingCard:", existingCard);

    if (!existingCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Step 2: Delete image from S3 if it exists
    if (existingCard.img) {
      const urlParts = existingCard.img.split("cards/");
      console.log("🚀 ~ removeCard ~ urlParts:", urlParts);

      if (urlParts.length > 1) {
        const key = `cards/${urlParts[1]}`;
        await deleteObject(key);
        console.log("🚀 ~ removeCard ~ Deleted image from S3:", key);
      } else {
        console.warn("Invalid image URL format:", existingCard.img);
      }
    }

    // Step 3: Delete the card from the DB
    await existingCard.deleteOne();

    res.status(200).json({
      message: "Card and image deleted successfully",
      deletedCard: existingCard,
    });
  } catch (error) {
    console.error("Error in removeCard:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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
