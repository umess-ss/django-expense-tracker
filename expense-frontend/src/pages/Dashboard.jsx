import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from  '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';




const Dashboard = () =>{
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [formData,setFormData] = useState({
            title: '',
            category:'',
            amount: '',
            date: dayjs()
        });
    const [error, setError] = useState("");
         
    const handleDateChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      date: newValue,
    }));
  };

    useEffect(()=>{
        const token = localStorage.getItem('access_token');
        if (!token){
            navigate('/login');
        }
        else{
            fetchExpenses(token);
            fetchCategories(token);
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


    const fetchCategories = async (token) =>{
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/category/',{
                headers:{Authorization:`Token ${token}`}
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Error in fetching categories",error);
        }
    }

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
    };






    const handleLogout = () =>{
        localStorage.removeItem('access_token');
        navigate('/login');
    };






    const handleChange = (e) =>{
        setFormData({...formData,[e.target.name]:e.target.value});  
    }


    const handleSubmit = async(e) =>{
        e.preventDefault();
        const token = localStorage.getItem('access_token')
        try {
            await axios.post('http://127.0.0.1:8000/api/expenses/', formData,
                {headers:{Authorization:`Token ${token}`}});
            alert('Item added successfully');
            setFormData({title:'',category:'',amount:'',date:formData.date
          ? formData.date.format("YYYY-MM-DD")  // ✅ convert dayjs -> string
          : null});
            fetchExpenses(token);
        } catch (error) {
            console.error("Error to add item",error);
        }
    };

    if (loading){
        return(
            <Box display="flex" justifycontent="center" alignItems="center" minHeight="100vh">
                <CircularProgress/>
            </Box>
        )
    }



    return(
   <>
      <AppBar
        position="static"
        className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            className="font-bold"
          >
            Expense Tracker
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            variant="outlined"
            className="ml-4 border-white hover:bg-white hover:text-blue-600 font-medium"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-10 bg-gray-50 min-h-screen">
        <Typography
          variant="h4"
          gutterBottom
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
        >
          Welcome to Expense Tracker
        </Typography>

        {error && (
          <Alert
            severity="error"
            className="mb-6 max-w-xl"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Table */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} className="p-6 rounded-2xl shadow-md">
              <Typography
                variant="h6"
                className="text-xl font-semibold mb-4 text-gray-800"
              >
                Your Spendings
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableCell className="font-semibold text-gray-700">
                        Item
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        Category
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        Amount
                      </TableCell>
                      <TableCell
                        className="font-semibold text-gray-700"
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.title}</TableCell>
                        <TableCell>{e.category_name}</TableCell>
                        <TableCell>
                          ₹{parseFloat(e.amount).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => alert("Edited")}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(e.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Form */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className="p-6 rounded-2xl shadow-md">
              <Typography
                variant="h6"
                className="text-xl font-semibold mb-4 text-gray-800"
              >
                Add New Expense
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  margin="normal"
                />

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ step: "0.01", min: "0" }}
                />

                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className="mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                >
                  Add Expense
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>    );
}

export default Dashboard;