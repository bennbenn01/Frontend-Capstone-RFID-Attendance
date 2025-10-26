import { createSlice } from '@reduxjs/toolkit'
import {
    loginUser,
    googleLogin,

    verifyAnyUser,

    refreshAnyToken,

    logoutUser
} from '../api/authThunks'

const initialState = {
    admin_name: null,
    password: null,
    role: null,

    isAuthenticated: false,
    isLoading: false,
    loginStatus: 'idle',
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginField: (state, action) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        clearError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            state.role = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loginStatus = 'success';
                state.admin_name = null;
                state.password = null;
                state.isAuthenticated = true;
                state.role = action.payload?.role || null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loginStatus = 'failed';
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loginStatus = 'success';
                state.isAuthenticated = true;
                state.role = action.payload?.role || null;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loginStatus = 'failed';
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            .addCase(verifyAnyUser.pending, (state) => {
                state.loginStatus = 'loading';
                state.isLoading = true;
            })
            .addCase(verifyAnyUser.fulfilled, (state, action) => {
                state.loginStatus = 'success';
                state.isAuthenticated = true;
                state.isLoading = false;
                state.role = action.payload?.role || null;
            })
            .addCase(verifyAnyUser.rejected, (state, action) => {
                if (action.payload?.reason === 'unauthorized') {
                    state.loginStatus = 'failed';
                    state.isAuthenticated = false;
                    state.isLoading = false;
                    state.role = null;
                    return;
                }

                state.loginStatus = 'failed';
                state.isAuthenticated = false;
                state.isLoading = false;
                state.role = null;
            })

            .addCase(refreshAnyToken.fulfilled, (state, action) => {
                state.loginStatus = 'success';
                state.isLoading = false;
                state.isAuthenticated = true;
                state.role = action.payload?.role || null;
            })
            .addCase(refreshAnyToken.rejected, (state) => {
                state.loginStatus = 'failed';
                state.isLoading = false;
                state.isAuthenticated = false;
                state.role = null;
            })

            .addCase(logoutUser.fulfilled, (state) => {
                state.loginStatus = 'idle';
                state.role = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loginStatus = 'failed';
                state.isAuthenticated = true;
                state.error = action.payload;
            })
        
        // Pending
        builder
            .addMatcher(
                (action) => [
                    loginUser.pending.type,
                    googleLogin.pending.type
                ].includes(action.type),
                (state) => {
                    state.loginStatus = 'loading';
                }
            )
    }
});

export const {
    loginField,
    clearError,
    logout
} = authSlice.actions;

export default authSlice.reducer;