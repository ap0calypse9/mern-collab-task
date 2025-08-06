const Project = require('../models/Project');

// @desc Get all projects for the logged-in user
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc Create new project
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) return res.status(400).json({ msg: "Project name is required" });

        const project = await Project.create({
            name,
            description,
            user: req.user.id
        });

        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc Update a project
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ msg: "Project not found" });
        if (project.user.toString() !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc Delete a project
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ msg: "Project not found" });
        if (project.user.toString() !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

        await project.deleteOne();
        res.json({ msg: "Project deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
};
