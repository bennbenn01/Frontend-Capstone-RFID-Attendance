import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

export const fetchDriverInfo = createAsyncThunk(
    'manual/fetchDriverInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_FETCH_DRIVER_INFO, {});
            
            return response.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const submitManualTimeIn = createAsyncThunk(
    'manual/submitManualTimeIn', 
    async ({ driver_db_id, time_in, reason } , { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_SUBMIT_MANUAL_TIME_IN, {
                driver_db_id, time_in, reason
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)

export const submitManualTimeOut = createAsyncThunk(
    'manual/submitManualTimeOut', 
    async ({ driver_db_id, time_out, payment_type, reason }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_SUBMIT_MANUAL_TIME_OUT, {
                driver_db_id, time_out, payment_type, reason
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)