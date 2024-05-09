import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Flex, Text } from '@chakra-ui/layout'
import { FormControl, Input, Spinner, useToast, Button, IconButton } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogic'
import ProfileModal from './misc/ProfileModel'
import UpdateGroupChatModal from './misc/UpdateGroupChatModal'
import axios from 'axios'
import io from 'socket.io-client'
import './style.css'
import ScrollableChat from './ScrollableChat'
import Lottie from "react-lottie";
import EmojiPicker from 'emoji-picker-react';
import { AttachmentIcon } from '@chakra-ui/icons'
import CloseIcon from '@mui/icons-material/Close';



import animationData from '../animations/typing.json'

const ENDPOINT = "http://localhost:5000"

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
    const [replying, setReplying] = useState(null)
    const [hideSend, setHideSend] = useState(false)
    const [fileLoading, setFileLoading] = useState(false)

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
            const { data } = await axios.get(`http://localhost:5000/api/message/${selectedChat._id}`, config)
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

    const sendMessage = async (event) => {
        if (event.key == "Enter" && (newMessage || file)) {
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
                const { data } = await axios.post("http://localhost:5000/api/message", messageData, config)
                console.log("messages length before sending simple", messages.length)

                socket.emit('new message', data.data)
                setMessages([...messages, data.data])
                console.log("messages length after sending sending simple", messages.length)

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
        console.log("hello reply object", replying)
        if (event.key == "Enter" && (newMessage || file)) {
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

                const { data } = await axios.post(`http://localhost:5000/api/reply/message/${replying._id}`, messageData, config)

                const messageIndex = messages.findIndex(
                    (msg) => msg._id === data.data._id
                );

                if (messageIndex !== -1) {
                    // If the message exists, replace it with the replied message data
                    const updatedMessages = [...messages];
                    updatedMessages[messageIndex] = data.data;
                    setMessages(updatedMessages);
                }

                socket.emit('reply message', data.data)
                console.log("messages length before sending", messages.length)
                console.log("reply message emitted")
                // setMessages("this is messages", messages);
                // fetchMessages()

                console.log("messages length after sending", messages.length)

                setFile('')
                setSelectedFileName('')
                setHideSend(false)
                setReplying(null)
                setNewMessage('')
            } catch (error) {
                console.log(error)
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
        socket = io(ENDPOINT);
        socket.emit('setup', user);
        socket.on('connected', () => {
            setSocketConnected(true)
        })
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat])

    useEffect(() => {
        socket.on('message recieved', (newMessageRecieved) => {
            console.log("messages length before reciveing simple", messages.length)

            if (!selectedChatCompare ||
                selectedChatCompare._id !== newMessageRecieved.chat._id) {
                //give notification
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification])
                    setFetchAgain(!fetchAgain)
                }

            } else {
                setMessages([...messages, newMessageRecieved])
                console.log("messages length before reciveing simple", messages.length)

            }
        })
    })

    useEffect(() => {
        socket.on('reply message recieved', (replyMessageRecieved) => {
            console.log("messages length before reciveing reply", messages.length)

            if (!selectedChatCompare ||
                selectedChatCompare._id !== replyMessageRecieved.chat._id) {
                //give notification
                if (!notification.includes(replyMessageRecieved)) {
                    setNotification([replyMessageRecieved, ...notification])
                    setFetchAgain(!fetchAgain)
                }

            } else {
                console.log(messages.length)
                const messageIndex = messages.findIndex(
                    (msg) => msg._id === replyMessageRecieved._id
                );

                if (messageIndex !== -1) {
                    // If the message exists, replace it with the replied message data
                    const updatedMessages = [...messages];
                    updatedMessages[messageIndex] = replyMessageRecieved;
                    setMessages(updatedMessages);
                }
                // fetchMessages()
                // setMessages([...messages, replyMessageRecieved])
                // sendMessage(messages)
                console.log("messages length before reciveing reply", messages.length)

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

        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "dlpxfirxx");
            fetch("https://api.cloudinary.com/v1_1/dlpxfirxx/image/upload", {
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
        } else {
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
                            {getSender(user, selectedChat.users)}
                            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                        </>
                    ) : (
                        <>
                            {selectedChat.chatName.toUpperCase()}

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
                            <ScrollableChat messages={messages} setReplying={setReplying} setHideSend={setHideSend} />
                        </div>)}

                    {(hideSend == false && replying == null) && (
                        <FormControl onKeyDown={sendMessage}>
                            {isTyping ? <div>
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div> : <></>}

                            <Flex d={"flex"}>
                                {fileLoading?
                                <Input
                                    variant={"filled"}
                                    bg="#E0E0E0"
                                    placeholder='Uploading files please wait...'
                                    // onChange={typingHanlder}
                                    // value={newMessage}
                                />:  <Input
                                variant={"filled"}
                                bg="#E0E0E0"
                                placeholder='Enter message'
                                onChange={typingHanlder}
                                value={newMessage}
                            />
                            }
                                <label htmlFor="file-upload">
                                    <IconButton as="span" bgColor="#E8E8E8" >
                                        <AttachmentIcon />
                                    </IconButton>
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
                        <FormControl onKeyDown={sendReply}>
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
                                {fileLoading?
                                <Input
                                    variant={"filled"}
                                    bg="#E0E0E0"
                                    placeholder='Uploading files please wait...'
                                    // onChange={typingHanlder}
                                    // value={newMessage}
                                />:  <Input
                                variant={"filled"}
                                bg="#E0E0E0"
                                placeholder='Enter message'
                                onChange={typingHanlder}
                                value={newMessage}
                            />
                            }
                                    {/* Add attachment button if needed */}
                                    <label htmlFor="file-upload">
                                        <IconButton as="span" bgColor="#E8E8E8" >
                                            <AttachmentIcon />
                                        </IconButton>
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