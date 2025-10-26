import { createSlice } from "@reduxjs/toolkit"
import { 
    data_analyticsData,
    dataAnalyticsDateSearchResults,
    dataAnalyticsAllDateSearchResults
} from '../api/data_analyticsThunks.js'

const initialState = {
    drivers: [],
    dataAnalyticsSearchQuery: {
        driver_id: '',
        full_name: '',
        from_date: '',
        to_date: ''
    },
    dateSearchResults: [],
    allDateSearchResults: [],
    data_analyticsStatus: 'idle',
    error: null,

    windowWidth: window.innerWidth,
}

const data_analyticsSlice = createSlice({
    name: 'data_analytics',
    initialState,
    reducers: {
        setWindowWidth: (state, action) => {
            state.windowWidth = action.payload;
        },
        setUpdateDataAnalyticsChange: (state, action) => {
            const { field, value } = action.payload;
            state.dataAnalyticsSearchQuery[field] = value;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(data_analyticsData.pending, (state) => {
                state.data_analyticsStatus = 'loading';
            })
            .addCase(data_analyticsData.fulfilled, (state, action) => {
                state.data_analyticsStatus = 'success';
                state.drivers = action.payload;
            })
            .addCase(data_analyticsData.rejected, (state, action) => {
                state.data_analyticsStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(dataAnalyticsDateSearchResults.pending, (state) => {
                state.data_analyticsStatus = 'loading';
            })
            .addCase(dataAnalyticsDateSearchResults.fulfilled, (state, action) => {
                state.data_analyticsStatus = 'success';
                state.dateSearchResults = action.payload;
            })
            .addCase(dataAnalyticsDateSearchResults.rejected, (state, action) => {
                state.data_analyticsStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(dataAnalyticsAllDateSearchResults.pending, (state) => {
                state.data_analyticsStatus = 'loading';
            })
            .addCase(dataAnalyticsAllDateSearchResults.fulfilled, (state, action) => {
                state.data_analyticsStatus = 'success';
                state.allDateSearchResults = action.payload;
            })
            .addCase(dataAnalyticsAllDateSearchResults.rejected, (state, action) => {
                state.data_analyticsStatus = 'failed';
                state.error = action.payload;
            })
    }
});

export const {
    setWindowWidth,
    setUpdateDataAnalyticsChange,
    clearError
} = data_analyticsSlice.actions;

export default data_analyticsSlice.reducer;