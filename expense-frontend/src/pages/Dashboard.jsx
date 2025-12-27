import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () =>{
    const navigate = useNavigate();
    const [user, setUser] = useState(null);


    useEffect(()=>{
        const token = localStorage.getItem('access_token');
        if (!token){
            navigate('/login');
        }
    },[navigate]);

    const handleLogout = () =>{
        localStorage.removeItem('access_token');
        navigate('/login');
    };



    return(
        <div>
            <nav>
                <h1>Expense Tracker</h1>
                <button onClick={handleLogout}>Logout</button>
            </nav>
            <main>
                <h1>Welcome to Dashboard</h1>
                <div>
                    <h3>Add Expenses</h3>
                    <button>Add Expenses</button>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;