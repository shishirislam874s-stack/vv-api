
const express = require("express");

const app = express();

app.use(express.json({
  limit: "10mb"
}));

const API_KEY = process.env.API_KEY;

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "VV API",
    version: "1.0.0",
    status: "online",
    endpoints: [
      "/api/status",
      "/api/media/inspect"
    ]
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    status: "online",
    message: "VV API is running"
  });
});

app.post("/api/media/inspect", (req, res) => {
  try {
    const key = req.headers["x-api-key"];

    if (!API_KEY || key !== API_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key"
      });
    }

    const { mimeType, base64, fileName } = req.body || {};

    if (!mimeType || !base64) {
      return res.status(400).json({
        success: false,
        message: "mimeType and base64 are required"
      });
    }

    if (
      !mimeType.startsWith("image/") &&
      !mimeType.startsWith("video/")
    ) {
      return res.status(400).json({
        success: false,
        message: "Only image and video are supported"
      });
    }

    const cleanBase64 = base64.replace(
      /^data:[^;]+;base64,/,
      ""
    );

    const buffer = Buffer.from(cleanBase64, "base64");

    if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Invalid media or file exceeds 5MB"
      });
    }

    res.json({
      success: true,
      data: {
        fileName: fileName || "media",
        mimeType,
        size: buffer.length,
        type: mimeType.startsWith("image/")
          ? "image"
          : "video",
        processed: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = app;
