import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const socket = io(
  process.env.REACT_APP_SERVER_URL || 'http://localhost:5000',
  {
    withCredentials: true
  }
);


export default function TaskComments({ taskId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!taskId) return;

        socket.emit('joinTaskRoom', taskId);

        const fetchComments = async () => {
            const res = await api.get(`/comments/${taskId}`);
            setComments(res.data);
        };

        fetchComments();

        socket.on('newComment', (comment) => {
            setComments((prev) => [...prev, comment]);
        });

        return () => {
            socket.off('newComment');
        };
    }, [taskId]);

    const sendComment = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newComment = {
            taskId,
            user: user.fullName,
            message
        };

        const res = await api.post('/comments', newComment);

        socket.emit('sendComment', {
            taskId,
            comment: res.data
        });

        setMessage('');
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>💬 Comments</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {comments.map((c) => (
                    <li key={c._id} style={{ marginBottom: '10px' }}>
                        <strong>{c.user}</strong>: {c.message}
                        <br />
                        <small>{new Date(c.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>

            <form onSubmit={sendComment}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your comment"
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}
