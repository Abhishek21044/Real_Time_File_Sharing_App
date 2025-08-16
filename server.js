const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    // Sender joins
    socket.on("sender-join", function (data) {
        socket.join(data.uid);
    });

    // Receiver joins
    socket.on("receiver-join", function (data) {
        socket.join(data.uid);
        socket.to(data.sender_uid).emit("init", data.uid);
    });

    // File metadata from sender to receiver
    socket.on("file-meta", function (data) {
        socket.to(data.uid).emit("fs-meta", data.metadata);
    });

    // Receiver requests next chunk
    socket.on("fs-start", function (data) {
        socket.to(data.uid).emit("fs-share");
    });

    // Actual file chunk transfer
    socket.on("file-raw", function (data) {
        socket.to(data.uid).emit("fs-share", data.buffer);
    });
});

// Start server
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
