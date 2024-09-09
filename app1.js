import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        socket.on('newMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socket.on('chatHistory', (history) => {
            setMessages(history);
        });
    }, []);

    const handleLogin = async () => {
        const response = await axios.post('http://localhost:3000/login', { username, password });
        setToken(response.data.token);
    };

    const handleSendMessage = () => {
        const formData = new FormData();
        formData.append('file', file);
        
        axios.post('http://localhost:3000/upload', formData)
            .then((response) => {
                socket.emit('sendMessage', {
                    room: 'general',
                    userId: 'someUserId', // Replace with actual user ID
                    message,
                    file: response.data.filePath
                });
                setMessage('');
            });
    };

    return (
        <div>
            <h1>Chat App</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>

            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>

            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <p>{msg.message}</p>
                        {msg.file && <img src={`http://localhost:3000/${msg.file}`} alt="uploaded" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
