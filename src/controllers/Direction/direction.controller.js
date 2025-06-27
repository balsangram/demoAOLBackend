import AudioTour from "../../models/direction/AudioTour.model.js";
import Direction from "../../models/direction/Direction.model.js";
import { deleteObject } from "../../utils/aws/deleteObject.js";
import { putObject } from "../../utils/aws/putObject.js";
import { uploadToCloudinary } from "../../utils/cloudnary.js"; // Ensure this exists and works
import translateText from "../../utils/translation.js";

// export const add_direction = async (req, res) => {
//   //   console.log(req.body, "Body");
//   console.log(req.files, "Files");
//   console.log("1");

//   try {
//     const {
//       directionName,
//       directionDescription,
//       longitude,
//       latitude,
//       directionusertype,
//     } = req.body;
//     console.log(
//       "1.5",
//       directionName,
//       directionDescription,
//       longitude,
//       latitude,
//       directionusertype
//     );

//     // Validate fields
//     if (
//       !directionName ||
//       !directionDescription ||
//       !longitude ||
//       !latitude ||
//       !directionusertype ||
//       !req.files
//     ) {
//       console.log("2");

//       // console.log("🚀 ~ constadd_direction= ~ directionImg:", directionImg);
//       return res
//         .status(400)
//         .json({ message: "All fields are required including image" });
//     }
//     // console.log("file", req.file.path);

//     // Upload image
//     const uploadedFiles = [];
//     if (req.files && req.files.length > 0) {
//       try {
//         for (const file of req.files) {
//           // Use buffer directly (no temp file needed)
//           const fileBuffer = file.buffer;

//           const { url } = await putObject(
//             { data: fileBuffer, mimetype: file.mimetype },
//             `direction-img/${Date.now()}-${file.originalname}`
//           );

//           uploadedFiles.push({
//             file_name: file.originalname,
//             file_url: url,
//           });
//         }
//       } catch (error) {
//         console.log(error, "error");

//         // throw new ApiError(500, `File upload failed: ${error.message}`);
//         return res.status(500).json({ success: false, message: "Error" });
//       }
//     }
//     const directionImg = uploadedFiles[0].file_url;

//     const newDirection = new Direction({
//       directionName,
//       directionImg,
//       directionDescription,
//       longitude,
//       latitude,
//       directionusertype,
//     });
//     console.log("🚀 ~ constadd_direction= ~ newDirection:", newDirection);

//     await newDirection.save();
//     res
//       .status(201)
//       .json({ message: "Direction added successfully", data: newDirection });
//   } catch (error) {
//     console.log("error", error);

//     res.status(500).json({ message: "Failed to add direction", error });
//   }
// };

// Get all directions

