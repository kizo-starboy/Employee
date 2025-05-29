const express = require('express');

const app = express();
const PORT = 5001;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('App router exists:', !!app._router);
  console.log('App stack length:', app._router ? app._router.stack.length : 'No router');
});
