const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const users = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.emit("existing-users", users);

  socket.on("send-location", ({ latitude, longitude }) => {
    if (!latitude || !longitude) return;

    users[socket.id] = { latitude, longitude };

    socket.broadcast.emit("receive-location", {
      id: socket.id,
      latitude,
      longitude,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("client-disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
