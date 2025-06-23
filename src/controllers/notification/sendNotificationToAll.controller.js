import moment from "moment-timezone";
import admin from "../../../firebase.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";
import Group from "../../models/notification/Group.model.js";
import Notification from "../../models/notification/Notification.model.js";
import { CronJob } from "cron";
import { scheduleJob } from 'node-schedule';

// Constants
const IST_TIMEZONE = 'Asia/Kolkata';
const SUPPORTED_DATE_FORMATS = [
  moment.ISO_8601,
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DDTHH:mm'
];

// Utility function to convert date-time to IST
function convertDateTimeFormat(input) {
  try {
    const date = moment(input, SUPPORTED_DATE_FORMATS, true);
    if (!date.isValid()) {
      throw new Error('Invalid date format');
    }
    const dateIST = date.tz(IST_TIMEZONE);
    console.log('Converted date-time:', { input, formatted: dateIST.format() });
    return dateIST.toDate();
  } catch (error) {
    console.error('Error parsing date-time:', error.message);
    return moment().tz(IST_TIMEZONE).toDate(); // Fallback to current IST time
  }
}

// Common notification message structure
function createNotificationMessage(title, body) {
  return {
    notification: { title, body },
    android: { priority: 'high' },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          'content-available': 1
        }
      }
    },
    webpush: {
      notification: { title, body, icon: 'icon.png' },
      fcm_options: { link: 'https://yourwebsite.com' }
    }
  };
}

// Schedule notification with cron
async function scheduleNotificationWithCron(scheduleDate, message, tokens, notificationId) {
  console.log(scheduleDate,"scheduleDate");
  
  try {
    const dateIST = moment(scheduleDate).tz(IST_TIMEZONE);
    console.log('Scheduling notification for:', dateIST.format());

    if (dateIST.isBefore(moment())) {
      console.log('Scheduled time is in the past, notification not scheduled');
      return;
    }

    scheduleJob(dateIST.toDate(), async () => {
      const results = [];
      const errors = [];

      for (const token of tokens) {
        try {
          const response = await admin.messaging().send({ ...message, token });
          results.push({ token, success: true, response });
          console.log(`Notification sent to ${token} at ${dateIST.format()}`);

          await DeviceToken.findOneAndUpdate(
            { token },
            { $inc: { count: 1 } },
            { upsert: true }
          );
        } catch (error) {
          errors.push({ token, error: error.message });
          console.error(`Failed to send to ${token}:`, error.message);
        }
      }

      await Notification.findByIdAndUpdate(notificationId, { sent: true });
      console.log('Notification results:', { results, errors });
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error.message);
  }
}

// Send immediate notification
async function scheduleNotificationWithoutCron(message, tokens, notificationId) {
  const results = [];
  const errors = [];

  try {
    for (const token of tokens) {
      try {
        const response = await admin.messaging().send({ ...message, token });
        results.push({ token, success: true, response });
        console.log(`Notification sent to ${token}`);

        await DeviceToken.findOneAndUpdate(
          { token },
          { $inc: { count: 1 } },
          { upsert: true }
        );
      } catch (error) {
        errors.push({ token, error: error.message });
        console.error(`Failed to send to ${token}:`, error.message);
      }
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { sent: true });
    }
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    errors.push({ error: error.message });
  }

  return { results, errors };
}

