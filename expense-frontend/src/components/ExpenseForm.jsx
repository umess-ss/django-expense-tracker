import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Button, Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export default function ExpenseForm({ open, onClose, onSubmit, formData, categories, onChange }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: '#1e1e1e', color: 'white' } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Expense</DialogTitle>
        <DialogContent sx={{ borderColor: '#333' }}>
          <TextField
            fullWidth label="Title" margin="dense" required sx={{ mb: 2 }}
            value={formData.title} onChange={(e) => onChange('title', e.target.value)}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={formData.category} label="Category" required
              onChange={(e) => onChange('category', e.target.value)}>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth label="Amount" type="number" margin="dense" required sx={{ mb: 2 }}
            value={formData.amount} onChange={(e) => onChange('amount', e.target.value)}
          />
          <Box sx={{ mt: 1 }}>
            <DatePicker label="Date" value={formData.date}
              onChange={(val) => onChange('date', val)} sx={{ width: '100%' }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#1e1e1e' }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained">Save Expense</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
