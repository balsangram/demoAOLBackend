import UserType from "../models/UserType.model.js";
import Action from "../models/Action.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
import DeviceToken from "../models/notification/deviceToken.model.js";
import Card from "../models/Card.model.js";
import YouTube from "../models/Youtube.model.js";
import { putObject } from "../utils/aws/putObject.js";
import { deleteObject } from "../utils/aws/deleteObject.js";
import translateText from "../utils/translation.js";
// import { parse } from "dotenv";
// Show All Cards
export const userType = async (req, res) => {
  try {
    const userType = await UserType.find();
    res.status(200).json(userType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUserType = async (req, res) => {
  try {
    const files = req.files;
    console.log(files, "files", req.body);

    if (!files) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    // console.log(files, "files");

    const { usertype, link } = req.body;
    if ((!usertype, !link)) {
      return res
        .status(404)
        .json({ success: false, message: "usertype, link both rewuire" });
    }
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          // Use buffer directly (no temp file needed)
          const fileBuffer = file.buffer;

          const { url } = await putObject(
            { data: fileBuffer, mimetype: file.mimetype },
            `aol-login-cards/${Date.now()}-${file.originalname}`
            // `internal-login-cards/${Date.now()}-${file.originalname}`
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

    const existingCard = await UserType.findOne({ usertype });
    if (existingCard) {
      return res.status(400).json({ message: "Card name already exists" });
    }
    const newUserType = new UserType({
      usertype,
      img: uploadedFiles[0].file_url,
      link,
    });
    console.log(newUserType, "newcard");

    await newUserType.save();
    res.status(201).json({ message: "Card created successfully", newUserType });
  } catch (error) {
    console.error("addUserType error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const updateUserType = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("UserType ID:", id);

//     const { usertype } = req.body;
//     console.log("usertype:", usertype, "Files:", req.files);

//     const existingUserType = await UserType.findById(id).lean();
//     if (!existingUserType) {
//       return res
//         .status(404)
//         .json({ message: `UserType with ID ${id} not found` });
//     }

//     // Delete old image from S3 if a new image is uploaded
//     if (req.files && req.files.length > 0 && existingUserType.img) {
//       const urlParts = existingUserType.img.split("cards/");
//       if (urlParts.length > 1) {
//         const key = `aol-login-cards/${urlParts[1]}`;
//         await deleteObject(key); // Assuming this is your helper function to delete from S3
//         console.log("Deleted old image from S3:", key);
//       } else {
//         console.warn("Invalid image URL format:", existingUserType.img);
//       }
//     }

//     let imageUrl = existingUserType.img; // Preserve existing image if no new one is uploaded

//     // Upload new image if provided
//     if (req.files && req.files.length > 0) {
//       const file = req.files[0];
//       const { buffer, mimetype, originalname } = file;
//       const { url } = await putObject(
//         { data: buffer, mimetype },
//         `aol-login-cards/${Date.now()}-${originalname}`
//       );
//       imageUrl = url;
//     }

//     // Update UserType document
//     const updatedUserType = await UserType.findByIdAndUpdate(
//       id,
//       { usertype, img: imageUrl },
//       { new: true }
//     );

//     if (!updatedUserType) {
//       return res
//         .status(404)
//         .json({ message: "UserType not found after update" });
//     }

//     res
//       .status(200)
//       .json({ message: "Updated successfully", data: updatedUserType });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateUserType = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("UserType ID:", id);

    const { usertype, link } = req.body; // Added link to destructuring
    console.log("usertype:", usertype, "link:", link, "Files:", req.files);

    // Validate required fields
    // if (!usertype || !link) {
    //   return res.status(400).json({
    //     message: "Both usertype and link are required fields",
    //   });
    // }

    const existingUserType = await UserType.findById(id).lean();
    if (!existingUserType) {
      return res
        .status(404)
        .json({ message: `UserType with ID ${id} not found` });
    }

    // Delete old image from S3 if a new image is uploaded
    if (req.files?.length > 0 && existingUserType.img) {
      const urlParts = existingUserType.img.split("cards/");
      if (urlParts.length > 1) {
        const key = `aol-login-cards/${urlParts[1]}`;
        try {
          await deleteObject(key);
          console.log("Deleted old image from S3:", key);
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
          // Continue with update even if deletion fails
        }
      } else {
        console.warn("Invalid image URL format:", existingUserType.img);
      }
    }

    let imageUrl = existingUserType.img; // Preserve existing image if no new one is uploaded

    // Upload new image if provided
    if (req.files?.length > 0) {
      const file = req.files[0];
      const { buffer, mimetype, originalname } = file;
      try {
        const { url } = await putObject(
          { data: buffer, mimetype },
          `aol-login-cards/${Date.now()}-${originalname}`
        );
        imageUrl = url;
      } catch (uploadError) {
        console.error("Failed to upload new image:", uploadError);
        return res.status(500).json({
          message: "Failed to upload image",
        });
      }
    }

    // Update UserType document with all fields
    const updatedUserType = await UserType.findByIdAndUpdate(
      id,
      {
        usertype,
        img: imageUrl,
        link, // Added link to the update
      },
      {
        new: true,
        runValidators: true, // Ensure validations are run
      }
    ).lean();

    if (!updatedUserType) {
      return res
        .status(404)
        .json({ message: "UserType not found after update" });
    }

    res.status(200).json({
      message: "Updated successfully",
      data: updatedUserType,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const deleteUserType = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete UserType with ID: ${id}`);

    // Step 1: Find the user first
    const existingUserType = await UserType.findById(id);
    if (!existingUserType) {
      return res.status(404).json({ message: "UserType not found" });
    }

    // Step 2: Delete image from S3 if it exists
    if (existingUserType.img) {
      const urlParts = existingUserType.img.split("cards/");
      if (urlParts.length > 1) {
        const key = `aol-login-cards/${urlParts[1]}`;
        await deleteObject(key); // This is your S3 helper to delete
        console.log("Deleted image from S3:", key);
      } else {
        console.warn("Invalid image URL format:", existingUserType.img);
      }
    }

    // Step 3: Delete the UserType from DB
    await UserType.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "UserType and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting UserType:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const changeLikeOrDislike = async (req, res) => {
  console.log("running");

  try {
    const { id } = req.params; // Assuming you're passing `id` in the route parameter
    const { cardId } = req.body;
    console.log("🚀 ~ changeLikeOrDislike ~ id:", id);
    console.log("🚀 ~ changeLikeOrDislike ~ cardId:", cardId);
    const exist = await DeviceToken.findById(id);
    console.log("🚀 ~ changeLikeOrDislike ~ exist:", exist);
    if (!exist) {
      return res.status(404).json({ message: "Device not found." });
    }
    const exisstcardId = await UserType.findById(cardId);
    if (!exisstcardId) {
      return res.status(404).json({ message: "UserType not found." });
    }

    if (!exist.userTypes.some((id) => id.toString() === cardId)) {
      console.log("not available");
      exist.userTypes.push(cardId);
      await exist.save();
    } else {
      console.log("available");
      // Remove the cardId from the array
      exist.userTypes = exist.userTypes.filter(
        (id) => id.toString() !== cardId
      );
      await exist.save();
    }

    // Continue with further logic here...
    return res.status(200).json({
      message: "DeviceToken found.",
      data: exist,
      userType: exisstcardId,
    });
  } catch (error) {
    console.error("❌ Error toggling favourite:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const changeHomeLikeOrDislike = async (req, res) => {
  try {
    const { id } = req.params; // Assuming you're passing `id` in the route parameter
    const { cardId } = req.body;
    const exist = await DeviceToken.findById(id);
    const exisstcardId = await Card.findById(cardId);
    if (!exist) {
      return res.status(404).json({ message: "Device not found." });
    }
    if (!exisstcardId) {
      return res.status(404).json({ message: "UserType home not found." });
    }

    if (!exist.CardTypes.some((id) => id.toString() === cardId)) {
      console.log("not available");
      exist.CardTypes.push(cardId);
      await exist.save();
    } else {
      console.log("available");
      // Remove the cardId from the array
      exist.CardTypes = exist.CardTypes.filter(
        (id) => id.toString() !== cardId
      );
      await exist.save();
    }

    // Continue with further logic here...
    return res.status(200).json({
      message: "DeviceToken found.",
      data: exist,
      Card: exisstcardId,
    });
  } catch (error) {
    console.error("❌ Error toggling favourite:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
export const changeStaticLikeOrDislike = async (req, res) => {
  try {
    const { id } = req.params; // DeviceToken document _id
    const { cardId } = req.body; // The staticType string to toggle

    const exist = await DeviceToken.findById(id);
    if (!exist) {
      return res.status(404).json({ message: "Device not found." });
    }

    const index = exist.staticType.findIndex((type) => type === cardId);

    if (index === -1) {
      // Not present, so add
      exist.staticType.push(cardId);
      console.log("Added to staticType:", cardId);
    } else {
      // Present, so remove
      exist.staticType.splice(index, 1);
      console.log("Removed from staticType:", cardId);
    }

    await exist.save();

    return res.status(200).json({
      message: "staticType updated successfully.",
      data: exist,
    });
  } catch (error) {
    console.error("❌ Error toggling staticType:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const changeYoutubeLikeOrDislike = async (req, res) => {
  try {
    const { id } = req.params; // Assuming you're passing `id` in the route parameter
    const { cardId } = req.body;
    const exist = await DeviceToken.findById(id);
    if (!exist) {
      return res.status(404).json({ message: "Device not found." });
    }
    const exisstcardId = await YouTube.findById(cardId);
    if (!exisstcardId) {
      return res.status(404).json({ message: "UserType not found." });
    }

    if (!exist.userTypes.some((id) => id.toString() === cardId)) {
      console.log("not available");
      exist.userTypes.push(cardId);
      await exist.save();
    } else {
      console.log("available");
      // Remove the cardId from the array
      exist.userTypes = exist.userTypes.filter(
        (id) => id.toString() !== cardId
      );
      await exist.save();
    }

    // Continue with further logic here...
    return res.status(200).json({
      message: "DeviceToken found.",
      data: exist,
      userType: exisstcardId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changeAdvLikeOrDislike = async (req, res) => {
  try {
    const { id } = req.params; // Assuming you're passing `id` in the route parameter
    const { cardId } = req.body;
    const exist = await DeviceToken.findById(id);
    if (!exist) {
      return res.status(404).json({ message: "Device not found." });
    }
    const exisstcardId = await UserType.findById(cardId);
    if (!exisstcardId) {
      return res.status(404).json({ message: "UserType not found." });
    }

    if (!exist.userTypes.some((id) => id.toString() === cardId)) {
      console.log("not available");
      exist.userTypes.push(cardId);
      await exist.save();
    } else {
      console.log("available");
      // Remove the cardId from the array
      exist.userTypes = exist.userTypes.filter(
        (id) => id.toString() !== cardId
      );
      await exist.save();
    }

    // Continue with further logic here...
    return res.status(200).json({
      message: "DeviceToken found.",
      data: exist,
      userType: exisstcardId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const singleuserType = async (req, res) => {
  try {
    const { id } = req.params;

    // Find device token and populate associated userTypes
    const user = await DeviceToken.findById(id).select("userTypes");

    if (!user) {
      return res.status(404).json({ message: "DeviceToken not found" });
    }

    const userTypes = user.userTypes;
    console.log("🚀 ~ singleuserType ~ userTypes:", userTypes);

    // const favoriteAuthors = userTypes.filter((u) => u.favourite);
    // const nonFavoriteAuthors = userTypes.filter((u) => !u.favourite);

    res.status(200).json({
      totalUserTypes: userTypes.length,
      // favoriteAuthorsCount: favoriteAuthors.length,
      // nonFavoriteAuthorsCount: nonFavoriteAuthors.length,
      // favoriteAuthors,
      // nonFavoriteAuthors,
      userTypes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const singleHomeuserType = async (req, res) => {
  try {
    const { id } = req.params;

    // Find device token and populate associated userTypes
    const user = await DeviceToken.findById(id).select("CardTypes");

    if (!user) {
      return res.status(404).json({ message: "DeviceToken not found" });
    }

    const CardTypes = user.CardTypes;
    console.log("🚀 ~ singleuserType ~ CardTypes:", CardTypes);

    // const favoriteAuthors = CardTypes.filter((u) => u.favourite);
    // const nonFavoriteAuthors = CardTypes.filter((u) => !u.favourite);

    res.status(200).json({
      totalCardTypes: CardTypes.length,
      // favoriteAuthorsCount: favoriteAuthors.length,
      // nonFavoriteAuthorsCount: nonFavoriteAuthors.length,
      // favoriteAuthors,
      // nonFavoriteAuthors,
      CardTypes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const favouriteCardDisplay = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await DeviceToken.findById(id).select("userTypes");

    if (!user) {
      return res.status(404).json({ message: "DeviceToken not found" });
    }

    const userTypesIds = user.userTypes;
    console.log("🚀 ~ singleuserType ~ userTypes:", userTypesIds);
    const userTypes = await UserType.find({ _id: { $in: userTypesIds } });

    console.log("🚀 ~ favouriteCardDisplay ~ userTypes:", userTypes);

    res.status(200).json({ userTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const favouriteHomeCardDisplay = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await DeviceToken.findById(id).select("CardTypes");
    console.log("🚀 ~ favouriteHomeCardDisplay ~ user:", user);

    if (!user) {
      return res.status(404).json({ message: "DeviceToken not found" });
    }

    const userTypesIds = user.CardTypes;
    console.log("🚀 ~ singleuserType ~ userTypes:", userTypesIds);
    const userTypes = await Card.find({ _id: { $in: userTypesIds } });

    console.log("🚀 ~ favouriteCardDisplay ~ userTypes:", userTypes);

    res.status(200).json({ userTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const favouriteCardDisplayLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body;

    console.log(language, "language 😁");

    // 1. Find device token by ID
    const user = await DeviceToken.findById(id).select("userTypes");
    if (!user) {
      return res.status(404).json({ message: "DeviceToken not found" });
    }

    const userTypesIds = user.userTypes;
    console.log("🚀 ~ userTypes IDs:", userTypesIds);

    // 2. Get userType documents (e.g., card names)
    const userTypes = await UserType.find({ _id: { $in: userTypesIds } });

    let translatedUserTypes = userTypes;

    // 3. Translate if language is not English
    if (language && language !== "en") {
      // Assuming each userType has a `name` field to translate
      translatedUserTypes = await Promise.all(
        userTypes.map(async (type) => {
          const translatedName = await translateText(type.name, language);
          return {
            ...type.toObject(),
            name: translatedName,
          };
        })
      );
    }

    console.log("🚀 ~ Translated userTypes:", translatedUserTypes);

    // 4. Send response
    res.status(200).json({ userTypes: translatedUserTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const favouriteHomeCardDisplayLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body;

    const user = await DeviceToken.findById(id).select("CardTypes");
    if (!user) {
      return res.status(404).json({ message: "DeviceToken not found" });
    }

    const cardTypeIds = user.CardTypes;
    const cards = await Card.find({ _id: { $in: cardTypeIds } });

    let translatedCards = cards;

    if (language && language !== "en") {
      // Translate card names if the requested language is not English
      translatedCards = await Promise.all(
        cards.map(async (card) => {
          const translatedName = await translateText(card.name, language);
          return {
            ...card.toObject(),
            name: translatedName,
          };
        })
      );
    }

    res.status(200).json({ userTypes: translatedCards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
