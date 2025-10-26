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