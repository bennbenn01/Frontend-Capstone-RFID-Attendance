import { Image, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import logo from '/Bluman Toda Logo.png'
import '../../styles/Home.css'

export default function Home() {
    const navigate = useNavigate();

    const handleAdminButtonClick = () => {
        navigate('/admin-login');
    }

    const handleOperatorButtonClick = () => {
        navigate('/login');
    }

    const handleDriverButtonClick = () => {
        navigate('/driver-login');
    }

    return(
        <>
            <div className='home-main-container'>
                <div className='home-container'>
                    <Image
                        src={logo}
                        className='home-image-logo'
                        width={140}
                        height={120}
                        alt='Login'/>

                    <Button 
                        onClick={handleAdminButtonClick}
                        className='home-button'>Admin Login</Button>

                    <Button 
                        onClick={handleOperatorButtonClick}
                        className='home-button'>Operator Login</Button>

                    <Button 
                        onClick={handleDriverButtonClick}
                        className='home-button'>Driver Login</Button>
                </div>
            </div>
        </>
    );
}