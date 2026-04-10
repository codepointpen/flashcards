const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.listen(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'Flashcard server is alive!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));