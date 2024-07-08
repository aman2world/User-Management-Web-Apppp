import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

// Registration API Controller
export const signup = async (req, res, next) => {
  const { username, email, password, telephone } = req.body;

  if (!username || !email || !password || !telephone) {
    return next(errorHandler(400, "All fields are required"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  try {
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      telephone,
    });
    await newUser.save();
    res.json("Signup successful");
  } catch (error) {
    next(error);
  }
};

// Signin API Controller
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Prevent CSRF attacks
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// Google Post Data API Controller
export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password, ...rest } = user._doc;
      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password, ...rest } = newUser._doc;
      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req, res, next) => {
  let { phoneNumber } = req.body;

  console.log("Received phone number:", phoneNumber);

  try {
    // Remove any non-digit characters
    phoneNumber = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid number (10 digits)
    if (phoneNumber.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid number. Please enter 10 digits." });
    }

    let user = await User.findOne({ telephone: phoneNumber });
    console.log("User found:", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number not registered" });
    }

    // Format the phone number for Twilio (add +91 prefix)
    const formattedNumber = "+91" + phoneNumber;

    console.log("Formatted number for Twilio:", formattedNumber);

    await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: formattedNumber, channel: "sms" });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Twilio Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error sending OTP: " + error.message });
  }
};

export const verifyOtp = async (req, res, next) => {
  let { phoneNumber, otp, pastExperience, skillSets } = req.body;

  console.log("Received verification request:", {
    phoneNumber,
    otp,
    pastExperience,
    skillSets,
  });

  try {
    // Remove any non-digit characters
    phoneNumber = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid number (10 digits)
    if (phoneNumber.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid number. Please enter 10 digits." });
    }

    // Format the phone number for Twilio (add +91 prefix)
    const formattedNumber = "+91" + phoneNumber;

    console.log("Formatted number for Twilio:", formattedNumber);

    const verification_check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: formattedNumber, code: otp });

    if (verification_check.status === "approved") {
      let user = await User.findOne({ telephone: phoneNumber });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.pastExperience = pastExperience;
      user.skillSets = skillSets;
      await user.save();

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = user._doc;

      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .json({ success: true, ...rest });
    } else {
      res
        .status(400)
        .json({ success: false, message: "OTP verification failed" });
    }
  } catch (error) {
    console.error("Twilio Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error verifying OTP: " + error.message,
      });
  }
};

