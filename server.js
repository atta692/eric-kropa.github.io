const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads folder if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const FILE_PATH = '/data/articles.json';

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Load existing articles
let articles = [];
if (fs.existsSync(FILE_PATH)) {
  articles = JSON.parse(fs.readFileSync(FILE_PATH));
}

// Save articles to file
function saveArticles() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(articles, null, 2));
}

// Get all articles
app.get('/articles', (req, res) => {
  res.json(articles);
});

// Get single article by ID
app.get('/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid article ID' });

  const article = articles.find(a => a && a.id === id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  res.json(article);
});

// Post new article
app.post('/articles', upload.single('image'), (req, res) => {
  const { title, body, category } = req.body;
  const baseUrl = req.protocol + '://' + req.get('host');
  const image = req.file ? `${baseUrl}/uploads/${req.file.filename}` : '';

  const newArticle = { id: Date.now(), title, body, category, image };
  articles.push(newArticle);
  saveArticles();
  res.json({ message: 'Article posted!', article: newArticle });
});

// Delete article
app.delete('/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = articles.findIndex(a => a && a.id === id);

  if (index === -1) return res.status(404).json({ error: 'Article not found' });

  const deleted = articles.splice(index, 1)[0];
  saveArticles();
  res.json({ message: 'Article deleted', article: deleted });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
