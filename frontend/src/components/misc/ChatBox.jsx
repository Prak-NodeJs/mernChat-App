import React from 'react'
import { ChatState } from '../../Context/ChatProvider'
import { Flex } from '@chakra-ui/layout'
import SingleChat from '../SingleChat'

const ChatBox = ({fetchAgain, setFetchAgain}) => {
   const {selectedChat} =  ChatState()
  return (
    <Flex d={{base:selectedChat?"flex":"none", md:"flex"}}
     alignItems={"center"}
     alignContent={"center"}
     flexDir={"column"}
     p={3}
     bg={"white"}
     w={{base:"100%", md:"68%"}}
     borderRadius="lg"
     borderWidth={"1px"}
    >
  <SingleChat fetchAgain = {fetchAgain} setFetchAgain= {setFetchAgain}></SingleChat>
    </Flex>
  )
}

export default ChatBox