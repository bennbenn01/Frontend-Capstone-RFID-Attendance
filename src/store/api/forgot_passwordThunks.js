import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

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