const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const mongoose = require('mongoose');

// Replace this with your MongoDB Atlas connection string
const dbURI = 'mongodb+srv://wlratkowski@gmail.com:mc3H1mKsgbR6it8R@cluster0.mongodb.net/userdb?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Define a User model
const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    username: String,
    password: String // Hashed password
}));

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve login page
});

// Handle registration
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    
    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    const user = new User({ email, username, password: hashedPassword });
    await user.save();

    res.json({ message: 'Registration successful!' });
});

// Handle login
app.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    // Find the user by email or username
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' }); // Use your own secret key

    res.json({ token, message: 'Login successful!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});