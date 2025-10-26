import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { connectSocket, disconnectSocket } from "../../utils/socket"
import { useSelector, useDispatch } from "react-redux";
import { attendanceTable } from "../../store/api/attendanceThunks";
import { getPendingLogout } from "../../store/api/appThunks";
import { showModal } from "../../store/slices/modalsSlice";
import { clearConfirmationLogoutData } from "../../store/slices/appSlice";
import { store } from "../../store/store";

export default function SocketManager() {
    const location = useLocation();
    const dispatch = useDispatch();

    const { isAuthenticated } = useSelector((state) => state.auth);
    const { confirmLogoutData } = useSelector((state) => state.app);

    useEffect(() => {
        const pathsNeedingSocket = [
            '/dashboard',
            '/manage-users',
            '/logs',
            '/logs/payment-logs',
            '/logs/data-analytics',
            '/about-us'
        ];

        const shouldConnect = isAuthenticated && pathsNeedingSocket.includes(location.pathname);

        if (!shouldConnect) {
            disconnectSocket();
            return;
        }

        const socket = connectSocket();

        const handleTimeIn = () => {
            dispatch(attendanceTable());
        };

        const handleLogoutConfirmation = (data) => {
            if (
                data?.status === 200 &&
                data?.action === 'logout_request' &&
                !confirmLogoutData
            ) {
                dispatch(getPendingLogout(data.driver_id)).then(() => {
                    dispatch(showModal({ title: 'Confirmation Timeout' }));
                });
            }
        };

        const handleLogoutCompleted = () => {
            const currentModalTitle = store.getState().modal.title;
            if (currentModalTitle === 'Confirmation Timeout') {
                setTimeout(() => {
                    dispatch(attendanceTable());
                    dispatch(clearConfirmationLogoutData());
                }, 2000);
            }
        };

        socket.on('attendance:timein', handleTimeIn);
        socket.on('attendance:logout-confirmation', handleLogoutConfirmation);
        socket.on('attendance:logout-completed', handleLogoutCompleted);

        return () => {
            socket.off('attendance:timein', handleTimeIn);
            socket.off('attendance:logout-confirmation', handleLogoutConfirmation);
            socket.off('attendance:logout-completed', handleLogoutCompleted);
            disconnectSocket(); 
        };
    }, [location.pathname, isAuthenticated, dispatch, confirmLogoutData]);

    return null;
}