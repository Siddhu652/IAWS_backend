const IAWS_DB = require("../config/db");

const { generateToken } = require("../utils/jwt");

const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      res.status(400).json({
        status: "error",
        message: "Mobile Number is required",
      });
    }

    const user = await IAWS_DB.user.findUnique({
      where: {
        mobileno: mobile,
      },
      select: {
        id: true,
        fullname: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found for this mobile number",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.otpVerification.deleteMany({
      where: { mobile },
    });

    // Save new OTP
    await prisma.otpVerification.create({
      data: { mobile, otp },
    });

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      data: { otp },
    });
  } catch (error) {
    console.error("sendOTP Error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};


const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        status: "failed",
        message: "Mobile and OTP are required",
      });
    }

  
    const getOtp = await prisma.otpVerification.findFirst({
      where: { mobile, otp },
    });

    if (!getOtp) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid or expired OTP",
      });
    }

    
    const user = await prisma.user.findUnique({
      where: { mobileno: mobile },
      select: { id: true, fullname: true, mobileno: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    
    const token = generateToken({
      id: user.id,
      mobile: user.mobileno,
      role: user.role,
    });

    
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

  
    await prisma.otpVerification.deleteMany({
      where: { mobile },
    });

    return res.status(200).json({
      status: "success",
      message: "OTP verified, logged in successfully",
      user: {
        id: user.id,
        fullname: user.fullname,
        role: user.role,
      }
    });

  } catch (error) {
    console.error("verifyOTP Error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};


const logout = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
