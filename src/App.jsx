import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("/");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [username, setUsername] = useState(""); 
  useEffect(() => {
    socket.on("message", receiveMessage);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("message", receiveMessage);
      socket.off("userTyping", handleUserTyping);
    };
  }, []);

  const receiveMessage = (newMessage) => {
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
    setTypingUsers([]);
  };

  const handleUserTyping = (data) => {
    if (!typingUsers.includes(data.username)) {
      setTypingUsers((prevUsers) => [...prevUsers, data.username]);
    }
  };

  const emitTypingEvent = () => {
    if (!message) {
      socket.emit("typing", { username });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (username) {
        handleSubmit(event);
      } else {
        handleSetUsername();
      }
    } else {
      emitTypingEvent();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newMessage = {
      body: message,
      from: username || "Anónimo",
    };
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
    setMessage("");
    socket.emit("message", newMessage.body);
  };

  const handleSetUsername = () => {
    if (username) {
      socket.emit("setUsername", username);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">tuChat</h1>
      </div>
      <div className="chat-messages">
        <ul>
          {messages.map((msg, index) => (
            <li
              key={index}
              className={`message ${
                msg.from === username ? "sent" : "received"
              }`}
            >
              <span className="message-sender">{msg.from}:</span> {msg.body}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-input">
        {username ? (
          <form onSubmit={handleSubmit}>
            <input
              name="message"
              type="text"
              placeholder="Escribe tu mensaje..."
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              value={message}
            />
          </form>
        ) : (
          <div className="username-form">
            <input
              type="text"
              placeholder="Ingresa tu nombre de usuario"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleSetUsername}>Ingresar</button>
          </div>
        )}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(", ")}{" "}
            {typingUsers.length === 1 ? "está" : "están"} escribiendo...
          </div>
        )}
      </div>
    </div>
  );
}
