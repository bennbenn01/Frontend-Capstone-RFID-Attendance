import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios";

export const manage_usersTable = createAsyncThunk(
    'manage_users/manageUsersTable',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_MANAGE_USERS_TABLE, {
                page
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const manage_usersAddInfo = createAsyncThunk(
    'manage_users/manageUsersAddInfo',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_MANAGE_USERS_ADD_INFO, 
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)

export const manage_userUpdateDevice = createAsyncThunk(
    'manage_users/manageUsersUpdateDevice',
    async ({ id, dev_id, upd_dev_id, full_name, dev_status_mode }, { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_MANAGE_USERS_UPDATE_DEVICE, {
                id, dev_id, upd_dev_id, full_name, dev_status_mode
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const manage_userDeleteDevice = createAsyncThunk(
    'manage_users/manageUsersDeleteDevice',
    async ({ id, dev_id }, { rejectWithValue }) => {
        try {
            const response = await api.delete(import.meta.env.VITE_APP_MANAGE_USERS_DELETE_DEVICE, {
                data: { id, dev_id }
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const manage_userUpdateDriver = createAsyncThunk(
    'manage_users/manageUsersUpdateDriver',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.patch(import.meta.env.VITE_APP_MANAGE_USERS_UPDATE_DRIVER,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);