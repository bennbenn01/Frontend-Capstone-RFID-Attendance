import { createAsyncThunk } from "@reduxjs/toolkit"
import api from '../../utils/axios'

export const attendanceTable = createAsyncThunk(
    'attendance/attendanceTable',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_ATTENDANCE_TABLE, {
                page
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

