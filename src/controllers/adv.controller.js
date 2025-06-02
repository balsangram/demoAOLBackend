import fs from "fs";
import Advertisement from "../models/Adv.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
import HistoryAdvertise from "../models/history/HistoryAdvertise.model.js";

// export const addAdvertisement = async (req, res) => {
//   try {
//     // ✅ Validate required files and links
//     const file = req.file;
//     console.log(file, "file");

//     if (!req.files || !req.files.img1 || !req.files.img2 || !req.files.img3) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All images are required" });
//     }

//     if (!req.body.link1 || !req.body.link2 || !req.body.link3) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All links are required" });
//     }

//     // ✅ Delete old ads
//     await Advertisement.deleteMany({});
//     console.log("Old advertisements deleted.");

//     // ✅ Upload new images and prepare data
//     const imageData = await Promise.all(
//       ["img1", "img2", "img3"].map(async (key, index) => {
//         const file = req.files[key]?.[0];

//         if (!file) throw new Error(`Missing image: ${key}`);
//         console.log(`Uploading ${file.originalname} to Cloudinary...`);

//         const uploadedImage = await uploadCloudinary(file.path);
//         console.log(`Uploaded to: ${uploadedImage.secure_url}`);

//         // ✅ Clean up temp file
//         if (fs.existsSync(file.path)) {
//           await fs.promises.unlink(file.path);
//           console.log(`Deleted local file: ${file.path}`);
//         }

//         return {
//           link: req.body[`link${index + 1}`],
//           img: uploadedImage.secure_url,
//         };
//       })
//     );

//     // ✅ Save to DB
//     const newAdvertisement = await Advertisement.create({
//       img1: imageData[0],
//       img2: imageData[1],
//       img3: imageData[2],
//     });

//     return res.status(201).json({
//       success: true,
//       message: "New advertisements saved successfully",
//       data: newAdvertisement,
//     });
//   } catch (error) {
//     console.error("Error uploading advertisement:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const addAdvertisement = async (req, res) => {
//   try {
//     if (!req.files) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Images are required" });
//     }

//     // Check if all link fields exist in the request body
//     if (!req.body.link1 || !req.body.link2 || !req.body.link3) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All links are required" });
//     }

//     // Upload images to Cloudinary
//     const imageData = await Promise.all(
//       ["img1", "img2", "img3"].map(async (key, index) => {
//         if (!req.files[key]) throw new Error(`Missing image: ${key}`);

//         const file = req.files[key][0];
//         const uploadedImage = await uploadCloudinary(file.path);

//         // Delete temp file after upload
//         await fs.promises.unlink(file.path).catch(() => {});

//         return {
//           link: req.body[`link${index + 1}`],
//           img: uploadedImage.secure_url,
//         };
//       })
//     );

//     // Save image URLs to MongoDB
//     const newAdvertisement = await Advertisement.create({
//       img1: imageData[0],
//       img2: imageData[1],
//       img3: imageData[2],
//     });

//     res.status(201).json({
//       success: true,
//       message: "Advertisements saved",
//       data: newAdvertisement,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const addAdvertisement = async (req, res) => {
//   try {
//     const { img1, img2, img3 } = req.files;
//     const { link1, link2, link3 } = req.body;

//     // Validate files and links
//     if (!img1 || !img2 || !img3) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All 3 images are required" });
//     }

//     if (!link1 || !link2 || !link3) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All 3 links are required" });
//     }

//     // Check for existing advertisements
//     const existingAds = await Advertisement.find();

//     if (existingAds.length > 0) {
//       // Store previous ads in HistoryAdvertise before deletion
//       await HistoryAdvertise.create({
//         archivedAds: existingAds,
//         archivedAt: new Date(),
//       });

//       await Advertisement.deleteMany();
//       console.log("Old advertisements archived and deleted.");
//     }

//     const files = [img1[0], img2[0], img3[0]];
//     const links = [link1, link2, link3];
//     const imageData = [];

//     for (let i = 0; i < files.length; i++) {
//       const uploaded = await uploadToCloudinary(
//         files[i].buffer,
//         files[i].originalname
//       );

//       imageData.push({
//         img: uploaded.secure_url,
//         link: links[i],
//       });
//     }

//     // Create new advertisement
//     const newAd = await Advertisement.create({
//       img1: imageData[0],
//       img2: imageData[1],
//       img3: imageData[2],
//     });

