import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, ButtonGroup, Image } from 'react-bootstrap'
import { fetchDriverInfo, submitManualTimeIn, submitManualTimeOut } from '../../store/api/manualTimeInAndOutThunks'
import { 
    setManualField,
    setManualTimeInChange, 
    setManualTimeOutChange, 
    clearManualAttendanceError,
    resetManualTimeInData,
    resetManualTimeOutData
} from '../../store/slices/manualTimeInAndOutSlice'
import { showModal, hideModal } from '../../store/slices/modalsSlice'
import Modals from '../../components/Modals/Modals'
import scan from '../../assets/scan.png'
import '../../styles/Manual_TimeInAndOut.css'

export default function Manual_TimeInAndOut() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { 
        driverInfo, 
        manualTimeInData, 
        manualTimeOutData, 
        status, 
        submitStatus, 
        submitError 
    } = useSelector((state) => state.manual);
    const { show, title, message } = useSelector((state) => state.modal);

  
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'timeIn');
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        dispatch(fetchDriverInfo());
    }, [dispatch]);

    useEffect(() => {
        if (submitStatus === 'succeeded') {
            const successMessage = activeTab === 'timeIn' 
                ? 'Manual Time In recorded successfully!' 
                : 'Manual Time Out recorded successfully!';

            dispatch(showModal({
                title: 'Success',
                message: successMessage
            }));

            setTimeout(() => {
                dispatch(hideModal());
                
                if (activeTab === 'timeIn') {
                    dispatch(resetManualTimeInData());
                } else {
                    dispatch(resetManualTimeOutData());
                }
                
                navigate('/manual-attendance');
            }, 2000);
        }

        if (submitStatus === 'failed' && submitError) {
            const errorTitle = activeTab === 'timeIn' ? 'Time In Failed' : 'Time Out Failed';
            dispatch(showModal({
                title: errorTitle,
                message: submitError
            }));
        }
    }, [submitStatus, submitError, activeTab, dispatch, navigate]);

    const handleManualChange = (e) => {
        const { name, value } = e.target;
        dispatch(setManualField({ field: name, value }));

        if (name === 'full_name' && value.trim().length > 2) {
            dispatch(fetchDriverInfo(value.trim()));
        }
    }

    const handleTimeInChange = (e) => {
        const { name, value } = e.target;
        dispatch(setManualTimeInChange({ field: name, value }));
    };

    const handleTimeOutChange = (e) => {
        const { name, value } = e.target;
        dispatch(setManualTimeOutChange({ field: name, value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(false);

        if (activeTab === 'timeIn') {
            dispatch(submitManualTimeIn({
                driver_db_id: manualTimeInData.driver_db_id,
                time_in: manualTimeInData.time_in,
                reason: manualTimeInData.reason
            }));       
        } else {
            dispatch(submitManualTimeOut({
                driver_db_id: manualTimeOutData.driver_db_id,
                time_out: manualTimeOutData.time_out,
                reason: manualTimeOutData.reason
            }));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setValidated(false);
    };

    const handleModalClose = () => {
        dispatch(hideModal());
        dispatch(clearManualAttendanceError());
    };

    const handleBackToSelection = () => {
        navigate('/manual-attendance');
    };

    if (status === 'loading') {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <>
            <Container className="manual-timeinout-container py-5">
                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        <Card className="manual-timeinout-card p-4 shadow-sm">
                            <Card.Body>
                                <div className="text-center mb-4">
                                    <h3 className="manual-timeinout-header">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Manual Attendance
                                    </h3>
                                    <p className="text-muted">
                                        Welcome, <strong>{driverInfo.full_name || 'Driver'}</strong>
                                    </p>
                                </div>

                                <div className="d-grid gap-2 mb-4">
                                    <ButtonGroup>
                                        <Button
                                            variant={activeTab === 'timeIn' ? 'success' : 'outline-success'}
                                            size="lg"
                                            onClick={() => handleTabChange('timeIn')}
                                            className="manual-timeinout-tab-button">
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Time In
                                        </Button>
                                        <Button
                                            variant={activeTab === 'timeOut' ? 'danger' : 'outline-danger'}
                                            size="lg"
                                            onClick={() => handleTabChange('timeOut')}
                                            className="manual-timeinout-tab-button">
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                            Time Out
                                        </Button>
                                    </ButtonGroup>
                                </div>

                                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                    {activeTab === 'timeIn' ? (
                                        <>
                                            <div className="manual-timeinout-form-section">
                                                <p className="text-muted text-center mb-3">
                                                    Use this form if the RFID device is unavailable during your shift start.
                                                </p>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Driver Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name='full_name'
                                                        value={driverInfo.full_name || ''}
                                                        placeholder='Enter name'
                                                        onChange={handleManualChange}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Time In</Form.Label>
                                                    <Form.Control
                                                        type="datetime-local"
                                                        name="time_in"
                                                        value={manualTimeInData.time_in}
                                                        onChange={handleTimeInChange}
                                                        required
                                                        isInvalid={validated && !manualTimeInData.time_in}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Time in is required.
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Reason (Optional)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="reason"
                                                        value={manualTimeInData.reason}
                                                        onChange={handleTimeInChange}
                                                        placeholder="e.g. RFID system down"
                                                        maxLength={255}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Submitted By</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={driverInfo.full_name || ''}
                                                        readOnly
                                                    />
                                                </Form.Group>

                                                <div className="d-grid">
                                                    <Button
                                                        variant="success"
                                                        type="submit"
                                                        size="lg"
                                                        disabled={submitStatus === 'loading'}>
                                                        {submitStatus === 'loading' ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-check-circle me-2"></i>
                                                                Submit Time In
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="manual-timeinout-form-section">
                                                <p className="text-muted text-center mb-3">
                                                    Submit your manual time out when RFID is unavailable.
                                                </p>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Driver Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name='full_name'
                                                        value={driverInfo.full_name || ''}
                                                        placeholder='Enter name'
                                                        onChange={handleManualChange}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Time Out</Form.Label>
                                                    <Form.Control
                                                        type="datetime-local"
                                                        name="time_out"
                                                        value={manualTimeOutData.time_out}
                                                        onChange={handleTimeOutChange}
                                                        required
                                                        isInvalid={validated && !manualTimeOutData.time_out}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Time out is required.
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Reason</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="reason"
                                                        value={manualTimeOutData.reason}
                                                        onChange={handleTimeOutChange}
                                                        placeholder="e.g. RFID malfunction"
                                                        maxLength={255}
                                                        required
                                                        isInvalid={validated && !manualTimeOutData.reason}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Reason is required.
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Payment Option</Form.Label>
                                                    <div>
                                                        <Form.Check
                                                            inline
                                                            label="Butaw"
                                                            name="payment_type"
                                                            type="radio"
                                                            value="butaw"
                                                            checked={manualTimeOutData.payment_type === 'butaw'}
                                                            onChange={handleTimeOutChange}
                                                            required
                                                            isInvalid={validated && !manualTimeOutData.payment_type}
                                                        />
                                                        <Form.Check
                                                            inline
                                                            label="Boundary"
                                                            name="payment_type"
                                                            type="radio"
                                                            value="boundary"
                                                            checked={manualTimeOutData.payment_type === 'boundary'}
                                                            onChange={handleTimeOutChange}
                                                            required
                                                            isInvalid={validated && !manualTimeOutData.payment_type}
                                                        />
                                                        <Form.Check
                                                            inline
                                                            label="Both"
                                                            name="payment_type"
                                                            type="radio"
                                                            value="both"
                                                            checked={manualTimeOutData.payment_type === 'both'}
                                                            onChange={handleTimeOutChange}
                                                            required
                                                            isInvalid={validated && !manualTimeOutData.payment_type}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            Please select an option.
                                                        </Form.Control.Feedback>
                                                    </div>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Submitted By</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={driverInfo.full_name || ''}
                                                        readOnly
                                                    />
                                                </Form.Group>

                                                <div className="d-grid">
                                                    <Button
                                                        variant="danger"
                                                        type="submit"
                                                        size="lg"
                                                        disabled={submitStatus === 'loading'}>
                                                        {submitStatus === 'loading' ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-upload me-2"></i>
                                                                Submit Time Out
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Form>

                                <div className="text-center mt-3">
                                    <Button
                                        variant="link"
                                        onClick={handleBackToSelection}>
                                        <i className="bi bi-arrow-left me-1"></i>
                                        Back to Selection
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    src={scan}
                    alt=""
                    width={300}
                    height={300}
                />
            </div>

            <Modals
                show={show}
                hide={handleModalClose}
                title={title}
                message={message}
                OK={title === 'Success' || title === 'Time In Failed' || title === 'Time Out Failed'}
            />
        </>
    );
}