const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const randomColor = require('randomcolor');
const createBoard = require('./create-board');
const createCooldown = require('./cooldown');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketIo(server);
const { clear, getBoard, makeTurn} = createBoard(20);

io.on('connection', (sock) => {
    const color = randomColor();
    const cooldown = createCooldown(2000);

    sock.emit('board', getBoard());

    sock.on('message', (text) => io.emit('message', text));

    sock.on('turn', ({x, y}) => {
        if(cooldown()) {
                const playerWon = makeTurn(x, y , color);
            io.emit('turn', {x, y, color});

            if(playerWon) {
                sock.emit('message', 'You won!');
                io.emit('message', 'New Round');
                io.emit('board');
                clear();
            }
        }
    });
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('Ready');
});