import express, { Request, Response } from "express";
import mongoose from "mongoose";

const router = express.Router();

// Define schema & model for Admin collection (use strict: false to accept dynamic fields)
const adminSchema = new mongoose.Schema({}, { strict: false, collection: "Admin" });
const Admin = mongoose.model("Admin", adminSchema);

// GET /data — return all entries from Admin collection
router.get("/data", async (req: Request, res: Response) => {
  try {
    const records = await Admin.find();
    res.json(records);
  } catch (error) {
    console.error("Error fetching Admin data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
