import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Box, AppBar, Toolbar, Typography, Container, Button, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Sidebar from '../components/Sidebar';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';

export default function CrudDashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', amount: '', date: dayjs()
  });

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
    try {
      await axios.post('http://127.0.0.1:8000/api/expenses/', payload, {
        headers: { Authorization: `Token ${token}` }
      });
      handleClose();
      fetchData(token);
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  const handleEdit = (expense) => console.log('Edit:', expense); // Implement
  const handleDelete = async (id) => {
    // Implement delete API call + refresh
    console.log('Delete:', id);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#121212' }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: '#121212' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#111', borderBottom: '1px solid #333' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>EXPENSE PRO</Typography>
        </Toolbar>
      </AppBar>

      <Sidebar onLogout={handleLogout} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { xs: '100%', md: `calc(100% - ${240}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Financial Overview</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
              ADD EXPENSE
            </Button>
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
