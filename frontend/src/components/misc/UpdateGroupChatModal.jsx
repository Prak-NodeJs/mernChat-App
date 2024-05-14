import React, { useState, useEffect} from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    IconButton,
    Button,
    Flex,
    FormControl,
    Input,
    useToast,
    Text,
  } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../User/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../User/UserListItem'
import { Spinner } from '@chakra-ui/spinner'
import { getSocket } from '../../config/socket.service'

 var socket;

const UpdateGroupChatModal = ({fetchMessages, fetchAgain, setFetchAgain}) => {
    const {selectedChat, setSelectedChat,user} = ChatState()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [groupChatName, setGroupChatName] = useState('')
    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [renameLoading, setRenameLoading] = useState(false)
    const [errors, setErrors] = useState({});

    const validateForm = () => {
      const errors = {};
      let isValid = true;

      if (!groupChatName.trim()) {
          errors.groupChatName = 'Group ChatName is required';
          isValid = false;
      } 
      setErrors(errors);
      return isValid;
  };
  useEffect(() => {
   socket = getSocket();
}, [])

 

  const handleGroupChatNameChange = (e) => {
    setGroupChatName(e.target.value);
    if (errors.groupChatName) {
        setErrors((prevErrors) => ({ ...prevErrors, groupChatName: '' }));
    }
};

const handleDelete= async (user1)=>{
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/chat/removefromgroup`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      const messageData = {
        content:"user left from group",
        userLeft:user1._id,
        chatId:selectedChat._id
    }

      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/message`, messageData, config)
      setSelectedChat()
      setFetchAgain(!fetchAgain);
      fetchMessages()
      socket.emit('user_deleted_group',selectedChat.users, data.data,user1)
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "error occured while deleting group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }      
}

    const handleRemove = async (user1)=>{
        if (selectedChat.groupAdmin._id !== user._id ) {
            toast({
              title: "Only admins can remove someone!",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
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
            const { data } = await axios.put(
              `${import.meta.env.VITE_BASE_URL}/api/chat/removefromgroup`,
              {
                chatId: selectedChat._id,
                userId: user1._id,
              },
              config
            );
            user._id==user1._id?setSelectedChat():setSelectedChat(data.data);
            const messageData = {
              content:"user removed from group",
              userRemoved:user1._id,
              chatId:selectedChat._id
          }
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/message`, messageData, config)
            setFetchAgain(!fetchAgain);
            fetchMessages()
            socket.emit('user_removed',selectedChat.users, data.data ,user1)
            setLoading(false);
          } catch (error) {
            toast({
              title: "Error Occured!",
              description: "error occured while removing user from group",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            setLoading(false);
          }      
    }

    const handleRename = async ()=>{
       if(validateForm()) {
       try {
        setRenameLoading(true)
         const config = {
            headers:{
                Authorization:`Bearer ${user.token}`
            }
         }

         const {data} = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/chat/rename`,{
              chatId:selectedChat._id,
              chatName:groupChatName
         }, config)

         setSelectedChat(data.data)
         setFetchAgain(!fetchAgain)
         socket.emit('rename_group',data.data, user)
         setRenameLoading(false)
       } catch (error) {
        toast({
            title: "Error Occured!",
            description: "Failed error occured while renaming",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
          setRenameLoading(false)
       }
       
       setGroupChatName('')
      }
    }

    const handleSearch = async (query)=>{
            setSearch(query);
            if (!query) {
              return;
            }
            try {
              setLoading(true);
              const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              };
              const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/user?search=${search}`, config);
              setLoading(false);
              setSearchResult(data.data);
            } catch (error) {
              toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
              setLoading(false);
            }
    }

    const handleAddUser = async (user1)=>{
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
              title: "User Already in group!",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            return;
          }
      
          if (selectedChat.groupAdmin._id !== user._id) {
            toast({
              title: "Only admins can add someone!",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
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
           
            const { data } = await axios.put(
              `${import.meta.env.VITE_BASE_URL}/api/chat/addtogroup`,
              {
                chatId: selectedChat._id,
                userId: user1._id,
              },
              config
            );


            const messageData = {
              content:"grp content",
              userAdded:user1._id,
              chatId:selectedChat._id
          }

           await axios.post(`${import.meta.env.VITE_BASE_URL}/api/message`, messageData, config)


            setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);
            socket.emit('user_added', data.data, user)
            setLoading(false);
            setSearch('');
            setSearchResult([])
          } catch (error) {
            toast({
              title: "Error Occured!",
              description: "error happend while adding user to group",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            setLoading(false);
            setSearch('');
          }
    }
    return (
      <>
        <IconButton d={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen} />
  
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedChat.chatName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" mb={4}>
                <Text fontWeight="bold" mb={2}>
                  Current Members
                </Text>
                <Flex flexWrap="wrap">
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handlerFunction={() => handleRemove(u)}
                    />
                  ))}
                </Flex>
              </Flex>
              <FormControl mb={4}>
                <Input
                  placeholder="Enter New Chat Name"
                  value={groupChatName}
                  onChange={handleGroupChatNameChange}
                />
                {errors.groupChatName && (
                  <Text mt={1} color="red.500">
                    {errors.groupChatName}
                  </Text>
                )}
                <Button
                  colorScheme="teal"
                  mt={2}
                  isLoading={renameLoading}
                  onClick={handleRename}
                >
                  Rename Group
                </Button>
              </FormControl>
              <FormControl mb={4}>
                <Input
                  placeholder="Search Users"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>
              {loading ? (
                <Spinner size="lg" />
              ) : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handlerFunction={() => handleAddUser(user)}
                  />
                ))
              )}
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme="red" onClick={() =>handleDelete(user)}>
                Delete Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default UpdateGroupChatModal;