import React, { useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser, getSenderFull } from '../config/ChatLogic';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Tooltip, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ProfileModal from './misc/ProfileModel';
import CloseIcon from '@mui/icons-material/Close';
import '../components/style.css';

const ScrollableChat = ({ messages, setReplying, setHideSend }) => {
    const { user, selectedChat } = ChatState();
    const [showReplies, setShowReplies] = useState({});

    const handleReply = (m) => {
        setReplying(m);
        setHideSend(true);
    };

    const toggleReplies = (messageId) => {
        setShowReplies((prev) => ({
            ...prev,
            [messageId]: !prev[messageId],
        }));
    };

    return (
        <ScrollableFeed>
            {!messages.length ? (
                <div className='no_message'>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : messages.map((m, i) => (
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }} key={m._id}>
                    {(isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
                        <ProfileModal user={getSenderFull(user, selectedChat.users)} >
                        <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                            <Avatar
                                mt="7px"
                                mr={1}
                                size="sm"
                                cursor="pointer"
                                name={m.sender.name}
                                src={m.sender.pic}
                            />
                        </Tooltip>
                        </ProfileModal>
                    )}
                                         {/* <ProfileModal user={getSenderFull(user, selectedChat.users)} /> */}

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.sender._id === user._id ? 'flex-end' : 'flex-start',
                        marginLeft: isSameSenderMargin(messages, m, i, user._id),
                        marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                        maxWidth: "75%",
                    }}>
                        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span
                                style={{
                                    backgroundColor: `${
                                        m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                                        }`,
                                    borderRadius: "20px",
                                    padding: "5px 15px",
                                    maxWidth: "100%",
                                }}
                            >
                                <span>{m.content}</span>
                                <span style={{ fontSize: '9px', color: '#555', paddingLeft: "5px" }}>{m.time}</span>
                                {m.file && (
                                    <a href={m.file} download="image.jpg">
                                        <img src={m.file} alt="File" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                    </a>
                                )}
                            </span>
                            <Menu>
                                <MenuButton as={MoreVertIcon} size="md" cursor="pointer" />
                                <MenuList>
                                    <MenuItem onClick={() => handleReply(m)}>Reply</MenuItem>
                                </MenuList>
                            </Menu>
                        </span>

                        {m.replies && m.replies.length > 0 && (
                            <div style={{ marginLeft: "10px", marginTop: "10px" }}>
                                <span style={{ cursor: 'pointer' }} onClick={() => toggleReplies(m._id)}>
                                    {showReplies[m._id] ? <CloseIcon width="10px" height="10px"></CloseIcon> : <span style={{ fontSize: "12px", marginRight: "20px" }}>{m.replies.length} replies</span>}
                                </span>
                            </div>
                        )}

                        {showReplies[m._id] && m.replies.map((reply) => (
                            <div key={reply._id} style={{ marginLeft: "10px" }}>
                                <span>{user.name === reply.name ? "you" : reply.name}: </span>
                                <span style={{ margin: "10px" }}>{reply.content}</span>
                                <span style={{ fontSize: '9px', color: '#555', paddingLeft: "5px" }}>{reply.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
