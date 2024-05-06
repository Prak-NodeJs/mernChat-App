import React, { useState } from 'react'
import { VStack } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/react'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useToast } from '@chakra-ui/react'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
const Login = () => {
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast()
   
    const navigate = useNavigate();
    const submitHanlder = async () => {
        console.log(email, password)
        setLoading(true);
        if (!email || !password) {
          toast({
            title: "Please Fill all the Feilds",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
          return;
        }
    
        try {
          const config = {
            headers: {
              "Content-type": "application/json",
            },
          };
    
          const { data } = await axios.post(
            "http://localhost:5000/api/user/login",
            { email, password },
            config
          );
    
          toast({
            title: "Login Successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          localStorage.setItem("userInfo", JSON.stringify(data.data));
          setLoading(false);
          navigate("/chats");
        } catch (error) {
            console.log(error)
          toast({
            title: "Error Occured!",
            description:error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
        }
      };

    const handleClick = () => {
        setShow(!show)
    }

    return <VStack spacing={"5px"} color={"black"}>

        <FormControl id="email" isRequired>
            <FormLabel>
                Email
            </FormLabel>
            <Input type='email' placeholder="Enter Your Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
            >
            </Input>
        </FormControl>
        <FormControl id="password" isRequired>
            <FormLabel>
                Password
            </FormLabel>

            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder="Enter Your Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                >
                </Input>
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>

        </FormControl>

        <Button colorScheme='blue' width="100%"
            style={{ marginTop: 15 }}
            onClick={submitHanlder}
            isLoading={loading}

        >
            Login
        </Button>

        <Button variant={"solid"} colorScheme='red' width="100%"
            style={{ marginTop: 15 }}
            onClick={()=>{setEmail("guest@example.com"); setPassword("1234");}} 
        >
            Get Guest Credentials
        </Button>

    </VStack>

}

export default Login