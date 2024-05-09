const express = require('express');
const app = express();
const dotenv = require('dotenv')

dotenv.config({})
const path = require('path')
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes')
const replyRoutes = require('./routes/replyRoutes')


const { notFound} =  require('./middleware/ApiError')

connectDB()
app.use(cors())
app.use(express.json())


//routes
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/reply', replyRoutes)



// ----------------deployment---------------------

// if(process.env.NODE_ENV==='production'){
//     const rootDirectory = path.resolve(__dirname, '..', 'frontend', 'dist');

//     // Serve static files from the root directory
//     app.use(express.static(rootDirectory));

//     // Serve index.html for all routes
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(rootDirectory, 'index.html'));
//     });

// }

// ---------------deployment-------------------------

app.use(notFound)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({ success: false, message });
    next()
})

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, ()=>{
    console.log(`Server is listining on port number ${PORT}`)
})


const io = require('socket.io')(server, {
    pingTimeout:6000,
    cors:{
        origin:"http://localhost:5173"
    }
})


io.on('connection', (socket)=>{
    console.log("connected to socket.io")

    socket.on('setup', (userData)=>{
       socket.join(userData._id);
       socket.emit("connected")
    })

    socket.on('join_chat', (room)=>{
        socket.join(room);
        console.log('User joined room', room)
    })

    socket.on('typing', (room)=>socket.in(room).emit('typing'))
    socket.on('stop typing', (room)=>socket.in(room).emit('stop typing'))


    socket.on('new message', (newMessageRecieved)=>{
          console.log("new mesage",newMessageRecieved)
        var chat = newMessageRecieved.chat;
        if(!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user)=>{
            if(user._id==newMessageRecieved.sender._id) return;

            socket.in(user._id).emit('message recieved', newMessageRecieved)
        })
    })

    socket.on('reply message', (replyMessageRecieved)=>{
        var chat = replyMessageRecieved.chat;
        console.log("this is reply message",replyMessageRecieved)
        console.log("reply messaged recived")

        if(!chat.users) return console.log('chat.users not defined');
        console.log(chat.users)
        chat.users.forEach((user)=>{
            // if(user._id!=replyMessageRecieved.replies[0].sender) return;

            socket.in(user._id).emit('reply message recieved', replyMessageRecieved)
        })
    })

    socket.off("setup", ()=>{
        console.log('user disconnected');
        socket.leave(userData._id)
    })
})