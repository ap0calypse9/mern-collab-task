const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Add this import!
const {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: Put the search route BEFORE the /:projectId route
router.get('/search/:projectId', protect, async (req, res) => {
    try {
        const { q } = req.query;
        const { projectId } = req.params;
        
        // Add validation
        if (!q || !q.trim()) {
            return res.status(400).json({ msg: 'Search query is required' });
        }
        
        const results = await Task.find({
            project: projectId,
            $or: [
                { title: { $regex: q, $options: 'i' } }, // fuzzy match
                { description: { $regex: q, $options: 'i' } }
            ]
        });
        
        res.json(results);
    } catch (err) {
        console.error('Search error:', err); // Better logging
        res.status(500).json({ msg: err.message });
    }
});

// Other routes come after the search route
router.get('/:projectId', protect, getTasksByProject);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;