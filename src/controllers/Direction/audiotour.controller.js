import AudioTour from "../../models/direction/AudioTour.model.js";
import { deleteObject } from "../../utils/aws/deleteObject.js";
import { putObject } from "../../utils/aws/putObject.js";
import { uploadToCloudinary } from "../../utils/cloudnary.js"; // Ensure this exists and works

export const add_audioTour = async (req, res) => {
  console.log("📦 Body:", req.body);
  console.log("📁 Files:", req.files);

  try {
    const {
      language,
      audioDirectionName,
      audioTourModel,
      videoLink,
      latitude,
      longitude,
      audioDirectionText,
    } = req.body;

    // Validation
    if (
      !language ||
      !audioDirectionName ||
      !audioTourModel ||
      !videoLink ||
      !latitude ||
      !longitude ||
      !audioDirectionText ||
      !req.files?.audioDirectionImg?.length ||
      !req.files?.audioLink?.length
    ) {
      return res
        .status(400)
        .json({ message: "All fields including image and audio are required" });
    }

    // Check if the new name is already used by another document

    const nameExists = await AudioTour.findOne({ audioDirectionName });
    if (nameExists) {
      return res.status(400).json({
        message: "Audio Direction Name already exists. Please choose another.",
      });
    }

    // Handle image upload
    const uploadedImgFile = req.files.audioDirectionImg[0];
    const imgBuffer = uploadedImgFile.buffer;
    const imgUpload = await putObject(
      { data: imgBuffer, mimetype: uploadedImgFile.mimetype },
      `audioTour-img/${Date.now()}-${uploadedImgFile.originalname}`
    );
    const audioDirectionImg = imgUpload.url;

    // Handle audio upload
    const uploadedAudioFile = req.files.audioLink[0];
    const audioBuffer = uploadedAudioFile.buffer;
    const audioUpload = await putObject(
      { data: audioBuffer, mimetype: uploadedAudioFile.mimetype },
      `audioTour-audio/${Date.now()}-${uploadedAudioFile.originalname}`
    );
    const audioLink = audioUpload.url;

    // Save to DB
    const newDirection = new AudioTour({
      language,
      audioDirectionName,
      audioTourModel,
      audioDirectionImg,
      audioLink,
      videoLink,
      longitude,
      latitude,
      audioDirectionText,
    });

    await newDirection.save();

    res.status(201).json({
      message: "Direction added successfully",
      data: newDirection,
    });
  } catch (error) {
    console.error("❌ Error while adding direction:", error);
    res.status(500).json({ message: "Failed to add direction", error });
  }
};

// Get all directions
export const get_audioTour = async (req, res) => {
  try {
    const directions = await AudioTour.find();
    res.status(200).json(directions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch directions", error });
  }
};

export const update_audioTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      audioDirectionName,
      videoLink,
      longitude,
      latitude,
      audioDirectionText,
    } = req.body;

    const existingTour = await AudioTour.findById(id);
    if (!existingTour) {
      return res.status(404).json({ message: "Audio Tour not found" });
    }

    const updatedFields = {
      audioDirectionName,
      videoLink,
      longitude,
      latitude,
      audioDirectionText,
    };

    // === Handle Old Image Deletion ===
    if (req.files?.audioDirectionImg?.[0] && existingTour.audioDirectionImg) {
      const parts = existingTour.audioDirectionImg.split("audioTour-img/");
      if (parts.length > 1) {
        const key = `audioTour-img/${parts[1]}`;
        await deleteObject(key);
        console.log("Old image deleted:", key);
      }
    }

    // === Upload New Image if Exists ===
    if (req.files?.audioDirectionImg?.[0]) {
      const { buffer, mimetype, originalname } = req.files.audioDirectionImg[0];
      const { url } = await putObject(
        { data: buffer, mimetype },
        `audioTour-img/${Date.now()}-${originalname}`
      );
      updatedFields.audioDirectionImg = url;
    }

    // === Handle Old Audio Deletion ===
    if (req.files?.audioLink?.[0] && existingTour.audioLink) {
      const parts = existingTour.audioLink.split("audioTour-audio/");
      if (parts.length > 1) {
        const key = `audioTour-audio/${parts[1]}`;
        await deleteObject(key);
        console.log("Old audio deleted:", key);
      }
    }

    // === Upload New Audio if Exists ===
    if (req.files?.audioLink?.[0]) {
      const { buffer, mimetype, originalname } = req.files.audioLink[0];
      const { url } = await putObject(
        { data: buffer, mimetype },
        `audioTour-audio/${Date.now()}-${originalname}`
      );
      updatedFields.audioLink = url;
    }

    const updatedAudioTour = await AudioTour.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Audio Tour updated successfully",
      data: updatedAudioTour,
    });
  } catch (error) {
    console.error("Error in update_audioTour:", error);
    res.status(500).json({
      message: "Failed to update Audio Tour",
      error: error.message,
    });
  }
};

export const delete_audioTour = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAudioTour = await AudioTour.findByIdAndDelete(id);

    if (!deletedAudioTour) {
      return res.status(404).json({ message: "Direction not found" });
    }

    res
      .status(200)
      .json({ message: "Direction deleted successfully", deletedAudioTour });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete direction", error });
  }
};

// Haversine distance calculation (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const audioTour = async (req, res) => {
  try {
    const { latitude, longitude, language, audioTourModel } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined ||
      !language ||
      !audioTourModel
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get all matching language + model data
    const results = await AudioTour.find({
      language,
      audioTourModel,
    });

    const nearbyTours = results.filter((item) => {
      const dist = calculateDistance(
        latitude,
        longitude,
        item.latitude,
        item.longitude
      );
      return dist <= 60;
    });

    res.status(200).json(nearbyTours);
  } catch (error) {
    console.error("Error in audioTour:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
