import { createSlice } from "@reduxjs/toolkit"
import {
    changePass,
    checkPass,
    confirmPass,

    driverChangePass,
    driverCheckPass,
    driverConfirmPass,
} from '../api/forgot_passwordThunks'

const initialState = {
    admin_name: '',
    driver_name: null,
    reqId: null,
    allow_change_pass: false,

    confirmPassData: {
        change_pass: '',
        confirm_pass: ''
    },

    forgot_passErrPassMsg: null,
    error: null,
}

const forgot_passwordSlice = createSlice({
    name: 'forgot_password',
    initialState,
    reducers: {
        forgotPassField: (state, action) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        setConfirmPassData: (state, action) => {
            const { field, value } = action.payload;
            state.confirmPassData[field] = value;
        },
        clearError: (state) => {
            state.error = null;
            state.forgot_passErrPassMsg = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Admin
            .addCase(changePass.fulfilled, (state, action) => {
                state.allow_change_pass = action.payload.allow_change_pass;
                state.reqId = action.payload.reqId;
            })
            .addCase(changePass.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(checkPass.fulfilled, (state, action) => {
                state.allow_change_pass = action.payload.allow_change_pass;
            })
            .addCase(checkPass.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(confirmPass.fulfilled, (state) => {
                state.admin_name = '';
                state.reqId = null;
                state.allow_change_pass = false;
                state.confirmPassData = {
                    change_pass: '',
                    confirm_pass: ''
                };

            })
            .addCase(confirmPass.rejected, (state, action) => {
                if (action.payload?.type === 'pass_validator') {
                    state.forgot_passErrPassMsg = action.payload.message;
                } else {
                    state.error = action.payload;   
                }
            })

            // Driver
            .addCase(driverChangePass.fulfilled, (state, action) => {
                state.allow_change_pass = action.payload.allow_change_pass;
                state.reqId = action.payload.reqId;
            })
            .addCase(driverChangePass.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(driverCheckPass.fulfilled, (state, action) => {
                state.allow_change_pass = action.payload.allow_change_pass;
            })
            .addCase(driverCheckPass.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(driverConfirmPass.fulfilled, (state) => {
                state.admin_name = '';
                state.reqId = null;
                state.allow_change_pass = false;
                state.confirmPassData = {
                    change_pass: '',
                    confirm_pass: ''
                };

            })
            .addCase(driverConfirmPass.rejected, (state, action) => {
                if (action.payload?.type === 'pass_validator') {
                    state.forgot_passErrPassMsg = action.payload.message;
                } else {
                    state.error = action.payload;   
                }
            })
    }
});

export const {
    forgotPassField,
    setConfirmPassData,
    clearError
} = forgot_passwordSlice.actions;

export default forgot_passwordSlice.reducer;