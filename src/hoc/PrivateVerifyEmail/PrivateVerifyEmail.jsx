import { Navigate } from "react-router-dom"

function getSignupSession() {
    try {
        return JSON.parse(sessionStorage.getItem('signup')) || {};
    } catch {
        return {};
    }
}

export default function PrivateVeriftyEmail({ children }) {
    const storedStatus = getSignupSession();

    if(storedStatus.status !== 'pending'){
        return <Navigate to='/login' replace/>
    }

    return children;
}