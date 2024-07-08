import express from "express";
import {
  signup,
  signin,
  google,
} from "../controllers/auth.controller.js"; // Assuming phoneLogin is in the same controller file
import { body, validationResult } from "express-validator";
import { sendOtp, verifyOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/send-otp", body("phoneNumber").isMobilePhone(), sendOtp);
router.post("/verify-otp", [
  body("phoneNumber").isMobilePhone(),
  body("otp").isLength({ min: 4, max: 6 }),
], verifyOtp);
export default router;
