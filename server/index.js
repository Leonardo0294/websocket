import express from "express";
import http from "http";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import path from "path";
import cors from "cors";

import { PORT } from "./config.js";

// Initializations
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000", // Puedes habilitar CORS para permitir solicitudes desde un origen específico
  },
});

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("message", (body) => {
    socket.broadcast.emit("message", {
      body,
      from: socket.id.slice(8),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Servidor en el puerto ${PORT}`);
});
