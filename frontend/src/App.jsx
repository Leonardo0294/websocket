import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("/");

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const receiveMessage = (message) => {
      setMessages((state) => [message, ...state]);
    };

    const userTyping = (username) => {
      setTyping(`${username} está escribiendo...`);
    };

    const userStoppedTyping = () => {
      setTyping(false);
    };

    socket.on("message", receiveMessage);
    socket.on("typing", userTyping);
    socket.on("stop typing", userStoppedTyping);

    return () => {
      socket.off("message", receiveMessage);
      socket.off("typing", userTyping);
      socket.off("stop typing", userStoppedTyping);
    };
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", username);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = {
      body: message,
      from: username || "Anónimo",
    };
    setMessages((state) => [newMessage, ...state]);
    setMessage("");
    socket.emit("message", newMessage);
    socket.emit("stop typing");
  };

  return (
    <div className="h-screen bg-blue-800 text-white flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="bg-blue-900 p-10 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold my-2">tuChat</h1>
        <input
          name="username"
          type="text"
          placeholder="Enter your username..."
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 border-zinc-500 p-2 w-full text-black rounded-md mb-2"
          value={username}
        />
        <input
          name="message"
          type="text"
          placeholder="Write your message..."
          onChange={handleInputChange}
          className="border-2 border-zinc-500 p-2 w-full text-black rounded-md"
          value={message}
          autoFocus
        />

        <ul className="h-80 overflow-y-auto mt-5 space-y-2">
          {messages.map((message, index) => (
            <li
              key={index}
              className={`my-2 p-2 table text-sm rounded-md shadow-md ${
                message.from === username ? "bg-sky-700 ml-auto" : "bg-black"
              }`}
            >
              <b>{message.from}</b>: {message.body}
            </li>
          ))}
        </ul>
        {typing && <p>{typing}</p>}
      </form>
    </div>
  );
}

export default App;
