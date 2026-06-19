import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let mainUri = process.env.MONGO_URI;
if (!mainUri) {
  throw new Error("MONGO_URI is missing in backend/.env");
}

if (mainUri.includes("<db_password>")) {
  mainUri = mainUri.replace("<db_password>", encodeURIComponent(process.env.DB_PASSWORD || ""));
}

if (mainUri.includes("<db_username>")) {
  mainUri = mainUri.replace("<db_username>", encodeURIComponent(process.env.DB_USERNAME || ""));
}

let attUri = process.env.ATTENDANCE_MONGO_URI;
if (attUri && attUri.includes("<attendance_db_password>")) {
  attUri = attUri.replace("<attendance_db_password>", encodeURIComponent(process.env.ATTENDANCE_DB_PASSWORD || ""));
}

export const mainDB = mongoose.createConnection(mainUri, {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 15000
});

export const attendanceDB = attUri
  ? mongoose.createConnection(attUri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 15000
    })
  : null;

export const connectDB = async () => {
  mainDB.on("connected", () => console.log("Main IQAC MongoDB connected"));
  mainDB.on("error", (err) => console.error("Main DB Error:", err));

  await mainDB.asPromise();

  if (attendanceDB) {
    attendanceDB.on("connected", () => console.log("Attendance Patterns MongoDB connected"));
    attendanceDB.on("error", (err) => console.error("Attendance DB Error:", err));
    await attendanceDB.asPromise();
  } else {
    console.warn("Secondary ATTENDANCE DB Connection skipped.");
  }
};
