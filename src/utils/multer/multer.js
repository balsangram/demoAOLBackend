import multer from "multer";

const storage = multer.memoryStorage();
export const upload_V2 = multer({ storage });
