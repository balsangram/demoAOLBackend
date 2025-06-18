import moment from "moment";
import PopUp from "../models/PopUp.js";
import { putObject } from "../utils/aws/putObject.js";
// import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js"; // Cloudinary helper function

// Add a new popup (store image in Cloudinary)

// import { scheduleImageRevert } from "../utils/cronJobs/popUpScheduler.js";

// export const addPopUp = async (req, res) => {
//   try {
//     const file = req.file;
//     const { liveTime } = req.body;

//     // Validate file
//     if (!file) {
//       return res.status(400).json({ message: "Image file is required" });
//     }
//     if (!file.mimetype.startsWith("image/")) {
//       return res.status(400).json({ message: "Only image files are allowed" });
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       return res.status(400).json({ message: "Image size exceeds 5MB limit" });
//     }

//     // Parse liveTime or default to now
//     let liveTimeDate = liveTime ? new Date(liveTime) : new Date();
//     if (isNaN(liveTimeDate.getTime())) {
//       return res.status(400).json({ message: "Invalid liveTime format" });
//     }

//     // Upload to Cloudinary
//     const result = await uploadToCloudinary(file.buffer, file.originalname);
//     if (!result?.secure_url) {
//       throw new Error("Failed to upload image to Cloudinary");
//     }

//     // Save to DB
//     const newPopUp = new PopUp({
//       img: result.secure_url,
//       liveTime: liveTimeDate,
//     });

//     await newPopUp.save();

