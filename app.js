const express = require('express');
const app = express();
const port = 3000;

const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server);



app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));



io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('send-Location', (data) => {
        console.log('Received location from client:', data);
        io.emit("receive-Location", {id:socket.id, ...data});
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        io.emit("client-disconnected", {id: socket.id});
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
