const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");

const app = express();

// enable CORS for all routes
app.use(cors({ origin: "*" }));

const route = require("./route");
app.use(route);

const server = http.createServer(app);

// create a new instance of socket.io and attach it to the server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }) => {
    if (!username || !room) return;

    const { user, isExisting } = addUser({ username, room });

    const userMessage = isExisting
      ? `Welcome back, ${user.username}!`
      : `${user.username}, welcome to the room.`;

    socket.join(user.room);
    // send welcome message to the user who joined
    socket.emit("message", {
      data: {
        user: { name: "Admin" },
        text: userMessage,
      },
    });

    //broadcast - send message to everyone except the user who joined
    socket.broadcast.to(user.room).emit("message", {
      data: { user: { name: "Admin" }, text: `${user.username} has joined!` },
    });

    // send room data to all users in the room
    io.to(user.room).emit("roomData", {
      data: { users: getRoomUsers(user.room) },
    });
  });

  // listen for sendMessage event
  socket.on("sendMessage", ({ message, username, room }) => {
    if (!message || !username || !room) return;

    const { user } = addUser({ username, room });
    socket.join(user.room);

    io.to(user.room).emit("message", {
      data: { user: { name: user.username }, text: message },
    });

    io.to(user.room).emit("roomData", {
      data: { users: getRoomUsers(user.room) },
    });
  });

  // listen for leftRoom event
  socket.on("leftRoom", ({ username, room }) => {
    const user = removeUser(username, room);

    if (user) {
      socket.leave(user.room);

      io.to(user.room).emit("roomData", {
        data: { users: getRoomUsers(user.room) },
      });

      io.to(user.room).emit("message", {
        data: {
          user: { name: "Admin" },
          text: `${user.username} has left the room!`,
        },
      });
    }
  });
});

server.listen(5001, () => {
  console.log("Server is running on port 5001");
});
