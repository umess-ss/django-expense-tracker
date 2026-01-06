import React from 'react';
import { 
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar 
} from '@mui/material';
import { Dashboard as DashIcon, Logout } from '@mui/icons-material';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export default function Sidebar({open, onLogout }) {
  const navigate = useNavigate();

  return (
    <Drawer 
      variant="persistent" 
      open={open}
      sx={{ 
        width: drawerWidth, 
        flexShrink: 0, 
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          bgcolor: '#0a0a0a', 
          color: 'white', 
          borderRight: '1px solid #333' 
        } 
      }}
    >
      <Toolbar />
      <List>
        <ListItemButton onClick={() => navigate('/dashboard')}>
          <ListItemIcon><DashIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/charts')}>
          <ListItemIcon><PieChartIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
          <ListItemText primary="Analytics" />
        </ListItemButton>
        <ListItemButton onClick={onLogout}>
          <ListItemIcon><Logout sx={{ color: '#f44336' }} /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
