import { createSlice } from "@reduxjs/toolkit"
import {
    getPendingLogout,
    checkPaidLogout
} from '../api/appThunks'

const initialState = {
    driver: null, 
    confirmLogoutData: null,
    appStatus: 'idle',
    error: null,
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        clearConfirmationLogoutData: (state) => {
            state.confirmLogoutData = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPendingLogout.pending, (state) => {
                state.appStatus = 'loading';
            })
            .addCase(getPendingLogout.fulfilled, (state, action) => {
                state.appStatus = 'success';
                if(action.payload?.logoutConfirmation){
                    state.confirmLogoutData = action.payload.driver;
                }else{
                    state.driver = action.payload?.driver || action.payload;
                    state.confirmLogoutData = null;
                };
            })
            .addCase(getPendingLogout.rejected, (state, action) => {
                state.appStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(checkPaidLogout.pending, (state) => {
                state.appStatus = 'loading';
            })
            .addCase(checkPaidLogout.fulfilled, (state) => {
                state.appStatus = 'success';
                state.confirmLogoutData = null;
            })
            .addCase(checkPaidLogout.rejected, (state, action) => {
                state.appStatus = 'failed';
                state.error = action.payload;
            }) 
    }
});

export const {
    clearConfirmationLogoutData
} = appSlice.actions;

export default appSlice.reducer;