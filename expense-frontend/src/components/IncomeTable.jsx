import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function IncomeTable({ incomes, onEdit, onDelete }) {
  const total = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);

  return (
    <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e', borderRadius: 2, border: '1px solid #333' }}>
      <Table>
        <TableHead sx={{ bgcolor: '#2a2a2a' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Source</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomes.map((inc) => (
            <TableRow key={inc.id} hover>
              <TableCell sx={{ color: '#e0e0e0' }}>{inc.title}</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>{inc.category_name}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                Rs. {parseFloat(inc.amount).toFixed(2)}
              </TableCell>
              <TableCell align="center">
                <IconButton color="primary" size="small" onClick={() => onEdit(inc)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" size="small" onClick={() => onDelete(inc.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
            <TableCell />
            <TableCell align='right' sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              Rs. {total.toFixed(2)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}