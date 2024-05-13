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
//         const rootDirectory = path.resolve(__dirname, '..', 'frontend', 'dist');

//         // Serve static files from the root directory
//         app.use(express.static(rootDirectory));

//         // Serve index.html for all routes
//         app.get('*', (req, res) => {
//                 res.sendFile(path.resolve(rootDirectory, 'index.html'));
//         });

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

const onlineUsers =[]; // Track online status of users


io.on('connection', (socket)=>{

    // socket.on('setup', (userData)=>{
    //    socket.join(userData._id);
    //    const existingUserIndex = onlineUsers.findIndex(user => user.userId === userData._id);

    //    if (existingUserIndex !== -1) {
    //        onlineUsers[existingUserIndex].socketId = socket.id;
    //        onlineUsers[existingUserIndex].status = true;
    //    } else {
    //        const userStatus = {
    //            userId: userData._id,
    //            socketId: socket.id,
    //            status: true
    //        };
    //        onlineUsers.push(userStatus);
    //    }


    //    socket.emit("connected")
    //    socket.emit('userStatus', onlineUsers)
  
    // })

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        const existingUserIndex = onlineUsers.findIndex(user => user.userId === userData._id);
    
        if (existingUserIndex !== -1) {
            // User is reconnecting, update their socketId and status
            onlineUsers[existingUserIndex].socketId = socket.id;
            onlineUsers[existingUserIndex].status = true;
            // Emit only the updated user information to all clients
            io.emit('userStatus', onlineUsers[existingUserIndex]);
        } else {
            // User is joining for the first time, add them to the array
            const userStatus = {
                userId: userData._id,
                socketId: socket.id,
                status: true
            };
            onlineUsers.push(userStatus);
            // Emit the updated onlineUsers array to all clients
            io.emit('userStatus', onlineUsers);
        }
    
        socket.emit("connected");
    });
    

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
        chat.users.forEach((user)=>{
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
            socket.in(u._id).emit('added_user', selectedChat)
        })
    })

    socket.on('user_removed', (usersFromRemove,selectedChat, user)=>{
        usersFromRemove.map((u)=>{
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

    socket.on('message_delete', (selectedChat, updatedMessages, senderId)=>{
        selectedChat.users.map((u)=>{
            if(u._id==senderId){
                return
            } 
            socket.in(u._id).emit('message_deleted', selectedChat, updatedMessages)
        })
    })

    socket.on('message_edit', (selectedChat,updatedMessages, senderId)=>{
        selectedChat.users.map((u)=>{
            if(u._id==senderId){
                return
            } 
            socket.in(u._id).emit('message_edited', selectedChat,updatedMessages)
        })
    })

    socket.on('disconnect', () => {
        const disconnectedUserIndex = onlineUsers.findIndex(user => user.socketId === socket.id);
    
        if (disconnectedUserIndex !== -1) {
            onlineUsers[disconnectedUserIndex].status = false;
            io.emit('userStatus', onlineUsers);
        }    
        console.log("Disconnected event occurred.");
    });
    
})