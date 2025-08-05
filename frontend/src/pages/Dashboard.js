import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        navigate('/login');
    };

    return (
        <div>
            <h1>Welcome, {user?.fullName}!</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
