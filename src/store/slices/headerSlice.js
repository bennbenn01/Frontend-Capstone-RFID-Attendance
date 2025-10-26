import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    activeKey: '/dashboard',
    windowWidth: window.innerWidth
}

const headerSlice = createSlice({
    name: 'header',
    initialState,
    reducers: {
        setActiveKey: (state, action) => {
            state.activeKey = action.payload;
        },
        setWindowWidth: (state, action) => {
            state.windowWidth = action.payload;
        },
    },
});

export const {
    setActiveKey,
    setWindowWidth,
} = headerSlice.actions;

export default headerSlice.reducer;