export const add_direction = async (req, res) => {
  console.log("📦 Body:", req.body);
  console.log("📁 Files:", req.files);

  try {
    const {
      directionName,
      directionDescription,
      longitude,
      latitude,
      directionusertype,
      directionUserModel,
      language,
      audioTourModel,
      audioDirectionText,
      videoLink,
    } = req.body;

    // ✅ Basic validation
    if (
      !directionName ||
      !directionDescription ||
      !longitude ||
      !latitude ||
      !directionusertype ||
      !req.files?.directionImg?.length
    ) {
      return res.status(400).json({
        message:
          "All required Direction fields, including directionImg, are required.",
      });
    }

    const isTourAndMaps = directionUserModel === "Tour and Maps";

    // ✅ Check duplicate Direction
    const directionNameExists = await Direction.findOne({ directionName });
    if (directionNameExists) {
      return res.status(400).json({
        message: "Direction name already exists. Please choose another.",
      });
    }

    // ✅ Upload direction image
    const uploadedImgFile = req.files.directionImg[0];
    const imgUpload = await putObject(
      {
        data: uploadedImgFile.buffer,
        mimetype: uploadedImgFile.mimetype,
      },
      `direction-img/${Date.now()}-${uploadedImgFile.originalname}`
    );
    const directionImg = imgUpload.url;

    // ✅ Create base Direction object
    const newDirection = new Direction({
      directionName,
      directionImg,
      directionDescription,
      longitude,
      latitude,
      directionusertype,
      directionUserModel: directionUserModel || "Maps Tour only",
    });

    // 🔁 Handle Translation (if needed)
    let translatedName = directionName;
    let translatedText = audioDirectionText;

    if (isTourAndMaps && language?.toLowerCase() !== "en") {
      translatedName = await translateText(directionName, language);
      translatedText = await translateText(audioDirectionText, language);
    }

    // ✅ If "Tour and Maps", handle AudioTour creation (only if audioDirectionText or language provided)
    let newAudioTour = null;

    if (isTourAndMaps && language && audioTourModel && audioDirectionText) {
      // ✅ Optional audio upload
      let audioLinkUrl = "";
      const uploadedAudioFile = req.files?.audioLink?.[0];

      if (uploadedAudioFile) {
        const audioUpload = await putObject(
          {
            data: uploadedAudioFile.buffer,
            mimetype: uploadedAudioFile.mimetype,
          },
          `audioTour-audio/${Date.now()}-${uploadedAudioFile.originalname}`
        );
        audioLinkUrl = audioUpload.url;
      }

      // ✅ Prevent duplicate AudioTour
      const audioNameExists = await AudioTour.findOne({
        audioDirectionName: directionName,
      });
      if (audioNameExists) {
        return res.status(400).json({
          message:
            "Audio Direction Name already exists. Please choose another.",
        });
      }

      newAudioTour = new AudioTour({
        language,
        audioDirectionName: translatedName,
        audioTourModel,
        audioDirectionImg: directionImg,
        audioLink: audioLinkUrl,
        videoLink: videoLink || "",
        longitude,
        latitude,
        audioDirectionText: translatedText,
        directionUserModel,
      });

      await Promise.all([newDirection.save(), newAudioTour.save()]);
    } else {
      // ✅ Save only Direction if no audio details
      await newDirection.save();
    }

    return res.status(201).json({
      message: isTourAndMaps && newAudioTour
        ? "Direction and AudioTour added successfully."
        : "Direction added successfully.",
      data: {
        direction: newDirection,
        ...(newAudioTour ? { audioTour: newAudioTour } : {}),
      },
    });
  } catch (error) {
    console.error("❌ Error while adding direction:", error);
    return res.status(500).json({
      message: "Failed to add direction.",
      error: error.message,
    });
  }
};


// export const add_direction = async (req, res) => {
//   console.log("📦 Body:", req.body);
//   console.log("📁 Files:", req.files);

//   try {
//     const {
//       directionName,
//       directionDescription,
//       longitude,
//       latitude,
//       directionusertype,
//       directionUserModel,
//       language,
//       audioTourModel,
//       audioDirectionText,
//       videoLink,
//     } = req.body;

//     // ✅ Validate basic fields
//     if (
//       !directionName ||
//       !directionDescription ||
//       !longitude ||
//       !latitude ||
//       !directionusertype ||
//       !req.files?.directionImg?.length
//     ) {
//       return res.status(400).json({
//         message:
//           "All required Direction fields, including directionImg, are required.",
//       });
//     }

//     // ✅ Extra validation if "Tour and Maps"
//     const isTourAndMaps = directionUserModel === "Tour and Maps";

//     if (isTourAndMaps) {
//       if (
//         !language ||
//         !audioTourModel ||
//         !audioDirectionText
//         //  ||
//         // !req.files?.audioLink?.length
//       ) {
//         return res.status(400).json({
//           message:
//             "All required AudioTour fields, including audioLink, are required for 'Tour and Maps'.",
//         });
//       }
//     }

//     // ✅ Check if direction already exists
//     const directionNameExists = await Direction.findOne({ directionName });
//     if (directionNameExists) {
//       return res.status(400).json({
//         message: "Direction name already exists. Please choose another.",
//       });
//     }

//     // ✅ Check for existing AudioTour (if needed)
//     if (isTourAndMaps) {
//       const audioNameExists = await AudioTour.findOne({
//         audioDirectionName: directionName,
//       });
//       if (audioNameExists) {
//         return res.status(400).json({
//           message:
//             "Audio Direction Name already exists. Please choose another.",
//         });
//       }
//     }

