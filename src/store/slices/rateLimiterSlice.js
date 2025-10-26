import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    rateLimitStatus: 'idle',
    rateLimitResetAt: null,
}

const rateLimiterSlice = createSlice({
    name: 'rate_limit',
    initialState,
    reducers: {
        setRateLimited: (state, action) => {
            state.rateLimitStatus = 'rate_limited';
            state.rateLimitResetAt = action.payload;
        },
        clearRateLimited: (state) => {
            state.rateLimitStatus = 'idle';
            state.rateLimitResetAt = null;
        },
    }
})

export const {
    setRateLimited,
    clearRateLimited,
} = rateLimiterSlice.actions;

export default rateLimiterSlice.reducer;