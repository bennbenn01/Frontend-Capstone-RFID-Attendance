import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import { clearConfirmationLogoutData } from '../../store/slices/appSlice'
import { Image } from 'react-bootstrap'
import { connectSocket } from '../../utils/socket'
import google from '../../assets/google.png'
import facebook from '../../assets/facebook.png'
import operator from '../../assets/operator.png'
import Modals from '../../components/Modals/Modals'
import '../../styles/About_Us.css'

export default function About_Us() {
    const dispatch = useDispatch();

    const { show, title, message } = useSelector((state) => state.modal);
    const [platformMsg, setPlatformMsg] = useState('');

    useEffect(() => {
        connectSocket();

        return () => {};
    }, []);

    const handleGoogleClick = () => {
        dispatch(showModal({ title: 'Contact Developer'}))

        setPlatformMsg(
            <>
                If problems occurred in the system. Please report and email me at{' '}
                <a href={`mailto:${import.meta.env.VITE_APP_GMAIL}`}>
                    {import.meta.env.VITE_APP_GMAIL}
                </a>
            </>
        );
    }

    const handleFacebookClick = () => {
        dispatch(showModal({ title: 'Contact Developer' }))

        setPlatformMsg('facebook');
    }

    const handleModalClose = () => {
        dispatch(hideModal());
        dispatch(clearConfirmationLogoutData());
    }

    return(
        <>
            <div className='about-us-main-container'>
                <div className='about-us-text'>
                    <h3>About Bluman Toda</h3>
                </div>

                <div className='about-us-details-container'>
                    <div className='about-us-text'>
                        <h3>Location of the Organization</h3>
                        <p>We are located here in 505 F.Manalo St. San Juan City</p>
                    </div>

                    <div className='about-us-image-container'>
                        <div className='about-us-sub-image-container'>
                            <Image
                                src={operator}
                                alt='operator-picture'
                                width={150}
                                height={150}/>

                            <h5 className='about-us-sub-image-text'>Leader of blumantoda</h5>
                            <h5 className='about-us-sub-image-text'>Floiran C. Ilada</h5>
                        </div>

                        <iframe
                            title='Bluman Toda'
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.271805501385!2d121.02514297587612!3d14.60458968587679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7d1e889c8e5%3A0x391f8a8f9b5c1a02!2s505%20F.%20Manalo%20St%2C%20San%20Juan%2C%201502%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1728594300000!5m2!1sen!2sph"
                            className='about-us-iframe'
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading='lazy'
                            referrerPolicy='no-refferer-when-downgrade'
                            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">                                
                        </iframe>
                    </div>
                </div>

                <footer>
                    <div className='footer-main-container'>
                        <div>
                            <h3 className='footer-contact-text'>Contact Developer</h3>
                            <span className='footer-contact-text'>If you encounter any issues, please reach out:</span>
                        </div>

                        <div className='footer-contact-details-container'>
                            <h5 className='footer-contact-text'>Contact Details</h5>

                            <div className='footer-contact-sub-details'>
                                <span className='footer-contact-text'>Contact:</span> 
                                <span>0939-293-3149</span>
                            </div>
                                
                            <div className='footer-contact-sub-details'>
                                <span className='footer-contact-text'>Address:</span> 
                                <span>STI College P. Sanchez St. Sta. Mesa, Manila, Philippines</span>
                            </div>
                        </div>


                        <div className='footer-social-media-container'>
                            <h5 className='footer-social-media-text'>Social Media</h5>

                            <div className='footer-social-media-logo'>
                                <Image
                                    src={google}
                                    alt='Google Logo'
                                    onClick={handleGoogleClick}
                                    className='footer-google-logo'
                                    width={35}
                                    height={35}/>

                                <Image 
                                    src={facebook} 
                                    alt='Facebook Logo' 
                                    onClick={handleFacebookClick}
                                    className='footer-facebook-logo'
                                    width={35} 
                                    height={35}/>
                            </div>
                        </div>
                    </div>
                </footer>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Confirmation Timeout Failed' ||
                        title === 'Contact Developer'
                    }

                    footer_msg={title === 'Contact Developer' && platformMsg}
                />
            </div>
        </>
    );
}