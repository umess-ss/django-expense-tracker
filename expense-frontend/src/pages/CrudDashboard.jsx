import React, { useEffect, useState } from 'react';
import axios from "axios";
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Container, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  CircularProgress, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Dashboard as DashIcon, Logout, 
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const drawerWidth = 240;

export default function CrudDashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]); // Added Categories state
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    date: dayjs()
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      fetchData(token);
    }
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const [expRes, catRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/expenses/", { headers: { Authorization: `Token ${token}` } }),
        axios.get("http://127.0.0.1:8000/api/category/", { headers: { Authorization: `Token ${token}` } })
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ title: '', category: '', amount: '', date: dayjs() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      fetchData(token); // Refresh the list
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#121212' }}><CircularProgress /></Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: '#121212' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#111', borderBottom: '1px solid #333' }}>
          <Toolbar><Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>EXPENSE PRO</Typography></Toolbar>
        </AppBar>

        <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, bgcolor: '#0a0a0a', color: 'white', borderRight: '1px solid #333' } }}>
          <Toolbar />
          <List>
            <ListItemButton onClick={() => navigate('/dashboard')}><ListItemIcon><DashIcon sx={{ color: '#1976d2' }} /></ListItemIcon><ListItemText primary="Dashboard" /></ListItemButton>
            <ListItemButton onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }}><ListItemIcon><Logout sx={{ color: '#f44336' }} /></ListItemIcon><ListItemText primary="Logout" /></ListItemButton>
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}>
          <Toolbar />
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Financial Overview</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ borderRadius: 2 }}>ADD EXPENSE</Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e', borderRadius: 2, border: '1px solid #333' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#2a2a2a' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell sx={{ color: '#e0e0e0' }}>{e.title}</TableCell>
                      <TableCell sx={{ color: '#e0e0e0' }}>{e.category_name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>${parseFloat(e.amount).toFixed(2)}</TableCell>
                      <TableCell align="center">
                         <IconButton color="primary" size="small"><EditIcon /></IconButton>
                         <IconButton color="error" size="small"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>

        {/* --- ADD EXPENSE MODAL --- */}
        <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: '#1e1e1e', color: 'white', backgroundImage: 'none' } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Expense</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ borderColor: '#333' }}>
              <TextField fullWidth label="Title" variant="outlined" margin="dense" required sx={{ mb: 2 }}
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" required
                  onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField fullWidth label="Amount" type="number" variant="outlined" margin="dense" required sx={{ mb: 2 }}
                value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              
              <Box sx={{ mt: 1 }}>
                <DatePicker label="Date" value={formData.date} sx={{ width: '100%' }}
                  onChange={(val) => setFormData({...formData, date: val})} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#1e1e1e' }}>
              <Button onClick={handleClose} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained">Save Expense</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}