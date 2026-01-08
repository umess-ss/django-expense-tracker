import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Container, CircularProgress, LinearProgress,
  Paper, Toolbar, Stack, Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function BudgetProgress() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const drawerWidth = 240;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/login");
    fetchBudgetProgress(token);
  }, [navigate]);

  const fetchBudgetProgress = async (token) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/budgets/progress/", {
        headers: { Authorization: `Token ${token}` },
      });
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budget progress", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#0a0a0a" }}>
        <CircularProgress thickness={5} sx={{ color: '#4caf50' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh", bgcolor: "#0a0a0a" }}>
      <Navbar onLogout={handleLogout} onToggleSidebar={handleToggleSidebar} />
      <Sidebar open={sidebarOpen} onLogout={handleLogout} />

      <Box component="main" sx={{ 
        flexGrow: 1, p: 4, transition: "margin 0.3s ease",
        ml: sidebarOpen ? 0 : `${-drawerWidth}px`,
      }}>
        <Toolbar />
        <Container maxWidth="md">
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "white", letterSpacing: '-0.5px' }}>
              Budget Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: "#777", mt: 1 }}>
              Track your monthly spending limits across categories
            </Typography>
          </Box>

          <Stack spacing={3}>
            {budgets.map((item) => {
              const isOver = item.percent > 100;
              const isWarning = item.percent > 80 && !isOver;
              
              const getGradient = () => {
                if (isOver) return "linear-gradient(90deg, #ff1744 0%, #b2102f 100%)";
                if (isWarning) return "linear-gradient(90deg, #ff9100 0%, #ff6d00 100%)";
                return "linear-gradient(90deg, #00e676 0%, #00c853 100%)";
              };

              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#161616",
                    color: "white",
                    borderRadius: "20px",
                    border: "1px solid #2a2a2a",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      bgcolor: "#1c1c1c",
                      borderColor: isOver ? "#ff174455" : "#4caf5055",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
                    },
                  }}
                >
                  {/* Header: Icon + Category + Percent */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#252525', mr: 2, width: 48, height: 48 }}>
                      <AccountBalanceWalletIcon sx={{ color: isOver ? '#ff1744' : '#4caf50' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {item.category}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#777' }}>
                        Monthly Allocation
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: isOver ? "#ff1744" : isWarning ? "#ff9100" : "#00e676" }}>
                        {Math.round(item.percent)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(item.percent, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "#252525",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          background: getGradient(),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    p: 2, 
                    bgcolor: '#0f0f0f', 
                    borderRadius: '12px' 
                  }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#555", fontWeight: 700, display: "block" }}>
                        SPENT
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Rs. {item.actual_limit}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" sx={{ color: "#555", fontWeight: 700, display: "block" }}>
                        {isOver ? "OVER BUDGET" : "REMAINING"}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 800, 
                        color: isOver ? "#ff1744" : "#00e676"
                      }}>
                        Rs. {Math.abs(item.remaining)}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "#555", fontWeight: 700, display: "block" }}>
                        LIMIT
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Rs. {item.budget_limit}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}