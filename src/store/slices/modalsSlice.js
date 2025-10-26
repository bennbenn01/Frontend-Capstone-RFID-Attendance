import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    modalStatus: 'idle',
    show: false,
    hide: false,
    title: '',
    message: '',
    error: null,

    windowWidth: window.innerWidth,

    addInfoFormData: {
        driver_img: null,
        img_type: '',
        driver_id: '',
        firstName: '',
        lastName: '',
        contact: '',
        plate_no: '',
    },

    deviceFormData: {
        id: '',
        dev_id: '',
        upd_dev_id: '',
        full_name: '',
        card_id: '',
        dev_status_mode: '',
    },
    driverFormData: {
        id: '',
        dev_id: '',
        driver_img: null,
        img_type: '',
        driver_id: '',
        firstName: '',
        lastName: '',
        contact: '',
        plate_no: '',
    },
    paymentFormData: {
        id: '',
        driver_id: '',
        butaw: 0,
        boundary: 0
    },

    selectedFilters: [],
    selectedFields: [],

    dashboardFilters: {
        full_name: 'Driver Name',
        driver_id: 'Driver ID',
    },
    manageUsersFilters: {
        full_name: 'Driver Name',
        driver_id: 'Driver ID',
    },
    attendanceFilters: {
        full_name: 'Driver Name',
        driver_id: 'Driver ID',
    },
    paymentFilters: {
        full_name: 'Driver Name',
        driver_id: 'Driver ID',
    },
    dataAnalyticsFilters: {
        full_name: 'Driver Name',
        driver_id: 'Driver ID',
    },

    dashboardSelectedFields: [],
    manageUsersSelectedFields: [],
    attendanceSelectedFields: [],
    paymentSelectedFields: [],
    dataAnalyticsSelectedFields: [],

    dashboardSelectedFilters: {
        full_name: true,
        driver_id: false
    },
    manageUsersSelectedFilters: {
        full_name: true,
        driver_id: false
    },
    attendanceSelectedFilters: {
        full_name: true,
        driver_id: false
    },
    paymentSelectedFilters: {
        full_name: true,
        driver_id: false
    },
    dataAnalyticsSelectedFilters: {
        full_name: true,
        driver_id: false
    }
}

const modalsSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        showModal: (state, action) => {
            state.show = true;
            state.title = action.payload.title;
            state.message = action.payload.message;
        },
        hideModal: (state) => {
            state.show = false;
            state.title = '';
            state.message = '';
        },
        clearError: (state) => {
            state.error = '';
        },

        setWindowWidth: (state, action) => {
            state.windowWidth = action.payload;
        },
        
        setAddInfoFormChange: (state, action) => {
            const { field, value } = action.payload;
            state.addInfoFormData[field] = value;
        },
        setDriverFormChange: (state, action) => {
            const { field, value } = action.payload;
            state.driverFormData[field] = value;
        },

        setDeviceFormData: (state, action) => {
            const { field, value } = action.payload;
            state.deviceFormData[field] = value;
        },
        setDriverImage: (state, action) => {
            const { field, value } = action.payload;
            state.driverFormData[field] = value;
        },
        setDriverFormData: (state, action) => {
            const { field, value } = action.payload;
            state.driverFormData[field] = value;
        },
        setPaymentFormData: (state, action) => {
            const { field, value } = action.payload;
            state.paymentFormData[field] = value;
        },

        setSelectedFilters: (state, action) => {
            state.selectedFilters = action.payload;
        },
        setSelectedFields: (state, action) => {
            state.selectedFields = action.payload;
        },

        setDashboardSelectedFields: (state, action) => {
            state.dashboardSelectedFields = action.payload;
        },
        setManageUsersSelectedFields: (state, action) => {
            state.manageUsersSelectedFields = action.payload;
        },
        setAttendanceSelectedFields: (state, action) => {
            state.attendanceSelectedFields = action.payload;
        },
        setPaymentSelectedFields: (state, action) => {
            state.paymentSelectedFields = action.payload;
        },
        setDataAnalyticsSelectedFields: (state, action) => {
            state.dataAnalyticsSelectedFields = action.payload;
        },

        setDashboardSelectedFilters: (state, action) => {
            state.dashboardSelectedFilters = action.payload;
        },
        setManageUsersSelectedFilters: (state, action) => {
            state.manageUsersSelectedFilters = action.payload;
        },
        setAttendanceSelectedFilters: (state, action) => {
            state.attendanceSelectedFilters = action.payload;
        },
        setPaymentSelectedFilters: (state, action) => {
            state.paymentSelectedFilters = action.payload;
        },
        setDataAnalyticsSelectedFilters: (state, action) => {
            state.dataAnalyticsSelectedFilters = action.payload;
        }
    }
})

export const {
    showModal,
    hideModal,
    clearError,

    setWindowWidth,

    setAddInfoFormChange,
    setDriverFormChange,

    setDeviceFormData,
    setDriverImage,
    setDriverFormData,
    setPaymentFormData,

    setSelectedFilters,
    setSelectedFields,

    setDashboardSelectedFields,
    setManageUsersSelectedFields,
    setAttendanceSelectedFields,
    setPaymentSelectedFields,
    setDataAnalyticsSelectedFields,

    setDashboardSelectedFilters,
    setManageUsersSelectedFilters,
    setAttendanceSelectedFilters,
    setPaymentSelectedFilters,
    setDataAnalyticsSelectedFilters,

    
} = modalsSlice.actions;

export default modalsSlice.reducer;