// Send group notification
export const sendGroupNotification = async (req, res) => {
  const { title, body, groupName, NotificationTime } = req.body;
  console.log('Group notification request:', req.body);

  // Input validation
  if (!title || !body || !groupName) {
    return res.status(400).json({
      message: 'Title, body, and groupName are required'
    });
  }

  try {
    // Fetch group tokens
    const groups = await Group.find({ groupName });
    if (!groups?.length) {
      return res.status(404).json({
        message: `No group found with groupName: ${groupName}`
      });
    }

    const deviceTokenIds = groups[0].deviceTokens.map(id => id.toString());
    const userTokenDocs = await DeviceToken.find({ _id: { $in: deviceTokenIds } });

    if (!userTokenDocs?.length) {
      return res.status(404).json({
        message: 'No valid device tokens found for the group'
      });
    }

    const tokens = userTokenDocs
      .filter(doc => doc.token)
      .map(doc => doc.token);

    if (!tokens.length) {
      return res.status(404).json({
        message: 'No valid device tokens found for the group'
      });
    }

    // Process notification time
    const notificationTime = NotificationTime 
      ? convertDateTimeFormat(NotificationTime)
      : moment().tz(IST_TIMEZONE).toDate();

    // Save notification
    const notification = new Notification({
      title,
      body,
      groupName,
      deviceTokens: deviceTokenIds,
      NotificationTime: notificationTime,
      sent: false
    });
    await notification.save();
    console.log('Notification saved:', notification);

    const message = createNotificationMessage(title, body);
    const notificationTimeIST = moment(notificationTime)
      .tz(IST_TIMEZONE)
      .format('YYYY-MM-DD HH:mm');

    if (!NotificationTime) {
      // Immediate send
      const { results, errors } = await scheduleNotificationWithoutCron(message, tokens, notification._id);
      
      return res.status(200).json({
        message: `Notification sent and saved successfully. ${results.length} succeeded, ${errors.length} failed`,
        notification,
        sentAtIST: moment().tz(IST_TIMEZONE).format('YYYY-MM-DD HH:mm'),
        firebaseResponse: {
          successCount: results.length,
          failureCount: errors.length,
          errors
        }
      });
    }

    // Scheduled send
    if (moment(notificationTime).tz(IST_TIMEZONE).isBefore(moment())) {
      console.log('Scheduled time is in the past');
      return res.status(200).json({
        message: 'Notification saved but not sent (scheduled time in the past)',
        notification,
        scheduledNotificationTimeIST: notificationTimeIST
      });
    }

    await scheduleNotificationWithCron(notificationTime, message, tokens, notification._id);
    return res.status(200).json({
      message: 'Notification scheduled and saved successfully',
      notification,
      scheduledNotificationTimeIST: notificationTimeIST
    });

  } catch (error) {
    console.error('Error processing group notification:', error);
    return res.status(500).json({
      message: 'Failed to process notification',
      error: error.message
    });
  }
};

// Send single notification
export const sendSingleNotification = async (req, res) => {
  const { title, body, selectedIds, NotificationTime } = req.body;
  console.log('Single notification request:', req.body);

  // Input validation
  if (!title || !body || !Array.isArray(selectedIds) || !selectedIds.length) {
    return res.status(400).json({
      message: 'Title, body, and a non-empty array of user IDs are required'
    });
  }

  try {
    // Fetch tokens
    const userTokenDocs = await DeviceToken.find({ _id: { $in: selectedIds } });

    if (!userTokenDocs?.length) {
      return res.status(404).json({
        message: 'No valid device tokens found for the provided IDs'
      });
    }

    const tokens = userTokenDocs
      .filter(doc => doc.token)
      .map(doc => doc.token);

    if (!tokens.length) {
      return res.status(404).json({
        message: 'No valid device tokens found for the provided IDs'
      });
    }

    // Process notification time
    const notificationTime = NotificationTime 
      ? convertDateTimeFormat(NotificationTime)
      : moment().tz(IST_TIMEZONE).toDate();

    // Save notification
    const notification = new Notification({
      title,
      body,
      groupName: selectedIds.join(','),
      deviceTokens: selectedIds,
      NotificationTime: notificationTime,
      sent: false
    });
    await notification.save();
    console.log('Notification saved:', notification);

    const message = createNotificationMessage(title, body);
    const notificationTimeIST = moment(notificationTime)
      .tz(IST_TIMEZONE)
      .format('YYYY-MM-DD HH:mm');

    if (!NotificationTime) {
      // Immediate send
      const { results, errors } = await scheduleNotificationWithoutCron(message, tokens, notification._id);
      
      return res.status(200).json({
        message: `Notification sent and saved successfully. ${results.length} succeeded, ${errors.length} failed`,
        notification,
        sentAtIST: moment().tz(IST_TIMEZONE).format('YYYY-MM-DD HH:mm'),
        firebaseResponse: {
          successCount: results.length,
          failureCount: errors.length,
          errors
        }
      });
    }

    // Scheduled send
    if (moment(notificationTime).tz(IST_TIMEZONE).isBefore(moment())) {
      console.log('Scheduled time is in the past');
      return res.status(200).json({
        message: 'Notification saved but not sent (scheduled time in the past)',
        notification,
        scheduledNotificationTimeIST: notificationTimeIST
      });
    }

    await scheduleNotificationWithCron(notificationTime, message, tokens, notification._id);
    return res.status(200).json({
      message: 'Notification scheduled and saved successfully',
      notification,
      scheduledNotificationTimeIST: notificationTimeIST
    });

  } catch (error) {
    console.error('Error processing single notification:', error);
    return res.status(500).json({
      message: 'Failed to process notification',
      error: error.message
    });
  }
};

