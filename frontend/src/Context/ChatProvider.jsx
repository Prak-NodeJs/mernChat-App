import { createContext, useContext, useState, useEffect } from 'react';
const ChatContext = createContext()
import { useNavigate } from 'react-router-dom';

const ChatProvider = ({ children }) => {

  const [selectedChat, setSelectedChat] = useState()
  const [user, setUser] = useState();
  const [chats, setChats]=  useState([])
  const [notification, setNotification] = useState([]);
  const [socket, setSocket] = useState()

  const navigate = useNavigate()

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo)

    if (!userInfo) {
      navigate('/')
    }
  }, [navigate])

  return <ChatContext.Provider value={{user, setUser,selectedChat, setSelectedChat, chats, setChats, notification, setNotification, setSocket, socket}}>
    {children}
  </ChatContext.Provider>

}

export const ChatState = () => {
  return useContext(ChatContext)

}

export default ChatProvider;