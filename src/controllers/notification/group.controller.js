import Group from "../../models/notification/Group.model.js";
import Notification from "../../models/notification/Notification.model.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";

// group

export const getAllGroupsWithDeviceTokens = async (req, res) => {
  try {
    const groups = await Group.find().populate("deviceTokens");

    res.status(200).json({
      message: "Groups fetched successfully",
      groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createGroupWithUser = async (req, res) => {
  try {
    const { groupName, deviceTokenId } = req.body;

    console.log(req.body);
    console.log("groupName:", groupName);
    console.log("deviceTokenId:", deviceTokenId);

    if (
      !groupName ||
      !Array.isArray(deviceTokenId) ||
      deviceTokenId.length === 0
    ) {
      return res.status(400).json({
        message: "groupName and at least one deviceTokenId are required.",
      });
    }

    // Optional: Check if all tokens exist (just logging or validating)
    const tokens = await DeviceToken.find({ _id: { $in: deviceTokenId } });
    if (tokens.length !== deviceTokenId.length) {
      return res
        .status(404)
        .json({ message: "One or more device tokens not found." });
    }
    console.log("🚀 ~ createGroupWithUser ~ tokens:", tokens);

    const group = new Group({
      groupName: groupName.trim(),
      deviceTokens: deviceTokenId,
    });

    await group.save();

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createGroupExcel = async (req, res) => {
  try {
    const { groupName, user } = req.body;

    if (!groupName || !Array.isArray(user) || user.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name and user list are required",
      });
    }

    // Find device tokens based on email or phone
    const deviceTokenIds = [];

    for (const u of user) {
      const foundUser = await DeviceToken.findOne({
        $or: [{ email: u.email }, { phone: u.phone }],
      });

      if (foundUser) {
        deviceTokenIds.push(foundUser._id);
      }
    }

    if (deviceTokenIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching users found",
      });
    }

    // Check for duplicate groupName
    const existingGroup = await Group.findOne({ groupName });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: "Group name already exists",
      });
    }

    // Create new group
    const newGroup = new Group({
      groupName,
      deviceTokens: deviceTokenIds,
    });

    await newGroup.save();

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error in createGroupExcel:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: "Group ID is required." });
    }

    // Find and delete the group
    const deletedGroup = await Group.findByIdAndDelete(id);

    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found." });
    }

    res
      .status(200)
      .json({ message: "Group deleted successfully.", group: deletedGroup });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateGroupUser = async (req, res) => {
  try {
    const groupId = req.params.id;
    console.log("🚀 ~ updateGroupUser ~ groupId:", groupId);
    const { addDeviceTokenIds = [], removeDeviceTokenIds = [] } = req.body;
    console.log("🚀 ~ updateGroupUser ~ addDeviceTokenIds:", addDeviceTokenIds);
    console.log(
      "🚀 ~ updateGroupUser ~ removeDeviceTokenIds:",
      removeDeviceTokenIds
    );

    // Input validation
    if (!groupId) {
      return res.status(400).json({
        message: "Group ID is required.",
      });
    }

    // Validate add/remove arrays
    if (
      !Array.isArray(addDeviceTokenIds) ||
      !Array.isArray(removeDeviceTokenIds)
    ) {
      return res.status(400).json({
        message: "addDeviceTokenIds and removeDeviceTokenIds must be arrays.",
      });
    }

    // Find the group
    const group = await Group.findById(groupId);
    console.log("🚀 ~ updateGroupUser ~ group:", group);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Merge and remove device tokens
    const currentTokenIds = new Set(
      group.deviceTokens.map((id) => id.toString())
    );

    // Remove tokens
    removeDeviceTokenIds.forEach((id) => currentTokenIds.delete(id));

    // Add tokens
    addDeviceTokenIds.forEach((id) => currentTokenIds.add(id));

    // Validate all final tokens exist
    const finalTokenArray = [...currentTokenIds];
    const validTokens = await DeviceToken.find({
      _id: { $in: finalTokenArray },
    });

    if (validTokens.length !== finalTokenArray.length) {
      return res.status(404).json({
        message: "One or more device tokens are invalid.",
      });
    }

    // Save updated tokens
    group.deviceTokens = finalTokenArray;
    await group.save();

    const populatedGroup = await group.populate("deviceTokens");

    res.status(200).json({
      message: "Group updated successfully.",
      group: populatedGroup,
    });
  } catch (error) {
    console.error("Error updating group users:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const futureNotificaton = async (req, res) => {
  try {
    const futureNotifications = await Notification.find({
      NotificationTime: { $gt: new Date() },
    }).populate("deviceTokens"); // optional: populate if you want device token details
    console.log(
      "🚀 ~ futureNotificaton ~ futureNotifications:",
      futureNotifications
    );

    res.status(200).json({
      success: true,
      count: futureNotifications.length,
      data: futureNotifications,
    });
  } catch (error) {
    console.error("Error fetching future notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
