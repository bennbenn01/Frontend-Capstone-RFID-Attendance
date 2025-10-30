import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal, Form, Image, Button, Table, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {
    showModal,
    hideModal,

    setWindowWidth,

    setUpdateAccChange,
    setAddInfoFormChange,
    setDriverFormChange,

    setDeviceFormData,
    setDriverImage,

    setSelectedFilters,
    setSelectedFields,

    setDashboardSelectedFields,
    setDashboardSelectedFilters,
    setManageUsersSelectedFields,
    setManageUsersSelectedFilters,
    setAttendanceSelectedFields,
    setAttendanceSelectedFilters,
    setPaymentSelectedFields,
    setPaymentSelectedFilters,
    setDataAnalyticsSelectedFields,
    setDataAnalyticsSelectedFilters,
} from '../../store/slices/modalsSlice'
import { submitRequestLeave } from '../../store/api/dashboardThunks' 
import { generateRfidUuid } from '../../utils/generateRfidUuid'
import { useNavigate } from 'react-router-dom'
import profile_pic from '../../assets/profile_pic.png'
import restart from '../../assets/restart.png'
import '../../styles/Modals.css'

export default function Modals({
    show,
    hide,
    title,
    message,
    OK,

    handleYesClick,
    handleModalYesClick,
    handleNoClick,

    update_acc,
    update_acc_buttons,
    handleUpdateAccSubmit,

    add_info,
    add_info_buttons,
    handleAddInfoSubmit,

    manage_devices_data,
    manage_devices_buttons,

    manage_drivers_data,
    manage_drivers_buttons,
    setDriverImageFile,

    return_time_out_msg,
    handleConfirmLogoutSubmit,

    payment_buttons,

    invoice_buttons,

    request_leave_data,
    request_buttons,

    filter_data,
    filter_buttons,

    footer_msg,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { deviceFormData, driverFormData } = useSelector((state) => state.modal);
    const { addInfoFormData, paymentFormData, updateAccData } = useSelector((state) => state.modal);
    const { confirmLogoutData } = useSelector((state) => state.app);
    const { sign_upErrPassMsg } = useSelector((state) => state.sign_up);
    const { forgot_passErrPassMsg } = useSelector((state) => state.forgot_password);
    const {
        dashboardFilters, dashboardSelectedFilters,
        manageUsersFilters, manageUsersSelectedFilters,
        attendanceFilters, attendanceSelectedFilters,
        paymentFilters, paymentSelectedFilters,
        dataAnalyticsFilters, dataAnalyticsSelectedFilters
    } = useSelector((state) => state.modal);
    const { windowWidth, selectedFilters } = useSelector((state) => state.modal);

    const [imageFile, setImageFile] = useState(null);
    const [_, setPreviewUrl] = useState(null);

    const [leaveType, setLeaveType] = useState([]);
    const [dateRange, setDateRange] = useState('');
    const [remarks, setRemarks] = useState('');

    const [addInfoValidated, setAddInfoValidated] = useState(false);
    const [updateDriverValidated, setUpdateDriverValidated] = useState(false);
    const [updateAccValidated, setUpdateAccValidated] = useState(false);

    const getCurrentFilters = useCallback(() => {
        if (filter_data === dashboardFilters) return dashboardSelectedFilters;
        if (filter_data === manageUsersFilters) return manageUsersSelectedFilters;
        if (filter_data === attendanceFilters) return attendanceSelectedFilters;
        if (filter_data === paymentFilters) return paymentSelectedFilters;
        if (filter_data === dataAnalyticsFilters) return dataAnalyticsSelectedFilters;
        return selectedFilters;
    }, [
        filter_data,
        selectedFilters,
        dashboardFilters,
        dashboardSelectedFilters,
        manageUsersFilters,
        manageUsersSelectedFilters,
        attendanceFilters,
        attendanceSelectedFilters,
        paymentFilters,
        paymentSelectedFilters,
        dataAnalyticsFilters,
        dataAnalyticsSelectedFilters
    ]);

    function getDefaultCheckedFilters(filter_data) {
        if (!filter_data || Object.keys(filter_data).length === 0) {
            return {};
        }

        const keys = Object.keys(filter_data);

        return keys.reduce((acc, key, idx) => {
            acc[key] = idx === 0;
            return acc;
        }, {});
    }

    const [localFilters, setLocalFilters] = useState(getCurrentFilters());

    useEffect(() => {
        const handleResize = () => {
            dispatch(setWindowWidth(window.innerWidth));
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch]);

    useEffect(() => {
        if (!show) {
            setImageFile(null);
            setPreviewUrl(null);
        }
    }, [show]);

    useEffect(() => {
        if (show && filter_data && Object.keys(filter_data).length > 0) {
            const currentFilters = getCurrentFilters();
            if (!currentFilters || Object.keys(currentFilters).length === 0) {
                setLocalFilters(getDefaultCheckedFilters(filter_data));
            } else {
                setLocalFilters(currentFilters);
            }
        }

        if (!show) {
            setLocalFilters({});
        }
    }, [show, getCurrentFilters, filter_data]);

    const isCenteredMsg = (msg) => {
        return (
            msg?.includes('Password must be at least 8 characters long and include at least one uppercase letter and one symbol')
        )
    }

    const handleUpdateAccChange = (e) => {
        const { name, value } = e.target;
        dispatch(setUpdateAccChange({ field: name, value }));
    }

    const handleAddImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            dispatch(setDriverImage({ type: file.type }));
            if (typeof setDriverImageFile === 'function') {
                setDriverImageFile(file);
            }
        }
    }

    const handleUpdateImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            dispatch(setDriverImage({ type: file.type }));
            if (typeof setDriverImageFile === 'function') {
                setDriverImageFile(file);
            }
        }
    }

    const handleAddInfoChange = (e) => {
        const { name, value } = e.target;
        dispatch(setAddInfoFormChange({ field: name, value }));
    }

    const handleDriverChange = (e) => {
        const { name, value } = e.target;
        dispatch(setDriverFormChange({ field: name, value }));
    }

    const handleUpdateAccInpSubmit = (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setUpdateAccValidated(true);
            return;
        }

        setUpdateAccValidated(false);

        if (handleUpdateAccSubmit) {
            handleUpdateAccSubmit();
        }        
    }

    const handleAddInfoInpSubmit = (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setAddInfoValidated(true);
            return;
        }

        setAddInfoValidated(false);

        if (handleAddInfoSubmit && addInfoFormData) {
            handleAddInfoSubmit(imageFile);
        }
    }

    const handleUpdateDevice = () => {
        dispatch(showModal({
            title: 'Updating Device',
            message: 'Are you sure updating the device?'
        }));
    }

    const handleRestartDevice = () => {
        const upd_dev_id = generateRfidUuid();
        dispatch(setDeviceFormData({ field: 'dev_id', value: deviceFormData.dev_id }));
        dispatch(setDeviceFormData({ field: 'upd_dev_id', value: upd_dev_id }));
    }

    const handleSelectDeviceMode = (eventKey) => {
        dispatch(setDeviceFormData({ field: 'dev_status_mode', value: eventKey }));
    }

    const handleDeleteDevice = () => {
        dispatch(showModal({
            title: 'Deleting Device',
            message: 'Are you sure deleting the device?'
        }));
    }

    const handleUpdateDriver = (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setUpdateDriverValidated(true);
            return;
        }

        setUpdateDriverValidated(false);

        dispatch(showModal({
            title: 'Updating Driver',
            message: 'Are you sure updating the user?'
        }));
    }

    const handleModalYesClickWithImage = () => {
        const fileToSend = imageFile || (driverFormData && driverFormData.driver_img ? driverFormData.driver_img : null);
        if (handleModalYesClick) {
            handleModalYesClick(fileToSend);
        }
    }

    const handlePaymentButaw = () => {
        dispatch(showModal({
            title: 'Confirmation of Payment of Butaw',
            message: 'Are you sure that the butaw is paid?'
        }));
    }

    const handlePaymentBoundary = () => {
        dispatch(showModal({
            title: 'Confirmation of Payment of Boundary',
            message: 'Are you sure that the boundary is paid?'
        }));
    }

    const handleBothPayment = () => {
        dispatch(showModal({
            title: 'Confirmation of Both Payments',
            message: 'Are you sure that both payments are paid?'
        }));
    }

    const handleOpenInvoice = () => {
        navigate('/driver-invoice');
    }

    const handleNewTabInvoice = () => {
        window.open('/driver-invoice', '_blank');
    }

    const handleRequestCheckboxChange = (type) => {
        setLeaveType(prev =>
            prev.includes(type)
                ? prev.filter(item => item !== type)
                : [...prev, type]
        );        
    }

    const handleRequestLeave = async () => {
        
        const data = {
            leaveType,
            dateRange,
            remarks,
        };
        
        await dispatch(submitRequestLeave(data)).unwrap();

        setLeaveType([]);
        setDateRange('');
        setRemarks('');

        dispatch(showModal({
            title: 'Request Leave Success',
            message: 'Request has been submitted.'
        }));
    }

    const handleCheckboxChange = (key, isChecked) => {
        setLocalFilters(prev => ({ ...prev, [key]: isChecked }))
    }

    const handleFiltersClick = () => {
        const selectedFields = Object.entries(localFilters)
            .filter(([checked]) => checked)
            .map(([key]) => key);

        if (filter_data === dashboardFilters) {
            dispatch(setDashboardSelectedFields(selectedFields));
            dispatch(setDashboardSelectedFilters(localFilters));
        } else if (filter_data === manageUsersFilters) {
            dispatch(setManageUsersSelectedFields(selectedFields));
            dispatch(setManageUsersSelectedFilters(localFilters));
        } else if (filter_data === attendanceFilters) {
            dispatch(setAttendanceSelectedFields(selectedFields));
            dispatch(setAttendanceSelectedFilters(localFilters));
        } else if (filter_data === paymentFilters) {
            dispatch(setPaymentSelectedFields(selectedFields));
            dispatch(setPaymentSelectedFilters(localFilters));
        } else if (filter_data === dataAnalyticsFilters) {
            dispatch(setDataAnalyticsSelectedFields(selectedFields));
            dispatch(setDataAnalyticsSelectedFilters(localFilters));
        } else {
            dispatch(setSelectedFields(selectedFields));
            dispatch(setSelectedFilters(localFilters));
        }
        dispatch(hideModal());
    }

    return (
        <>
            <Modal show={show} onHide={hide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body className='modal-body-container'>
                    <div>
                        {sign_upErrPassMsg ? (
                            <div className={`modal-message-container ${isCenteredMsg(sign_upErrPassMsg) ? 'centered-msg' : ''}`}>
                                {sign_upErrPassMsg}
                            </div>
                        ) : forgot_passErrPassMsg ? (
                            <div className={`modal-message-container ${isCenteredMsg(forgot_passErrPassMsg) ? 'centered-msg' : ''}`}>
                                {forgot_passErrPassMsg}
                            </div>
                        ) : (
                            <div>{message}</div>
                        )}
                    </div>

                    {update_acc && (
                        <>
                            <div className=''>
                                <Form
                                    id='updateAccForm'
                                    className=''
                                    noValidate
                                    validated={updateAccValidated}
                                    onSubmit={handleUpdateAccInpSubmit}>

                                    <Form.Group>
                                        <Form.Text>Firstname</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='fname'
                                            value={updateAccData.fname || '-'}
                                            placeholder='Enter first name'
                                            onChange={handleUpdateAccChange}
                                            isInvalid={updateAccValidated && !updateAccData.fname}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            first name is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
 
                                    <Form.Group>
                                        <Form.Text>Lastname</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='lname'
                                            value={updateAccData.lname || '-'}
                                            placeholder='Enter last name'
                                            onChange={handleUpdateAccChange}
                                            isInvalid={updateAccValidated && !updateAccData.lname}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            last name is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Text>Email</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='email'
                                            value={updateAccData.email || '-'}
                                            placeholder='Enter email'
                                            onChange={handleUpdateAccChange}
                                            isInvalid={updateAccValidated && !updateAccData.lname}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            email is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Text>Admin Name</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='admin_name'
                                            value={updateAccData.admin_name || '-'}
                                            placeholder='Enter admin name'
                                            onChange={handleUpdateAccChange}
                                            isInvalid={updateAccValidated && !updateAccData.lname}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            admin name is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Text>Contact</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='contact'
                                            value={updateAccData.contact || '-'}
                                            placeholder='Enter contact'
                                            onChange={handleUpdateAccChange}
                                            isInvalid={updateAccValidated && !updateAccData.contact}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            contact number is required
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form>
                            </div>
                        </>
                    )}

                    {add_info && (
                        <>
                            <div>
                                <Form
                                    id='addInfoForm'
                                    className='modal-form-container'
                                    noValidate
                                    validated={addInfoValidated}
                                    onSubmit={handleAddInfoInpSubmit}>

                                    <Form.Text>Upload Image</Form.Text>
                                    <Form.Control
                                        type='file'
                                        accept='image/*'
                                        onChange={handleAddImageChange}/>

                                    <Form.Group>
                                        <Form.Text>Driver ID</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='driver_id'
                                            value={addInfoFormData.driver_id || ''}
                                            placeholder='Enter Driver ID'
                                            onChange={handleAddInfoChange}
                                            isInvalid={addInfoValidated && !addInfoFormData.driver_id}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            driver id is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>                                    

                                    <Form.Group>
                                        <Form.Text>Firstname</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='firstName'
                                            value={addInfoFormData.firstName}
                                            placeholder='Enter First Name'
                                            onChange={handleAddInfoChange}
                                            isInvalid={addInfoValidated && !addInfoFormData.firstName}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            Please enter a first name.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Text>Lastname</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='lastName'
                                            value={addInfoFormData.lastName}
                                            placeholder='Enter Last Name'
                                            onChange={handleAddInfoChange}
                                            isInvalid={addInfoValidated && !addInfoFormData.lastName}
                                            required />

                                        <Form.Control.Feedback type='invalid'>
                                            Please enter a last name.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Text>Contact No.</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='contact'
                                            value={addInfoFormData.contact}
                                            placeholder='Enter Contact Number'
                                            onChange={handleAddInfoChange}
                                            isInvalid={addInfoValidated && !addInfoFormData.contact}
                                            required/>

                                        <Form.Control.Feedback type='invalid'>
                                            contact number is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Text>Plate No.</Form.Text>

                                        <Form.Control
                                            type='text'
                                            name='plate_no'
                                            value={addInfoFormData.plate_no}
                                            placeholder='Enter Plate Number'
                                            onChange={handleAddInfoChange}
                                            isInvalid={addInfoValidated && !addInfoFormData.plate_no}
                                            required/>

                                        <Form.Control.Feedback type='invalid'>
                                            plate number is required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form>
                            </div>
                        </>
                    )}

                    {manage_devices_data && (
                        <>
                            <div>
                                <div className='modal-manage-devices-table-container'>
                                    <Table className='modal-manage-devices-table'>
                                        <thead className='modal-manage-devices-table-header'>
                                            <tr>
                                                <th>Device ID</th>
                                                <th>Driver Name</th>
                                                <th>Device Status Mode</th>
                                            </tr>
                                        </thead>

                                        <tbody className='modal-manage-devices-table-body'>
                                            <tr>
                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {deviceFormData.upd_dev_id || deviceFormData.dev_id}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{deviceFormData.upd_dev_id || deviceFormData.dev_id}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {deviceFormData.full_name}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{deviceFormData.full_name}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {deviceFormData.dev_status_mode}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{deviceFormData.dev_status_mode}</span>
                                                    </OverlayTrigger>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>

                                <div>
                                    <div className='modal-form-container'>
                                        <Button onClick={() => handleRestartDevice()}>
                                            <Image
                                                src={restart}
                                                alt='Restart'
                                                width={20}
                                                height={20} />

                                            <span>Restart Device ID</span>
                                        </Button>

                                        <Dropdown onSelect={(eventKey) => handleSelectDeviceMode(eventKey)}>
                                            <Dropdown.Toggle className='modal-form-dropdown-toggle'>
                                                Select Device Mode
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className='modal-form-dropdown-menu'>
                                                <Dropdown.Item eventKey='Register'>Register Mode</Dropdown.Item>
                                                <Dropdown.Item eventKey='Attendance'>Attendance Mode</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {manage_drivers_data && (
                        <>
                            <div>
                                <div className='modal-manage-drivers-table-container'>
                                    <Table className='modal-manage-drivers-table'>
                                        <thead className='modal-manage-drivers-table-header'>
                                            <tr>
                                                <th>Driver Image</th>
                                                <th>Driver ID</th>
                                                <th>Driver Name</th>
                                                <th>Contact No</th>
                                                <th>Plate No</th>
                                            </tr>
                                        </thead>

                                        <tbody className='modal-manage-drivers-table-body'>
                                            <tr>
                                                <td>
                                                    <Image
                                                        src={driverFormData.driver_img}
                                                        className='modal-manage-drivers-table-data-driver-image'
                                                        width={70}
                                                        height={70} />
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {driverFormData.driver_id || '-'}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{driverFormData.driver_id || '-'}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {driverFormData.full_name}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{driverFormData.full_name}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {driverFormData.contact || '-'}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{driverFormData.contact || '-'}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                {driverFormData.plate_no || '-'}
                                                            </Tooltip>
                                                        }>
                                                        <span className=''>{driverFormData.plate_no || '-'}</span>
                                                    </OverlayTrigger>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>

                                <div>
                                    <Form
                                        id='manageUsersForm'
                                        className='modal-form-container'
                                        noValidate
                                        validated={updateDriverValidated}
                                        onSubmit={handleUpdateDriver}>

                                        <Form.Text>Upload Image</Form.Text>
                                        <Form.Control
                                            type='file'
                                            accept='image/*'
                                            onChange={handleUpdateImageChange} />

                                        <Form.Group>
                                            <Form.Text>Driver ID</Form.Text>

                                            <Form.Control
                                                type='text'
                                                name='driver_id'
                                                value={driverFormData.driver_id || ''}
                                                placeholder='Enter Driver ID'
                                                onChange={handleDriverChange}
                                                isInvalid={updateDriverValidated && !driverFormData.driver_id}
                                                required />

                                            <Form.Control.Feedback type='invalid'>
                                                driver id is required.
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Text>Firstname</Form.Text>

                                            <Form.Control
                                                type='text'
                                                name='firstName'
                                                value={driverFormData.firstName || driverFormData.fname}
                                                placeholder='Enter First Name'
                                                onChange={handleDriverChange}
                                                isInvalid={updateDriverValidated && (!driverFormData.firstName || !driverFormData.fname)}
                                                required />

                                            <Form.Control.Feedback type='invalid'>
                                                first name is required.
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Text>Lastname</Form.Text>

                                            <Form.Control
                                                type='text'
                                                name='lastName'
                                                value={driverFormData.lastName || driverFormData.lname}
                                                placeholder='Enter Last Name'
                                                onChange={handleDriverChange}
                                                isInvalid={updateDriverValidated && (!driverFormData.lastName || !driverFormData.lname)}
                                                required />

                                            <Form.Control.Feedback type='invalid'>
                                                last name is required.
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Text>Contact No.</Form.Text>                                                

                                            <Form.Control
                                                type='text'
                                                name='contact'
                                                value={driverFormData.contact || ''}
                                                placeholder='Enter Contact Number'
                                                onChange={handleDriverChange}
                                                isInvalid={updateDriverValidated && !driverFormData.contact}
                                                required />

                                            <Form.Control.Feedback type='invalid'>
                                                contact number is required.
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Text>Plate No.</Form.Text>

                                            <Form.Control
                                                type='text'
                                                name='plate_no'
                                                value={driverFormData.plate_no || ''}
                                                placeholder='Enter Plate Number'
                                                onChange={handleDriverChange}
                                                isInvalid={updateDriverValidated && !driverFormData.plate_no}
                                                required />

                                            <Form.Control.Feedback type='invalid'>
                                                plate number is required.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Form>
                                </div>
                            </div>
                        </>
                    )}

                    {return_time_out_msg && (
                        <>
                            <div>
                                <div className='modal-return-time-out-msg-container'>
                                    <Image
                                        src={confirmLogoutData?.driver?.driver_img}
                                        alt=''
                                        className='modal-return-time-out-msg-image'
                                        width={150}
                                        height={150} />

                                    <div className='modal-return-time-out-sub-container-2'>
                                        <span className=''>
                                            <b>Name: </b><span>{confirmLogoutData?.full_name}</span>
                                        </span>

                                        <span className=''>
                                            <b>Paid Status: </b><span>{confirmLogoutData?.paid}</span>
                                        </span>

                                        <span className=''>
                                            <b>Butaw Status: </b><span>{confirmLogoutData?.butaw}</span>
                                        </span>

                                        <span className=''>
                                            <b>Boundary Status: </b><span>{confirmLogoutData?.boundary}</span>
                                        </span>

                                        <span className=''>
                                            <b>Balance Status: </b><span>{confirmLogoutData?.balance}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {request_leave_data && (
                        <>
                            <div className='reminder_msg'>
                                <h4>Leave Type</h4>

                                <Form>
                                    {['Sick leave', 'Vehicle repair', 'Personal Reason'].map((type) => (
                                        <Form.Check
                                            key={type}
                                            type='checkbox'
                                            label={type}
                                            checked={leaveType.includes(type)}
                                            onChange={() => handleRequestCheckboxChange(type)}
                                        />
                                    ))}

                                    <Form.Group className='mt-3'>
                                        <Form.Label>Date Range</Form.Label>
                                        <Form.Control
                                            type='datetime-local'
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className='mt-3'>
                                        <Form.Label>Remarks (Optional)</Form.Label>
                                        <Form.Control
                                            as='textarea'
                                            rows={2}
                                            placeholder='Short explanation...'
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            </div>
                        </>
                    )}

                    {footer_msg && (
                        <>
                            {footer_msg === 'facebook' ? (
                                <>
                                    <div className='modal-footer-image-container'>
                                        <div className={windowWidth > 520 ? 'modal-footer-sub-image-container-1' : 'modal-footer-sub-image-container-2'}>
                                            <Image
                                                src={profile_pic}
                                                alt='Profile Image'
                                                width={130}
                                                height={130} />

                                            <h5>Facebook Name: Ben Beralde</h5>
                                        </div>

                                        <span className='modal-footer-msg'>If problems occurred in the system. Please report and contact me at facebook</span>
                                    </div>
                                </>
                            ) : (
                                <p className='modal-footer-msg'>{footer_msg}</p>
                            )}
                        </>
                    )}

                    {filter_data && Object.keys(filter_data).length > 0 && (
                        <>
                            <div className='modal-filter-data-container'>
                                {Object.entries(filter_data).map(([key, label]) => (
                                    <Form.Check
                                        key={key}
                                        checked={!!localFilters[key]}
                                        label={label}
                                        onChange={e => handleCheckboxChange(key, e.target.checked)} />
                                ))}
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    {OK && (
                        <>
                            <Button className='modal-button' onClick={hide}>OK</Button>
                        </>
                    )}

                    {handleYesClick && handleNoClick && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button className='modal-footer-button' onClick={
                                    title === 'Updating Driver' ? handleModalYesClickWithImage :
                                        handleModalYesClick}>Yes</Button>
                                <Button className='modal-footer-button' onClick={hide}>No</Button>
                            </div>
                        </>
                    )}

                    {update_acc_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button
                                    type='submit'
                                    form='updateAccForm'
                                    className='moda-footer-button'>Update Operator</Button>
                            </div>
                        </>
                    )}              

                    {add_info_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button
                                    type='submit'
                                    form='addInfoForm'
                                    className='moda-footer-button'>Confirm Add Info</Button>
                            </div>
                        </>
                    )}

                    {manage_devices_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button className='modal-footer-button' onClick={() => handleUpdateDevice()}>Update Device</Button>
                                <Button className='modal-footer-button' onClick={() => handleDeleteDevice()}>Delete Device</Button>
                            </div>
                        </>
                    )}

                    {manage_drivers_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button
                                    type='submit'
                                    form='manageUsersForm'
                                    className='modal-footer-button'>
                                    Update Driver
                                </Button>
                            </div>
                        </>
                    )}

                    {payment_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                {paymentFormData.butaw !== 20 && (
                                    <Button className='modal-footer-button'
                                        onClick={() => handlePaymentButaw(paymentFormData)}>
                                        Pay Butaw
                                    </Button>
                                )}

                                {paymentFormData.boundary !== 300 && (
                                    <Button className='modal-footer-button'
                                        onClick={() => handlePaymentBoundary(paymentFormData)}>
                                        Pay Boundary
                                    </Button>
                                )}

                                {(paymentFormData.butaw !== 20 && paymentFormData.boundary !== 300) && (
                                    <Button className='modal-footer-button'
                                        onClick={() => handleBothPayment(paymentFormData)}>
                                        Pay Both Payments
                                    </Button>                                    
                                )}
                            </div>
                        </>
                    )}

                    {handleConfirmLogoutSubmit && (
                        <>
                            <div className='modal-footer-button-contaienr'>
                                <Button className='modal-footer-button'
                                    onClick={handleConfirmLogoutSubmit}>
                                    Confirm Logout
                                </Button>
                            </div>
                        </>
                    )}

                    {invoice_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button 
                                    className='modal-footer-button'
                                    onClick={handleOpenInvoice}>Open Invoice directly</Button>
                                <Button 
                                    className='modal-footer-button'
                                    onClick={handleNewTabInvoice}>Open Invoice in new tab</Button>
                            </div>
                        </>
                    )}

                    {request_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button className='modal-footer-button'
                                    onClick={handleRequestLeave}>Submit Request Leave</Button>
                            </div>
                        </>
                    )}

                    {filter_buttons && (
                        <>
                            <div className='modal-footer-button-container'>
                                <Button className='modal-footer-button'
                                    onClick={() => handleFiltersClick()}>
                                    Update Filter Change
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
}