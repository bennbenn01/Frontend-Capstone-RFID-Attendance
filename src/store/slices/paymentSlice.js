import { createSlice } from "@reduxjs/toolkit"
import {
    paymentButaw,
    paymentBoundary
} from '../api/paymentThunks'

const initialState = {
    drivers: [],
    paymentStatus: 'idle',
    error: null,

    windowWidth: window.innerWidth,
}

const paymentSlice =  createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setWindowWidth: (state, action) => {
            state.windowWidth = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(paymentButaw.pending, (state) => {
                state.paymentStatus = 'loading';
            })
            .addCase(paymentButaw.fulfilled, (state, action) => {
                state.paymentStatus = 'success';
                const updatedDriver = action.payload;
                const index = state.drivers.findIndex(d => d.id === updatedDriver.id);
                if(index !== -1){
                    state.drivers[index] = updatedDriver;
                }
            })
            .addCase(paymentButaw.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(paymentBoundary.pending, (state) => {
                state.paymentStatus = 'loading';
            })
            .addCase(paymentBoundary.fulfilled, (state, action) => {
                state.paymentStatus = 'success';
                const updatedDriver = action.payload;
                const index = state.drivers.findIndex(d => d.id === updatedDriver.id);
                if(index !== -1){
                    state.drivers[index] = updatedDriver;
                }
            })
            .addCase(paymentBoundary.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.error = action.payload;
            })
    }
});

export const {
    setWindowWidth,
} = paymentSlice.actions;

export default paymentSlice.reducer;