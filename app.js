import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const [room, setRoom] = useState('general'); // default room

    useEffect(() => {
        socket.on('newMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socket.on('chatHistory', (history) => {
            setMessages(history);
        });

        if (token) {
            socket.emit('joinRoom', { userId: 'someUserId', room }); // Replace 'someUserId' with actual user ID
        }
    }, [token, room]);

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3000/login', { username, password });
            setToken(response.data.token);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);

            const fileResponse = file ? await axios.post('http://localhost:3000/upload', formData) : { data: { filePath: '' } };
            socket.emit('sendMessage', {
                room,
                userId: 'someUserId', // Replace with actual user ID
                message,
                file: fileResponse.data.filePath
            });
            setMessage('');
            setFile(null);
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    return (
        <div className="app">
            <h1>Chat App</h1>
            {!token ? (
                <div className="login">
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
                </div>
            ) : (
                <div className="chat">
                    <div className="chat-header">
                        <h2>Room: {room}</h2>
                        <button onClick={() => setRoom(room === 'general' ? 'anotherRoom' : 'general')}>Switch Room</button>
                    </div>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                <p>{msg.message}</p>
                                {msg.file && <img src={`http://localhost:3000/${msg.file}`} alt="uploaded" />}
                            </div>
                        ))}
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
