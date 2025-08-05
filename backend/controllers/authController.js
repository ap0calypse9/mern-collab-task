const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
    const { fullName, username, email, password } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName, username, email, password: hashedPassword });

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, sameSite: 'Lax' });

        res.status(201).json({ user });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, sameSite: 'Lax' });

        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
};

const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ msg: 'Logged out' });
};

module.exports = { registerUser, loginUser, getMe, logoutUser };
