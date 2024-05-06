import { CloseIcon } from '@chakra-ui/icons'
import { Flex } from '@chakra-ui/layout'
import React from 'react'
import { Badge } from "@chakra-ui/layout";

const UserBadgeItem = ({user, handlerFunction}) => {
    return (
        <Badge
          px={2}
          py={1}
          borderRadius="lg"
          m={1}
          mb={2}
          variant="solid"
          fontSize={12}
          colorScheme="purple"
          cursor="pointer"
          onClick={ handlerFunction}
        >
          {user.name}
          <CloseIcon pl={1} onClick={handlerFunction} />
        </Badge>
      );
    };

export default UserBadgeItem