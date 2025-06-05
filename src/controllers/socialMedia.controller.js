import socialMediaSchema from "../models/footerSocialMedia.Model.js";
import { deleteObject } from "../utils/aws/deleteObject.js";
import { putObject } from "../utils/aws/putObject.js";
import { uploadToCloudinary } from "../utils/cloudnary.js"; // Adjust the path
export const displayAllSocialMedia = async (req, res) => {
  try {
    const allSocialmedia = await socialMediaSchema.find();
    res
      .status(200)
      .json({ message: "all display social media ", allSocialmedia });
  } catch (error) {
    res.status(500).json({ error });
  }
};
// import SocialMedia from "../models/socialMediaModel.js"; // Adjust the path as needed

// import { Readable } from "stream"; // Needed for streaming buffer

export const addSocialMedia = async (req, res) => {
  try {
    const { mediaName, mediaLink } = req.body;
    console.log(req.body, "body");
    console.log(req.files);

    const mediaImage = req.files;
    console.log(mediaImage, "mediaImage");

    if (!mediaImage) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          // Use buffer directly (no temp file needed)
          const fileBuffer = file.buffer;

          const { url } = await putObject(
            { data: fileBuffer, mimetype: file.mimetype },
            `SocialMedia-icons/${Date.now()}-${file.originalname}`
          );

          uploadedFiles.push({
            file_name: file.originalname,
            file_url: url,
          });
        }
      } catch (error) {
        console.log(error, "error");

        // throw new ApiError(500, `File upload failed: ${error.message}`);
        return res.status(500).json({ success: false, message: "Error" });
      }
    }
    console.log(uploadedFiles, "uploadedFiles");

    // Save to DB
    const newSocialMedia = new socialMediaSchema({
      mediaName,
      mediaLink,
      mediaImage: uploadedFiles[0].file_url,
    });

    await newSocialMedia.save();

    res.status(200).json({
      message: "Social media added successfully",
      data: newSocialMedia,
    });
  } catch (error) {
    console.error("Error uploading social media:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// import SocialMedia from "../models/socialMediaModel.js";
// import { uploadToCloudinary } from "../utils/cloudinary.js";
export const updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { mediaName, mediaLink } = req.body;
    const mediaImageFile = req.files;

    // Find the existing social media entry
    const existingWorkOrder = await socialMediaSchema.findById(id);
    if (!existingWorkOrder) {
      return res.status(404).json({ message: "Social media entry not found" });
    }

    // Update name/link if provided
    if (mediaName) existingWorkOrder.mediaName = mediaName;
    if (mediaLink) existingWorkOrder.mediaLink = mediaLink;

    // Delete old image from S3 if a new one is uploaded
    if (req.files && req.files.length > 0 && existingWorkOrder.mediaImage) {
      const urlParts = existingWorkOrder.mediaImage.split("SocialMedia-icons/");
      if (urlParts.length > 1) {
        const key = `SocialMedia-icons/${urlParts[1]}`;
        await deleteObject(key);
      } else {
        console.warn("Invalid image URL format:", existingWorkOrder.mediaImage);
      }
    }

    // Upload new image if available
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const { buffer, mimetype, originalname } = file;

      const { url } = await putObject(
        { data: buffer, mimetype },
        `SocialMedia-icons/${Date.now()}-${originalname}`
      );

      existingWorkOrder.mediaImage = url; // ✅ Save the new image URL
    }

    // Save the updated document
    await existingWorkOrder.save(); // ✅ Save changes to DB

    res.status(200).json({
      message: "Social media updated successfully",
      data: existingWorkOrder,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update social media" });
  }
};

// export const updateSocialMedia = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { mediaName, mediaLink } = req.body;
//     const mediaImageFile = req.files;
//     console.log("🚀 ~ updateSocialMedia ~ mediaImageFile:", mediaImageFile);

//     // Find the existing social media entry
//     const existingWorkOrder = await socialMediaSchema.findById(id);
//     if (!existingWorkOrder) {
//       return res.status(404).json({ message: "Social media entry not found" });
//     }

//     // Update media name and link
//     if (mediaName) existingWorkOrder.mediaName = mediaName;
//     if (mediaLink) existingWorkOrder.mediaLink = mediaLink;

//     // Delete old image from S3 if a new one is uploaded
//     // Delete old image from S3 if a new one is being uploaded
//     if (req.files && req.files.length > 0 && existingWorkOrder.img) {
//       const urlParts = existingWorkOrder.img.split("cards/");
//       console.log("🚀 ~ updateCard ~ urlParts:", urlParts);
//       if (urlParts.length > 1) {
//         const key = `cards/${urlParts[1]}`; // FIXED LINE
//         await deleteObject(key); // Delete previous image
//         console.log("🚀 ~ updateCard ~ key:", key);
//       } else {
//         console.warn("Invalid image URL format:", existingWorkOrder.img);
//       }
//     }

//     let imageUrl = null;

//     // Upload new image and get URL
//     if (req.files && req.files.length > 0) {
//       const file = req.files[0]; // Assuming only 1 image per card
//       const { buffer, mimetype, originalname } = file;

//       const { url } = await putObject(
//         { data: buffer, mimetype },
//         `cards/${Date.now()}-${originalname}`
//       );

//       imageUrl = url;
//     }
//     // Save updates

//     res
//       .status(200)
//       .json({
//         message: "Social media updated successfully",
//         data: existingWorkOrder,
//       });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ error: "Failed to update social media" });
//   }
// };

export const deleteSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await socialMediaSchema.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ error: "Social media entry not found" });
    }

    res
      .status(200)
      .json({ message: "Social media entry deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete social media entry" });
  }
};
