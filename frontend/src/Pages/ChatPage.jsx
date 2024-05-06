import React, { useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import SideDrawer from '../components/misc/SideDrawer';
import { Box } from '@chakra-ui/layout';
import MyChats from '../components/misc/MyChats';
import ChatBox from '../components/misc/ChatBox';
import { Flex, Spacer } from '@chakra-ui/react'
const ChatPage = () => {
    const { user } = ChatState();
     const [fetchAgain, setFetchAgain] = useState(false)
    return (
        <div style={{width:"100%"}}>
            {user && <SideDrawer />}
            <Flex
                d="flex"
                justifyContent={"space-between"}
                w='100%'
                h={"91.5vh"}
            >
                    {user && <MyChats fetchAgain = {fetchAgain} style={{width:"50%"}}  />} 
              
                   {user && <ChatBox fetchAgain = {fetchAgain} setFetchAgain={setFetchAgain} style={{width:"50%"}} />}
           
            </Flex>
        </div>
    );
};

export default ChatPage;
