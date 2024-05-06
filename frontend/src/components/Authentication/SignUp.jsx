import React, { useState } from 'react'
import { VStack } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/react'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useToast } from '@chakra-ui/react'
import { useNavigate } from "react-router-dom";

import axios from 'axios';
const SignUp = () => {
    const [show, setShow] = useState(false)
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast()
   
    const navigate = useNavigate();
   
   


const submitHanlder =async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
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
        if (password !== confirmpassword) {
          toast({
            title: "Passwords Do Not Match",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false)
          return;
        }
        try {
          const config = {
            headers: {
              "Content-type": "application/json",
            },
          };
          const { data } = await axios.post(
            "http://localhost:5000/api/user",
            {
              name,
              email,
              password,
              pic,
            },
            config
          );

          toast({
            title: "Registration Successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          localStorage.setItem("userInfo", JSON.stringify(data.data));
          setLoading(false);
          navigate('/chats')
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
    <FormControl id="first-name" isRequired>
        <FormLabel>
            Name
        </FormLabel>
        <Input placeholder="Enter Your Name"
            onChange={(e) => setName(e.target.value)}
        >
        </Input>
    </FormControl>
    <FormControl id="first-name" isRequired>
        <FormLabel>
            Email
        </FormLabel>
        <Input type='email' placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
        >
        </Input>
    </FormControl>
    <FormControl id="password" isRequired>
        <FormLabel>
            Password
        </FormLabel>

        <InputGroup>
            <Input type={show ? "text" : "password"} placeholder="Enter Your Email"
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

    <FormControl id="password" isRequired>
        <FormLabel>
            Confirm Password
        </FormLabel>

        <InputGroup>
            <Input type={show ? "text" : "password"} placeholder="Enter Your Email"
                onChange={(e) => setConfirmpassword(e.target.value)}
            >
            </Input>
            <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "hide" : "Show"}
                </Button>
            </InputRightElement>
        </InputGroup>

    </FormControl>

    <FormControl id="pic" isRequired>
        <FormLabel>
            Upload your picture
        </FormLabel>
        <Input type="file" p={1.5} accept='image/*' placeholder="Enter Your Email"
            onChange={(e) => postDetails(e.target.files[0])}
        >
        </Input>
    </FormControl>

    <Button colorScheme='blue' width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHanlder}
        isLoading={loading}
    >
        Sign Up
    </Button>

</VStack>
}

export default SignUp