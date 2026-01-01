import { BrowserRouter as Router,Routes, Route,Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LoginForm from "./pages/Login";
import CrudDashboard from "./pages/CrudDashboard";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const theme = createTheme({
  palette:{
    mode:'dark',
    primary:{
      main: '#1976d2',
    }
  }
});


function App() {
  return(


    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to = "/login" />} />
        <Route path="/login" element={<LoginForm/>} />
        <Route path="/dashboard" element={<CrudDashboard/>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
    </LocalizationProvider>
    </ThemeProvider>
  );

}
export default App;