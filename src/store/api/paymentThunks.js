import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

export const paymentButaw = createAsyncThunk(
    'payment/paymentButaw',
    async ({ id, card_id, driver_id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_PAYMENT_BUTAW, {
                id, card_id, driver_id
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.messsage);
        }
    }
)

export const paymentBoundary = createAsyncThunk(
    'payment/paymentBoundary',
    async ({ id, driver_id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_PAYMENT_BOUNDARY, {
                id, driver_id
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.messsage);
        }
    }
)

export const paymentBothPayment = createAsyncThunk(
    '',
    async ({ id, driver_id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_BOTH_PAYMENTS, {
                id, driver_id
            });

            return response.data;            
        } catch (err) {
            return rejectWithValue(err.response?.data?.messsage);            
        }
    }
)