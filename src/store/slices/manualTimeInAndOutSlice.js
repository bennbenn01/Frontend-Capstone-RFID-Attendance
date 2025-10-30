import { createSlice } from '@reduxjs/toolkit'
import { 
    fetchDriverInfo, 
    submitManualTimeIn, 
    submitManualTimeOut 
} from '../api/manualTimeInAndOutThunks'

const initialState = {
    status: 'idle',
    error: null,
    
    driverInfo: {
        id: '',
        full_name: ''
    },

    manualTimeInData: {
        driver_db_id: '',
        time_in: '',
        reason: ''
    },

    manualTimeOutData: {
        driver_db_id: '',
        time_out: '',
        payment_type: '',
        reason: ''
    },

    submitStatus: 'idle',
    submitError: null
}

const manualAttendanceSlice = createSlice({
    name: 'manual',
    initialState,
    reducers: {
        setManualField: (state, action) => {
            const { field, value } = action.payload;
            state.driverInfo[field] = value;
        },
        setManualTimeInChange: (state, action) => {
            const { field, value } = action.payload;
            state.manualTimeInData[field] = value;
        },
        setManualTimeOutChange: (state, action) => {
            const { field, value } = action.payload;
            state.manualTimeOutData[field] = value;
        },
        clearManualAttendanceError: (state) => {
            state.error = null;
            state.submitError = null;
        },
        resetManualTimeInData: (state) => {
            state.manualTimeInData = {
                driver_db_id: '',
                time_in: '',
                reason: ''
            };
        },
        resetManualTimeOutData: (state) => {
            state.manualTimeOutData = {
                driver_db_id: '',
                time_out: '',
                reason: ''
            };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDriverInfo.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDriverInfo.fulfilled, (state, action) => {
                state.status = 'success';
                state.driverInfo = action.payload;
                state.manualTimeInData.driver_db_id = action.payload.id;
                state.manualTimeOutData.driver_db_id = action.payload.id;
            })
            .addCase(fetchDriverInfo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(submitManualTimeIn.pending, (state) => {
                state.submitStatus = 'loading';
                state.submitError = null;
            })
            .addCase(submitManualTimeIn.fulfilled, (state) => {
                state.submitStatus = 'success';
                state.manualTimeInData = {
                    driver_db_id: state.driverInfo.id,
                    time_in: '',
                    reason: ''
                };
            })
            .addCase(submitManualTimeIn.rejected, (state, action) => {
                state.submitStatus = 'failed';
                state.submitError = action.payload;
            })

            .addCase(submitManualTimeOut.pending, (state) => {
                state.submitStatus = 'loading';
                state.submitError = null;
            })
            .addCase(submitManualTimeOut.fulfilled, (state) => {
                state.submitStatus = 'success';
                state.manualTimeOutData = {
                    driver_db_id: state.driverInfo.id,
                    time_out: '',
                    reason: ''
                };
            })
            .addCase(submitManualTimeOut.rejected, (state, action) => {
                state.submitStatus = 'failed';
                state.submitError = action.payload;
            });
    }
})

export const {
    setManualField,
    setManualTimeInChange,
    setManualTimeOutChange,
    clearManualAttendanceError,
    resetManualTimeInData,
    resetManualTimeOutData
} = manualAttendanceSlice.actions;

export default manualAttendanceSlice.reducer;