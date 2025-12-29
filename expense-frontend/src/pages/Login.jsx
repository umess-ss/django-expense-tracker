import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';

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
        <div>
            <form onSubmit={handleSubmit}>
                <h2>Expense Tracker Login</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={crediantials.username}
                    onChange={handleChange}
                    required
                 />

                 <input
                    type="text"
                    name="password"
                    placeholder="Password"
                    value={crediantials.password}
                    onChange={handleChange}
                    required
                    />

                    <button type="submit">Login</button>
            </form>
        </div>
    );
};


export default LoginForm;
