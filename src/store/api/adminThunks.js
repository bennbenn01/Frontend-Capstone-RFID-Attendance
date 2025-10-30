import { createAsyncThunk } from "@reduxjs/toolkit"
import api from '../../utils/axios'

export const adminTable = createAsyncThunk(
    'admin/adminTable',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_ADMIN_TABLE, {});

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const updateAdminTable = createAsyncThunk(
    'admin/updateAdminTable',
    async ({ id, fname, lname, email, admin_name, contact } , { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_UPDATE_ADMIN_TABLE, {
                id, fname, lname, email, admin_name, contact
            });     

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const deleteAdminTable = createAsyncThunk(
    'admin/deleteAdminTable',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.delete(import.meta.env.VITE_APP_DELETE_ADMIN_TABLE, {
                data: { id }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);
