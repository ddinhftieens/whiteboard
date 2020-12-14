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

io.of('/whiteboard').on('connection', onConnection);

var connectedUsers = {};
// var history = [];

var _history = new Map();

function onConnection(socket) {
    
    // Updated drawing action
    socket.on('updateCanvas', (data) => {
        // var historyByRoom = history.find(element => element.key === data.roomName)
        // if(historyByRoom === undefined || historyByRoom === null) history.push({key: data.roomName, array: [data.data]})
        // else{
        //     history.push(data.data);
        // }
        if(_history.has(data.roomName)){
            var array = _history.get(data.roomName);
            array.push(data.data);
            _history.set(data.roomName, array)
        }else{
            var array = [];
            array.push(data.data)
            _history.set(data.roomName, array)
        }
    });

    // new connect
    socket.on('newConnect', (data) => {
        socket.join(data.roomName);
        const toUser = data.id;
        socket.id = data.id;
        connectedUsers[data.id] = socket;
        if(connectedUsers.hasOwnProperty(toUser)){
            let array = _history.get(data.roomName);
            let dataCanvas = null;
            if(array !== undefined && array !== null){
                dataCanvas = array[array.length - 1];
            }
            // if(history.length > 0){
            //     dataCanvas = history[history.length - 1];
            // }
            connectedUsers[toUser].emit('newConnected', dataCanvas);
        }
    })

    socket.on('drawing', (data) => {
        socket.join(data.roomName);
        socket.broadcast.to(data.roomName).emit('drawing', data);
    });

    socket.on('clearCanvas', (data) => {
        socket.join(data.roomName);
        if(_history.has(data.roomName)){
            var array = _history.get(data.roomName);
            array.push(data.data);
            _history.set(data.roomName, array)
            socket.broadcast.to(data.roomName).emit('clearCanvas', null);
        }else{
            return;
        }
        // dataCanvas = data.data;
        // history.push(data.data);
        // let dataCanvas = history[history.length - 1]; 
    });

    socket.on('undoCavas', (data) => {
        socket.join(data.roomName);
        if(_history.has(data.roomName)){
            var array = _history.get(data.roomName);
            array.pop();
            let dataCanvas = array[array.length - 1];
            socket.broadcast.to(data.roomName).emit('undoDrawing', dataCanvas);
        }else{
            return;
        }
        // if(history.length > 0){
        //     history.pop();
        //     let dataCanvas = history[history.length - 1];
        //     socket.broadcast.to(data.roomName).emit('undoDrawing', dataCanvas);
        // }
    });
}

const port = 9700;
server.listen(port, () => console.log(`server is running on port ${port}`));