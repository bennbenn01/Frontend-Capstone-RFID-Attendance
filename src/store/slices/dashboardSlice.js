import { createSlice } from "@reduxjs/toolkit"
import { dashboardTable } from '../api/dashboardThunks.js'

const initialState = {
    drivers: [],
    dashboardStatus: 'idle',
    error: null,

    totalAttendance: 0,
    totalDrivers: 0,
    totalButaw: 0,
    totalBoundary: 0,
    totalPaid: 0,

    windowWidth: window.innerWidth,

    currentPage: 1,
    totalPages: 0
}

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setWindowWidth: (state, action) => {
            state.windowWidth = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(dashboardTable.pending, (state) => {
                state.dashboardStatus = 'loading';
                state.error = null;
            })  
            .addCase(dashboardTable.fulfilled, (state, action) => {
                state.dashboardStatus = 'success';
                state.drivers = action.payload.drivers;
                state.totalAttendance = action.payload.totalAttendance;
                state.totalDrivers = action.payload.totalDrivers;

                state.totalButaw = action.payload.totalButaw || 0;
                state.totalBoundary = action.payload.totalBoundary || 0;
                state.totalPaid = action.payload.totalPaid || 0;

                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })   
            .addCase(dashboardTable.rejected, (state, action) => {
                state.dashboardStatus = 'failed';
                state.error = action.payload;
            })     
    }
});

export const {
    setWindowWidth,
    setCurrentPage,
    clearError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;