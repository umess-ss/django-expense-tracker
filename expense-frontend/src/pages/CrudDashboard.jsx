import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Box, Toolbar, Typography, Container, Button, CircularProgress,Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Sidebar from '../components/Sidebar';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import Navbar from '../components/Navbar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';  
import FileDownloadIcon from '@mui/icons-material/FileDownload';


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
  const [startDate,setStartDate] = useState(null);
  const [endDate,setEndDate] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      let expenseUrl = "http://127.0.0.1:8000/api/expenses/";

      const params = new URLSearchParams();
      if (startDate) params.append("start_date",dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate) params.append("end_date",dayjs(endDate).format('YYYY-MM-DD'));

      if (params.toString()){
        expenseUrl += `?${params.toString()}`;
      }



      const [expRes, catRes, statsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/expenses/", { headers: { Authorization: `Token ${token}` } }),
        axios.get("http://127.0.0.1:8000/api/category/", { headers: { Authorization: `Token ${token}` } }),
        axios.get(`http://127.0.0.1:8000/api/expenses/summary_stats/?${params.toString()}`, {
          headers: { Authorization: `Token ${token}` }})
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setStats(statsRes.data);
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



  const handleExportCSV = async () =>{
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();

    if (startDate) params.append('start_date', dayjs(startDate).format('YYYY-MM-DD'));
    if (endDate) params.append('end_date', dayjs(endDate).format('YYYY-MM-DD'));

    try{
      const response = await axios.get(`http://127.0.0.1:8000/api/expenses/export_csv/?${params.toString()}`,{headers: {Authorization:`Token ${token}`},responseType:'blob'});

      // creating download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }catch(error){
      console.log("Export Failed", error);
    }
  };


  // apply filters
  const handleApplyFilters = () =>{
    const token = localStorage.getItem("access_token");
    setLoading(true);
    fetchData(token);
  }


  const handleClearFilters =  () =>{
    setStartDate(null);
    setEndDate(null);
    const token =localStorage.getItem("access_token");
    setLoading(true);
    fetchData(token);
  }


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#121212' }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: '#121212' }}>
      <Navbar onAddExpense={handleOpen} onAddIncome={()=>navigate("/income")} onLogout={handleLogout} onToggleSidebar={handleToggleSidebar} />

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
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </Stack>
        
        {stats && (
          <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Total: <strong style={{ color: '#4caf50' }}>Rs. {stats.total.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Count: <strong>{stats.count}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Average: <strong>Rs. {stats.average.toFixed(2)}</strong>
            </Typography>
          </Box>
        )}
      </Paper>


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
