import React, { useState } from 'react'
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
    useToast
  } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../User/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../User/UserListItem'
import { Spinner } from '@chakra-ui/spinner'

const UpdateGroupChatModal = ({fetchMessages, fetchAgain, setFetchAgain}) => {
     const {selectedChat, setSelectedChat,user} = ChatState()
    const { isOpen, onOpen, onClose } = useDisclosure()
     const toast = useToast()
    const [groupChatName, setGroupChatName] = useState()
    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [renameLoading, setRenameLoading] = useState(false)

    const handleRemove = async (user1)=>{
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
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
              `http://localhost:5000/api/chat/removefromgroup`,
              {
                chatId: selectedChat._id,
                userId: user1._id,
              },
              config
            );
      
            user1._id === user._id ? setSelectedChat() : setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);
            fetchMessages()
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
          setGroupChatName("");
      
    }
    const handleRename = async ()=>{
       if(!groupChatName) return 
       try {
        setRenameLoading(true)
         const config = {
            headers:{
                Authorization:`Bearer ${user.token}`
            }
         }

         const {data} = await axios.put('http://localhost:5000/api/chat/rename',{
              chatId:selectedChat._id,
              chatName:groupChatName
         }, config)

         setSelectedChat(data.data)
         setFetchAgain(!fetchAgain)
         setRenameLoading(false)
       } catch (error) {
        console.log(error)
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
              const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
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
              `http://localhost:5000/api/chat/addtogroup`,
              {
                chatId: selectedChat._id,
                userId: user1._id,
              },
              config
            );
      
            setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
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
          }
          setGroupChatName("")
      
    }

    return (
        <>
          <IconButton d={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}/>
    
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{selectedChat.chatName}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>

                <Flex >
                    {selectedChat.users.map(u=>(
                      <UserBadgeItem key={u._id}
                      user={u}
                      handlerFunction={()=>handleRemove(u)}
                      >
                      </UserBadgeItem>  
                    ))}
                </Flex>
                <FormControl>
                <Input placeholder='Chat Name' mb={3} value={groupChatName} onChange={(e)=>setGroupChatName(e.target.value)}/>
                <Button variant={"solid"} colorScheme='teal' ml={"1"} isLoading={renameLoading} onClick={handleRename}>
                    Update
                </Button>
                </FormControl>
                <FormControl>
                <Input placeholder='Add User to group' mb={1} onChange={(e)=>handleSearch(e.target.value)}/>
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
                <Button onClick={()=>handleRemove(user)} colorScheme='red'>
                  Leave Group
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
    }

export default UpdateGroupChatModal