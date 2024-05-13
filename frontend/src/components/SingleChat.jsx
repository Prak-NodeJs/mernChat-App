import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Flex, Text, Box } from '@chakra-ui/layout'
import { FormControl, Input, Spinner, useToast, Button, IconButton } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogic'
import ProfileModal from './misc/ProfileModel'
import UpdateGroupChatModal from './misc/UpdateGroupChatModal'
import axios from 'axios'
import './style.css'
import ScrollableChat from './ScrollableChat'
import Lottie from "react-lottie";
import EmojiPicker from 'emoji-picker-react';
import { CloseIcon, AttachmentIcon } from '@chakra-ui/icons'
import _ from 'lodash'
import SendIcon from '@mui/icons-material/Send';

import { getSocket } from '../config/socket.service'

import animationData from '../animations/typing.json'


var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState()

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState();
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [replying, setReplying] = useState(null);
    const [editing, setEditeding] = useState(null)

    const [hideSend, setHideSend] = useState(false)
    const [fileLoading, setFileLoading] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([]);

    let isViewed = true;

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    isViewed = false;
  } else {
    isViewed = true;
  }
});
    const toast = useToast()

    const emojiConfig =
    {
        showPreview: false
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }
            setLoading(true)
            const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/message/${selectedChat._id}`, config)
            setMessages(data.data)
            setLoading(false)

            socket.emit('join_chat', selectedChat._id)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    const deleteMessage = async (m) => {
        try {
            if (user._id != m.sender._id) {
                toast({
                    title: "Error Occured",
                    description: 'You can delete Only Your Messages',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                return
            }
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/message/${m._id}`, config)
            const updatedMessages = messages.filter((msg) => msg._id !== m._id);

             setMessages(updatedMessages)
            socket.emit('message_delete', selectedChat, updatedMessages, m.sender._id)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    const editMessage = async () => {
        try {
            if (newMessage) {
                if (user._id != editing.sender._id) {
                    toast({
                        title: "Error Occured",
                        description: 'You can Edit Only Your Messages',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                    return
                }
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }
               const {data}= await axios.put(`${import.meta.env.VITE_BASE_URL}/api/message/${editing._id}`, {
                    content: newMessage
                }, config)

                const updatedMessages = messages.map(msg =>
                    msg._id === data.data._id ? { ...msg, content: data.data.content } : msg
                );
                setMessages(updatedMessages);
                setLoading(false)
                setNewMessage('')
                setEditeding(null)
                socket.emit('message_edit', selectedChat, updatedMessages, editing.sender._id)
            }
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        
        }         

    }

    const sendMessage = async (event) => {
        if (newMessage || file) {
            socket.emit("stop typing", selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }
                setNewMessage("")
                const messageData = {
                    chatId: selectedChat._id
                }
                if (newMessage) {
                    messageData.content = newMessage
                }
                if (file) {
                    messageData.file = file
                }
                const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/message`, messageData, config)

                socket.emit('new message', data.data)
                setMessages([...messages, data.data])

                setFile('')
                setSelectedFileName('')
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: error.response.data.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    const sendReply = async (event) => {
        if (newMessage || file) {
            socket.emit("stop typing", selectedChat._id)

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }
                const messageData = {
                    chatId: selectedChat._id
                }
                if (newMessage) {
                    messageData.content = newMessage
                }
                if (file) {
                    messageData.file = file
                }

                const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/reply/message/${replying._id}`, messageData, config)

                const messageIndex = messages.findIndex(
                    (msg) => msg._id === data.data._id
                );

                if (messageIndex !== -1) {
                    const updatedMessages = [...messages];
                    updatedMessages[messageIndex] = data.data;
                    setMessages(updatedMessages);
                }

                socket.emit('reply message', data.data)
            
                setFile('')
                setSelectedFileName('')
                setHideSend(false)
                setReplying(null)
                setNewMessage('')
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: error.response.data.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    useEffect(() => {
        socket = getSocket();
        socket.emit('setup', user);
        socket.on('connected', () => {
            setSocketConnected(true)
        })


        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        socket.on('userStatus', (userData) => {
            // Check if userData is an array or a single user object
            if (Array.isArray(userData)) {
                // Update onlineUsers state with the entire array
                setOnlineUsers(userData);
            } else {
                // Update onlineUsers state with the updated user information
                setOnlineUsers((prevOnlineUsers) => {
                    const existingUserIndex = prevOnlineUsers.findIndex(user => user.userId === userData.userId);
                    if (existingUserIndex !== -1) {
                        // User is reconnecting, update their information
                        const updatedOnlineUsers = [...prevOnlineUsers];
                        updatedOnlineUsers[existingUserIndex] = userData;
                        return updatedOnlineUsers;
                    } else {
                        // User is joining for the first time, add them to the array
                        return [...prevOnlineUsers, userData];
                    }
                });
            }
        });

    }, [])

        useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat])

    useEffect(() => {
        socket.on('message recieved', (newMessageRecieved) => { 
            if(!isViewed){
                const rnotification = new Notification(`New Message from ${getSender(user, newMessageRecieved.chat.users)}`, {
                    body: `${newMessageRecieved.content}`,
                });
            
                // Handle notification click
                rnotification.onclick = () => {
                   
                    window.focus(); 
                    setFetchAgain(!fetchAgain)
                    setSelectedChat(newMessageRecieved.chat)
                    rnotification.close()
                };
            
            }
            else if (!selectedChatCompare ||
                    selectedChatCompare._id !== newMessageRecieved.chat._id) {
                //give notification
                if (!notification.includes(newMessageRecieved)) {
                            setNotification([newMessageRecieved, ...notification])
                            setFetchAgain(!fetchAgain)
                    }

              } else {
                setMessages([...messages, newMessageRecieved])
              
}
        })

        socket.on('reply message recieved', (replyMessageRecieved) => {
         if(!isViewed){
            if(!isViewed){
                const rnotification = new Notification(`New Message from ${getSender(user, replyMessageRecieved.chat.users)}`, {
                    body: `${replyMessageRecieved.content}`,
                });
            
                // Handle notification click
                rnotification.onclick = () => {
                   
                    window.focus(); 
                    setFetchAgain(!fetchAgain)
                    setSelectedChat(replyMessageRecieved.chat)
                    rnotification.close()
                };
            
            }
         }
        else if (!selectedChatCompare ||
                selectedChatCompare._id !== replyMessageRecieved.chat._id) {
                if (!notification.includes(replyMessageRecieved)) {
                    setNotification([replyMessageRecieved, ...notification])
                    setFetchAgain(!fetchAgain)
                }

            } else {
                const messageIndex = messages.findIndex(
                    (msg) => msg._id === replyMessageRecieved._id
                );

                if (messageIndex !== -1) {
                    const updatedMessages = [...messages];
                    updatedMessages[messageIndex] = replyMessageRecieved;
                    setMessages(updatedMessages);
                }
            }
        })

        socket.on('user_added_to_group', (selectedChat) => {
            setFetchAgain(!fetchAgain)
        })

        socket.on('added_user', (selectedChat1) => {
            if (!selectedChatCompare ||
                selectedChatCompare._id !== selectedChat1._id) {
                setFetchAgain(!fetchAgain)
            } else {
                setSelectedChat(selectedChat)
            }
        })

        socket.on('removed_user', (selectedChat, userRemoved) => {
            if (userRemoved._id == user._id) {
                setFetchAgain(!fetchAgain)
                setSelectedChat()
            } else {
                setSelectedChat(selectedChat)
                setFetchAgain(!fetchAgain)

            }
        })

        socket.on('user_deleted_group_received', (selectedChat) => {
            if (!selectedChatCompare ||
                selectedChatCompare._id !== selectedChat._id) {
                setFetchAgain(!fetchAgain)
            } else {
                setSelectedChat(selectedChat)
                setFetchAgain(!fetchAgain)

            }
        })

        socket.on('group_renamed', (selectedChat) => {
            setSelectedChat(selectedChat)
            setFetchAgain(!fetchAgain)
        })

        socket.on('message_deleted', (selectedChat,updatedMessages) => {
            if (!selectedChatCompare ||
                selectedChatCompare._id !== selectedChat._id) {
            } else {
                setMessages(updatedMessages)
            }
        })

        socket.on('message_edited', (selectedChat, updatedMessages) => {

            if (!selectedChatCompare ||
                selectedChatCompare._id !== selectedChat._id) {

            } else {
                setMessages(updatedMessages)
            }
        })

    })

    const handleReplyClose = () => {
        setReplying(null)
        setHideSend(false)
    }

    const handleEmojiClick = (event, emojiData) => {
        const emoji = event.emoji;
        setNewMessage(prevMessage => prevMessage ? prevMessage + emoji : emoji);
    }

    const handleFileSelect = (e) => {
        setFileLoading(true)
        let pics = e.target.files[0]
        if (pics === undefined) {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setFileLoading(false)
            return;
        }
        if (pics.type != 'image/jpeg' && pics.type != "image/png" && pics.type != "application/pdf" && pics.type != "text/plain" && pics.type != "application/json" && pics.type != "application/zip" && pics.type != "video/mp4" && pics.type != "video/webm" && pics.type != "audio/mpeg" && pics.type != "audio/mp3" && pics.type != "text/csv") {
            toast({
                title: `pics.type is not supported`,
                description: "please try sending other files",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setFileLoading(false)
            return
        }
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", "dlpxfirxx");
        fetch("https://api.cloudinary.com/v1_1/dlpxfirxx/upload", {
            method: "post",
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                setFile(data.url.toString());
                setSelectedFileName(pics.name)
                setFileLoading(false)
            })
            .catch((err) => {
                setFileLoading(false)
            });
    };

    const typingHanlder = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true)
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }

    return (
        <>{
            selectedChat ? (<>
                <Flex
                    fontSize={{ base: "28px", md: "30px" }}
                    pb={3}
                    px={2}
                    w="100%"
                    d="flex"
                    justifyContent={{ base: "space-between" }}
                    alignItems={"center"}
                >
                    <IconButton d="flex" md="none" icon={<ArrowBackIcon />} onClick={() => setSelectedChat('')}>
                    </IconButton>
                  
                    {!selectedChat.isGroupChat ? (
                       <>
                            <div>

                            {_.capitalize(getSender(user, selectedChat.users))}

                            {onlineUsers
                                .filter((user1, index, self) =>
                                    index === self.findIndex((u) => u.userId === user1.userId)
                                )
                                .map((user1) => (
                                    <p key={user1.userId}>
                                        {user._id !== user1.userId && (
                                            <span style={{fontSize:"15px"}}>{user1.status ? 'Online' : 'Offline'}</span>
                                        )}
                                    </p>
                                ))
                            }
                            </div>

                            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
</>
                      
                    ) : (
                        <>
                            {_.capitalize(selectedChat.chatName)}

                            {/* updategorupchatname */}
                            <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                        </>
                    )}

                </Flex>
                <Flex
                    d="flex"
                    flexDir={"column"}
                    justifyContent={"flex-end"}
                    p={3}
                    bg="#E8E8E8"
                    w="100%"
                    h="100%"
                    borderRadius={"lg"}
                    overflowY={"hidden"}
                >
                    {loading ? (<Spinner
                        size={"x1"}
                        w={20}
                        h={20}
                        alignSelf={"center"}
                        margin={"auto"}
                    >
                    </Spinner>)

                        : (<div className='messages'>
                            <ScrollableChat messages={messages} setReplying={setReplying} setHideSend={setHideSend} deleteMessage={deleteMessage} setEditeding={setEditeding} setNewMessage={setNewMessage} />
                        </div>)}

                    {(hideSend == false && replying == null && editing == null) && (
                        <FormControl>
                            {isTyping ? <div>
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div> : <></>}

                            <Flex >
                                {fileLoading ?
                                    <Input
                                        variant={"filled"}
                                        bg="#E0E0E0"
                                        placeholder='Uploading files please wait...'
                                    /> :
                                    <Flex flex={"1"}>
                                        <Input
                                            variant={"filled"}
                                            border={"none"}
                                            bg="#E0E0E0"
                                            placeholder='Enter message'
                                            onChange={typingHanlder}
                                            value={newMessage}
                                        />
                                        <IconButton bg="#E0E0E0" onClick={sendMessage}><SendIcon bg="#E0E0E0"></SendIcon></IconButton>
                                    </Flex>


                                }
                                <label htmlFor="file-upload">
                                    {selectedFileName ? <IconButton onClick={() => setSelectedFileName('')}><CloseIcon ></CloseIcon></IconButton> : <IconButton as="span" bgColor="#E8E8E8" >
                                        <AttachmentIcon />
                                    </IconButton>}

                                </label>
                                {selectedFileName && (
                                    <Text fontSize="sm" ml={2} alignSelf="center">
                                        {selectedFileName}
                                    </Text>
                                )}
                                <input id="file-upload" type="file" style={{ display: "none" }} onChange={handleFileSelect} />
                                <Button bgColor={"#E8E8E8"} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😃️</Button>
                            </Flex>
                            {
                                showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} height={250} searchDisabled={true} previewConfig={emojiConfig}></EmojiPicker>
                            }
                        </FormControl>)}

                    {/* //show reply input */}


                    {/* Reply Section */}
                    {hideSend && replying && (
                        <FormControl>
                            <Flex
                                flexDir="column"
                                bg="#F7F7F7"
                                borderRadius="lg"
                                p={2}
                                mb={2}
                                alignItems="flex-start"
                            >
                                <Flex
                                    alignItems="center"
                                    justifyContent="space-between"
                                    w="100%"
                                    mb={2}
                                >
                                    <Text fontSize="sm" fontWeight="bold">
                                        Replying to {user.name === replying.sender.name ? 'you' : replying.sender.name}
                                    </Text>
                                    <IconButton
                                        icon={<CloseIcon />}
                                        variant="ghost"
                                        onClick={handleReplyClose}
                                    />
                                </Flex>
                                <Text fontSize="sm" color="gray.500" mb={2}>
                                    {replying.content}
                                </Text>
                                {/* Input Box for Reply */}
                                <Flex w="100%">
                                    {fileLoading ?
                                        <Input
                                            variant={"filled"}
                                            bg="#E0E0E0"
                                            placeholder='Uploading files please wait...'
                                        /> : <Flex flex={"1"}>
                                            <Input
                                                variant={"filled"}
                                                border={"none"}
                                                bg="#E0E0E0"
                                                placeholder='Enter message'
                                                onChange={typingHanlder}
                                                value={newMessage}
                                            />
                                            <IconButton bg="#E0E0E0" onClick={sendReply}><SendIcon bg="#E0E0E0"></SendIcon></IconButton>
                                        </Flex>

                                    }
                                    {/* Add attachment button if needed */}
                                    <label htmlFor="file-upload">
                                        {selectedFileName ? <IconButton onClick={() => setSelectedFileName('')}>  <CloseIcon></CloseIcon></IconButton> : <IconButton as="span" bgColor="#E8E8E8" >
                                            <AttachmentIcon />
                                        </IconButton>}

                                    </label>
                                    {selectedFileName && (
                                        <Text fontSize="sm" ml={2} alignSelf="center">
                                            {selectedFileName}
                                        </Text>
                                    )}
                                    <input id="file-upload" type="file" style={{ display: "none" }} onChange={handleFileSelect} />

                                    <Button bgColor="#E8E8E8" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                        😃️
                                    </Button>
                                </Flex>
                            </Flex>
                            {
                                showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} height={250} searchDisabled={true} previewConfig={emojiConfig}></EmojiPicker>
                            }
                        </FormControl>
                    )}
                    {/* {editing messages} */}

                    {editing &&
                        <FormControl>
                            {isTyping ? <div>
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div> : <></>}

                            <Flex d={"flex"}>
                                {fileLoading ?
                                    <Input
                                        variant={"filled"}
                                        bg="#E0E0E0"
                                        placeholder='Uploading files please wait...'
                                    /> : <Flex flex={"1"}>
                                        <Input
                                            variant={"filled"}
                                            border={"none"}
                                            bg="#E0E0E0"
                                            placeholder='Enter message'
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            value={newMessage}
                                        />
                                        <IconButton bg="#E0E0E0" onClick={editMessage}><SendIcon bg="#E0E0E0"></SendIcon></IconButton>
                                    </Flex>

                                }
                                <Button bgColor={"#E8E8E8"} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😃️</Button>
                            </Flex>
                            {
                                showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} height={250} searchDisabled={true} previewConfig={emojiConfig}></EmojiPicker>
                            }
                        </FormControl>}


                </Flex>
            </>
            ) : (
                <Flex d="flex" alignItems={"center"} justifyContent={"center"} h="100%">
                    <Text fontSize={"3xl"} pb="3" >
                        click on a user to start chatting..
                    </Text>

                </Flex>
            )
        }</>
    )
}

export default SingleChat