import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import router from "./src/routes/router.js";
import { liveLinkJob } from "./src/utils/cronJobs/liveUpScheduler.js";
// import { jobNotification } from "./src/utils/cronJobs/noteficationUpScheduler.js";
// import notificationRoutes from "./firebase.js";
// import admin from "./firebase";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/auth", authRoutes);

app.use("/aol", router);

// job.start();
// notificationJob.start();
liveLinkJob.start();
// jobNotification.start();
// popupCronJob.start();
console.log("🚀 Popup cron job started");

// app.use('/cards', verifyToken, cardRoutes);
// app.use('/cards',cardRoutes);
// user type
// app.use("/user", userRoutes);

//notification
// app.use("/notifications", notificationRoutes);

// healthy api
app.get("/", (req, res) => {
  res.send("Hello, this project is Art Of Living 27-5-25:16:30");
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB(); // Wait for the database connection
    console.log("Database connected successfully");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log("connectDB not working", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

startServer();
