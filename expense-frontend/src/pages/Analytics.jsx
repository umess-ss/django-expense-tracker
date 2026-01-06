import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Box, Container, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Analytics = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({ by_category: [], by_month: [] });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const drawerWidth = 240;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const monthNames = [
    "","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/login");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        "http://localhost:8000/api/expenses/analytics",
        { headers: { Authorization: `Token ${token}` } }
      );

      const data = response.data;

      setChartData({
        by_category: data.by_category || [],
        by_month: data.by_month || [],
      });
    } catch (err) {
      console.error("Error fetching analytics", err);
    }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{display: "flex",
        width: "100vw",
        minHeight: "100vh",
        bgcolor: "#121212", 
      }}
    >
       <Navbar
        onAddExpense={null}            
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
      />

      <Sidebar open={sidebarOpen} onLogout={handleLogout} />


      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s ease",
          ml: sidebarOpen ? 0 : `${-drawerWidth}px`,
        }}
      >
        <Toolbar />

        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "white" }}
            >
              Financial Analytics
            </Typography>
          </Box>

        
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
              gap: 3,
            }}
          >
            {/* Pie Chart Card */}
            <Box
              sx={{
                backgroundColor: "#1e1e1e",
                borderRadius: 2,
                boxShadow: 3,
                p: 3,
                height: 500,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                sx={{ textAlign: "center", mb: 2, color: "white" }}
              >
                Expenses By Category
              </Typography>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                  <PieChart>
                    <Pie
                      data={chartData.by_category}
                      dataKey="total"
                      nameKey="category__name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.by_category.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Bar Chart Card */}
            <Box
              sx={{
                backgroundColor: "#1e1e1e",
                borderRadius: 2,
                boxShadow: 3,
                p: 3,
                height: 500,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                sx={{ textAlign: "center", mb: 2, color: "white" }}
              >
                Monthly Spending
              </Typography>

              <Box sx={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                  <BarChart
                    data={chartData.by_month}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <XAxis
                      dataKey="date__month"
                      tickFormatter={(val) => monthNames[val] || val}
                      tickMargin={10}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(val) => monthNames[val] || val}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#00C49F"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Analytics;
