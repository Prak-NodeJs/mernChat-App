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

if(process.env.NODE_ENV==='production'){
        const rootDirectory = path.resolve(__dirname, '..', 'frontend', 'dist');

        // Serve static files from the root directory
        app.use(express.static(rootDirectory));

        // Serve index.html for all routes
        app.get('*', (req, res) => {
                res.sendFile(path.resolve(rootDirectory, 'index.html'));
        });

}

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
        origin:"*"
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
        var chat = newMessageRecieved.chat;
        if(!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user)=>{
            if(user._id==newMessageRecieved.sender._id) return;

            socket.in(user._id).emit('message recieved', newMessageRecieved)
        })
    })

    socket.on('reply message', (replyMessageRecieved)=>{
        var chat = replyMessageRecieved.chat;

        if(!chat.users) return console.log('chat.users not defined');
        console.log(chat.users)
        chat.users.forEach((user)=>{
            // if(user._id!=replyMessageRecieved.replies[0].sender) return;

            socket.in(user._id).emit('reply message recieved', replyMessageRecieved)
        })
    })

    socket.on('add_user_to_group', (selectedUsers)=>{
           selectedUsers.map((u)=>{
             socket.in(u._id).emit('user_added_to_group', u)
           })
    })

    socket.on('user_added', (selectedChat, user)=>{
        selectedChat.users.map((u)=>{
            if(u._id==user._id)return
            console.log(u.name)
            socket.in(u._id).emit('added_user', selectedChat)
        })
        // console.log("this user is added",userId)
        // socket.in(userId).emit('user_added_received', userId)
    })

    socket.on('user_removed', (usersFromRemove,selectedChat, user)=>{
        usersFromRemove.map((u)=>{
            // if(u._id==selectedChat.groupAdmin._id)return
            // console.log(u.name)
            socket.in(u._id).emit('removed_user', selectedChat, user)
        })
    })


    socket.on('user_deleted_group', (usersFromDelete, selectedChat, user)=>{
          usersFromDelete.map((u)=>{
            if(u._id==user._id)return
            socket.in(u._id).emit('user_deleted_group_received', selectedChat)

          })
    })

    socket.on('rename_group', (selectedChat, user)=>{
        selectedChat.users.map((u)=>{
            if(u._id==user._id) return
            socket.in(u._id).emit('group_renamed', selectedChat)
        })
    })

    socket.on('message_delete', (selectedChat, senderId)=>{
        console.log("message delete", selectedChat, senderId)
        selectedChat.users.map((u)=>{
            if(u._id==senderId){
                return
            } 
            socket.in(u._id).emit('message_deleted', selectedChat)
        })
    })

    socket.on('message_edit', (selectedChat, senderId)=>{
        selectedChat.users.map((u)=>{
            if(u._id==senderId){
                return
            } 
            socket.in(u._id).emit('message_edited', selectedChat)
        })
    })
    // socket.on('user left',(userId) )

    socket.off("setup", ()=>{
        console.log('user disconnected');
        socket.leave(userData._id)
    })
})