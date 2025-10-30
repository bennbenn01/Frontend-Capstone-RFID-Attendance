import { createSlice } from "@reduxjs/toolkit"
import {
    adminTable,
    updateAdminTable,
    deleteAdminTable
} from '../api/adminThunks'

const initialState = {
    admins: [],
    adminStatus: 'idle',
    error: null,

    windowWidth: window.innerWidth,

    currentPage: 1,
    totalPages: 0
}

const adminSlice = createSlice({
    name: 'admin',
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
            .addCase(adminTable.pending, (state) => {
                state.adminStatus = 'loading';
            })
            .addCase(adminTable.fulfilled, (state, action) => {
                state.adminStatus = 'success';

                state.admins = action.payload.admins;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(adminTable.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateAdminTable.pending, (state) => {
                state.adminStatus = 'loading';
            })
            .addCase(updateAdminTable.fulfilled, (state) => {
                state.adminStatus = 'success';
            })
            .addCase(updateAdminTable.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteAdminTable.pending, (state) => {
                state.adminStatus = 'loading';
            })
            .addCase(deleteAdminTable.fulfilled, (state) => {
                state.adminStatus = 'success';
            })
            .addCase(deleteAdminTable.rejected, (state, action) => {
                state.error = action.payload;
            })
    }
});

export const {
    setWindowWidth,
    setCurrentPage,
    clearError
} = adminSlice.actions;

export default adminSlice.reducer;