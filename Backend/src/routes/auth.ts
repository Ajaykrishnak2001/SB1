import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router: Router = express.Router();

//  Ensure Express can parse JSON requests
router.use(express.json());

//  User Login Route
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    console.log(" Incoming Request Body:", req.body);

    // 🔍 Find user in database
    const user = await User.findOne({ username });
    if (!user) {
      console.log(" User not found:", username);
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    console.log(" User found:", user);

    //  Ensure password is stored correctly
    if (!user.password) {
      console.log(" User password is missing in the database.");
      res.status(500).json({ error: "Server error: User password missing." });
      return;
    }

    // Compare passwords **without hashing**
    if (password !== user.password) {
      console.log(" Incorrect password for:", username);
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    // 🔑 Validate JWT_SECRET
    console.log(" JWT_SECRET:", process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    //  Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role ,name:user.name,expertName:user.expertName},
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    console.log(" Login successful for:", username);

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, role: user.role, name: user.name,  
        expertName: user.expertName } 
    });

  } catch (error: any) {
    console.error(" Error in /login:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
