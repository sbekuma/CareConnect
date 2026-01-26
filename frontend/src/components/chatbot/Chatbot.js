import React, { useState, useEffect, useRef } from 'react';
import { IoChatbubbleEllipsesSharp, IoSend } from 'react-icons/io5';
import axios from 'axios';
import { ENDPOINTS } from "../../apiConfig";
import './Chatbot.css';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { type: 'user', text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        const currentInputMessage = input;
        const userId = localStorage.getItem("userId"); 

        try {
            // Prepare chat history for the backend logic if needed
            const chatHistoryForLLM = messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'bot',
                text: msg.text
            }));

            // Use the centralized ENDPOINT instead of localhost
            const response = await axios.post(ENDPOINTS.CHAT, {
                message: currentInputMessage, 
                userId: userId, 
                chatHistory: chatHistoryForLLM 
            });

            const data = response.data;
            setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: data.reply }]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error.response && error.response.data && error.response.data.error
                                 ? error.response.data.error
                                 : 'Sorry, I am having trouble connecting to the service right now.';
            setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-toggle-button" onClick={toggleChatbot}>
                <IoChatbubbleEllipsesSharp size={30} />
            </div>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>CareConnect Assistant</h3>
                        <button className="close-button" onClick={toggleChatbot}>X</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.length === 0 && (
                            <div className="welcome-message">
                                <p>Hi there! I'm your CareConnect AI. How can I help you with your appointments today?</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot loading">
                                <p>...</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            <IoSend />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chatbot;