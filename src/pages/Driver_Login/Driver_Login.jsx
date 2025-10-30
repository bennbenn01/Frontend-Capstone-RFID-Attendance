import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Image, Form, Button, InputGroup } from 'react-bootstrap'
import { useGoogleLogin } from '@react-oauth/google'
import { driverLoginUser, googleDriverLogin } from '../../store/api/authThunks'
import { driverLoginField, clearError } from '../../store/slices/authSlice'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import google from '../../assets/google.png'
import logo from '/Bluman Toda Logo.png'
import show_button from '../../assets/view.png'
import hide_button from '../../assets/hide.png'
import Modals from '../../components/Modals/Modals'
import '../../styles/Login.css'

export default function Driver_Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);

    const { admin_name, password, isAuthenticated, error } = useSelector((state) => state.auth);
    const { show, title, message } = useSelector((state) => state.modal);

    const [isPassword,  setIsPassword] = useState(false);

    useEffect(() => {
        if(isAuthenticated){
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if(error){
            dispatch(showModal({
                title: 'Login Failed',
                message: error
            }));
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch(driverLoginField({ field: name, value }));
    }

    const handleShowOrHideConfirmPassButton = () => {
        setIsPassword((prev) => !prev);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if(form.checkValidity() === false){
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(false);

        try {
            await dispatch(driverLoginUser({ admin_name, password })).unwrap();
            sessionStorage.clear();
        } catch (err) {
            dispatch(showModal({
                title: 'Login Failed',
                message: err
            }));
        }
    }

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });

                const userInfo = await response.json();

                const googleUserData = {
                    googleId: userInfo.sub,
                    email: userInfo.email,
                };

                await dispatch(googleDriverLogin(googleUserData)).unwrap();     
                sessionStorage.clear();         
            } catch (err) {
                dispatch(showModal({
                    title: 'Google Login Failed',
                    message: err
                }));
            }
        }
    });

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
            <div className='login-main-container'>
                <div className='login-container'>
                    <div className='login-logo-container'>
                        <Image
                            src={logo}
                            width={140}
                            height={120}
                            alt='Logo'/>
                    </div>

                    <h4 className='login-title'>Welcome to Bluman Toda!</h4>
                    <h5 className='login-title'>Driver Login</h5>

                    <Form 
                        className='login-form-container'
                        noValidate
                        validated={validated}
                        onSubmit={handleSubmit}>

                        <Form.Group>
                            <Form.Text>Username</Form.Text>

                            <Form.Control
                                type='text'
                                placeholder='Enter username'
                                className='login-form-control'
                                name='admin_name'
                                value={admin_name || ''}
                                onChange={handleChange}
                                isInvalid={validated && !admin_name}
                                required/>

                            <Form.Control.Feedback type='invalid'>
                                Please enter an valid username.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className='login-password-container'>
                            <Form.Text>Password</Form.Text>

                            <InputGroup hasValidation>
                                <Form.Control
                                    type={isPassword ? 'text' : 'password'}
                                    placeholder='Enter password'
                                    className='login-form-control'
                                    name='password'
                                    value={password || ''}
                                    onChange={handleChange}
                                    isInvalid={validated && !password}
                                    required/>

                                    <Button
                                        type='button'
                                        onClick={() => handleShowOrHideConfirmPassButton()}
                                        className='login-show-or-hide-password-button'>
                                        <Image
                                            src={isPassword ? hide_button : show_button}
                                            alt='show-or-hide button'
                                            width={20}
                                            height={20}/>
                                    </Button>

                                <Form.Control.Feedback type='invalid'>
                                    Please enter an valid password.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
              
                        <Button 
                            type='submit'
                            className='login-form-button'>Login</Button>
                    </Form>

                    <span className='login-or-text'>Or</span>

                    <div className='login-button-container'>
                        <Button 
                            onClick={handleGoogleLogin}
                            className='login-google-button'>
                                <Image
                                    src={google}
                                    alt='Google Logo'
                                    width={20}
                                    height={20}/>
                                <span>Continue with Google</span>
                        </Button>
                    </div>

                    <div>
                        <Link to='/driver-forgot-password'>Forgot password?</Link>
                    </div>

                    <div>
                        <Link to='/driver-sign-up'
                        className='login-link'>Sign-up</Link>
                    </div>
                </div>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Login Failed' || 
                        title === 'Google Login Failed' || 
                        title === 'Verification Success' || 
                        title === 'Password Has Been Changed'
                    }
                />
            </div>            
        </>
    );
}