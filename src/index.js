const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, getRooms } = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new connetion');

    
    socket.on('join', ({ username, room }, callback) => { 
        const { error, user } = addUser({id: socket.id, username, room});

        if (error) { 
            return callback(error); 
        }

        socket.join(user.room);
        
        socket.emit('message', generateMessage('Sys','Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the chatroom`))
        // refresh the sidebar that contains user in current room.
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('disconnect', () => { 
        const user = removeUser(socket.id);

        if (user) { 
            io.to(user.room).emit('message', generateMessage(`${user.username} has disconneced`))// current user has already left

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    
    socket.on('sendMessage', ({ message }, callback) => { 
        const filter = new Filter();
        const user = getUser(socket.id);
        
        if (!user) { 
            return callback('User id invalid');
        }
        if (filter.isProfane(message)) { 
            return callback('Profenity is not allowed');
        }

        io.to(user.room).emit('message', generateMessage(user.username,message));
        callback();
    })

    socket.on('sendLocation', ({ lati, long }, callback) => {
        const user = getUser(socket.id);

        if (!user) { return callback('User id invalid') };

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${lati},${long}`))
        callback();
    })

    socket.on('getRooms', (callback) => { 
        callback(getRooms());
    })
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})