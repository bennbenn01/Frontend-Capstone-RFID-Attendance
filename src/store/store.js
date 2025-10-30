import { configureStore, combineReducers } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import rateLimitReducer from './slices/rateLimiterSlice'
import manualReducer from './slices/manualTimeInAndOutSlice'
import modalReducer from './slices/modalsSlice'
import signUpReducer from './slices/sign_upSlice'
import adminReducer from './slices/adminSlice'
import authReducer from './slices/authSlice'
import forgotPasswordReducer from './slices/forgot_passwordSlice'
import headerReducer from './slices/headerSlice'
import dashboardReducer from './slices/dashboardSlice'
import manageUsersReducer from './slices/manage_usersSlice'
import attendanceReducer from './slices/attendanceSlice'
import paymentReducer from './slices/paymentSlice'
import dataAnalyticsReducer from './slices/data_analyticsSlice'
import transactionReducer from './slices/transactionSlice'

const rootReducer = combineReducers({
    app: appReducer,
    rate_limit: rateLimitReducer,
    manual: manualReducer,
    sign_up: signUpReducer,
    admin: adminReducer,
    auth: authReducer,
    forgot_password: forgotPasswordReducer,
    modal: modalReducer,
    header: headerReducer,
    dashboard: dashboardReducer,
    manage_users: manageUsersReducer,
    attendance: attendanceReducer,
    payment: paymentReducer,
    data_analytics: dataAnalyticsReducer,
    transaction: transactionReducer
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoreActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                warnAfter: 100,
            }
        })
});