import { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { verifyField, clearError, resetSignup } from '../../store/slices/sign_upSlice'
import { verifyEmail, verifyGoogleEmail } from '../../store/api/sign_upThunks'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import Modals from '../../components/Modals/Modals'
import '../../styles/Verify_Email.css'

function getSignupSession() {
    try {
        return JSON.parse(sessionStorage.getItem('signup')) || {};
    } catch {
        return {};
    }
}

export default function Verify_Email() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { tokenInput } = useSelector((state) => state.sign_up);
    const { show, title, message } = useSelector((state) => state.modal);

    const [validated, setValidated] = useState(false);

    const signup = getSignupSession();

    useEffect(() => {
        const checkExpiry = () => {
            const tokenExpiry = signup.expiresAt;
            const now = Date.now();

            if(signup.method === 'google' && signup.status === 'pending' && tokenExpiry){
                const expiry = parseInt(tokenExpiry, 10);

                if(now > expiry){
                    dispatch(resetSignup());

                    sessionStorage.removeItem('signup');
                    navigate('/sign-up');
                } 
            }

            if(signup.method === 'local' && signup.status === 'pending' && tokenExpiry){
                const expiry = parseInt(tokenExpiry, 10);

                if(now > expiry){
                    dispatch(resetSignup());

                    sessionStorage.removeItem('signup');
                    navigate('/sign-up');
                }
            }
        };

        checkExpiry();

        const interval = setInterval(checkExpiry, 2000);

        return () => clearInterval(interval);
    }, [dispatch, navigate, signup]);

    const handleTokenChange = (e) => {
        const { name, value } = e.target;
        dispatch(verifyField({ field: name, value }));
    }

    const handleTokenSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(false);

        try{
            if (signup.method === 'local') {
                await dispatch(verifyEmail({ token: tokenInput })).unwrap();

                sessionStorage.removeItem('signup');

                navigate('/home');
            }

            if (signup.method === 'google') {
                await dispatch(verifyGoogleEmail({ token: tokenInput })).unwrap();

                sessionStorage.removeItem('signup');

                navigate('/home');
            }

            dispatch(showModal({
                title: 'Verification Success',
                message: 'Account Verified Successfully!'
            }));

            dispatch(resetSignup());
        }catch(err){
            dispatch(showModal({
                title: 'Verification Failed',
                message: err
            }));
        }
    }

    const clearAllErrors = () => {
        dispatch(clearError());

        if(window.errorTimeoutId){
            clearTimeout(window.errorTimeoutId);
            window.errorTimeoutId = null;
        }
    }

    const handleHideModal = () => {
        dispatch(hideModal());
        dispatch(clearError());
    }

    const handleModalClose = () => {
        clearAllErrors();
        handleHideModal();
    }

    return(
        <>
            <div className='verify-email-main-container'>
                <div className='verify-email-form-container'>
                    <h4 className='verify-email-text'>Please enter the one-time token sent to your email</h4>

                    <Form
                        className='verify-email-form'
                        noValidate
                        validated={validated}
                        onSubmit={handleTokenSubmit}>
                        <Form.Group>
                            <Form.Control
                                type='number'
                                name='tokenInput'
                                placeholder='Enter One-Time Token'
                                value={tokenInput || ''}
                                onChange={handleTokenChange}
                                required
                                isInvalid={validated && tokenInput === null}/>

                            <Form.Control.Feedback type='invalid'>
                                Please enter a token.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button 
                            type='submit'
                            className='verify-email-form-button'>Verify Account</Button>
                    </Form>
                </div>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Verification Success' ||
                        title === 'Verification Failed'
                    }
                />
            </div>
        </>
    );
}