export const sendNotificationToAll = async (req, res) => {
  const { title, body, NotificationTime } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required" });
  }

  const message = {
    topic: "all",
    notification: {
      title,
      body,
    },
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const now = new Date();
    let cronTime = "* * * * * *";
    // If NotificationTime is not given, send immediately
    let nowTime = new Date();
    if (NotificationTime) {
      nowTime = new Date(NotificationTime);

      const minute = nowTime.getMinutes();
      const hour = nowTime.getHours();
      const day = nowTime.getDate();
      const month = nowTime.getMonth() + 1;
      cronTime = `${minute} ${hour} ${day} ${month} *`;

      if (nowTime < now) {
        return res.status(400).json({
          message: "NotificationTime must be in the future.",
        });
      }
    }
    console.log("🚀 ~ sendNotificationToAll ~ cronTime:", NotificationTime);
    let sentNotification = new Notification({
      title,
      body,
      status: "sent",
      sentAt: nowTime,
      NotificationTime: NotificationTime || nowTime,
    });

    if (now < nowTime) {
      const job = new CronJob(
        cronTime,
        async function () {
          console.log("inside the cron job to sedn notification to all api");
          await admin.messaging().send(message);
          // await sentNotification.save();

          // ✅ Increment count for all users
          const result = await DeviceToken.updateMany(
            {},
            { $inc: { count: 1 } }
          );
          console.log("📈 Device count updated for all users:", result);

          job.stop();
        },
        null,
        true,
        "Asia/Kolkata"
      );
    } else {
      await admin.messaging().send(message);
      // await sentNotification.save();
      const result = await DeviceToken.updateMany({}, { $inc: { count: 1 } });
      console.log("📈 Device count updated for all users:", result);
    }

    await sentNotification.save();
    // Return response
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    res.status(200).json({
      message: "Notification scheduled successfully.",
      scheduledTimeIST: istFormatter.format(nowTime),
      currentTimeIST: istFormatter.format(now),
      notification: sentNotification,
    });
  } catch (error) {
    console.error("❌ Error processing notification:", error);

    res.status(500).json({
      message: "Failed to process notification.",
      error: error.message || error,
    });
  }
};

