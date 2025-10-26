import { createSlice } from '@reduxjs/toolkit'
import {
    manage_usersTable,
    manage_usersAddInfo,
    manage_userUpdateDevice,
    manage_userDeleteDevice,
    manage_userUpdateDriver,
} from '../api/manage_usersThunks.js'

const initialState = {
    drivers: [],  
    manage_usersStatus: 'idle',
    error: null,

    windowWidth: window.innerWidth,

    currentPage: 1,
    totalPages: 0
}

const manage_usersSlice = createSlice({
    name: 'manage_users',
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
            .addCase(manage_usersTable.pending, (state) => {
                state.manage_usersStatus = 'loading';
                state.error = null;
            })
            .addCase(manage_usersTable.fulfilled, (state, action) => {
                state.manage_usersStatus = 'success';
                state.drivers = action.payload.drivers;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(manage_usersTable.rejected, (state, action) => {
                state.manage_usersStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(manage_usersAddInfo.fulfilled, (state, action) => {
                state.manage_usersStatus = 'success';
                state.drivers = action.payload;
            })
            .addCase(manage_usersAddInfo.rejected, (state, action) => {
                state.manage_usersStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(manage_userUpdateDevice.pending, (state) => {
                state.manage_usersStatus = 'loading';
            })
            .addCase(manage_userUpdateDevice.fulfilled, (state, action) => {
                state.manage_usersStatus = 'success';
                state.drivers = action.payload;
            })
            .addCase(manage_userUpdateDevice.rejected, (state, action) => {
                state.manage_usersStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(manage_userDeleteDevice.pending, (state) => {
                state.manage_usersStatus = 'loading';
            })
            .addCase(manage_userDeleteDevice.fulfilled, (state, action) => {
                state.manage_usersStatus = 'success';
                state.drivers = action.payload;
            })
            .addCase(manage_userDeleteDevice.rejected, (state, action) => {
                state.manage_usersStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(manage_userUpdateDriver.pending, (state) => {
                state.manage_usersStatus = 'loading';
            })
            .addCase(manage_userUpdateDriver.fulfilled, (state) => {
                state.manage_usersStatus = 'success';
            })
            .addCase(manage_userUpdateDriver.rejected, (state, action) => {
                state.manage_usersStatus = 'failed';
                state.error = action.payload;
            })
    }
});

export const {
    setWindowWidth,
    setCurrentPage,
    setSelectedDriId,
    clearError
} = manage_usersSlice.actions;

export default manage_usersSlice.reducer;