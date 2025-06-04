import Action from "../models/Action.model.js";
import { deleteObject } from "../utils/aws/deleteObject.js";
import { putObject } from "../utils/aws/putObject.js";
// import Action from "../models/translate/Action.model.js";
// import Action from "../models/translate/Action.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
import translateText from "../utils/translation.js";

export const action = async (req, res) => {
  console.log(req.params, "usertype query"); // Logging query params correctly

  try {
    const { usertype } = req.params; // Extract usertype from query params

    if (!usertype) {
      return res.status(400).json({ message: "Usertype is required" });
    }

    const actions = await Action.find({ usertype }); // Filter actions by usertype

    if (actions.length === 0) {
      return res
        .status(404)
        .json({ message: "No actions found for this usertype" });
    }

    res.status(200).json(actions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addAction = async (req, res) => {
  try {
    const files = req.files;
    console.log("Received files:", files);
    console.log("Received body:", req.body);

    const uploadedFiles = [];

    if (files && files.length > 0) {
      try {
        for (const file of files) {
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
        console.error("File upload error:", error);
        return res
          .status(500)
          .json({ success: false, message: "File upload failed" });
      }
    }

    let data = req.body;

    // If data is a single object (e.g., from Postman or form), convert it to array
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Ensure all entries have required fields
    const formattedData = data.map((item, index) => ({
      usertype: item.usertype,
      action: item.action,
      link: item.link,
      img: uploadedFiles[index] ? uploadedFiles[index].file_url : null,
    }));

    const isValid = formattedData.every(
      (item) => item.usertype && item.action && item.link
    );
    if (!isValid) {
      return res.status(400).json({
        message: "Missing required fields (usertype, action, link).",
      });
    }

    const newActions = await Action.insertMany(formattedData);
    console.log("Inserted Actions:", newActions);

    res.status(201).json({
      message: "Actions added successfully",
      actions: newActions,
    });
  } catch (error) {
    console.error("Error adding action:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { usertype, language, action, link } = req.body;
    const files = req.files;
    console.log(files, "req.file");

    const existingAction = await Action.findById(id);
    if (!existingAction) {
      return res.status(404).json({ message: "Action not found" });
    }

    // Delete old image from S3 if a new image is uploaded
    if (req.files && req.files.length > 0 && existingAction.img) {
      const urlParts = existingAction.img.split("cards/");
      if (urlParts.length > 1) {
        const key = `cards/${urlParts[1]}`;
        await deleteObject(key); // Assuming this is your helper function to delete from S3
        console.log("Deleted old image from S3:", key);
      } else {
        console.warn("Invalid image URL format:", existingAction.img);
      }
    }

    let imageUrl = existingAction.img; // Preserve existing image if no new one is uploaded

    // Upload new image if provided
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const { buffer, mimetype, originalname } = file;
      const { url } = await putObject(
        { data: buffer, mimetype },
        `cards/${Date.now()}-${originalname}`
      );
      imageUrl = url;
    }

    // If a new image is uploaded, process it
    if (req.file?.path) {
      try {
        console.log("Received Image:", req.file);

        // Optional: If you want to delete the old image from Cloudinary
        // if (existingAction.img) await deleteCloudinaryImage(existingAction.img);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // Update fields (only if they exist in req.body)
    existingAction.usertype = usertype?.trim() || existingAction.usertype;
    existingAction.language = language?.trim() || existingAction.language;
    existingAction.action = action?.trim() || existingAction.action;
    existingAction.link = link?.trim() || existingAction.link;
    existingAction.img = imageUrl; // Update image only if changed

    // Save updated document
    await existingAction.save();

    res
      .status(200)
      .json({ message: "Updated successfully", action: existingAction });
  } catch (error) {
    console.error("Error updating action:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteAction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");

    const isAction = await Action.findByIdAndDelete(id);
    if (!isAction) {
      return res.status(404).json({ message: "file not found" });
    }

    console.log(isAction, "isAction");

    res.status(200).json({ message: "action deleted sucessafully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
