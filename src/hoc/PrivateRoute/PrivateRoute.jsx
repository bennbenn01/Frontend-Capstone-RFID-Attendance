import { useEffect, useRef } from "react"
import { Spinner } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { Navigate } from 'react-router-dom'
import { verifyAnyUser } from "../../store/api/authThunks.js"
import { clearRateLimited } from "../../store/slices/rateLimiterSlice.js"

export default function PrivateRoute({ children, allowedRoles = [] }) {
    const dispatch = useDispatch();
    const hasVerified = useRef(false);

    const { role, isAuthenticated, loginStatus } = useSelector((state) => state.auth);
    const { rateLimitStatus, rateLimitResetAt } = useSelector((state) => state.rate_limit);

    useEffect(() => {
        if (!isAuthenticated && !hasVerified.current && loginStatus === 'idle') {
            hasVerified.current = true;

            dispatch(verifyAnyUser());
        }
    }, [dispatch, isAuthenticated, loginStatus]);

    useEffect(() => {
        if (rateLimitStatus === 'rate_limited' && rateLimitResetAt) {
            const now = Date.now();
            const delay = rateLimitResetAt - now;

            if (delay > 0) {
                const timer = setTimeout(() => {
                    dispatch(clearRateLimited());
                }, delay + 500);

                return () => clearTimeout(timer);
            }
        }
    }, [dispatch, rateLimitStatus, rateLimitResetAt]);

    useEffect(() => {
        if (rateLimitStatus === 'idle' && !isAuthenticated && loginStatus !== 'loading') {
            dispatch(verifyAnyUser());
        }
    }, [dispatch, rateLimitStatus, isAuthenticated, loginStatus]);

    if ((loginStatus === 'loading' || loginStatus === 'idle') && !isAuthenticated) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spinner animation='border' role='status' />
            </div>
        );
    }

    if (rateLimitStatus === 'rate_limited') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', height: '100vh' }}>
                <p>⚠️ Too many request. Please wait a moment...</p>
            </div>
        );
    }

    if (loginStatus === 'failed' && !isAuthenticated) {
        return <Navigate to='/home' replace />
    }

    if (isAuthenticated && loginStatus === 'success') {
        if (allowedRoles.length > 0) {
            if (role === 'super-admin') {
                return children;
            } else if (!allowedRoles.includes(role)) {
                return(
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', height: '100vh' }}>
                        <h3>🚫 Access Denied</h3>
                        <p>You don't have permission to access this page.</p>
                    </div>                        
                )
            }
        }

        return children;
    }

    return <Navigate to='/home' replace />;
}