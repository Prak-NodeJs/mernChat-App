import React, { useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser, getSenderFull } from '../config/ChatLogic';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Tooltip, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ProfileModal from './misc/ProfileModel';
import CloseIcon from '@mui/icons-material/Close';
import '../components/style.css';
import _ from 'lodash'


const ScrollableChat = ({ messages, setReplying, setHideSend, deleteMessage,setEditeding, setNewMessage}) => {
    const { user, selectedChat } = ChatState();
    const [showReplies, setShowReplies] = useState({});

    const handleReply = (m) => {
        setReplying(m);
        setHideSend(true);
    };

    const handleDelete = (m) => {
        deleteMessage(m)
    }

    const handleEdit = (m) => {
        setNewMessage(m.content)
        setEditeding(m)
    }

    const toggleReplies = (messageId) => {
        setShowReplies((prev) => ({
            ...prev,
            [messageId]: !prev[messageId],
        }));
    };

    const downloadFile = (fileUrl, fileName) => {
        fetch(fileUrl)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            });
    };

    const downloadFileWithName = (fileUrl) => {
        const fileName = fileUrl.split('/').pop();
        downloadFile(fileUrl, fileName);
    };

    const renderContent = (content) => {
        if (typeof content !== 'undefined') {
            if (content.startsWith('http://') || content.startsWith('https://')) {
                return <a href={content} style={{ color: "blue" }} target="_blank" rel="noopener noreferrer">{content}</a>;
            }
            return content;
        }
        return null;
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
                                    backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                                        }`,
                                    borderRadius: "20px",
                                    padding: "5px 15px",
                                    maxWidth: "100%",
                                }}
                            >
                                {renderContent(m.content)}
                                <span style={{ fontSize: '9px', color: '#555', paddingLeft: "5px" }}>{m.time}</span>
                                {m.file && (
                                    <Tooltip label="Click to download" placement="top" cursor={"pointer"}>
                                        {m.file.endsWith('.pdf') ? (
                                            <a onClick={() => downloadFileWithName(m.file)}>
                                            <div style={{ width: '250px', height: '50px', backgroundColor: 'white', border: '1px solid black', textAlign: 'center', lineHeight: '50px' }}>.pdf</div>
                                            </a>
                                        ) : m.file.endsWith('.zip') ? (
                                            <a src={m.file} onClick={() => downloadFileWithName(m.file)}>
                                                 <div style={{ width: '250px', height: '50px', backgroundColor: 'white', border: '1px solid black', textAlign: 'center', lineHeight: '50px' }}>.zip</div>

                                            </a>
                                        ) : m.file.endsWith('.mp4') ? (
                                            <video controls height="200px" width={"200px"}>
                                                <source src={m.file} type="video/mp4" onClick={() => downloadFileWithName(m.file)} />
                                            </video>
                                        ) : m.file.endsWith('.mpeg') ? (
                                            <audio controls height="200px" width={"200px"}>
                                                <source src={m.file} type="audio/mpeg" onClick={() => downloadFileWithName(m.file)} />
                                            </audio>
                                        ):m.file.endsWith('.webm') ? (
                                         <video controls height="200px" width={"200px"}>
                                                <source src={m.file} type="video/webm" />
                                            </video>
                                        ): m.file.endsWith('.mp3') ? (
                                            <audio controls height="200px" width={"200px"}>
                                                <source src={m.file} type="audio/mp3" onClick={() => downloadFileWithName(m.file)} />
                                            </audio>
                                        )
                                        : m.file.endsWith('.txt') ? (
                                            <a onClick={() => downloadFileWithName(m.file)}>
                                                                <div style={{ width: '250px', height: '50px', backgroundColor: 'white', border: '1px solid black', textAlign: 'center', lineHeight: '50px' }}>.txt</div>

                                            </a>
                                        ) : m.file.endsWith('.json') ? (
                                            <a onClick={() => downloadFileWithName(m.file)}>
                                                                <div style={{ width: '250px', height: '50px', backgroundColor: 'white', border: '1px solid black', textAlign: 'center', lineHeight: '50px' }}>.json</div>

                                            </a>
                                        ) : m.file.endsWith('.csv') ? (
                                            <a onClick={() => downloadFileWithName(m.file)}>
                                                                <div style={{ width: '250px', height: '50px', backgroundColor: 'white', border: '1px solid black', textAlign: 'center', lineHeight: '50px' }}>.csv</div>
                                            </a>
                                        ) : (
                                            <img
                                                src={m.file}
                                                alt="File"
                                                style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                                                onClick={() => downloadFileWithName(m.file)}
                                            />
                                        )}
                                    </Tooltip>
                                )}
                            </span>
                            {/* <Menu>
                                <MenuButton as={MoreVertIcon} size="md" cursor="pointer" />
                                <MenuList>
                                    {user._id == m.sender._id ? <MenuList>
                                        <MenuItem onClick={() => handleReply(m)}>Reply</MenuItem>
                                        <MenuItem onClick={() => handleEdit(m)}>Edit</MenuItem>
                                        <MenuItem onClick={() => handleDelete(m)}>Delete</MenuItem>
                                    </MenuList> : <MenuList>
                                        <MenuItem onClick={() => handleReply(m)}>Reply</MenuItem>
                                        <MenuItem onClick={() => handleEdit(m)}>Edit</MenuItem>
                                    </MenuList>}

                                </MenuList>
                            </Menu> */}
                            <Menu>
                                <MenuButton as={MoreVertIcon} size="md" cursor="pointer" />
                                <MenuList>
                                    {user._id === m.sender._id && !m.file && (
                                        <MenuItem onClick={() => handleEdit(m)}>Edit</MenuItem>
                                    )}
                                    <MenuItem onClick={() => handleReply(m)}>Reply</MenuItem>
                                    {user._id === m.sender._id && (
                                        <MenuItem onClick={() => handleDelete(m)}>Delete</MenuItem>
                                    )}
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
                                <span>{user.name === reply.name ? "You" : _.capitalize(reply.name)}: </span>
                                <span style={{ margin: "10px" }}> {renderContent(reply.content)}
                                </span>
                                {reply.file && (
                                    <Tooltip label="Click to download" placement="top">
                                        {reply.file.endsWith('.pdf') ? (
                                            <if onClick={() => downloadFileWithName(reply.file)}>.pdf</if>
                                        ) : reply.file.endsWith('.zip') ? (
                                            <p src={reply.file} onClick={() => downloadFileWithName(reply.file)}>.zip</p>
                                        ) : reply.file.endsWith('.mp4') ? (
                                            <video controls height="200px" width={"200px"}>
                                                <source src={reply.file} type="video/mp4" onClick={() => downloadFileWithName(reply.file)} />
                                            </video>
                                        ) : reply.file.endsWith('.txt') ? (
                                            <p onClick={() => downloadFileWithName(reply.file)}>.txt</p>
                                        ) : reply.file.endsWith('.json') ? (
                                            <p onClick={() => downloadFileWithName(reply.file)}>.json</p>
                                        ) : reply.file.endsWith('.csv') ? (
                                            <p onClick={() => downloadFileWithName(reply.file)}>.csv</p>
                                        ) : (
                                            <img
                                                src={reply.file}
                                                alt="File"
                                                style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                                                onClick={() => downloadFileWithName(reply.file)}
                                            />
                                        )}
                                    </Tooltip>
                                )}
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
