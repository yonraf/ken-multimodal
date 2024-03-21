const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve files from the 'files' directory
app.use('/files', express.static(path.join(__dirname, 'tm-my-audio-model')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});