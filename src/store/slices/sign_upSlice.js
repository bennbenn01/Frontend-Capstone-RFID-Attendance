import { createSlice } from "@reduxjs/toolkit"
import {
    signUpUser,
    signUpDriverUser,
    googleSignUp,
    googleDriverSignUp,

    verifyEmail,
    verifyGoogleEmail,
} from '../api/sign_upThunks'

const initialState = {
    signUpData: {
        fname: '',
        lname: '',
        admin_name: '',
        email: '',
        contact: '',
        password: '',
        confirm_pass: '',
    },

    driverSignUpData: {
        fname: '',
        lname: '',
        driver_name: '',
        email: '',
        contact: '',
        password: '',
        confirm_pass: '',
    },

    tokenInput: '',

    sign_upStatus: 'idle',
    sign_upErrPassMsg: null,
    error: null
}

const sign_upSlice = createSlice({
    name: 'sign_up',
    initialState,
    reducers: {
        signupField: (state, action) => {
            const { field, value } = action.payload;
            state.signUpData[field] = value;
        },
        setDriverSignupField: (state, action) => {
            const { field, value } = action.payload;
            state.driverSignUpData[field] = value;
        },
        setSignUpData: (state, action) => {
            const { field, value } = action.payload;
            state.signUpData[field] = value;
        },
        verifyField: (state, action) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        clearError: (state) => {
            state.sign_upErrPassMsg = null;
            state.error = null;
        },
        resetSignup: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signUpUser.fulfilled, (state) => {
                state.sign_upStatus = 'pending';

                sessionStorage.setItem(
                    'signup', 
                    JSON.stringify({
                        method: 'local',
                        status: 'pending',
                        expiresAt: Date.now() + 30 * 60 * 1000
                    })
                );
            })

            .addCase(signUpDriverUser.fulfilled, (state) => {
                state.sign_upStatus = 'pending';

                sessionStorage.setItem(
                    'signup', 
                    JSON.stringify({
                        method: 'local',
                        status: 'pending',
                        expiresAt: Date.now() + 30 * 60 * 1000
                    })
                );
            })

            .addCase(googleSignUp.fulfilled, (state) => {
                state.sign_upStatus = 'success';

                sessionStorage.setItem(
                    'signup',
                    JSON.stringify({
                        method: 'google',
                        status: 'pending',
                        expiresAt: Date.now() + 30 * 60 * 1000
                    })
                );
            })

            .addCase(googleDriverSignUp.fulfilled, (state) => {
                state.sign_upStatus = 'success';

                sessionStorage.setItem(
                    'signup',
                    JSON.stringify({
                        method: 'google',
                        status: 'pending',
                        expiresAt: Date.now() + 30 * 60 * 1000
                    })
                );
            })

            .addCase(verifyEmail.fulfilled, (state) => {
                state.sign_upStatus = 'success';
                state.signUpData = initialState.signUpData;
            })

            .addCase(signUpUser.rejected, (state, action) => {
                state.sign_upStatus = 'failed';
                if (action.payload?.type === 'pass_validator') {
                    state.sign_upErrPassMsg = action.payload.message;
                } else {
                    state.error = action.payload;                    
                }
            })
        
        // Pending
        builder
            .addMatcher(
                (action) => [
                    signUpUser.pending,
                    googleSignUp.pending
                ].includes(action.type),
                (state) => {
                    state.sign_upStatus = 'loading';
                }
            )

        // Success
        builder
            .addMatcher(
                (action) => [
                    verifyGoogleEmail.fulfilled
                ].includes(action.type),
                (state) => {
                    state.sign_upStatus = 'success';
                }
            )


        // Failed
        builder
            .addMatcher(
                (action) => [
                    googleSignUp.rejected,
                    verifyEmail.rejected,
                    verifyGoogleEmail.rejected,
                ].includes(action.type),
                (state, action) => {
                    state.sign_upStatus = 'failed';
                    state.error = action.payload;
                }
            )
    }
});

export const {
    signupField,
    setDriverSignupField,
    setSignUpData,
    verifyField,
    clearError,
    resetSignup
} = sign_upSlice.actions;

export default sign_upSlice.reducer;