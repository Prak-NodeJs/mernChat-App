import React, { useEffect } from 'react'
import { Container, Box, Text, Tab, Tabs, TabList, TabPanel,TabPanels} from '@chakra-ui/react'
import Login from '../components/Authentication/Login'
import SignUp from '../components/Authentication/SignUp'
import { useNavigate } from 'react-router-dom'


const HomePage = () => {
      const navigate = useNavigate()
        useEffect(()=>{
            const user = JSON.parse(localStorage.getItem('userInfo'));

            if(user) navigate('/chats');
        })


    return <Container maxW='xl' centerContent>

        <Box d='flex' justifyContent='center' p={3} w="100%"
            bg={'white'}
            m={"40px 0 15px 0"}
            borderRadius={"1g"}
            borderWidth={"1px"}
        >
            <Text fontSize={"4xl"} color="black">
                Chat Now
            </Text>
        </Box>

        <Box bg="white" w="100%" p={"4"} borderRadius='1g'  borderWidth="1px">
            <Tabs variant='soft-rounded' colorScheme='green'>
                <TabList mb="1em">
                    <Tab width={"50%"}>Login</Tab>
                    <Tab width={"50%"}>Sign Up</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Login></Login>
                    </TabPanel>
                    <TabPanel>
                        <SignUp/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    </Container>
}

export default HomePage