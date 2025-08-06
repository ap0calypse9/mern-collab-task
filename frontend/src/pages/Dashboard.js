import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskComments from '../components/TaskComments';

export default function Dashboard() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [taskForm, setTaskForm] = useState({ title: '', description: '' });

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskData, setEditTaskData] = useState({ title: '', description: '', status: 'todo' });

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getProjects();
    }, []);

    const getProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getTasks = async (projectId) => {
        try {
            const res = await api.get(`/tasks/${projectId}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        navigate('/login');
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        getTasks(project._id);
        setSearchQuery('');
    };

    const handleProjectInput = (e) => {
        setNewProject({ ...newProject, [e.target.name]: e.target.value });
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        const res = await api.post('/projects', newProject);
        setProjects([...projects, res.data]);
        setNewProject({ name: '', description: '' });
    };

    const handleDeleteProject = async (id) => {
        await api.delete(`/projects/${id}`);
        setProjects(projects.filter((p) => p._id !== id));
        if (selectedProject?._id === id) {
            setSelectedProject(null);
            setTasks([]);
        }
    };

    const handleTaskInput = (e) => {
        setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        const res = await api.post('/tasks', {
            ...taskForm,
            project: selectedProject._id
        });
        setTasks([...tasks, res.data]);
        setTaskForm({ title: '', description: '' });
    };

    const handleDeleteTask = async (id) => {
        await api.delete(`/tasks/${id}`);
        setTasks(tasks.filter((task) => task._id !== id));
        if (selectedTaskId === id) setSelectedTaskId(null);
    };

    const handleEditTask = (task) => {
        setEditingTaskId(task._id);
        setEditTaskData({
            title: task.title,
            description: task.description,
            status: task.status || 'todo'
        });
    };

    const handleEditInput = (e) => {
        setEditTaskData({ ...editTaskData, [e.target.name]: e.target.value });
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        const res = await api.put(`/tasks/${editingTaskId}`, editTaskData);
        const updatedTasks = tasks.map((t) => (t._id === editingTaskId ? res.data : t));
        setTasks(updatedTasks);
        setEditingTaskId(null);
        setEditTaskData({ title: '', description: '', status: 'todo' });
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditTaskData({ title: '', description: '', status: 'todo' });
    };

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (!q.trim()) {
            getTasks(selectedProject._id);
            return;
        }
        try {
            const res = await api.get(`/tasks/search/${selectedProject._id}?q=${q}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome, {user?.fullName}!</h1>
            <button onClick={handleLogout}>Logout</button>

            <h2>Create New Project</h2>
            <form onSubmit={handleProjectSubmit}>
                <input
                    name="name"
                    placeholder="Project name"
                    value={newProject.name}
                    onChange={handleProjectInput}
                />
                <input
                    name="description"
                    placeholder="Description"
                    value={newProject.description}
                    onChange={handleProjectInput}
                />
                <button type="submit">Create Project</button>
            </form>

            <h2>Your Projects</h2>
            {projects.map((project) => (
                <div
                    key={project._id}
                    onClick={() => handleProjectClick(project)}
                    style={{
                        border: '1px solid gray',
                        padding: '8px',
                        margin: '4px 0',
                        cursor: 'pointer',
                        background: selectedProject?._id === project._id ? '#f0f0f0' : ''
                    }}
                >
                    <strong>{project.name}</strong> <br />
                    <small>{project.description}</small>
                    <br />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                        }}
                    >
                        Delete
                    </button>
                </div>
            ))}

            {selectedProject && (
                <>
                    <h2>Tasks for: {selectedProject.name}</h2>

                    <form onSubmit={handleTaskSubmit}>
                        <input
                            name="title"
                            placeholder="Task title"
                            value={taskForm.title}
                            onChange={handleTaskInput}
                        />
                        <input
                            name="description"
                            placeholder="Task description"
                            value={taskForm.description}
                            onChange={handleTaskInput}
                        />
                        <button type="submit">Add Task</button>
                    </form>

                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ margin: '10px 0' }}
                    />

                    <ul>
                        {tasks.map((task) => (
                            <li
                                key={task._id}
                                onClick={() => setSelectedTaskId(task._id)}
                                style={{ marginBottom: '10px', cursor: 'pointer' }}
                            >
                                {editingTaskId === task._id ? (
                                    <form onSubmit={handleUpdateTask}>
                                        <input
                                            name="title"
                                            value={editTaskData.title}
                                            onChange={handleEditInput}
                                        />
                                        <input
                                            name="description"
                                            value={editTaskData.description}
                                            onChange={handleEditInput}
                                        />
                                        <select
                                            name="status"
                                            value={editTaskData.status}
                                            onChange={handleEditInput}
                                        >
                                            <option value="todo">Todo</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <button type="submit">Save</button>
                                        <button type="button" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <strong>{task.title}</strong> — {task.status}
                                        <br />
                                        <small>{task.description}</small>
                                        <br />
                                        <button onClick={() => handleEditTask(task)}>Edit</button>
                                        <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {selectedTaskId && <TaskComments taskId={selectedTaskId} />}
                </>
            )}
        </div>
    );
}
