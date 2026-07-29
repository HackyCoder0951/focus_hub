import app from './server.js';

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
