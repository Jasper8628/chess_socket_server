



const express = require('express');
const socket = require('socket.io');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 4000 // This is for socket.io server
const server = app.listen(PORT, () => {
    console.log(`listening for socket.io messages on port ${PORTSOCKET}`)
});


const ioCast = socket(server)
ioCast.set('origins', '*:*')
const chatUsers = {}
let fenArray = []
const fenCode = ''
let moveArray = []

const room1 = {
    name: 'room1',
    whiteTaken: false,
    blackTaken: false
}

ioCast.on('connection', socket => {
    console.log(`Connection made by socketid: [${socket.id}]`)
    const fenStr = fenArray[fenArray.length - 1]
    ioCast.sockets.emit('all', { fen: fenStr });

    socket.on("ready", function (rd) {
        console.log(rd.name);
        let name = rd.name;
        let color;
        if (room1.whiteTaken == false && room1.blackTaken == false) {
            room1.whiteTaken = true;
            color = "w";
        } else if (room1.blackTaken == false) {
            room1.blackTaken = true;
            color = "b";
        } else if (room1.whiteTaken == true && room1.blackTaken == true) {
            color = "observer";
        }
        let newData = {
            color: color,
            name: name
        }
        ioCast.sockets.emit("ready", newData);

    });

    socket.on('game', function (data) {
        console.log(data)
        fenArray.push(data.fen)
        const gameMove = {}
        gameMove.pieceName = data.pieceName
        gameMove.capName = data.capName
        gameMove.to = data.to
        gameMove.from = data.from
        gameMove.side = data.side
        moveArray.push(gameMove)

        ioCast.sockets.emit('all', data)
    })



    app.get("/ready", function (req, res) {
        let color;
        if (room1.whiteTaken == false && room1.blackTaken == false) {
            room1.whiteTaken = true;
            color = "w";
        } else if (room1.blackTaken == false) {
            room1.blackTaken = true;
            color = "b";
        } else if (room1.whiteTaken == true && room1.blackTaken == true) {
            color = "observer";
        }

        res.json({ color: color });
        console.log(color);

    });






    socket.on('new-user', name => {
        try {
            chatUsers[socket.id] = name
            socket.broadcast.emit('user-connected', name)
            console.log(`%c SERVER.js -> New User [${name}] Connected`, 'background: #00FF00; color: #FFFFFF;')
        } catch (error) {
            console.log('%c SERVER.js -> EXCEPTION ON NEW USER', 'background: #FF0000; color: #FFFFFF;')
        }
    })

    socket.on('send-chat-message', message => {
        try {
            socket.broadcast.emit('chat-message', { message: message, name: chatUsers[socket.id] })
            console.error(`%c SERVER.js -> New CHAT [${message}]`, 'background: #00FF00; color: #FFFFFF;')
        } catch (error) {
            console.log('%c SERVER.js -> EXCEPTION ON SEND-CHAT-MESSAGE', 'background: #FF0000; color: #FFFFFF;')
        }
    })

    socket.on('disconnect', () => {
        try {
            socket.broadcast.emit('user-disconnected', chatUsers[socket.id])
            delete chatUsers[socket.id]
            console.log(`%c SERVER.js -> User [${socket.id}] DISconnected`, 'background: #00FF00; color: #FFFFFF;')
        } catch (error) {
            console.log('%c SERVER.js -> EXCEPTION ON DISCONNECT', 'background: #FF0000; color: #FFFFFF;')
        }
    })
})
