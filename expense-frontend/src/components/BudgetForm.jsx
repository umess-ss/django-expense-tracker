import React from "react";

import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Button
} from '@mui/material';

export default function BudgetForm({open,onClose,onSubmit,formData,categories,onChange}){
    return(
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                {formData.id ? "Edit Budget" : "Set Monthly Budget"}
            </DialogTitle>

            <DialogContent>
                {/* category dropdown */}
                <TextField
                select
                fullWidth
                label="category"
                value={formData.category}
                onChange={(e)=>onChange("category",e.target.value)}
                margin="dense"
                variant="filled"
                >
                    {categories.map((cat)=>(
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}

                </TextField>

                    {/* Amount */}
                <TextField
                    fullWidth
                    label="Monthly Limit(Rs.)"
                    type="number"
                    value={formData.amount}
                    onChange={(e)=>onChange("amount",e.target.value)}
                    margin="dense"
                    variant="filled"
                >
                    
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>Save Budget</Button>
            </DialogActions>
        </Dialog>
    );
}