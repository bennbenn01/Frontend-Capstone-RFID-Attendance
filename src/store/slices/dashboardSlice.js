import { createSlice } from "@reduxjs/toolkit"
import { dashboardTable, dashboardDriverInfo, submitRequestLeave } from '../api/dashboardThunks.js'

const initialState = {
    drivers: [],
    driverInfo: {
        driver_img: null,
        driver_id: '',
        driver_name: '',
    },
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
            
            .addCase(dashboardDriverInfo.fulfilled, (state, action) => {
                state.dashboardStatus = 'success';
                state.driverInfo = action.payload;
            })
            .addCase(dashboardDriverInfo.rejected, (state, action) => {
                state.dashboardStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(submitRequestLeave.fulfilled, (state) => {
                state.dashboardStatus = 'success';
            })
            .addCase(submitRequestLeave.rejected, (state, action) => {
                state.dashboardStatus = 'failed';
                state.error = action.payload;
            });            
    }
});

export const {
    setWindowWidth,
    setCurrentPage,
    clearError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;