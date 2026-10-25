const bcrypt = require('bcryptjs');
const dataStore = require('../services/dataStore');

// Strict VIT student email pattern: firstname.lastname@vitstudent.ac.in (digits allowed at end of lastname, e.g. rahul.kumar2024@vitstudent.ac.in)
const VIT_STUDENT_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+[0-9]*@vitstudent\.ac\.in$/;

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, VIT email, and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Enforce strict VIT student email format
    if (!VIT_STUDENT_EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid VIT student email format. Must follow the pattern: firstname.lastname@vitstudent.ac.in (e.g. rahul.kumar2024@vitstudent.ac.in)'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existing = await dataStore.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this VIT student email already exists. Please log in.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await dataStore.createUser({
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
      role: 'student'
    });

    // Save session
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to VIT Food Spot Guide!',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await dataStore.getUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Not logged in.'
      });
    }

    const user = await dataStore.getUserById(req.session.user.id);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'User no longer exists.'
      });
    }

    const favorites = await dataStore.getUserFavorites(user.id);

    return res.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        favoritesCount: favorites.length
      }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out.' });
      }
      res.clearCookie('connect.sid');
      return res.json({
        success: true,
        message: 'Logged out successfully.'
      });
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  VIT_STUDENT_EMAIL_REGEX
};
