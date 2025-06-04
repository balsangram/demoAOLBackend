import ContactWithUs from "../models/footerConnectWithUS.model.js";
import { deleteObject } from "../utils/aws/deleteObject.js";
import { putObject } from "../utils/aws/putObject.js";
import { uploadToCloudinary } from "../utils/cloudnary.js";

export const displayAllContactWithUS = async (req, res) => {
  try {
    const allContactWithUs = await ContactWithUs.find();
    res.status(200).json({
      message: "All contact entries retrieved successfully.",
      allContactWithUs,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Failed to fetch contact entries." });
  }
};

export const addContactWithUS = async (req, res) => {
  try {
    console.log(req.files, "files");
    const { contactName, contactLink } = req.body;
    const contactImage = req.files;

    if (!contactImage) {
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

    const newContact = new ContactWithUs({
      contactName,
      contactLink,
      contactImage: uploadedFiles[0].file_url,
      typeName: contactName,
    });

    await newContact.save();

    res.status(201).json({
      message: "Contact entry added successfully.",
      data: newContact,
    });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ error: "Failed to add contact entry." });
  }
};

// export const updateContactWithUS = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { contactName, contactLink } = req.body;
//     const contactImage = req.file;

//     const existing = await ContactWithUs.findById(id);
//     if (!existing) {
//       return res.status(404).json({ message: "Contact entry not found." });
//     }

//     if (contactName) existing.contactName = contactName;
//     if (contactLink) existing.contactLink = contactLink;

//     // Delete old image from S3 if a new one is uploaded
//     if (req.files && req.files.length > 0 && existingWorkOrder.mediaImage) {
//       const urlParts = existingWorkOrder.mediaImage.split("cards/");
//       if (urlParts.length > 1) {
//         const key = `cards/${urlParts[1]}`;
//         await deleteObject(key);
//       } else {
//         console.warn("Invalid image URL format:", existingWorkOrder.mediaImage);
//       }
//     }

//     // Upload new image if available
//     if (req.files && req.files.length > 0) {
//       const file = req.files[0];
//       const { buffer, mimetype, originalname } = file;

//       const { url } = await putObject(
//         { data: buffer, mimetype },
//         `cards/${Date.now()}-${originalname}`
//       );

//       existingWorkOrder.mediaImage = url; // ✅ Save the new image URL
//     }

//     // Save the updated document
//     await existingWorkOrder.save(); // ✅ Save changes to DB

//     res.status(200).json({
//       message: "Contact entry updated successfully.",
//       data: existing,
//     });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ error: "Failed to update contact entry." });
//   }
// };

export const updateContactWithUS = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactName, contactLink } = req.body;
    // You destructured req.file as contactImage but later using req.files and existingWorkOrder
    // Let's consistently use req.files for multiple files or req.file for single file
    // Assuming single file upload here:
    const contactImageFile = req.file;

    const existing = await ContactWithUs.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Contact entry not found." });
    }

    if (contactName) existing.contactName = contactName;
    if (contactLink) existing.contactLink = contactLink;

    // Delete old image from S3 if a new one is uploaded
    // Use 'existing' instead of 'existingWorkOrder' for variable consistency
    if (contactImageFile && existing.contactImage) {
      const urlParts = existing.contactImage.split("cards/");
      if (urlParts.length > 1) {
        const key = `cards/${urlParts[1]}`;
        await deleteObject(key);
      } else {
        console.warn("Invalid image URL format:", existing.contactImage);
      }
    }

    // Upload new image if available
    if (contactImageFile) {
      const { buffer, mimetype, originalname } = contactImageFile;

      const { url } = await putObject(
        { data: buffer, mimetype },
        `cards/${Date.now()}-${originalname}`
      );

      existing.contactImage = url; // Save new image URL
    }

    // Save changes
    await existing.save();

    res.status(200).json({
      message: "Contact entry updated successfully.",
      data: existing,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update contact entry." });
  }
};

export const deleteContactWithUS = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await ContactWithUs.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ error: "ContactWithUs entry not found" });
    }

    res
      .status(200)
      .json({ message: "ContactWithUs entry deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete ContactWithUs" });
  }
};

export const displayFooterEmail = async (req, res) => {
  try {
    const emailEntry = await ContactWithUs.findOne({ typeName: "email" });

    if (!emailEntry) {
      return res.status(404).json({ message: "Email entry not found" });
    }

    res.status(200).json({
      message: "Email entry retrieved successfully.",
      data: emailEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const displayFooterCall = async (req, res) => {
  try {
    const contactEntry = await ContactWithUs.findOne({ typeName: "contact" });

    if (!contactEntry) {
      return res.status(404).json({ message: "Contact entry not found" });
    }

    res.status(200).json({
      message: "Contact entry retrieved successfully.",
      data: contactEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const displayFooterMessage = async (req, res) => {
  try {
    const messageEntry = await ContactWithUs.findOne({ typeName: "chat" });

    if (!messageEntry) {
      return res.status(404).json({ message: "Chat entry not found" });
    }

    res.status(200).json({
      message: "Chat entry retrieved successfully.",
      data: messageEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const displayFooterDrop = async (req, res) => {
  try {
    const dropEntry = await ContactWithUs.findOne({ typeName: "drop" });

    if (!dropEntry) {
      return res.status(404).json({ message: "Drop entry not found" });
    }

    res.status(200).json({
      message: "Drop entry retrieved successfully.",
      data: dropEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
