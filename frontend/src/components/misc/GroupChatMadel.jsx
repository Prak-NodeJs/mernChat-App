import React, { useState } from 'react'
import axios from 'axios'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    useToast,
    FormControl, Input, Flex

} from '@chakra-ui/react'

import { ChatState } from '../../Context/ChatProvider'
import UserListItem from '../User/UserListItem'
import UserBadgeItem from '../User/UserBadgeItem'

const GroupChatMadel = ({ children }) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false)

    const toast = useToast();

    const { user, chats, setChats } = ChatState()

    const handleSearch = async (query) => {
        setSearch(query)
        if(!query){
            return;
        }
        try {
            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              };
          
              const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
              setLoading(false);
              setSearchResult(data.data);
        } catch (error) {
            console.log(error)
            toast({
                title: "Error Occured!",
                description: "Failed to fetch users",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
        }

    }

    const handleSubmit = async () => {
       if(!groupChatName || !selectedUsers){
        toast({
            title: "Please provide all the details",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          return;
       }

       try {
        const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
      
          const { data } = await axios.post(`http://localhost:5000/api/chat/group`,{
          chatName:groupChatName,
          users:selectedUsers.map((u)=>u._id)
          },config);

          setChats([data.data, ...chats])
          onClose();
          toast({
            title: "Group Chat Created",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        
       } catch (error) {
        console.log(error)
        toast({
            title: "Error Occured!",
            description: "Failed error occured while creating group chat",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
       }
    }

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
      };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
          toast({
            title: "User already added",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          return;
        }
    
        setSelectedUsers([...selectedUsers, userToAdd]);
      };
    

    return (
        <>
            <Button onClick={onOpen}>{children}</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily={"work sans"}
                        d="flex"
                        justifyContent={"center"}
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody d="flex" flexDir={"column"} alignItems={"center"}>

                        <FormControl>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>

                        <FormControl>
                            <Input placeholder='Add Users eg: John, Prakash, Jane' mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>

                        {/* selected users */}
                        <Flex w="100%" d="flex" flexWrap="wrap">
                        {selectedUsers.map(u=>(
                            <UserBadgeItem key={u._id} user={u} handlerFunction={() => handleDelete(u)}/>
                        ))}
                        </Flex>
                      
                        
                        {/* ///render searched users */}
                       
          {loading ? <ChatLoading /> : (
    searchResult?.map(userItem => (
        <UserListItem key={userItem._id} user={userItem} handlerFunction={()=>handleGroup(userItem)} />
    ))
)}

                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatMadel