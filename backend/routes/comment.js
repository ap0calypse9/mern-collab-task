const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET all comments for a task
router.get('/:taskId', async (req, res) => {
    try {
        const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// POST a comment (save to DB)
router.post('/', async (req, res) => {
    try {
        const { taskId, user, message } = req.body;
        const comment = await Comment.create({ taskId, user, message });
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
