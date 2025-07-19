import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { inngest } from "../inngest/client.js";

export const signUp = async (req, res) => {
  const {name, email, password, skills = []} = req.body;

  try {
     if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email : email.toLowerCase(),
      password: hashedPassword,
      skills,
    });

    // Fire inngest event
    await inngest.send({
        name: "user/signup",
        date:{
            email: email.toLowerCase(),
        }
    })
    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj, token });
  } 
  catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const userObj = existingUser.toObject();
    delete userObj.password;

    res.status(200).json({ user: userObj, token });
  } 
  catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({error : "Unauthorized"});
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {  
                return res.status(401).json({error : "Unauthorized"});
            }

            res.status(200).json({ message: "Logged out successfully" });
        })
 
  } 
  catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!req.user || (req.user.role !== "admin" && req.user.email !== email.toLowerCase())) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (skills.length) user.skills = skills;
    if (role && req.user.role === "admin") user.role = role;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: "User updated successfully", user: userObj });
  } 
  catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await User.find().select("-password");
    res.status(200).json(users);
  } 
  catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};