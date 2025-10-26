import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

export const getPendingLogout = createAsyncThunk(
    'app/getPendingLogout',
    async (driver_id, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_GET_PENDING_LOGOUT, {
                driver_id
            });

            return response.data;
        } catch (err) {
            if (err.response?.status === 400 && err.response.data?.driver) {
                return err.response.data.driver;
            }

            return rejectWithValue(err.response?.data?.message);
        }
    }
)

export const checkPaidLogout = createAsyncThunk(
    'app/checkPaidLogout',
    async ({ id, driver_id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_CHECK_PAID_LOGOUT, {
                id, driver_id
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)