export const saveAndSubscribeToken = async (req, res) => {
  const { token, id } = req.body;
  console.log("🚀 ~ saveAndSubscribeToken ~ req.body:", req.body);

  // Validate input
  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
    // Subscribe token to the 'all' topic first
    const response = await admin.messaging().subscribeToTopic(token, "all");
    if (!response || response.failureCount > 0) {
      const errorInfo =
        response.errors?.[0]?.error ||
        "Unknown error while subscribing to topic.";
      console.log("FCM Subscription Error:", errorInfo);

      return res.status(400).json({
        message: "Failed to subscribe token to topic 'all'.",
        error: errorInfo,
      });
    }

    console.log("Token subscribed to 'all' topic 📡:", response);

    // Save or update token
    const existing = await DeviceToken.findOne({ id });

    if (existing) {
      // Update existing token
      existing.token = token;
      await existing.save();
      console.log("Token updated for user:", id);
    } else {
      // Create new token entry
      await DeviceToken.create({ id, token });
      console.log("New token saved for user:", id);
    }

    res.status(200).json({
      message: "Token saved and subscribed to topic 'all' successfully.",
      firebaseResponse: response,
    });
  } catch (error) {
    console.log("Error in saveAndSubscribeToken:", error);

    if (error.code && error.message) {
      return res.status(500).json({
        message: "Firebase error occurred while subscribing token.",
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    res.status(500).json({
      message: "Internal server error occurred while processing token.",
      error: error.message || "Unexpected error",
    });
  }
};

export const displayAllNotification = async (req, res) => {
  try {
    const now = new Date();

    // Fetch all notifications sorted by createdAt descending
    const allNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    // Filter: only those with NotificationTime < current time
    const filtered = allNotifications.filter((n) => {
      if (!n.NotificationTime) return false;
      const notificationDate = new Date(n.NotificationTime);
      return notificationDate <= now;
    });

    // Format NotificationTime to IST and format as "DD-MM-YYYY HH:mm:ss"
    const formatted = filtered.slice(0, 5).map((n) => {
      const istTime = moment(n.NotificationTime).tz("Asia/Kolkata");
      return {
        ...n,
        NotificationTimeIST: istTime.format("DD-MM-YYYY HH:mm:ss"),
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const countDeviceTokens = async (req, res) => {
  try {
    const count = await DeviceToken.countDocuments(); // Count all device tokens
    res.status(200).json({ count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const logoutAndUnsubscribeToken = async (req, res) => {
  console.log("came in logout.,..");

  const { token } = req.body;
  console.log("🚀 ~ logoutAndUnsubscribeToken ~ token:", token);

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
    // Find the document by token and update the token field to empty string (or null)
    const updatedUser = await DeviceToken.findOneAndUpdate(
      { token },
      { $set: { token: "" } }, // or use null if you prefer: { token: null }
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Token not found in database." });
    }

    console.log("Token cleared from user document:", updatedUser);

    res.status(200).json({ message: "Token cleared successfully." });
  } catch (error) {
    console.error("Error clearing token:", error);
    res.status(500).json({
      message: "Internal server error while clearing token.",
      error: error.message || "Unexpected error",
    });
  }
};

export const displayUser = async (req, res) => {
  try {
    const devices = await DeviceToken.find();

    // Convert all timestamps to IST
    const updatedDevices = devices.map((device) => {
      return {
        ...device._doc, // get plain object
        createdAtIST: device.createdAt?.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        updatedAtIST: device.updatedAt?.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      };
    });

    res.status(200).json({
      message: "Device tokens fetched successfully",
      data: updatedDevices,
    });
  } catch (error) {
    console.error("Error fetching device tokens:", error);
    res.status(500).json({ message: "Failed to fetch device tokens" });
  }
};

export const getUserNotifications = async (req, res) => {
  const { deviceId } = req.params;
  console.log("📱 Received deviceId:", deviceId);
  const now = new Date();

  try {
    const device = await DeviceToken.findOne({ _id: deviceId.trim() });
    if (!device) {
      return res.status(404).json({ message: "Device not registered." });
    }
    console.log("🚀 ~ getUserNotifications ~ device:", device._id);
    let devId = device._id;
    console.log("🚀 ~ getUserNotifications ~ devId:", devId);
    // ✅ Reset `count` in all notifications related to the device
    // ✅ Reset count on DeviceToken
    const resetCount = await DeviceToken.findByIdAndUpdate(devId, { count: 0 });

    console.log(!resetCount);

    const deviceCreatedAt = device.createdAt;

    // Add condition to only get notifications where NotificationTime <= now
    const notifications = await Notification.find({
      createdAt: { $gte: deviceCreatedAt },
      NotificationTime: { $lte: now }, // <-- This line filters out future notifications
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const filteredNotifications = notifications.filter((notification) => {
      if (
        !notification.deviceTokens ||
        notification.deviceTokens.length === 0
      ) {
        return true;
      }
      return notification.deviceTokens.some(
        (token) => token.toString() === deviceId.toString()
      );
    });

    const formattedNotifications = filteredNotifications.map((notification) => {
      const createdAtIST = moment(notification.createdAt).tz("Asia/Kolkata");
      const updatedAtIST = moment(notification.updatedAt).tz("Asia/Kolkata");

      return {
        _id: notification._id,
        title: notification.title,
        body: notification.body,
        deviceTokens: notification.deviceTokens,
        createdAt: createdAtIST.format("DD-MM-YYYY HH:mm:ss"),
        updatedAt: updatedAtIST.format("DD-MM-YYYY HH:mm:ss"),
      };
    });

    return res.status(200).json({
      message: formattedNotifications.length
        ? "Notifications fetched successfully."
        : "No new notifications found.",
      data: formattedNotifications,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({
      message: "Server error while fetching notifications.",
      error: error.message,
    });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { username, email, phone } = req.query;

    if (!username && !email && !phone) {
      return res.status(400).json({
        message:
          "Please provide at least one search parameter (username, email, or phone).",
      });
    }

    const searchCriteria = [];

    if (username) {
      searchCriteria.push({ username: { $regex: username, $options: "i" } });
    }

    if (email) {
      searchCriteria.push({ email: { $regex: email, $options: "i" } });
    }

    if (phone) {
      searchCriteria.push({ phone: { $regex: phone, $options: "i" } });
    }

    const users = await DeviceToken.find({ $or: searchCriteria });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUser:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const userNotificationCount = async (req, res) => {
  const { deviceId } = req.params;

  try {
    const device = await DeviceToken.findById(deviceId).select("count");

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({
      count: device.count,
    });
  } catch (error) {
    console.error("❌ Error fetching notification count:", error);
    return res.status(500).json({
      message: "Server error while fetching count",
      error: error.message,
    });
  }
};