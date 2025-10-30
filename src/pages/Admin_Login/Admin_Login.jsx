import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Image, Form, Button, InputGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { loginField, clearError } from '../../store/slices/authSlice'
import { loginSuperUser } from '../../store/api/authThunks'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import Modals from '../../components/Modals/Modals'
import logo from '/Bluman Toda Logo.png'
import show_button from '../../assets/view.png'
import hide_button from '../../assets/hide.png'
import '../../styles/Login.css'

export default function Admin_Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);

    const { admin_name, password, isAuthenticated, error, role } = useSelector((state) => state.auth);
    const { show, title, message } = useSelector((state) => state.modal);

    const [isPassword,  setIsPassword] = useState(false);

    useEffect(() => {
        if(isAuthenticated){
            if (role === 'super-admin') {
                navigate('/admin-dashboard');
            }
        }
    }, [isAuthenticated, navigate, role]);

    useEffect(() => {
        if(error){
            dispatch(showModal({
                title: 'Login Failed',
                message: error
            }));
        }
    }, [error, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
            
            if (window.errorTimeoutId) {
                clearTimeout(window.errorTimeoutId);
                window.errorTimeoutId = null;
            }
        }
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch(loginField({ field: name, value }));
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
            await dispatch(loginSuperUser({ admin_name, password })).unwrap();
            sessionStorage.clear();
        } catch (err) {
            dispatch(showModal({
                title: 'Login Failed',
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
                    <h5 className='login-title'>Admin Login</h5>

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

                    <div>
                        <Link to='/forgot-password'>Forgot password?</Link>
                    </div>
                </div>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Login Failed' || 
                        title === 'Password Has Been Changed'
                    }
                />
            </div>
        </>
    );
}