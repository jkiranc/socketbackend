const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./user");

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//inside io.on everything happens because of the socket
app.use(cors());
app.use(router);
app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    console.log("socketid", socket.id);
    const { error, user } = addUser({ id: socket.id, name, room });

    console.log("sockietussr", user, error);

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("messsage", {
      user: "admin",
      text: "${user.name}, welcome human ${user.room}",
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("join", ({ name, room }, callback) => {
    console.log(name, room);

    const error = true;

    if (error) {
      callback(error);
    }
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    console.log("user", user);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} left without paying!!!`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log("Server has begin."));
