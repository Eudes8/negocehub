require('dotenv').config();
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Use Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));