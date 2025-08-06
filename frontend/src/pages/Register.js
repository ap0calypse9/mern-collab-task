import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/register.css';

export default function Register() {
    const [form, setForm] = useState({
        fullName: '',
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', form);
            await fetchUser();
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.msg || "Registration failed");
        }
    };

    return (
        <div className="register-container" >
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input name="fullName" placeholder="Full Name" onChange={handleChange} />
                <input name="username" placeholder="Username" onChange={handleChange} />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} />
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}