//     // ✅ Upload direction image
//     const uploadedImgFile = req.files.directionImg[0];
//     const imgUpload = await putObject(
//       {
//         data: uploadedImgFile.buffer,
//         mimetype: uploadedImgFile.mimetype,
//       },
//       `direction-img/${Date.now()}-${uploadedImgFile.originalname}`
//     );
//     const directionImg = imgUpload.url;

//     // ✅ Create Direction document
//     const newDirection = new Direction({
//       directionName,
//       directionImg,
//       directionDescription,
//       longitude,
//       latitude,
//       directionusertype,
//       directionUserModel: directionUserModel || "Maps Tour only",
//     });

//     // 🔁 Optional: Translate if needed
//     let translatedName = directionName;
//     let translatedText = audioDirectionText;

//     if (isTourAndMaps && language && language.toLowerCase() !== "en") {
//       translatedName = await translateText(directionName, language);
//       translatedText = await translateText(audioDirectionText, language);
//     }

//     // ✅ If "Tour and Maps", upload audio + create AudioTour
//     if (isTourAndMaps) {
//       const uploadedAudioFile = req.files.audioLink[0];
//       const audioUpload = await putObject(
//         {
//           data: uploadedAudioFile.buffer,
//           mimetype: uploadedAudioFile.mimetype,
//         },
//         `audioTour-audio/${Date.now()}-${uploadedAudioFile.originalname}`
//       );
//       const audioLink = audioUpload.url;

//       const newAudioTour = new AudioTour({
//         language,
//         audioDirectionName: translatedName,
//         audioTourModel,
//         audioDirectionImg: directionImg,
//         audioLink,
//         videoLink: videoLink || "",
//         longitude,
//         latitude,
//         audioDirectionText: translatedText,
//         directionUserModel,
//       });

//       // ✅ Save both
//       await Promise.all([newDirection.save(), newAudioTour.save()]);

//       return res.status(201).json({
//         message: "Direction and AudioTour added successfully.",
//         data: {
//           direction: newDirection,
//           audioTour: newAudioTour,
//         },
//       });
//     }

//     // ✅ Save only Direction if not "Tour and Maps"
//     await newDirection.save();

//     return res.status(201).json({
//       message: "Direction added successfully.",
//       data: {
//         direction: newDirection,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error while adding direction:", error);
//     return res.status(500).json({
//       message: "Failed to add direction.",
//       error: error.message,
//     });
//   }
// };



export const get_direction = async (req, res) => {
  try {
    const directions = await Direction.find();
    res.status(200).json(directions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch directions", error });
  }
};

// export const update_direction = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { directionName, directionDescription, longitude, latitude } =
//       req.body;

//     let updatedFields = {
//       directionName,
//       directionDescription,
//       longitude,
//       latitude,
//     };

//     // If a new image is provided, upload to Cloudinary
//     if (req.file) {
//       const uploadedImage = await uploadToCloudinary(
//         req.file.buffer,
//         req.file.originalname
//       );
//       updatedFields.directionImg = uploadedImage.url;
//     }

//     const updatedDirection = await Direction.findByIdAndUpdate(
//       id,
//       updatedFields,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedDirection) {
//       return res.status(404).json({ message: "Direction not found" });
//     }

//     res.status(200).json({
//       message: "Direction updated successfully",
//       data: updatedDirection,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to update direction", error });
//   }
// };

export const update_direction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      directionImg,
      directionName,
      directionDescription,
      longitude,
      latitude,
    } = req.body;

    // Find the existing direction entry first
    const existingDirection = await Direction.findById(id);
    if (!existingDirection) {
      return res.status(404).json({ message: "Direction not found" });
    }

    // Prepare updated fields
    const updatedFields = {
      directionImg,
      directionName,
      directionDescription,
      longitude,
      latitude,
    };

    // Handle old image deletion if a new file is uploaded
    if (req.files && req.files.length > 0 && existingDirection.img) {
      const urlParts = existingDirection.img.split("direction-img/");
      if (urlParts.length > 1) {
        const key = `direction-img/${urlParts[1]}`;
        await deleteObject(key);
        console.log("Old image deleted:", key);
      } else {
        console.warn("Invalid image URL format:", existingDirection.img);
      }
    }

    // Upload new image if provided
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const { buffer, mimetype, originalname } = file;

      const { url } = await putObject(
        { data: buffer, mimetype },
        `direction-img/${Date.now()}-${originalname}`
      );
      console.log("urlllll", url);

      updatedFields.directionImg = url; // Add image URL to fields
    }

    // Update document in DB
    const updatedDirection = await Direction.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Direction updated successfully",
      data: updatedDirection,
    });
  } catch (error) {
    console.error("Error in update_direction:", error);
    res
      .status(500)
      .json({ message: "Failed to update direction", error: error.message });
  }
};

