// Main server file
const app = require('./app');
require('./src/config/database');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});