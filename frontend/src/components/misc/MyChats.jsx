import React, {useState, useEffect} from 'react'
import {Stack, Text} from '@chakra-ui/layout'
import { Flex,  useToast } from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider';
import { Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getSender } from '../../config/ChatLogic';
import ChatLoading from './ChatLoading';
import GroupChatMadel from './GroupChatMadel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';

const MyChats = ({fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user,selectedChat, setSelectedChat, chats, setChats} =ChatState();
  const toast = useToast()

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat`, config);
      setChats(data.data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description:error.response.data.message,

        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      
    }
  };

  const handleChatDelete = async(chatId)=>{
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/chat/${chatId}`, config);
      setChats(data.data);
      setSelectedChat()
    } catch (error) {
      toast({
        title: "Error Occured!",
        description:error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Flex
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Flex
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatMadel>
        <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
          </GroupChatMadel>
       </Flex>
       <Flex
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >

         {chats ? (<Stack overflowY={'scroll'}>
          {
            chats.map((chat)=>(
              <Flex
              justifyContent={'space-between'}
              onClick={()=>setSelectedChat(chat)}
              cursor={"pointer"}
              bg={selectedChat===chat? "#38B2AC" :"#E8E8E8"}
              color={selectedChat ===chat? "white":"black"}
              px={3}
              py={2}
              borderRadius={"lg"}
              key={chat._id}
              >
                 <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>

                <Menu>
                                <MenuButton as={MoreVertIcon} size="md" cursor="pointer" />
                                <MenuList>
                                    
                                      <MenuItem style={{color:'black'}} onClick={()=>handleChatDelete(chat._id)}>Delete</MenuItem>
                                 
                                    
                                    
                                </MenuList>
                            </Menu>
              </Flex>
            ))
          }

         </Stack>): (<ChatLoading/>)}
        </Flex>


     
    </Flex>
  );
}

export default MyChats