export const delete_direction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDirection = await Direction.findByIdAndDelete(id);

    if (!deletedDirection) {
      return res.status(404).json({ message: "Direction not found" });
    }

    res
      .status(200)
      .json({ message: "Direction deleted successfully", deletedDirection });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete direction", error });
  }
};

export const getNames = async (req, res) => {
  try {
    const { directionusertype } = req.params;
    console.log("🚀 ~ getNames ~ directionusertype:", directionusertype);

    let filter = {};

    if (directionusertype === "Visitor") {
      filter = { directionusertype: { $in: ["Visitor", "Both"] } };
    } else if (directionusertype === "Participant") {
      filter = { directionusertype: { $in: ["Participant", "Both"] } };
    } else {
      return res.status(400).json({ error: "Invalid direction user type." });
    }

    // Fetch only required fields (customize as needed)
    const directions = await Direction.find(
      filter,
      "directionName directionusertype"
    );

    res.status(200).json(directions);
  } catch (error) {
    console.error("Error fetching directions:", error);
    res.status(500).json({ error: "Server error while fetching directions." });
  }
};

export const getSingelCard = async (req, res) => {
  const { cardName } = req.params; // Get the card name from the URL params

  try {
    // Find a single direction where directionName matches the cardName
    const direction = await Direction.findOne({ directionName: cardName });

    if (!direction) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Return the found direction
    res.status(200).json(direction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch the card" });
  }
};

export const getNamesTranslated = async (req, res) => {
  try {
    const { directionusertype } = req.params;
    const { language } = req.body;

    console.log("🚀 ~ directionusertype:", directionusertype);
    console.log("🌐 ~ language:", language);

    let filter = {};

    if (directionusertype === "Visitor") {
      filter = { directionusertype: { $in: ["Visitor", "Both"] } };
    } else if (directionusertype === "Participant") {
      filter = { directionusertype: { $in: ["Participant", "Both"] } };
    } else {
      return res.status(400).json({ error: "Invalid direction user type." });
    }

    // Fetch only the required fields
    const directions = await Direction.find(
      filter,
      "directionName directionusertype"
    );

    // Translate if language is specified and not English
    if (language && language !== "en") {
      const translatedDirections = await Promise.all(
        directions.map(async (dir) => {
          const translatedName = await translateText(
            dir.directionName,
            language
          );
          return {
            ...dir.toObject(),
            directionName: translatedName,
          };
        })
      );
      return res.status(200).json(translatedDirections);
    }

    // Return untranslated if no translation needed
    res.status(200).json(directions);
  } catch (error) {
    console.error("Error fetching directions:", error);
    res.status(500).json({ error: "Server error while fetching directions." });
  }
};

export const getSingelCardTranslated = async (req, res) => {
  const { cardName } = req.params;
  const { language } = req.body;

  try {
    // Find the card by name
    const direction = await Direction.findOne({ directionName: cardName });

    if (!direction) {
      return res.status(404).json({ message: "Card not found" });
    }

    if (language && language !== "en") {
      const translatedName = await translateText(
        direction.directionName,
        language
      );
      const translatedDescription = direction.directionDescription
        ? await translateText(direction.directionDescription, language)
        : "";

      const translatedCard = {
        ...direction.toObject(),
        directionName: translatedName,
        directionDescription: translatedDescription,
      };

      return res.status(200).json(translatedCard);
    }

    // No translation needed — return original
    res.status(200).json(direction);
  } catch (error) {
    console.error("Error fetching translated card:", error);
    res.status(500).json({ message: "Failed to fetch the card" });
  }
};
