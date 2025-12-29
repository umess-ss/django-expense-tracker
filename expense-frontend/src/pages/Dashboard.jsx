import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () =>{
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(()=>{
        const token = localStorage.getItem('access_token');
        if (!token){
            navigate('/login');
        }
        else{
            fetchExpenses(token);
        }
    },[navigate]);


    const fetchExpenses = async (token) =>{
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/expenses/",{
                headers:{Authorization: `Token ${token}`}
            });
            setExpenses(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching Data",error);
            setLoading(false);
        }
    };


    const handleDelete = async (id) =>{
        const token = localStorage.getItem('access_token');
        if (window.confirm("Are you sure want to delete this?")){
            try {
                await axios.delete(`http://127.0.0.1:8000/api/expenses/${id}/`,{
                    headers:{Authorization:`Token ${token}`}
                });
                setExpenses(expenses.filter(exp=>exp.id !== id));
            } catch (error) {
                alert("Failed to delete.....")
            }
        }
    }






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
                <h1>Welcome to Expense Tracker</h1>
                <h2>Your Spendings</h2>
                {loading ? (<p>Loading....</p>)
                :
                (<table border="1">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((e) =>(
                            <tr key={e.id}>
                                <td>{e.title}</td>
                                <td>{e.category_name}</td>
                                <td>{e.amount}</td>
                                <td>
                                    <button onClick={()=>alert("Edited")}>Edit</button>
                                    <button onClick={()=>handleDelete(e.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>)}
            </main>
        </div>
    );
}

export default Dashboard;