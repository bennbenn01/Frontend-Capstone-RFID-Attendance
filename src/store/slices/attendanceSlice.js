import { createSlice } from "@reduxjs/toolkit"
import { 
    attendanceTable 
} from '../api/attendanceThunks'

const initialState = {
    drivers: [],
    attendanceStatus: 'idle',
    error: null,

    windowWidth: window.innerWidth,



    currentPage: 1,
    totalPages: 0
}

const attendanceSlice = createSlice({
    name: 'attendance',
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
            .addCase(attendanceTable.pending, (state) => {
                state.attendanceStatus = 'loading';
            })
            .addCase(attendanceTable.fulfilled, (state, action) => {
                state.attendanceStatus = 'success';
                state.drivers = action.payload.drivers;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(attendanceTable.rejected, (state, action) => {
                state.attendanceStatus = 'failed';
                state.error = action.payload;
            })
    }
});

export const {
    setWindowWidth,
    setCurrentPage,
    clearError
} = attendanceSlice.actions;

export default attendanceSlice.reducer;