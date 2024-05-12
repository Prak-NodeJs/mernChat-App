import React, { useState } from 'react'
import {Tooltip, Menu, MenuButton, MenuItem, MenuList, MenuDivider, Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure
} from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/spinner'
import {Button} from '@chakra-ui/button'
import { Input} from '@chakra-ui/input'
import axios from "axios";

import { BellIcon,ChevronDownIcon } from "@chakra-ui/icons"
import { Flex } from '@chakra-ui/react'
import { Avatar
 } from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider';

import {Box, Text} from '@chakra-ui/layout'
import { useNavigate } from 'react-router-dom'
import ProfileModal from './ProfileModel'
import { useToast } from "@chakra-ui/toast";
import ChatLoading from './ChatLoading';
import UserListItem from '../User/UserListItem';
import { getSender } from '../../config/ChatLogic'
import NotificationBadge from 'react-notification-badge';
import {Effect} from 'react-notification-badge';

const SideDrawer = () => {
  const { user, setSelectedChat, chats, setChats, notification, setNotification} = ChatState();
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const navigate = useNavigate()
  const toast = useToast();

const { isOpen, onOpen, onClose } = useDisclosure();

const logoutHandler = ()=>{
  localStorage.removeItem('userInfo');
   navigate('/')
}

const handleSearch = async () => {
  if (!search) {
    toast({
      title: "Please Enter something in search",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "top-left",
    });
    return;
  }

  try {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/user?search=${search}`, config);
    setLoading(false);
    setSearchResult(data.data);
    setSearch('')
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


const accessChat = async(userId)=>{
  try {
    setLoadingChat(true)
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/chat`,{userId}, config);
    if(!chats.find((c)=>c._id==data.data._id)) setChats([data.data, ...chats]);
    setSelectedChat(data.data)
    setLoadingChat(false)
    onClose();
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
  return (
    <>
      <Flex
      d="flex"
      justifyContent={"space-between"}
      alignItems={"center"}
      bg={"white"}
      w="100%"
      p="5px 10px 5px 10px"
      borderWidth={"5px"}
      >
        <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'>
          <Button variant="ghost" onClick={onOpen}>
            <Text d={{base:"none", md:"flex"}} px="4">
              Search Users
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} >
              SmartConnect
        </Text>
      <div>
         <Menu>
         <MenuButton p={1}>
         <NotificationBadge count={notification.length} effect={Effect.SCALE} ></NotificationBadge>

          < BellIcon fontSize={"2xl"}></BellIcon>
         </MenuButton>
          <MenuList pl={2}>
            {!notification.length && "No New Messages"}
            {notification.map(notif=>(
              <MenuItem key={notif._id}  onClick={()=>{
                setSelectedChat(notif.chat)
                setNotification(notification.filter((n)=>n!==notif))
              }}>
                {notif.chat.isGroupChat?`New Message in ${notif.chat.chatName}`:`New Message from ${getSender(user, notif.chat.users)}`}
              </MenuItem>
            ))}
          </MenuList>
         </Menu>
 
         <Menu>
         <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
          <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}></Avatar>
         </MenuButton>

         <MenuList>
          <ProfileModal user={user}>
          <MenuItem>My Profile</MenuItem>
          </ProfileModal>
          <MenuDivider/>
          <MenuItem onClick={logoutHandler}>Logout</MenuItem>
         </MenuList>
         </Menu>


      </div>

      </Flex>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
       <DrawerOverlay>
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"}>
           Search Users
          </DrawerHeader>
          <DrawerBody>
          <Flex d="flex" pb={2}>
          <Input 
          placeholder="Seach by name or email"  
          mr={2} value={search} 
          onChange={(e)=> setSearch(e.target.value)}
          />
          <Button
          onClick={handleSearch}
          >Go</Button>
          </Flex>

          {loading ? <ChatLoading /> : (
    searchResult?.map(userItem => (
        <UserListItem key={userItem._id} user={userItem} handlerFunction={() => accessChat(userItem._id)} />
    ))
  
)}

    {loadingChat && <Spinner ml="auto" d="flex"></Spinner>}
        </DrawerBody>
        </DrawerContent>
       
       </DrawerOverlay>
      </Drawer>
    </>
  )
}

export default SideDrawer