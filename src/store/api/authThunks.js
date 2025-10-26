import { createAsyncThunk } from "@reduxjs/toolkit"
import api from '../../utils/axios'

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ admin_name, password }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_LOGIN, {
                admin_name,
                password
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async ({ googleId, email }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_GOOGLE_LOGIN, {
                googleId, email
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const verifyAnyUser = createAsyncThunk(
    'auth/verifyUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_VERIFY_USER, {}, { withCredentials: true });

            return response.data;
        } catch (err) {
            if (err.response?.status === 401) {
                try {
                    await dispatch(refreshAnyToken()).unwrap();

                    const retry = await api.post(import.meta.env.VITE_APP_VERIFY_USER, {}, { withCredentials: true });

                    return retry.data;
                } catch {
                    return;
                }
            }

            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const refreshAnyToken = createAsyncThunk(
    'auth/refreshAnyToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_REFRESH_TOKEN, {});

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post(import.meta.env.VITE_APP_LOGOUT, {}); 
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);