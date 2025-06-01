
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();

// Use Render's provided port or default to 3000 for local dev
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `https://eric-kropa-github-io.onrender.com`; // Replace with your Render URL if needed

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const FILE_PATH = 'articles.json';
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploads_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Load existing articles
let articles = [];
if (fs.existsSync(FILE_PATH)) {
  articles = JSON.parse(fs.readFileSync(FILE_PATH));
}

// Save to file
function saveArticles() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(articles, null, 2));
}

// GET homepage
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// GET all articles
app.get('/articles', (req, res) => {
  res.json(articles);
});

// GET single article
app.get('/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid article ID' });

  const article = articles.find(a => a && a.id === id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  res.json(article);
});

// POST new article
app.post('/articles', upload.single('image'), (req, res) => {
  const { title, body, category } = req.body;
const image = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';
  res.json({ message: 'Article posted!', article: newArticle });
});

// DELETE article
app.delete('/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid article ID' });

  const index = articles.findIndex(a => a && a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Article not found' });

  const deleted = articles.splice(index, 1)[0];
  saveArticles();
  res.json({ message: 'Article deleted', article: deleted });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
