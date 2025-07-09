const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'latest.mp4');
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

app.post('/upload', (req, res) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: 'Upload failed', 
        message: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }
    
    res.json({ 
      message: 'Video uploaded successfully',
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

app.get('/api/video/latest', (req, res) => {
  const filePath = path.resolve('uploads/latest.mp4');
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', filePath);
      return res.status(404).json({ 
        error: 'Video not found',
        message: 'No video has been uploaded yet'
      });
    }
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ 
          error: 'Failed to serve video file' 
        });
      }
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});