//     res.status(201).json({
//       success: true,
//       message: "Advertisement uploaded successfully",
//       data: newAd,
//     });
//   } catch (error) {
//     console.error("Upload Error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const addAdvertisement = async (req, res) => {
  try {
    const { img1, img2, img3 } = req.files;
    const { link1, link2, link3, title1, title2, title3 } = req.body;

    if (!img1 || !img2 || !img3) {
      return res.status(400).json({
        success: false,
        message: "All 3 images are required",
      });
    }

    if (!link1 || !link2 || !link3) {
      return res.status(400).json({
        success: false,
        message: "All 3 links are required",
      });
    }

    if (!title1 || !title2 || !title3) {
      return res.status(400).json({
        success: false,
        message: "All 3 titles are required",
      });
    }

    const existingAds = await Advertisement.find();

    if (existingAds.length > 0) {
      await HistoryAdvertise.create({
        archivedAds: existingAds,
        archivedAt: new Date(),
      });

      await Advertisement.deleteMany();
      console.log("Previous advertisements archived and deleted.");
    }

    const files = [img1[0], img2[0], img3[0]];
    const links = [link1, link2, link3];
    const titles = [title1, title2, title3];
    const imageData = [];

    for (let i = 0; i < files.length; i++) {
      const uploaded = await uploadToCloudinary(
        files[i].buffer,
        files[i].originalname
      );

      imageData.push({
        img: uploaded.secure_url,
        link: links[i],
        title: titles[i],
      });
    }

    const newAd = await Advertisement.create({
      img1: imageData[0],
      img2: imageData[1],
      img3: imageData[2],
    });

    res.status(201).json({
      success: true,
      message: "Advertisement uploaded successfully",
      data: newAd,
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

export const getAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch advertisements" });
  }
};

export const displayHistoryOfAdvertisement = async (req, res) => {
  try {
    const historyOfAdvertisement = await HistoryAdvertise.find();
    res
      .status(200)
      .json({ message: "display all advertisement ", historyOfAdvertisement });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch advertisements" });
  }
};

// import { upload } from "../middleware/multer.middleware.js";
// import Adv from "../models/Adv.model.js";
// import { uploadCloudinary } from "../utils/cloudnary.js";
// // import YouTube from "../models/Youtube.model.js";
// // import fs from "fs";

// // Controller to add a new advertisement
// import fs from "fs";

// export const addAdv = async (req, res) => {
//   console.log(req.body, "body");
//   console.log(req.file), "file ... ";

//   try {
//     // Required image and link fields
//     const requiredImages = ["img1", "img2", "img3"];
//     console.log(requiredImages, "requiredImages");

//     const requiredLinks = ["link1", "link2", "link3"];
//     console.log(requiredLinks, "requiredLinks");

//     // ✅ Validate uploaded images
//     if (!req.files || Object.keys(req.files).length < 3) {
//       return res.status(400).json({
//         message: "Minimum three images are required",
//         required: requiredImages,
//       });
//     }

//     // ✅ Ensure each required image exists
//     for (const img of requiredImages) {
//       if (!req.files[img] || !req.files[img][0]) {
//         return res.status(400).json({
//           message: `Missing required image: ${img}`,
//           required: requiredImages,
//         });
//       }
//     }

//     // ✅ Ensure each required link exists in the request body
//     for (const link of requiredLinks) {
//       if (!req.body[link]) {
//         return res.status(400).json({
//           message: `Missing required link: ${link}`,
//           required: requiredLinks,
//         });
//       }
//     }

//     // ✅ Process images: Upload to Cloudinary & clean up local files
//     const imageData = await Promise.all(
//       requiredImages.map(async (key, index) => {
//         const file = req.files[key][0];

//         // Validate file type
//         if (!file.mimetype.startsWith("image/")) {
//           throw new Error(`File ${key} is not a valid image`);
//         }

//         // Upload to Cloudinary
//         const uploadedImage = await uploadCloudinary(file.path);

//         // Delete temporary file after upload
//         try {
//           await fs.promises.unlink(file.path);
//         } catch (cleanupError) {
//           console.error(`Error deleting temp file ${file.path}:`, cleanupError);
//         }

//         return {
//           url: uploadedImage.url, // Cloudinary URL
//           link: req.body[requiredLinks[index]], // Corresponding link
//         };
//       })
//     );

//     // ✅ Clear previous advertisements
//     await Adv.deleteMany({});

//     // ✅ Save new advertisement data
//     const newAdv = new Adv({ img: imageData });
//     await newAdv.save();

//     res.status(201).json({
//       success: true,
//       message: "Advertisements updated successfully",
//       data: newAdv,
//     });
//   } catch (error) {
//     console.error("Error in addAdv:", error);

//     // Handle specific errors
//     let status = 500;
//     let message = "Failed to process advertisements";

//     if (error.message.includes("not a valid image")) {
//       status = 400;
//       message = error.message;
//     } else if (error.name === "ValidationError") {
//       status = 400;
//       message = "Invalid advertisement data";
//     }

//     res.status(status).json({
//       success: false,
//       message,
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Controller to fetch all advertisements
// export const getAdvs = async (req, res) => {
//   try {
//     const advs = await Adv.find().sort({ createdAt: -1 }); // Get newest first
//     if (!advs || advs.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No advertisements found",
//         data: [],
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: advs.length,
//       data: advs,
//     });
//   } catch (error) {
//     console.error("Error fetching advertisements:", error);

//     // Handle specific Mongoose errors
//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data format",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch advertisements",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Controller to delete an advertisement
// // export const deleteAdv = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const adv = await Adv.findById(id);

// //     if (!adv) {
// //       return res.status(404).json({ message: "Advertisement not found" });
// //     }

// //     await Adv.findByIdAndDelete(id);
// //     res.status(200).json({ message: "Advertisement deleted successfully" });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Failed to delete advertisement" });
// //   }
// // };

// // export const displayYoutubeLink = async (req, res) => {
// //   try {
// //     const youtubeLinks = await YouTube.find();
// //     res.status(200).json(youtubeLinks);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Failed to delete advertisement" });
// //   }
// // };
