const express = require('express');
const http = require('http');
const path = require('path');
const Filter = require('bad-words');
const socketio = require('socket.io');
const {
    generateMessage,
    generateLocationMessage,
} = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT ?? 8080;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ ...options, id: socket.id });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Server', 'Welcome!'));
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                generateMessage('Server', `${user.username} has joined!`)
            );

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (user) {
            const filter = new Filter();
            if (filter.isProfane(message)) {
                return callback('Profanity is not allowed!');
            } else {
                io.to(user.room).emit(
                    'message',
                    generateMessage(user.username, message)
                );
                callback();
            }
        }
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                'locationMessage',
                generateLocationMessage(
                    user.username,
                    `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
                )
            );
            callback();
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                'message',
                generateMessage(user.username, `${user.username} has left!`)
            );

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(port, () => {
    console.log('server started at port ' + port);
});
