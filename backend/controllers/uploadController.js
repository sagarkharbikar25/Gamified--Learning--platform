const cloudinary = require("cloudinary").v2;
const Submission = require("../models/Submission");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
 
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 
// Multer local storage (temp before Cloudinary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/temp");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
 
const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/gif", "text/plain"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("File type not allowed. Use PDF, DOC, DOCX, JPG, PNG, or TXT"), false);
};
 
const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
 
// @desc  Upload file for submission
// @route POST /api/uploads/submission/:submissionId
const uploadSubmissionFile = async (req, res) => {
  const { submissionId } = req.params;
  const submission = await Submission.findById(submissionId);
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
  if (submission.studentId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
 
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
 
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `eduquest/submissions/${submissionId}`,
      resource_type: "auto",
      public_id: `${req.user._id}_${Date.now()}`,
    });
 
    // Clean up local temp file
    fs.unlinkSync(req.file.path);
 
    const fileData = {
      name: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      type: req.file.mimetype,
      size: req.file.size,
    };
 
    submission.files.push(fileData);
    if (submission.status === "pending") submission.status = "submitted";
    submission.submittedAt = new Date();
    await submission.save();
 
    res.json({ success: true, file: fileData, submission });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: "File upload failed: " + err.message });
  }
};
 
// @desc  Delete file from submission
// @route DELETE /api/uploads/file/:publicId
const deleteFile = async (req, res) => {
  const { publicId } = req.params;
  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: "File deleted" });
};
 
module.exports = { upload, uploadSubmissionFile, deleteFile };
 
