import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Image, Dropdown, Nav, Offcanvas } from 'react-bootstrap'
import { setActiveKey, setWindowWidth } from '../../store/slices/headerSlice'
import { disconnectSocket } from '../../utils/socket'
import { logout } from '../../store/slices/authSlice'
import { logoutUser } from '../../store/api/authThunks'
import hamburger from '../../assets/hamburger.png'
import logo from '/Bluman Toda Logo.png'
import '../../styles/Header.css'

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { activeKey, windowWidth } = useSelector((state) => state.header);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            dispatch(setWindowWidth(window.innerWidth));
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch]);

    useEffect(() => {
        if(activeKey !== location.pathname){
            dispatch(setActiveKey(location.pathname));
        }
    }, [dispatch, location.pathname, activeKey]);

    const handleSelection = (eventKey) => {
        navigate(eventKey);
        setIsOffCanvasOpen(false);
    }

    const handleAboutUs = () => {
        navigate('/about-us');
        setIsOffCanvasOpen(false);
    }

    const handleNavigateHome = () => {
        navigate('/dashboard');
    }

    const handleOffCanvas = () => {
        setIsOffCanvasOpen(prev => !prev);
    }

    const handleLogout = async () => {
        disconnectSocket();

        await dispatch(logoutUser()).unwrap();

        await dispatch(logout()).unwrap();

        navigate('/login');
    }

    return(
        <>
            <header>
                <div className='header-main-container'>
                    <div>
                        <Image
                            src={windowWidth > 480 ? logo : hamburger}
                            alt={windowWidth > 480 ? 'Logo' : null}
                            className='header-image-click'
                            onClick={windowWidth <= 480 ? handleOffCanvas : handleNavigateHome}
                            width={windowWidth > 480 ? 70 : 40}
                            height={windowWidth > 480 ? 50 : 40}/>
                    </div>

                    {windowWidth > 480 && (
                        <div className='header-tab-container'>
                            <Nav 
                                variant='pills'
                                activeKey={isDropdownOpen ? null : activeKey}
                                onSelect={(eventKey) => {
                                    dispatch(setActiveKey(eventKey));
                                    handleSelection(eventKey);
                                }}>
                                <Nav.Item>
                                    <Nav.Link eventKey='/dashboard' className='header-nav-link'>Dashboard</Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link eventKey='/manage-users' className='header-nav-link'>Manage Users</Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link eventKey='/logs' className='header-nav-link'>Logs</Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Dropdown
                                show={isDropdownOpen}
                                onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
                                onSelect={(eventKey) => {
                                        handleSelection(eventKey)
                                    }
                                }>
                                <Dropdown.Toggle className='header-dropdown-toggle'>Menu</Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey='/about-us' onClick={handleAboutUs}>About Us</Dropdown.Item>
                                    <Dropdown.Item eventKey='/logout' onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    )}
                    
                    <Offcanvas show={isOffCanvasOpen} onHide={() => setIsOffCanvasOpen(false)}>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Navigation Bar</Offcanvas.Title>
                        </Offcanvas.Header>

                        <Offcanvas.Body>
                            <Nav 
                                variant='pills'
                                className='header-offcanvas-body-container'
                                activeKey={isDropdownOpen ? null : activeKey}
                                onSelect={(eventKey) => {
                                    dispatch(setActiveKey(eventKey));
                                    handleSelection(eventKey);
                                }}>
                                <Nav.Link eventKey='/dashboard'>Dashboard</Nav.Link>
                                <Nav.Link eventKey='/manage-users'>Manage Users</Nav.Link>
                                <Nav.Link eventKey='/logs'>Logs</Nav.Link>
                                <Dropdown
                                    show={isDropdownOpen}
                                    onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
                                    className='header-offcanvas-dropdown-container'
                                    onSelect={(eventKey) => {
                                            handleSelection(eventKey)
                                        }
                                    }>
                                    <Dropdown.Toggle className='header-offcanvas-dropdown-toggle'>Menu</Dropdown.Toggle>

                                    <Dropdown.Menu className='header-offcanvas-dropdown-menu'>
                                        <Dropdown.Item eventKey='/about-us' onClick={handleAboutUs}>About Us</Dropdown.Item>
                                        <Dropdown.Item eventKey='/logout' onClick={handleLogout}>Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav>
                        </Offcanvas.Body>
                    </Offcanvas>
                </div>
            </header>
        </>
    );
}