import { useState, useEffect, useRef } from 'react'
import { Form, Button, Image, Table, Dropdown, InputGroup, OverlayTrigger, Tooltip, ListGroup, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showModal, hideModal, setPaymentFormData } from '../../store/slices/modalsSlice'
import { dashboardTable, dashboardDriverInfo } from '../../store/api/dashboardThunks'
import { setWindowWidth, setCurrentPage, clearError } from '../../store/slices/dashboardSlice'
import { paymentButaw, paymentBoundary, paymentBothPayment } from '../../store/api/paymentThunks'
import { dashboardSearchResults } from '../../store/queries/dashboardQueries'
import debounce from 'lodash.debounce'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Modals from '../../components/Modals/Modals'
import ReactPaginate from 'react-paginate'
import { getSocket } from '../../utils/socket'
import card_tap from '../../assets/card_tap.png'
import group_of_drivers from '../../assets/drivers.png'
import filter from '../../assets/filter.png'
import search from '../../assets/search.png'
import '../../styles/Dashboard.css'

export default function Dashboard() {
    const dispatch = useDispatch();
    const dropdownRef = useRef(false);
    const navigate = useNavigate();

    /* eslint-disable-next-line */
    const searchParams = new URLSearchParams(location.search);
    let pageParam = parseInt(searchParams.get('page'), 10);
    const { totalPages } = useSelector((state) => state.dashboard);
    if (!pageParam || pageParam < 1) {
        pageParam = 1;
    } else if (totalPages && pageParam > totalPages) {
        pageParam = totalPages;
    }

    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTablePage, setSearchTablePage] = useState(1);
    const [notifications, setNotifications] = useState([]);

    const { drivers, driverInfo, currentPage, error, totalAttendance, totalDrivers, totalButaw, totalBoundary , totalPaid, windowWidth } = useSelector((state) => state.dashboard);
    const { role } = useSelector((state) => state.auth);
    const { paymentFormData } = useSelector((state) => state.modal);
    const { dashboardFilters, dashboardSelectedFields, dashboardSelectedFilters } = useSelector((state) => state.modal);
    const { show, title, message } = useSelector((state) => state.modal);

    const summary = {
        totalAttendance,
        totalDrivers,
        totalButaw,
        totalBoundary,
        totalPaid
    }

    useEffect(() => {
        dispatch(dashboardDriverInfo());
    }, [dispatch])

    useEffect(() => {
        const handleResize = () => {
            dispatch(setWindowWidth(window.innerWidth));
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch]);

    useEffect(() => {
        if (totalPages && pageParam > totalPages) {
            searchParams.set('page', String(totalPages));
            navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
        }
    }, [navigate, pageParam, searchParams, totalPages]);

    useEffect(() => {
        dispatch(setCurrentPage(pageParam));
        dispatch(dashboardTable(pageParam));
    }, [dispatch, pageParam]);

    useEffect(() => {
        if (error) {
            dispatch(showModal({
                title: 'Dashboard Failed',
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

    useEffect(() => {
        return () => {
            dispatch(clearError());

            if (window.errorTimeoutId) {
                clearTimeout(window.errorTimeoutId);
                window.errorTimeoutId = null;
            }
        }
    }, [dispatch]);

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleUpdated = (data) => {
            if ((data?.status === 200 && data?.action === 'time_in') && !activeSearchQuery) {
                dispatch(dashboardTable(currentPage));
            }
        }

        const handleTimeOut = (data) => {
            if (data?.action === 'time_out' && !activeSearchQuery) {
                dispatch(dashboardTable(currentPage)); 
            }
        }

        const handlePaymentNotif = (data) => {
            setNotifications(prev => [...prev, data]);
        }

        const handleInActiveNotif = (data) => {
            setNotifications(prev => [...prev, data]);
        }

        socket.on('updated', handleUpdated);
        socket.on('attendance:timein', handleUpdated);
        socket.on('attendance:logout-completed', handleTimeOut);
        socket.on('updated_payment_butaw', handleUpdated);
        socket.on('updated_payment_boundary', handleUpdated);
        socket.on('updated_both_payments', handleUpdated);
        socket.on('payment-reminder', handlePaymentNotif);
        socket.on('inactive-driver', handleInActiveNotif);

        return () => {
            socket.off('updated', handleUpdated);
            socket.off('attendance:timein', handleUpdated);
            socket.off('attendance:logout-completed', handleTimeOut);
            socket.off('updated_payment_butaw', handleUpdated);
            socket.off('updated_payment_boundary', handleUpdated);
            socket.off('updated_both_payments', handleUpdated);
            socket.off('payment-reminder', handlePaymentNotif);
            socket.off('inactive-driver', handleInActiveNotif);
        }
    }, [dispatch, activeSearchQuery, currentPage]);

    const handleSuccessOperation = (title, message) => {
        dispatch(clearError());

        if (window.errorTimeoutId) {
            clearTimeout(window.errorTimeoutId);
            window.errorTimeoutId = null;
        }

        dispatch(showModal({
            title,
            message
        }));
    }

    const { data: searchResults = { drivers: [], totalPages: 1 }, isLoading } = useQuery({
        queryKey: ['search', { query: debouncedQuery, fields: dashboardSelectedFields, page: currentPage }],
        queryFn: dashboardSearchResults,
        enabled: !!debouncedQuery,
        staleTime: 1000,
    });

    const queryClient = useQueryClient();

    const debouncedSetQuery = useRef(
        debounce((val) => setDebouncedQuery(val), 300)
    ).current;

    const isSearching = !!activeSearchQuery;

    const itemsPerPage = 10;

    /* eslint-disable no-unused-vars */
    const checkedFields = Object.entries(dashboardSelectedFilters)
        .filter(([_, checked]) => checked)
        .map(([field]) => field)

    const dropdownFilteredResults = searchResults.drivers?.filter((dri) =>
        checkedFields.some((field) =>
            typeof dri[field] === 'string' &&
            dri[field].toLowerCase().includes(debouncedQuery.toLowerCase())
        )
    ) || [];

    const tableFilteredResults = searchResults.drivers?.filter((dri) =>
        checkedFields.some((field) =>
            typeof dri[field] === 'string' &&
            dri[field].toLowerCase().includes(activeSearchQuery.toLowerCase())
        )
    ) || [];

    const seen = new Map();
    const uniqueDropdownResults = [];

    for (const dri of dropdownFilteredResults) {
        const matchedField = checkedFields.find(field =>
            typeof dri[field] === 'string' &&
            dri[field].toLowerCase().includes(debouncedQuery.toLowerCase())
        );

        const value = dri[matchedField]?.toLowerCase().trim();

        if (!value) continue;

        if (!seen.has(value)) {
            seen.set(value, { count: 1, dri, field: matchedField });
        } else {
            seen.get(value).count += 1;
        }
    }

    for (const [value, { dri, count, field }] of seen.entries()) {
        uniqueDropdownResults.push({
            ...dri,
            _matchedField: field,
            _valueKey: value,
            _count: count,
        });
    }

    let tableDrivers = [];
    let tableTotalPages = totalPages;

    if (isSearching) {
        const startIndex = (searchTablePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        tableDrivers = tableFilteredResults.slice(startIndex, endIndex);
        tableTotalPages = Math.max(1, Math.ceil(tableFilteredResults.length / itemsPerPage));
    } else {
        tableDrivers = drivers;
        tableTotalPages = totalPages;
    }

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        debouncedSetQuery(val);
        setShowDropdown(!!val);

        if (!val) {
            setActiveSearchQuery('');
            setSearchTablePage(1);
            dispatch(dashboardTable(currentPage));
        }
    }

    const handleSearchSubmit = () => {
        if (!searchInput.trim()) {
            dispatch(showModal({
                title: 'Dashboard Failed',
                message: 'Invalid Request'
            }));
            setActiveSearchQuery('');
            setSearchTablePage(1);
            setShowDropdown(false);
            return;
        }

        setActiveSearchQuery(searchInput.trim());
        setSearchTablePage(1);
        setShowDropdown(false);
    }

    const handleSearchClick = (data) => {
        const matchedField = checkedFields.find(field =>
            typeof data[field] === 'string' &&
            data[field].toLowerCase().includes(searchInput.trim().toLowerCase())
        )

        if (!matchedField) {
            setActiveSearchQuery('');
            setSearchTablePage(1);
            setShowDropdown(false);
            return;
        }

        const value = data[matchedField] || '';
        setSearchInput(value);
        setDebouncedQuery(value);
        setActiveSearchQuery(value);
        setSearchTablePage(1);
        setShowDropdown(false);
    }

    const handleFilterClick = () => {
        dispatch(showModal({ title: 'Filter' }));
    }

    const handleTableClick = (driver) => {
        if (
            driver && driver.paid === 'Not Paid' &&
            (parseFloat(driver.butaw) === 0 || parseFloat(driver.boundary) === 0)
        ) {
            dispatch(showModal({
                title: 'Payment',
                message: 'Click the following buttons for butaw or boundary'
            }));

            dispatch(setPaymentFormData({ field: 'id', value: driver.id }));
            dispatch(setPaymentFormData({ field: 'driver_id', value: driver.driver_id }));
            dispatch(setPaymentFormData({ field: 'butaw', value: parseFloat(driver.butaw) }));
            dispatch(setPaymentFormData({ field: 'boundary', value: parseFloat(driver.boundary) }));
        }
    }

    const handlePaymentButawYesClick = async () => {
        try {
            await dispatch(paymentButaw(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An payment was updated');
            dispatch(dashboardTable(currentPage));

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Attendance Failed',
                message: err
            }))
        }
    }

    const handlePaymentBoundaryYesClick = async () => {
        try {
            await dispatch(paymentBoundary(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An payment was updated');
            dispatch(dashboardTable(currentPage));

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Attendance Failed',
                message: err
            }))
        }
    }

    const handleBothPaymentYesClick = async () => {
        try {
            await dispatch(paymentBothPayment(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An both payment was updated');
            dispatch(dashboardTable(currentPage));

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Attendance Failed',
                message: err
            }))
        }
    }

    const handlePageClick = ({ selected }) => {
        const selectedPage = selected + 1;
        if (isSearching) {
            setSearchTablePage(selectedPage);
        } else {
            const searchParams = new URLSearchParams(location.search);
            searchParams.set('page', selectedPage);
            navigate(`${location.pathname}?${searchParams.toString()}`);
        }
    }

    const clearAllErrors = () => {
        dispatch(clearError());

        if (window.errorTimeoutId) {
            clearTimeout(window.errorTimeoutId);
            window.errorTimeoutId = null;
        }
    }

    const handleInvoiceClick = () => {
        dispatch(showModal({ 
            title: 'Invoice Option',
            message: 'Options to open the invoice.'
        }));
    }

    const handleAlternativeClick = () => {
        navigate('/alternative-attendance')
    }

    const handleRequestLeave = () => {
        dispatch(showModal({ 
            title: 'Request Leave' 
        }));
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
            {role === 'super-admin' || role === 'admin' && (
                <div className='dashboard-main-container'>
                    <div className='dashboard-search-container'>
                        <Form >
                            <InputGroup>
                                <Button onClick={handleFilterClick}>
                                    <Image
                                        src={filter}
                                        alt='Filter'
                                        width={20}
                                        height={20}
                                    />
                                </Button>

                                <Form.Control
                                    type='text'
                                    placeholder='Search Driver'
                                    name='query'
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    onFocus={() => {
                                        if (searchInput && debouncedQuery) setShowDropdown(true);
                                    }}
                                />

                                <Button onClick={handleSearchSubmit}>
                                    <Image src={search} alt='Search' width={20} height={20} />
                                </Button>
                            </InputGroup>
                        </Form>

                        <div>
                            {showDropdown && (
                                <>
                                    <Dropdown.Menu
                                        show
                                        className='dashboard-search-suggestion-dropdown-menu'
                                        ref={dropdownRef}>
                                        {isLoading && <Dropdown.Item>Loading...</Dropdown.Item>}
                                        {uniqueDropdownResults.map((data, index) => {
                                            const field = data._matchedField;
                                            const value = data[field];
                                            const count = data._count;

                                            return (
                                                <Dropdown.Item
                                                    key={data.id || index}
                                                    onClick={() => handleSearchClick(data)}>
                                                    {value}
                                                    {count > 1 && ` - (${count} results)`}
                                                </Dropdown.Item>
                                            );
                                        })}
                                        {!isLoading && dropdownFilteredResults.length === 0 && <Dropdown.Item>No results found.</Dropdown.Item>}
                                    </Dropdown.Menu>
                                </>
                            )}
                        </div>
                    </div>

                    <div className='dashboard-summary-container'>
                        <div className='dashboard-sub-summary-1'>
                            <div className='dashboard-sub-summary-1-text'>
                                <span>Total's Attendance</span>
                                <span>{summary.totalAttendance || 0}</span>
                            </div>

                            {windowWidth > 700 && (
                                <Image
                                    src={card_tap}
                                    alt='card_tap'
                                    width={50}
                                    height={50}/>
                            )}
                        </div> 

                        <div className='dashboard-sub-summary-2'>
                            <div className='dashboard-sub-summary-2-text'>
                                <span>Total Driver's</span>
                                <span>{summary.totalDrivers || 0}</span>
                            </div>
            
                            {windowWidth > 700 && (
                                <Image
                                    src={group_of_drivers}
                                    alt='drivers'
                                    width={50}
                                    height={50}/>
                            )}
                        </div> 

                        <div className='dashboard-sub-summary-3'>
                            <span>Total Payments</span>

                            <div className='dashboard-sub-summary-3-text'>
                                <span>Butaw</span>
                                <span>{summary.totalButaw || 0}</span>
                            </div>

                            <div className='dashboard-sub-summary-3-text'>
                                <span>Boundary</span>
                                <span>{summary.totalBoundary || 0}</span>
                            </div>

                            <div className='dashboard-sub-summary-3-text'>
                                <span>Total Paid</span>
                                <span>{summary.totalPaid || 0}</span>
                            </div>
                        </div>                                                                        
                    </div>

                    <div className='dashboard-table-container'>
                        {windowWidth > 700 && (
                            <Table className='dashboard-table' hover>
                                <thead className='dashboard-table-header'>
                                    <tr>
                                        <th>Driver Image</th>
                                        <th>Driver ID</th>
                                        <th>Driver Name</th>
                                        <th>Contact No.</th>
                                        <th>Plate No.</th>
                                    </tr>
                                </thead>

                                <tbody className='dashboard-table-body'>
                                    {Array.isArray(tableDrivers) && tableDrivers.length > 0 ? (
                                        tableDrivers.map((record, index) => {
                                            let rowClass = 'dashboard-table-row';

                                            if (record.paid === 'Not Paid') {
                                                rowClass = 'dashboard-not-paid-row';
                                            } else {
                                                rowClass = 'dashboard-paid-row';
                                            }

                                            return (
                                                <tr key={index} className={rowClass}
                                                    onClick={() => handleTableClick(record)}>
                                                    <td>
                                                        <Image
                                                            src={record?.driver?.driver_img}
                                                            alt=''
                                                            className='dashboard-table-data-driver-image'
                                                            width={70}
                                                            height={70}
                                                        />
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {record.driver_id}
                                                                </Tooltip>
                                                            }>
                                                            <span>{record.driver_id}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {record.full_name}
                                                                </Tooltip>
                                                            }>
                                                            <span>{record.full_name}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {record?.driver?.contact}
                                                                </Tooltip>
                                                            }>
                                                            <span>{record?.driver?.contact}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {record?.driver?.plate_no}
                                                                </Tooltip>
                                                            }>
                                                            <span>{record?.driver?.plate_no}</span>
                                                        </OverlayTrigger>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}

                        {windowWidth <= 700 && (
                            <ListGroup className='dashboard-listgroup-container'>
                                {Array.isArray(tableDrivers) && tableDrivers.length > 0 ? (
                                    tableDrivers.map((record, index) => {
                                        let rowClass = 'dashboard-listgroup-item';

                                        if (record.paid === 'Not Paid') {
                                            rowClass = 'dashboard-listgroup-not-paid-item';
                                        } else {
                                            rowClass = 'dashboard-listgroup-paid-item';
                                        }

                                        return(
                                            <ListGroup.Item 
                                                key={index}
                                                className={rowClass}
                                                onClick={() => handleTableClick(record)}>
                                                <div className='dashboard-listgroup-row'>
                                                    <span className='dashboard-listgroup-label'>Driver Image:</span>

                                                    <Image
                                                        src={record?.driver?.driver_img}
                                                        alt=''
                                                        className='dashboard-table-data-driver-image'
                                                        width={70}
                                                        height={70}
                                                    />
                                                </div>
                                                <div className='dashboard-listgroup-row'>
                                                    <span className='dashboard-listgroup-label'>Driver ID:</span>
                                                    <span>{record.driver_id}</span>
                                                </div>
                                                <div className='dashboard-listgroup-row'>
                                                    <span className='dashboard-listgroup-label'>Driver Name:</span>
                                                    <span>{record.full_name}</span>
                                                </div>
                                                <div className='dashboard-listgroup-row'>
                                                    <span className='dashboard-listgroup-label'>Contact No:</span>
                                                    <span>{record?.driver?.contact}</span>
                                                </div>
                                                <div className='dashboard-listgroup-row'>
                                                    <span className='dashboard-listgroup-label'>Plate No:</span>
                                                    <span>{record?.driver?.plate_no}</span>
                                                </div>
                                            </ListGroup.Item>
                                        );
                                    })
                                ) : (
                                    <ListGroup.Item >No data available</ListGroup.Item>
                                )}
                            </ListGroup>
                        )}
                    </div>

                    <div>
                        <ReactPaginate
                            containerClassName='pagination'
                            previousLabel={null}
                            previousClassName='prev'
                            nextLabel={null}
                            nextClassName='next'
                            breakLabel='...'

                            pageCount={tableTotalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                            forcePage={isSearching
                                ? Math.min(Math.max(searchTablePage - 1, 0), tableTotalPages -1)
                                : Math.min(Math.max(currentPage - 1, 0), tableTotalPages - 1)
                            }
                            activeClassName='active'
                            renderOnZeroPageCount={null}
                        />
                    </div>

                    <Modals
                        show={show}
                        hide={handleModalClose}
                        title={title}
                        message={message}

                        OK={
                            title === 'Confirmation Timeout Failed' ||
                            title === 'Dashboard Failed' ||
                            title === 'Updated Payment'
                        }

                        handleYesClick={
                            title === 'Confirmation of Payment of Butaw' ||
                            title === 'Confirmation of Payment of Boundary' || 
                            title === 'Confirmation of Both Payments'
                        }
                        handleModalYesClick={
                            title === 'Confirmation of Payment of Butaw' && handlePaymentButawYesClick ||
                            title === 'Confirmation of Payment of Boundary' && handlePaymentBoundaryYesClick ||
                            title === 'Confirmation of Both Payments' && handleBothPaymentYesClick
                        }
                        handleNoClick={
                            title === 'Confirmation of Payment of Butaw' ||
                            title === 'Confirmation of Payment of Boundary' || 
                            title === 'Confirmation of Both Payments'
                        }

                        payment_buttons={title === 'Payment' && paymentFormData}

                        filter_data={title === 'Filter' ? dashboardFilters : {}}
                        filter_buttons={title === 'Filter'}
                    />
                </div>
            )}

            {role === 'driver' && (
                <div className='dashboard-main-container'>
                    <div>
                        {notifications.map((notif, index) => (
                            <Alert key={index} variant='danger'>{notif.message}</Alert>
                        ))}

                        <Button className='dashboard-driver-buttons' onClick={handleInvoiceClick}>Invoice</Button>               
                    </div>

                    <div className="card shadow-sm p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">

                            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                            <Image
                                src={driverInfo.driver_img}
                                alt=""
                                className='dashboard-driver-image'
                                width={100}
                                height={100}
                            />

                            <div className="d-flex flex-column">
                                <span className=''>
                                    <b>Driver ID:</b> {driverInfo.driver_id}
                                </span>

                                <span className=''>
                                    <b>Driver Name:</b> {driverInfo.driver_name}
                                </span>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end align-items-center gap-2">
                            <Button
                                className="px-3"
                                onClick={handleRequestLeave}
                            >
                                Request Leave
                            </Button>

                            <Button
                                className="px-3"
                                onClick={handleAlternativeClick}
                            >
                                Alternative Attendance
                            </Button>
                            </div>

                        </div>
                    </div>

                    <Modals
                        show={show}
                        hide={handleModalClose}
                        title={title}
                        message={message}

                        OK={
                            title === 'Dashboard Failed' || 
                            title === 'Request Leave Success'
                        }

                        invoice_buttons={title === 'Invoice Option'}

                        request_leave_data={title === 'Request Leave'}
                        request_buttons={title === 'Request Leave'}
                    />   
                </div>
            )}
        </>
    );
}