//     res.status(201).json({
//       message: "Popup added successfully",
//       popup: newPopUp,
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const addPopUp = async (req, res) => {
  console.log("popup");
  try {
    const files = req.files;
    const { liveTime } = req.body;

    // Validate file
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Image file is required" });
    }
    if (files[0].size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image size exceeds 5MB limit" });
    }

    // Parse liveTime as IST and convert to UTC
    let liveTimeDate;
    if (liveTime) {
      const parts = liveTime.split("-"); // ["14", "30", "18", "06", "2025"]
      if (parts.length === 5) {
        const [hh, mm, dd, MM, yyyy] = parts.map(Number);
        // Validate input ranges
        if (
          hh < 0 ||
          hh > 23 ||
          mm < 0 ||
          mm > 59 ||
          dd < 1 ||
          dd > 31 ||
          MM < 1 ||
          MM > 12 ||
          yyyy < 1970
        ) {
          return res.status(400).json({
            message:
              "Invalid liveTime values. Ensure hh: 00-23, mm: 00-59, dd: 01-31, MM: 01-12, yyyy: valid year",
          });
        }

        // Parse as IST using moment-timezone
        const istDate = moment.tz(
          `${yyyy}-${MM.toString().padStart(2, "0")}-${dd
            .toString()
            .padStart(2, "0")} ${hh.toString().padStart(2, "0")}:${mm
            .toString()
            .padStart(2, "0")}`,
          "YYYY-MM-DD HH:mm",
          "Asia/Kolkata"
        );

        if (!istDate.isValid()) {
          return res.status(400).json({ message: "Invalid date in liveTime" });
        }

        // Convert to UTC and get JavaScript Date object
        liveTimeDate = istDate.utc().toDate();
      } else {
        return res.status(400).json({
          message: "Invalid liveTime format. Expected hh-mm-dd-MM-yyyy",
        });
      }
    } else {
      // Default to current UTC time
      liveTimeDate = new Date();
    }
    console.log("🚀 ~ addPopUp ~ liveTimeDate (UTC):", liveTimeDate);

    // Validate date
    if (isNaN(liveTimeDate.getTime())) {
      return res.status(400).json({ message: "Invalid date in liveTime" });
    }

    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          // Use buffer directly (no temp file needed)
          const fileBuffer = file.buffer;

          const { url } = await putObject(
            { data: fileBuffer, mimetype: file.mimetype },
            `popup-cards/${Date.now()}-${file.originalname}`
          );

          uploadedFiles.push({
            file_name: file.originalname,
            file_url: url,
          });
        }
      } catch (error) {
        console.error("❌ File upload error:", error);
        return res
          .status(500)
          .json({ success: false, message: "File upload failed" });
      }
    }

    // Save to DB
    const newPopUp = new PopUp({
      img: uploadedFiles[0].file_url,
      liveTime: liveTimeDate,
    });

    await newPopUp.save();

    res.status(201).json({
      message: "Popup added successfully",
      popup: {
        _id: newPopUp._id,
        img: newPopUp.img,
        liveTime: newPopUp.liveTime, // UTC timestamp
        createdAt: newPopUp.createdAt,
        updatedAt: newPopUp.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const addPopUp = async (req, res) => {
//   try {
//     const files = req.files;
//     const { liveTime } = req.body;

//     // Validate file
//     if (!files) {
//       return res.status(400).json({ message: "Image file is required" });
//     }
//     if (files.size > 5 * 1024 * 1024) {
//       return res.status(400).json({ message: "Image size exceeds 5MB limit" });
//     }

//     // Parse custom format liveTime ("hh-mm-dd-MM-yyyy")
//     let liveTimeDate;
//     if (liveTime) {
//       const parts = liveTime.split("-"); // ["11", "02", "27", "05", "2025"]
//       if (parts.length === 5) {
//         const [hh, mm, dd, MM, yyyy] = parts.map(Number);
//         liveTimeDate = new Date(yyyy, MM - 1, dd, hh, mm);
//       } else {
//         return res.status(400).json({
//           message: "Invalid liveTime format. Expected hh-mm-dd-MM-yyyy",
//         });
//       }
//     } else {
//       liveTimeDate = new Date(); // default to now
//     }

//     if (isNaN(liveTimeDate.getTime())) {
//       return res.status(400).json({ message: "Invalid date in liveTime" });
//     }

//     const uploadedFiles = [];
//     if (req.files && req.files.length > 0) {
//       try {
//         for (const file of req.files) {
//           // Use buffer directly (no temp file needed)
//           const fileBuffer = file.buffer;

//           const { url } = await putObject(
//             { data: fileBuffer, mimetype: file.mimetype },
//             `popup-cards/${Date.now()}-${file.originalname}`
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

//     // Save to DB
//     const newPopUp = new PopUp({
//       img: uploadedFiles[0].file_url,
//       liveTime: liveTimeDate,
//     });

//     await newPopUp.save();

//     res.status(201).json({
//       message: "Popup added successfully",
//       popup: newPopUp,
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const displayPopUp = async (req, res) => {
  try {
    const latestPopUp = await PopUp.find().sort({ createdAt: -1 });

    if (!latestPopUp) {
      return res.status(404).json({ message: "No popups found" });
    }
    const utcTimestamp = new Date();

    const newPopup = [];
    latestPopUp.forEach((item) => {
      const someUtcTime = new Date(item.liveTime).getTime();

      console.log(utcTimestamp, "🚀 ~ newPopup ~ someUtcTime:", someUtcTime);
      console.log(someUtcTime <= utcTimestamp, "item.liveTime <= utcTimestamp");
      if (someUtcTime <= utcTimestamp) {
        newPopup.push(item);
      }
    });
    console.log("🚀 ~ latestPopUp.forEach ~ newPopup:", newPopup);
    // console.log("🚀 ~ displayPopUp ~ newPopup:", newPopup);
    res.status(200).json(newPopup[0] ?? []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const displayAllPopUp = async (req, res) => {
  try {
    const allPopUp = await PopUp.find().sort({ createdAt: -1 });

    // Format each popup with separate date and time fields
    const formattedPopUps = allPopUp.map((popup) => {
      const createdAt = new Date(popup.createdAt);
      const formattedDate = createdAt.toLocaleDateString(); // e.g., "4/23/2025"
      const formattedTime = createdAt.toLocaleTimeString(); // e.g., "10:30:15 AM"

      return {
        ...popup.toObject(),
        date: formattedDate,
        time: formattedTime,
      };
    });

    res.status(200).json(formattedPopUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
