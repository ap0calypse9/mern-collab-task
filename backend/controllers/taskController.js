const Task = require('../models/Task');

// @desc Get tasks for a specific project
const getTasksByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tasks = await Task.find({ project: projectId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc Create new task under a project
const createTask = async (req, res) => {
    try {
        const { title, description, status, project } = req.body;

        if (!title || !project) {
            return res.status(400).json({ msg: "Title and Project ID are required" });
        }

        const task = await Task.create({ title, description, status, project });
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc Update a task
const updateTask = async (req, res) => {
    try {
        const updated = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updated) return res.status(404).json({ msg: "Task not found" });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc Delete a task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ msg: "Task not found" });

        await task.deleteOne();
        res.json({ msg: "Task deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask
};
