const User = require("../models/user.model");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name, university, course, branch, cgpa, skills,
    } = req.body;

    const userData = {
      name, university, course, branch, cgpa,
    };

    // Handle skills - parse if it's a string
    if (skills) {
      let parsedSkills = [];
      if (Array.isArray(skills)) {
        parsedSkills = skills;
      } else if (typeof skills === "string" && skills.trim()) {
        try {
          parsedSkills = JSON.parse(skills);
        } catch {
          parsedSkills = skills.split(",").map((item) => item.trim()).filter(Boolean);
        }
      }
      userData.skills = parsedSkills;
    }

    // Handle resume and profile pic uploads if files exist
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === "resume") {
          userData.resumeURL = `/uploads/${file.filename}`;
        } else if (file.fieldname === "profilePic") {
          userData.profilePic = `/uploads/${file.filename}`;
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      userData,
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        welcome: `Welcome ${req.user.name}`,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          profilePic: req.user.profilePic,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
};
