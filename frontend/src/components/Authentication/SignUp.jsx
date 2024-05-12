import React, { useState } from 'react';
import { VStack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

import axios from 'axios';

const SignUp = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const [password, setPassword] = useState('');
    const [pic, setPic] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleNameKeyPress = (e) => {
        const charCode = e.charCode;
        if (charCode >= 48 && charCode <= 57) {
            e.preventDefault();
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        } else if (!/^[a-zA-Z\s]*$/.test(name)) {
            errors.name = 'Name should not contain numbers or special characters';
            isValid = false;
        }

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

        if (!confirmpassword.trim()) {
            errors.confirmpassword = 'Password is required';
            isValid = false;
        }

        if (password !== confirmpassword) {
            errors.confirmpassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (errors.name) {
            setErrors((prevErrors) => ({ ...prevErrors, name: '' }));
        }
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

    const handleConfirmPasswordChange = (e) => {
        setConfirmpassword(e.target.value);
        if (errors.confirmpassword) {
            setErrors((prevErrors) => ({ ...prevErrors, confirmpassword: '' }));
        }
    };

    const postDetails = (pics) => {
        if (pics === undefined) {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "dlpxfirxx");
            fetch("https://api.cloudinary.com/v1_1/dlpxfirxx/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                })
                .catch((err) => {
                    setLoading(false);
                });
        } else {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
    };

    const handleClick = () => {
        setShow(!show);
    };

    const submitHandler = async () => {
        setLoading(true);
        if (validateForm()) {
            try {
                const userData = {
                    name, email, password
                }
                if(pic){
                    userData.file = pic
                }

                const { data } = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/user`,
                    userData
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
                navigate('/chats');
            } catch (error) {
                setLoading(false);
                toast({
                    title: "Error Occurred!",
                    description: error.response.data.message,
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

    return (
        <VStack spacing={"5px"} color={"black"}>
            <FormControl id="name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder="Enter Your Name"
                    onChange={handleNameChange}
                    onKeyPress={handleNameKeyPress}

                />
                {errors.name && <span style={{ color: "red" }} className='error'>{errors.name}</span>}
            </FormControl>
            <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    type='email'
                    placeholder="Enter Your Email"
                    onChange={handleEmailChange}
                />
                {errors.email && <span style={{ color: "red" }} className='error'>{errors.email}</span>}
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="Enter Your Password"
                        onChange={handlePasswordChange}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                {errors.password && <span style={{ color: "red" }} className='error'>{errors.password}</span>}
            </FormControl>
            <FormControl id="confirm-password" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="Confirm Your Password"
                        onChange={handleConfirmPasswordChange}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                {errors.confirmpassword && <span style={{ color: "red" }} className='error'>{errors.confirmpassword}</span>}
            </FormControl>
            <FormControl id="pic" >
                <FormLabel>Upload your picture</FormLabel>
                <Input
                    type="file"
                    p={1.5}
                    accept='image/*'
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>
            <Button
                colorScheme='blue'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Sign Up
            </Button>
        </VStack>
    );
};

export default SignUp;
