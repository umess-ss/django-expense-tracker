import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Box, AppBar, Toolbar, Typography, Container, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Sidebar from '../components/Sidebar';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import Navbar from '../components/Navbar';


export default function CrudDashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', amount: '', date: dayjs()
  });
  const [editId, setEditId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const drawerWidth = 240;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const [expRes, catRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/expenses/", { headers: { Authorization: `Token ${token}` } }),
        axios.get("http://127.0.0.1:8000/api/category/", { headers: { Authorization: `Token ${token}` } })
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData({ title: '', category: '', amount: '', date: dayjs() });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('access_token');
    const payload = {
      ...formData,
      date: dayjs(formData.date).format("YYYY-MM-DD")
    };
    const config = {
      headers: { Authorization: `Token ${token}` }
    };


    try {

      if (editId == null){
        await axios.post('http://127.0.0.1:8000/api/expenses/',payload,config);
      }else{
        await axios.put(`http://127.0.0.1:8000/api/expenses/${editId}/`,payload,config);
      }
      handleClose();
      fetchData(token);
    } catch (error) {
      console.error("Error adding expense", error);
      console.error("Django Error Details:", error.response.data);
    }
  };

  const handleEdit = (expense) =>{
    setEditId(expense.id);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: dayjs(expense.date),
    });
    setOpen(true);
  };






const handleDelete = async (id) => {
    const token = localStorage.getItem('access_token');

    if (window.confirm("Are you sure you want to delete this?")) {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/expenses/${id}/`, {
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setExpenses(prev => prev.filter(exp => exp.id !== id));
            
        } catch (error) {
            console.log("Failed to delete", error);
        }
    }
};


  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#121212' }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: '#121212' }}>
      <Navbar onAddExpense={handleOpen} onLogout={handleLogout} onToggleSidebar={handleToggleSidebar} />

      <Sidebar open={sidebarOpen} onLogout={handleLogout}/>
      
      <Box component="main" 
      sx={{ flexGrow: 1, p: 3, transition: 'margin 0.3s ease',
        ml: sidebarOpen ? 0 : `${-drawerWidth}px`, }
      }>
        <Toolbar />
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Financial Overview</Typography>
          </Box>

          <ExpenseTable expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
          <ExpenseForm
            open={open}
            onClose={handleClose}
            onSubmit={handleSubmit}
            formData={formData}
            categories={categories}
            onChange={handleChange}
          />
        </Container>
      </Box>
    </Box>
  );
}
