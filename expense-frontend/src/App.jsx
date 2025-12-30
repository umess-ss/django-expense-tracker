import { BrowserRouter as Router,Routes, Route,Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LoginForm from "./pages/Login";
import Dashboard from "./pages/Dashboard";


const theme = createTheme({
  palette:{
    mode:'dark',
    primary:{
      main: '#1976d2',
    }
  }
})



function App() {
  return(


    <ThemeProvider theme={theme}>
      <CssBaseline/>




    <Router>
      <Routes>
        <Route path="/" element={<Navigate to = "/login" />} />
        <Route path="/login" element={<LoginForm/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>
    </Router>
    </ThemeProvider>
  );

}
export default App;