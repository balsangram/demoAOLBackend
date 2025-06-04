import OnBoarding from "../../models/flutter/OnBording.model.js";
import { putObject } from "../../utils/aws/putObject.js";
import { uploadToCloudinary } from "../../utils/cloudnary.js"; // adjust to your utility path

export const displayOnBoarding = async (req, res) => {
  try {
    const latestOnBoardings = await OnBoarding.find()
      .sort({ createdAt: -1 }) // descending order
      .limit(3); // only the latest 4

    res.status(200).json({
      success: true,
      message: "Latest onboarding screens fetched successfully.",
      data: latestOnBoardings,
    });
  } catch (error) {
    console.error("Error fetching onboarding screens:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch onboarding screens.",
    });
  }
};

export const addOnBoarding = async (req, res) => {
  try {
    // const { title, body } = req.body;
    const files = req.files;

    if (!files) {
      return res.status(400).json({
        success: false,
        message: "Image are all required.",
      });
    }

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
        console.log(error, "error");

        // throw new ApiError(500, `File upload failed: ${error.message}`);
        return res.status(500).json({ success: false, message: "Error" });
      }
    }

    const newOnBoarding = await OnBoarding.create({
      img: uploadedFiles[0].file_url,
      //   title,
      //   body,
    });

    res.status(201).json({
      success: true,
      message: "Onboarding screen added successfully.",
      data: newOnBoarding,
    });
  } catch (error) {
    console.error("Error adding onboarding screen:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add onboarding screen.",
    });
  }
};
