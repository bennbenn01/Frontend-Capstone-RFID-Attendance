import { createAsyncThunk } from "@reduxjs/toolkit"
import api from '../../utils/axios'

export const dashboardTable = createAsyncThunk(
    'dashboard/dashboardTable',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DASHBOARD_TABLE, {
                page
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const dashboardDriverInfo = createAsyncThunk(
    'dahsboard/fetchDriverInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DASHBOARD_DRIVER_INFO, {});

            return response.data;            
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);            
        }
    }
)

export const submitRequestLeave = createAsyncThunk(
    'dashboard/submitRequestLeave',
    async (leaveData, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DASHBOARD_SUBMIT_REQUEST_LEAVE, 
                leaveData
            );

            return response.data;               
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)