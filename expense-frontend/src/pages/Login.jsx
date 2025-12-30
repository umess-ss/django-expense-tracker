import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';

import {TextField, Button, Box, Container, Paper, Typography} from '@mui/material'; 

const LoginForm = () =>{
    const [crediantials, setCrediantials] = useState({username:'',password:''});
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleChange = (e) =>{
        setCrediantials({ ...crediantials,[e.target.name]:e.target.value});
    };


    const handleSubmit = async (e) =>{
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login',
                {username : crediantials.username, password:crediantials.password});

            localStorage.setItem('access_token',response.data.token);
            navigate('/Dashboard');
        } catch (error) {
            setError("Invalid Username or Password. Please Try Again...")
        }
    };



    return(
        <Container maxWidth="xs">
            <Box sx={{marginTop:8,display:'flex',flexDirection:'column',alignItems:"center"}}>
                <Paper elevation={3} sx={{padding:4, width:"100%",borderRadius:2}}>
                    <Typography>
                        Expense Tracker Login
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={crediantials.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={crediantials.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            Login
                        </Button>
                    </Box>
                </Paper>

            </Box>

        </Container>
    );
};


export default LoginForm;
