import React, { useEffect, useState } from 'react';
import axios from "axios";
import { 
  Box, Typography, Container, CircularProgress, 
  Paper, Stack, Toolbar, Button, Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import Sidebar from '../components/Sidebar';
import IncomeTable from '../components/IncomeTable';
import IncomeForm from '../components/IncomeForm';
import Navbar from '../components/Navbar';

export default function IncomeDashboard() {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', amount: '', date: dayjs()
  });
  const [editId, setEditId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const drawerWidth = 240;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      let incomeUrl = "http://127.0.0.1:8000/api/income/";
      
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate) params.append("end_date", dayjs(endDate).format('YYYY-MM-DD'));
      
      if (params.toString()) {
        incomeUrl += `?${params.toString()}`;
      }

      const [incRes, catRes] = await Promise.all([
        axios.get(incomeUrl, { 
          headers: { Authorization: `Token ${token}` } 
        }),
        axios.get("http://127.0.0.1:8000/api/category/?type=income", { 
          headers: { Authorization: `Token ${token}` } 
        })
      ]);
      
      setIncomes(incRes.data);
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
      if (editId == null) {
        await axios.post('http://127.0.0.1:8000/api/income/', payload, config);
      } else {
        await axios.put(`http://127.0.0.1:8000/api/income/${editId}/`, payload, config);
      }
      handleClose();
      fetchData(token);
    } catch (error) {
      console.error("Error adding income", error);
      console.error("Django Error Details:", error.response?.data);
    }
  };

  const handleEdit = (income) => {
    setEditId(income.id);
    setFormData({
      title: income.title,
      category: income.category,
      amount: income.amount,
      date: dayjs(income.date),
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('access_token');

    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/income/${id}/`, {
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setIncomes(prev => prev.filter(inc => inc.id !== id));
      } catch (error) {
        console.log("Failed to delete", error);
      }
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleApplyFilters = () => {
    const token = localStorage.getItem("access_token");
    setLoading(true);
    fetchData(token);
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    const token = localStorage.getItem("access_token");
    setLoading(true);
    fetchData(token);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#121212' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: '#121212' }}>
      <Navbar 
        onAddExpense={() => navigate('/dashboard')} 
        onAddIncome={handleOpen}
        onLogout={handleLogout} 
        onToggleSidebar={handleToggleSidebar} 
      />
      <Sidebar open={sidebarOpen} onLogout={handleLogout}/>
      
      <Box component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          transition: 'margin 0.3s ease',
          ml: sidebarOpen ? 0 : `${-drawerWidth}px`, 
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
              Income Overview
            </Typography>
          </Box>

          {/* Filter Section */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#1e1e1e' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
              />
              <Button variant="contained" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear
              </Button>
            </Stack>
          </Paper>

          <IncomeTable incomes={incomes} onEdit={handleEdit} onDelete={handleDelete} />
          <IncomeForm
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
