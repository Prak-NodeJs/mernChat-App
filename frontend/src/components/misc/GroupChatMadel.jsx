import React, { useState, useEffect} from 'react'
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
import io from 'socket.io-client'
const ENDPOINT = "http://localhost:5000"
var socket;

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
    const [errors, setErrors] = useState({});

    const toast = useToast();

    const { user, chats, setChats} = ChatState()

    useEffect(() => {
        socket = io(ENDPOINT);
    }, [])


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

    const handleGroupChatNameChange = (e) => {
        setGroupChatName(e.target.value);
        if (errors.groupChatName) {
            setErrors((prevErrors) => ({ ...prevErrors, groupChatName: '' }));
        }
    };

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
      if(validateForm()){
        if(selectedUsers.length<2){
            toast({
                title: "Error Occured!",
                description: "Add atleast two user to create group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
              return
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
          socket.emit('add_user_to_group', (selectedUsers))
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
        setSearchResult([])
        setSearch('')
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
                            <Input placeholder='Chat Name' mb={3} onChange={handleGroupChatNameChange} />
                            {errors.groupChatName && <span style={{color:"red"}} className='error'>{errors.groupChatName}</span>}
                        </FormControl>

                        <FormControl>
                            <Input placeholder='Add Users eg: John, Prakash, Jane' value={search} mb={1} onChange={(e) => handleSearch(e.target.value)} />
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