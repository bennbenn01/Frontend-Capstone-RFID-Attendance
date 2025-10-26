import { useState, useEffect } from 'react'
import { Image, Form, Button, InputGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signupField, setSignUpData, clearError } from '../../store/slices/sign_upSlice'
import { signUpUser, googleSignUp } from '../../store/api/sign_upThunks'
import Modals from '../../components/Modals/Modals'
import { useQuery } from '@tanstack/react-query'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import { sign_upQueriesFormCheck } from '../../store/queries/sign_upQueries'
import { useGoogleLogin } from '@react-oauth/google'
import google from '../../assets/google.png'
import logo from '/Bluman Toda Logo.png'
import show_button from '../../assets/view.png'
import hide_button from '../../assets/hide.png'
import '../../styles/Sign_up.css'

export default function Sign_up() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    
    const { signUpData, error } = useSelector((state) => state.sign_up);
    const { show, title, message } = useSelector((state) => state.modal);

    const [isPassword, setIsPassword] = useState(false);
    const [isConfirmPassword, setIsConfirmPassword] = useState(false);
    
    useEffect(() => {
        if(error){
            dispatch(showModal({
                title: 'Sign-up Failed',
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

    const { data: nameCheckData } = useQuery({
        queryKey: ['form-check', { 
            fname: signUpData?.fname?.trim(), 
            lname: signUpData?.lname?.trim()
        }],
        queryFn: sign_upQueriesFormCheck,
        enabled: !!(signUpData.fname?.trim() && signUpData.lname?.trim()),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        retry: false
    });

    const isNameDuplication = !!nameCheckData?.exist;

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch(signupField({ field: name, value }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (isNameDuplication) {
            setValidated(true);
            dispatch(showModal({
                title: 'Sign-up Failed',
                message: 'This name is already registered. Please use a different name.'
            }));
            return;
        }
    
        if(form.checkValidity() === false){
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(false);

        try {
            dispatch(setSignUpData({field: 'fname', value: signUpData.fname}));
            dispatch(setSignUpData({field: 'lname', value: signUpData.lname}));
            dispatch(setSignUpData({field: 'admin_name', value: signUpData.admin_name}));
            dispatch(setSignUpData({field: 'email', value: signUpData.email}));
            dispatch(setSignUpData({field: 'contact', value: signUpData.contact}));
            dispatch(setSignUpData({field: 'password', value: signUpData.password}));
            dispatch(setSignUpData({field: 'confirm_pass', value: signUpData.confirm_pass}));

            await dispatch(signUpUser(signUpData)).unwrap();
            navigate('/verify-email');
        } catch (err) {
            dispatch(showModal({
                title: 'Verification Failed',
                message: err
            }));
        }
    }

    const handleGoogleSignUp = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });

                const userInfo = await response.json();

                const googleUserData = {
                    googleId: userInfo.sub,
                    email: userInfo.email,
                    fname: userInfo.given_name,
                    lname: userInfo.family_name
                };

                await dispatch(googleSignUp(googleUserData)).unwrap();
                navigate('/verify-email');                
            } catch (err) {
                dispatch(showModal({
                    title: 'Google Sign-up Failed',
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
            <div className='sign-up-main-container'>
                <div className='sign-up-container'>
                    <div className='sign-up-logo-container'>
                        <Image
                            src={logo}
                            width={140}
                            height={120}
                            alt='Logo'/>
                    </div>

                    <h4 className='sign-up-title'>Sign-up to Bluman Toda!</h4>

                    <div className='sign-up-form-main-container'>
                        <div>
                            <span className='sign-up-form-title'>Create an account</span>

                            <Form 
                                className='sign-up-form-container'
                                noValidate
                                validated={validated}
                                onSubmit={handleSubmit}>

                                <Form.Group>
                                    <Form.Text>Firstname</Form.Text>

                                    <Form.Control
                                        type='text'
                                        placeholder='Enter first name'
                                        className='sign-up-form-control'
                                        name='fname'
                                        value={signUpData.fname || ''}
                                        onChange={handleChange}
                                        isInvalid={
                                            validated && (signUpData.fname.trim() === '') ||
                                            isNameDuplication
                                        }
                                        required/>

                                        {(validated && signUpData.lname.trim() === '') && (
                                            <Form.Control.Feedback type='invalid'>
                                                Please enter an valid first name.
                                            </Form.Control.Feedback>
                                        )}

                                        {(validated && isNameDuplication && signUpData.fname.trim() !== '') && (
                                            <Form.Control.Feedback type='invalid'></Form.Control.Feedback>
                                        )}
                                </Form.Group>

                                <Form.Group>
                                    <Form.Text>Lastname</Form.Text>

                                    <Form.Control
                                        type='text'
                                        placeholder='Enter last name'
                                        className='sign-up-form-control'
                                        name='lname'
                                        value={signUpData.lname || ''}
                                        onChange={handleChange}                                        
                                        isInvalid={
                                            (validated && signUpData.lname.trim() === '') ||
                                            isNameDuplication
                                        }
                                        required/>

                                    {(validated && signUpData.lname.trim() === '') && (
                                        <Form.Control.Feedback type='invalid'>
                                            Please enter an valid last name.
                                        </Form.Control.Feedback>
                                    )}                                 

                                    {isNameDuplication && (
                                        <Form.Text className='sign-up-name-duplication'>
                                            This name already exist. Please try again. 
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group>
                                    <Form.Text>Username</Form.Text>

                                    <Form.Control
                                        type='text'
                                        placeholder='Enter username'
                                        className='sign-up-form-control'
                                        name='admin_name'
                                        value={signUpData.admin_name || ''}
                                        onChange={handleChange}
                                        isInvalid={validated && signUpData.admin_name.trim() === ''}
                                        required/>

                                    <Form.Control.Feedback type='invalid'>
                                        Please enter an valid username.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Text>Email</Form.Text>

                                    <Form.Control
                                        type='email'
                                        placeholder='Enter email'
                                        className='sign-up-form-control'
                                        name='email'
                                        value={signUpData.email || ''}
                                        onChange={handleChange}
                                        isInvalid={validated && signUpData.email.trim() === ''}
                                        required/>

                                    <Form.Control.Feedback type='invalid'>
                                        Please enter an valid email.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Text>Contact</Form.Text>

                                    <Form.Control
                                        type='text'
                                        placeholder='Enter contact'
                                        className='sign-up-form-control'
                                        name='contact'
                                        value={signUpData.contact || ''}
                                        onChange={handleChange}
                                        isInvalid={validated && signUpData.contact.trim() === ''}
                                        required/>

                                    <Form.Control.Feedback type='invalid'>
                                        Please enter an valid contact.
                                    </Form.Control.Feedback>
                                </Form.Group>
                                
                                <Form.Group className='sign-up-password-container'>
                                    <Form.Text>Password</Form.Text>

                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type={isPassword ? 'text' : 'password'}
                                            placeholder='Enter password'
                                            className='sign-up-form-control-password'
                                            name='password'
                                            value={signUpData.password || ''}
                                            onChange={handleChange}
                                            isInvalid={
                                                validated && 
                                                (
                                                    signUpData.password.trim() === '' ||
                                                    !validatePassword(signUpData.password).isValid
                                                )
                                            }
                                            required/>

                                            <Button
                                                type='button'
                                                onClick={handleShowOrHidePassButton}
                                                className='sign-up-form-control-password-button'>
                                                <Image 
                                                    src={isPassword ? hide_button : show_button}
                                                    alt='show-or-hide button'
                                                    width={20}
                                                    height={20}/>
                                            </Button>

                                        {signUpData.password.trim() === '' && (
                                            <Form.Control.Feedback type='invalid'>
                                                Please enter an valid password.
                                            </Form.Control.Feedback>
                                        )}
                                    </InputGroup>

                                    {signUpData.password && (
                                        <div className='sign-up-password-live-validate'>
                                            <Form.Text className={validatePassword(signUpData.password).rules.minLength ? 'valid' : 'invalid'}>
                                                At least 8 characters minimum.
                                            </Form.Text>

                                            <Form.Text className={validatePassword(signUpData.password).rules.minUppercase ? 'valid' : 'invalid'}>
                                                At least 1 uppercase letter.
                                            </Form.Text>

                                            <Form.Text className={validatePassword(signUpData.password).rules.minSymbols ? 'valid' : 'invalid'}>
                                                At least 1 special symbol.                                                  
                                            </Form.Text>
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group className='sign-up-password-container'>
                                    <Form.Text>Confirm Password</Form.Text>

                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type={isConfirmPassword ? 'text' : 'password'}
                                            placeholder='Enter confirm password'
                                            className='sign-up-form-control-password'
                                            name='confirm_pass'
                                            value={signUpData.confirm_pass || ''}
                                            onChange={handleChange}
                                            isInvalid={
                                                validated && 
                                                (
                                                    signUpData.confirm_pass.trim() === '' ||
                                                    (signUpData.confirm_pass !== signUpData.password)
                                                )   
                                            }
                                            required/>

                                        <Button 
                                            type='button'
                                            onClick={handleShowOrHideConfirmPassButton}
                                            className='sign-up-form-control-password-button'>
                                            <Image
                                                src={isConfirmPassword ? hide_button : show_button}
                                                alt='show-or-hide button'
                                                width={20}
                                                height={20}/>
                                        </Button>

                                        {signUpData.confirm_pass.trim() === '' && (
                                            <Form.Control.Feedback type='invalid'>
                                                Please enter an valid confirm password.
                                            </Form.Control.Feedback>
                                        )}
                                    </InputGroup>
                                </Form.Group>                           

                                <Button 
                                    type='submit'
                                    className='sign-up-form-button'>Sign-up</Button>
                            </Form>
                        </div>

                        <div className='sign-up-form-or-text'>
                            <p>Or</p>
                        </div>

                        <div className='sign-up-form-button-container'>
                            <Button 
                                onClick={handleGoogleSignUp}
                                className='sign-up-form-google-button'>
                                    <Image
                                        src={google}
                                        alt='Google Logo'
                                        width={20}
                                        height={20}/>
                                    <span>Sign-up with Google</span>
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Link to='/login'
                        className='sign-up-link'>Return to Login</Link>
                    </div>
                </div>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Verification Failed' ||
                        title === 'Sign-up Failed' ||
                        title === 'Google Sign-up Failed'
                    }
                />
            </div>
        </>
    );
}