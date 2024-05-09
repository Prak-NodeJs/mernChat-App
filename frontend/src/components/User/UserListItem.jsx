import React from 'react'
import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Text } from "@chakra-ui/layout";
const UserListItem = ({user, handlerFunction}) => {
    return (
        <Flex
          onClick={handlerFunction}
          cursor="pointer"
          bg="#E8E8E8"
          _hover={{
            background: "#38B2AC",
            color: "white",
          }}
          w="100%"
          d="flex"
          alignItems="center"
          color="black"
          px={3}
          py={2}
          mb={2}
          borderRadius="lg"
        >
          <Avatar
            mr={2}
            size="sm"
            cursor="pointer"
            name={user.name}
            src={user.pic}
          />
          <Flex>
            <Text>{user.name}</Text>
            {/* <Text fontSize="xs">
              <b>Email : </b>
              {user.email}
            </Text> */}
          </Flex>
        </Flex>
      );
    };
export default UserListItem