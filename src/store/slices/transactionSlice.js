import { createSlice } from '@reduxjs/toolkit'
import { fetchTransaction } from '../api/transactionThunks'

const initialState = {
    transaction: null,
    loading: false,
    error: null
}

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        clearTransaction: (state) => {
            state.transaction = null;
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.transaction = action.payload;
            })
            .addCase(fetchTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearTransaction
} = transactionSlice.actions;

export default transactionSlice.reducer;