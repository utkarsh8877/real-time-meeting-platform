const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const socketHandler = require("./socket/socketHandler");

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
