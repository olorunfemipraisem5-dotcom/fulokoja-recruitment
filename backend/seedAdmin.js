/**
 * Run this once to create the first admin account:
 *   node seedAdmin.js
 *
 * Edit the values below before running, or set them via environment variables.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const ADMIN_NAME = process.env.ADMIN_NAME || "FULokoja Recruitment Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fulokoja.edu.ng";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log("An account with this email already exists:", ADMIN_EMAIL);
      process.exit(0);
    }

    await User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin account created successfully:");
    console.log("  Email:", ADMIN_EMAIL);
    console.log("  Password:", ADMIN_PASSWORD);
    console.log("Log in and change this password immediately in a real deployment.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin:", err.message);
    process.exit(1);
  }
})();
