import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/axios"

export const data_analyticsData = createAsyncThunk(
    'data_analytics/dataAnalyticsData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DATA_ANALYTICS_DATA, {});

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)

export const dataAnalyticsDateSearchResults = createAsyncThunk(
    'data_analytics/dateSearchResults',
    async ({ driver_id, full_name, from_date, to_date }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DATA_ANALYTICS_DATE_SEARCH, {
                driver_id, full_name, from_date, to_date
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)

export const dataAnalyticsAllDateSearchResults = createAsyncThunk(
    'data_analytics/allDateSearchResults',
    async ({ from_date, to_date }, { rejectWithValue }) => {
        try {
            const response = await api.post(import.meta.env.VITE_APP_DATA_ANALYTICS_ALL_DATE_SEARCH, {
                from_date, to_date
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
)