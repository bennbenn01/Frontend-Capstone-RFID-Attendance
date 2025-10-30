import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios'

export const signUpUser = createAsyncThunk(
    'sign_up/signUpUser',
    async ({ fname, lname, admin_name, email, contact, password, confirm_pass }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_SIGNUP, {
                fname,
                lname,
                admin_name,
                email,
                contact,
                password,
                confirm_pass
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

export const signUpDriverUser = createAsyncThunk(
    'sign_up/signUpDriverUser',
    async ({ fname, lname, driver_name, email, contact, password, confirm_pass }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DRIVER_SIGNUP, {
                fname,
                lname,
                driver_name,
                email,
                contact,
                password,
                confirm_pass
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

export const googleSignUp = createAsyncThunk(
    'sign_up/googleSignUp',
    async ({ googleId, email, fname, lname }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_GOOGLE_SIGNUP, {
                googleId, email, fname, lname
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const googleDriverSignUp = createAsyncThunk(
    'sign_up/googleDriverSignUp',
    async ({ googleId, email, fname, lname }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DRIVER_GOOGLE_SIGNUP, {
                googleId, email, fname, lname
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'sign_up/verifyEmail',
    async ({ token }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_VERIFY_EMAIL, { token });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)

export const verifyGoogleEmail = createAsyncThunk(
    'sign_up/verifyGoogleEmail',
    async ({ token }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_VERIFY_GOOGLE_EMAIL, { token });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);