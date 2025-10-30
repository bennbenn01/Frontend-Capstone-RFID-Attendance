import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

export const fetchTransaction = createAsyncThunk(
    'transaction/fetchTransaction',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_TRANSACTION, {});

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);            
        }
    }
)