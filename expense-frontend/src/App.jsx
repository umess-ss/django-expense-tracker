import { BrowserRouter as Router,Routes, Route,Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {ToastContainer} from "react-toastify";
import CssBaseline from "@mui/material/CssBaseline";
import LoginForm from "./pages/Login";
import CrudDashboard from "./pages/CrudDashboard";
import Analytics from "./pages/Analytics";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BudgetProgress from "./pages/BudgetProgress";
import IncomeDashboard from "./pages/IncomeDashboard";

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
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to = "/login" />} />
        <Route path="/login" element={<LoginForm/>} />
        <Route path="/dashboard" element={<CrudDashboard/>} />
        <Route path="/income" element={<IncomeDashboard/>} />
        <Route path="/charts" element={<Analytics />} />
        <Route path="/budgets" element={<BudgetProgress />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
    </LocalizationProvider>
    </ThemeProvider>
    </>
  );

}
export default App;