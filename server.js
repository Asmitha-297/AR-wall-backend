const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, 'latest.mp4')
});
const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
  res.send({ message: 'Video uploaded successfully' });
});

app.get('/api/video/latest', (req, res) => {
  res.sendFile(path.resolve('uploads/latest.mp4'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
