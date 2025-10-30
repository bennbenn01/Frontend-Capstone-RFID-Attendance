import { useState, useEffect } from 'react'
import { Form, Button, Image, Spinner, InputGroup } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { driverChangePass, driverCheckPass, driverConfirmPass } from '../../store/api/forgot_passwordThunks'
import { forgotPassField, setConfirmPassData, clearError } from '../../store/slices/forgot_passwordSlice'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import Modals from '../../components/Modals/Modals'
import show_button from '../../assets/view.png'
import hide_button from '../../assets/hide.png'
import '../../styles/Forgot_Password.css'

function getForgotPassSession() {
    try {
        return JSON.parse(sessionStorage.getItem('forgotpass')) || {};
    } catch {
        return {};
    }
}

export default function Forgot_Password() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const forgot_pass = getForgotPassSession();
    const [storedStatus, setStoredStatus] = useState(
        forgot_pass ?? { status: null, expiresAt: null }
    );

    const { driver_name, reqId, confirmPassData, allow_change_pass, error } = useSelector((state) => state.forgot_password);
    const { show, title, message } = useSelector((state) => state.modal);

    const [isPassword, setIsPassword] = useState(false);
    const [isConfirmPassword, setIsConfirmPassword] = useState(false);
    const [changeValidated, setChangeValidated] = useState(false);
    const [confirmValidated, setConfirmValidated] = useState(false);
    const [check, setCheck] = useState(false);

    useEffect(() => {
        if (!check || !driver_name || !reqId || allow_change_pass) return;

        const interval = setInterval(() => {
            dispatch(driverCheckPass({ driver_name, reqId })).unwrap();
        }, 3000);

        return () => clearInterval(interval);
    }, [dispatch, check, driver_name, reqId, allow_change_pass]);

    useEffect(() => {
        if (allow_change_pass && storedStatus.status !== 'pending') {
            const sessionStatus = {
                status: 'pending',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            sessionStorage.setItem(
                'forgotpass',
                JSON.stringify(sessionStatus)
            );
            setStoredStatus(sessionStatus);
        }
    }, [allow_change_pass, storedStatus.status]);

    useEffect(() => {
        const checkExpiry = () => {
            const { expiresAt, status } = storedStatus;
            const now = Date.now();

            if (status === 'pending' && expiresAt && now > parseInt(expiresAt, 10)) {
                sessionStorage.removeItem('forgotpass');
                sessionStorage.removeItem('name');
                setStoredStatus({ status: null, expiresAt: null });
                return;
            } else if (status === 'check-pass' && expiresAt && now > parseInt(expiresAt, 10)) {
                sessionStorage.removeItem('changepass');
                sessionStorage.removeItem('name');
                setStoredStatus({ status: null, expiresAt: null });
                return; 
            }
        };

        checkExpiry();

        const interval = setInterval(checkExpiry, 2000);

        return () => clearInterval(interval);
    }, [storedStatus]);

    useEffect(() => {
        if (error) {
            dispatch(showModal({
                title: 'Change Password Failed',
                message: error
            }));

            window.errorTimeoutId = setTimeout(() => {
                dispatch(clearError());
                window.errorTimeoutId = null;
            }, 5000);

            return () => {
                if (window.errorTimeoutId) {
                    clearTimeout(window.errorTimeoutId);
                    window.errorTimeoutId = null;
                }
            };
        }
    }, [error, dispatch]);

    const handleChangePassChange = (e) => {
        const { name, value } = e.target;
        dispatch(forgotPassField({ field: name, value }));
    }

    const validatePassword = (password) => {
        const rules = {
            minLength: password.length >= 8,
            minUppercase: /[A-Z]/.test(password),
            minSymbols: /[!@#$%^&*]/.test(password),
        };

        return {
            rules,
            isValid: Object.values(rules).every(Boolean)
        }
    }

    const handleShowOrHidePassButton = () => {
        setIsPassword((prev) => !prev);
    }

    const handleShowOrHideConfirmPassButton = () => {
        setIsConfirmPassword((prev) => !prev);
    }

    const handleConfirmPassChange = (e) => {
        const { name, value } = e.target;
        dispatch(setConfirmPassData({ field: name, value }));
    }

    const handleChangePassSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setChangeValidated(true);
            return;
        }

        setChangeValidated(false);

        try {
            sessionStorage.setItem('name', driver_name);
            const sessionStatus = {
                status: 'change-pass',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            sessionStorage.setItem(
                'changepass',
                JSON.stringify(sessionStatus)
            );

            await dispatch(driverChangePass({ driver_name })).unwrap();

            setCheck(true);
        } catch (err) {
            dispatch(showModal({
                title: 'Change Password Failed',
                message: err
            }));
        }
    }

    const handleConfirmPassSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setConfirmValidated(true);
            return;
        }

        setConfirmValidated(false);

        try {
            const dataPayload = {
                driver_name: sessionStorage.getItem('name'),
                ...confirmPassData
            }

            await dispatch(driverConfirmPass(dataPayload)).unwrap();

            sessionStorage.clear();

            dispatch(showModal({
                title: 'Password Has Been Changed',
                message: 'Password changed completed.'
            }));
            navigate('/home');
        } catch (err) {
            dispatch(showModal({
                title: 'Change Password Failed',
                message: err
            }));
        }
    }

    const clearAllErrors = () => {
        dispatch(clearError());

        if (window.errorTimeoutId) {
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

    return (
        <>
            <div className='forgot-password-main-container'>
                {storedStatus.status === 'pending' ? (
                    <div className='forgot-password-form-container-2'>
                        <h3><b>Reset Password</b></h3>

                        <Form
                            className='forgot-password-form'
                            noValidate
                            validated={confirmValidated}
                            onSubmit={handleConfirmPassSubmit}>
                            <Form.Group className='forgot-password-container'>
                                <Form.Text>Create new password</Form.Text>

                                <InputGroup hasValidation>
                                    <Form.Control
                                        type={isPassword ? 'text' : 'password'}
                                        name='change_pass'
                                        className='forgot-password-form-control-password'
                                        placeholder='Create new password'
                                        value={confirmPassData.change_pass}
                                        onChange={handleConfirmPassChange}
                                        isInvalid={
                                            confirmValidated &&
                                            (
                                                confirmPassData.change_pass.trim() === '' ||
                                                !validatePassword(confirmPassData.change_pass).isValid
                                            )
                                        }
                                        required />

                                    <Button
                                        type='button'
                                        onClick={handleShowOrHidePassButton}
                                        className='forgot-password-form-control-password-button'>
                                        <Image
                                            src={isPassword ? hide_button : show_button}
                                            alt='show-or-hide button'
                                            width={20}
                                            height={20} />
                                    </Button>

                                    {confirmPassData.change_pass.trim() === '' && (
                                        <Form.Control.Feedback type='invalid'>
                                            Please enter an valid change password.
                                        </Form.Control.Feedback>
                                    )}

                                    {validatePassword(confirmPassData.change_pass).isValid && (
                                        <Form.Control.Feedback type='invalid'>
                                            Password must be at least 8 characters, include 1 uppercase letter, and 1 special symbol.
                                        </Form.Control.Feedback>
                                    )}
                                </InputGroup>

                                {confirmPassData.change_pass && (
                                    <div className='forgot-password-live-validate'>
                                        <Form.Text className={validatePassword(confirmPassData.change_pass).rules.minLength ? 'valid' : 'invalid'}>
                                            At least 8 characters minimum.
                                        </Form.Text>

                                        <Form.Text className={validatePassword(confirmPassData.change_pass).rules.minUppercase ? 'valid' : 'invalid'}>
                                            At least 1 uppercase letter.
                                        </Form.Text>

                                        <Form.Text className={validatePassword(confirmPassData.change_pass).rules.minSymbols ? 'valid' : 'invalid'}>
                                            At least 1 special symbol.
                                        </Form.Text>
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className='forgot-password-container'>
                                <Form.Text>Confirm your password</Form.Text>

                                <InputGroup hasValidation>
                                    <Form.Control
                                        type={isConfirmPassword ? 'text' : 'password'}
                                        name='confirm_pass'
                                        className='forgot-password-form-control-password'
                                        placeholder='Confirm your password'
                                        value={confirmPassData.confirm_pass}
                                        onChange={handleConfirmPassChange}
                                        isInvalid={
                                            confirmValidated &&
                                            (
                                                confirmPassData.confirm_pass.trim() === '' ||
                                                (confirmPassData.confirm_pass !== driverConfirmPass.change_pass)
                                            )
                                        }
                                        required />

                                    <Button
                                        type='button'
                                        onClick={handleShowOrHideConfirmPassButton}
                                        className='forgot-password-form-control-password-button'>
                                        <Image
                                            src={isConfirmPassword ? hide_button : show_button}
                                            alt='show-or-hide button'
                                            width={20}
                                            height={20} />
                                    </Button>

                                    {confirmPassData.confirm_pass.trim() === '' && (
                                        <Form.Control.Feedback type='invalid'>
                                            Please enter an valid confirm password.
                                        </Form.Control.Feedback>
                                    )}

                                    {confirmPassData.confirm_pass !== confirmPassData.change_pass && (
                                        <Form.Control.Feedback type='invalid'>
                                            Confirm password should be the same as password.
                                        </Form.Control.Feedback>
                                    )}
                                </InputGroup>
                            </Form.Group>

                            <Button
                                type='submit'
                                className='forgot-password-form-button'>Confirm new password</Button>
                        </Form>
                    </div>
                ) : check ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
                        <Spinner animation='border' role='status' style={{ color: 'white' }} />
                        <p style={{ color: 'white', marginTop: '15px', marginLeft: '10px', textAlign: 'center' }}>Waiting for Confirmation...</p>
                    </div>
                ) : (
                    <div className='forgot-password-form-container-1'>
                        <h3><b>Forgot Password</b></h3>
                        <p>Contact the operator for password reset</p>

                        <Form
                            className='forgot-password-form'
                            noValidate
                            validated={changeValidated}
                            onSubmit={handleChangePassSubmit}>

                            <Form.Group>
                                <Form.Text>Username</Form.Text>

                                <Form.Control
                                    type='text'
                                    name='driver_name'
                                    placeholder='Enter username'
                                    value={driver_name}
                                    onChange={handleChangePassChange}
                                    required
                                    isInvalid={changeValidated && driver_name.trim() === ''} />

                                <Form.Control.Feedback type='invalid'>
                                    Please enter an valid username.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button
                                type='submit'
                                className='forgot-password-form-button'>Submit</Button>
                        </Form>
                    </div>
                )}

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Change Password Failed' ||
                        title === 'Verification For Change Password' || 
                        title === 'Password Has Been Changed'
                    }
                />
            </div>
        </>
    );
}