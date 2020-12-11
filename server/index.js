const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server, { 
    cors: {
        origin: '*'
    }
});

io.on('connection', onConnection);

var dataCanvas = null;
var connectedUsers = {};
var history = [];

function onConnection(socket) {
    
    socket.on('updateCanvas', (data) => {
        dataCanvas = data;
        history.push(data);
    });
    socket.on('newConnect', (id) => {
        const toUser = id;
        socket.id = id;
        connectedUsers[id] = socket;
        if(connectedUsers.hasOwnProperty(toUser)){
            connectedUsers[toUser].emit('newConnected', dataCanvas);
        }
    })

    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });

    // socket.on('drawImage', (data) => {
    //     dataCanvas = data;
    //     history.push(data);
    //     socket.broadcast.emit('drawImage', dataCanvas);
    // });

    socket.on('clearCanvas', (data) => {
        dataCanvas = data;
        history.push(data);
        socket.broadcast.emit('clearCanvas', dataCanvas);
    });

    socket.on('undoCavas', (data) => {
        if(history.length > 0){
            history.pop();
            dataCanvas = history[history.length - 1];
            socket.broadcast.emit('undoDrawing', dataCanvas);
        }
    });
}

const port = 9700;
server.listen(port, () => console.log(`server is running on port ${port}`));