import React from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogic';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Tooltip} from '@chakra-ui/react';
import '../components/style.css';
import 'font-awesome/css/font-awesome.min.css';

const ScrollableChat = ({ messages, setReplying, setHideSend}) => {
    const { user } = ChatState();

    const handleReply = (m) => {
        setReplying(m)
        setHideSend(true)
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
                    )}
                    <flex style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.sender._id === user._id ? 'flex-end' : 'flex-start',
                        marginLeft: isSameSenderMargin(messages, m, i, user._id),
                        marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                        maxWidth: "75%",
                    }}>
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
                            {m.content}
                            <span style={{ fontSize: '9px', color: '#555', paddingLeft: "5px" }}>{m.time}</span>

                            {m.file && (
                                <a href={m.file} download="image.jpg">
                                    <img src={m.file} alt="File" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                </a>
                            )}
                        </span>
                        <i className="fa fa-solid fa-reply" onClick={()=>handleReply(m)} />

                        {/* Display replies */}
                        {m.replies && m.replies.length > 0 && (
                            <div style={{ marginLeft: "10px" }}>
                                {m.replies.map((reply) => (
                                    <div key={reply._id}>
                                        <span>{reply.sender.name}: </span>
                                        <span>{reply.content}</span>
                                        <span style={{ fontSize: '9px', color: '#555', paddingLeft: "5px" }}>{reply.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </flex>
                </div>
            ))}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
