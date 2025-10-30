import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

// Admin
export const changePass = createAsyncThunk(
    'forgot_password/changePass',
    async ({ admin_name }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_CHANGE_PASS, {
                admin_name
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);
export const checkPass = createAsyncThunk(
    'forgot_password/checkPass',
    async ({ admin_name, reqId }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_CHECK_PASS, {
                admin_name, reqId
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);
export const confirmPass = createAsyncThunk(
    'forgot_password/confirmPass',
    async ({ admin_name, change_pass, confirm_pass }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_CONFIRM_PASS, {
                admin_name, change_pass, confirm_pass
            });

            return response.data;
        } catch (err) {
            if (err.response?.data?.pass_validator) {
                const err_pass_msg = err.response.data.pass_validator;
                return rejectWithValue({ type: 'pass_validator', message: err_pass_msg });
            }

            return rejectWithValue(err.response?.data?.message);
        }
    }
);

// Driver
export const driverChangePass = createAsyncThunk(
    'forgot_password/driverChangePass',
    async ({ driver_name }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DRIVER_CHANGE_PASS, {
                driver_name
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);
export const driverCheckPass = createAsyncThunk(
    'forgot_password/driverCheckPass',
    async ({ driver_name, reqId }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DRIVER_CHECK_PASS, {
                driver_name, reqId
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);
export const driverConfirmPass = createAsyncThunk(
    'forgot_password/driverConfirmPass',
    async ({ driver_name, change_pass, confirm_pass }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DRIVER_CONFIRM_PASS, {
                driver_name, change_pass, confirm_pass
            });

            return response.data;
        } catch (err) {
            if (err.response?.data?.pass_validator) {
                const err_pass_msg = err.response.data.pass_validator;
                return rejectWithValue({ type: 'pass_validator', message: err_pass_msg });
            }

            return rejectWithValue(err.response?.data?.message);
        }
    }
);