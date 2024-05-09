import React, { useState } from 'react';
import { VStack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email is invalid';
            isValid = false;
        }

        if (!password.trim()) {
            errors.password = 'Password is required';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) {
            setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
        }
    };

    const submitHandler = async () => {
        setLoading(true);
        if (validateForm()) {
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
                setLoading(false);
                console.log(error);
                toast({
                    title: "Error Occurred!",
                    description: error.response ? error.response.data.message : "Network Error",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } else {
            setLoading(false);
        }
    };

    const handleClick = () => {
        setShow(!show);
    };

    return (
        <VStack spacing={"5px"} color={"black"}>
            <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    type='email'
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={handleEmailChange}
                />
                {errors.email && <span style={{color:"red"}} className='error'>{errors.email}</span>}
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="Enter Your Password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                {errors.password && <span style={{color:"red"}} className='error'>{errors.password}</span>}
            </FormControl>
            <Button
                colorScheme='blue'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Login
            </Button>
            <Button
                variant={"solid"}
                colorScheme='red'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("1234");
                }}
            >
                Get Guest Credentials
            </Button>
        </VStack>
    );
};

export default Login;
