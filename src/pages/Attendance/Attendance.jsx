import { useState, useEffect, useRef } from 'react'
import { Table, Image, Form, Button, InputGroup, Dropdown, OverlayTrigger, Tooltip, ListGroup } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { setWindowWidth, setCurrentPage, clearError } from '../../store/slices/attendanceSlice'
import { attendanceTable } from '../../store/api/attendanceThunks'
import { useNavigate } from 'react-router-dom'
import { showModal, hideModal, setPaymentFormData } from '../../store/slices/modalsSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceSearchResults } from '../../store/queries/attendanceQueries'
import { paymentButaw, paymentBoundary, paymentBothPayment } from '../../store/api/paymentThunks'
import debounce from 'lodash.debounce'
import { getSocket } from '../../utils/socket'
import ReactPaginate from 'react-paginate'
import Modals from '../../components/Modals/Modals'
import timeHelper from '../../utils/timeHelper'
import search from '../../assets/search.png'
import filter from '../../assets/filter.png'
import '../../styles/Attendance.css'

export default function Attendance() {
    const dispatch = useDispatch();
    const dropdownRef = useRef();
    const navigate = useNavigate();

    /* eslint-disable-next-line */
    const searchParams = new URLSearchParams(location.search);
    let pageParam = parseInt(searchParams.get('page'), 10);
    const { totalPages } = useSelector((state) => state.attendance);
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

    const { drivers, error, currentPage, windowWidth } = useSelector((state) => state.attendance);
    const { role } = useSelector((state) => state.auth);
    const { paymentFormData } = useSelector((state) => state.modal);
    const { attendanceFilters, attendanceSelectedFields, attendanceSelectedFilters } = useSelector((state) => state.modal);
    const { show, title, message } = useSelector((state) => state.modal);

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
        dispatch(attendanceTable(pageParam));
    }, [dispatch, pageParam]);

    useEffect(() => {
        if (error) {
            dispatch(showModal({
                title: 'Attendance Failed',
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
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showDropdown]);

    useEffect(() => {
        const socket = getSocket();

        const handleTimeIn = (data) => {
            if (data?.status === 200 && !activeSearchQuery) {
                dispatch(attendanceTable(currentPage));
            }
        }

        const handleTimeOut = (data) => {
            if (data?.action === 'time_out' && !activeSearchQuery) {
                dispatch(attendanceTable(currentPage)); 
            }
        }

        socket.on('attendance:timein', handleTimeIn);
        socket.on('attendance:logout-completed', handleTimeOut);
        socket.on('updated_payment_butaw', handleTimeIn);
        socket.on('updated_payment_boundary', handleTimeIn);
        socket.on('updated_both_payments', handleTimeIn);

        return () => {
            socket.off('attendance:timein', handleTimeIn);
            socket.off('attendance:logout-completed', handleTimeOut);
            socket.off('updated_payment_butaw', handleTimeIn);
            socket.off('updated_payment_boundary', handleTimeIn);
            socket.off('updated_both_payments', handleTimeIn);
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
        queryKey: ['search', { query: debouncedQuery, fields: attendanceSelectedFields, page: currentPage }],
        queryFn: attendanceSearchResults,
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
    const checkedFields = Object.entries(attendanceSelectedFilters)
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

    let tableAttendances = [];
    let tableTotalPages = totalPages;

    if (isSearching) {
        const startIndex = (searchTablePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        tableAttendances = tableFilteredResults.slice(startIndex, endIndex);
        tableTotalPages = Math.max(1, Math.ceil(tableFilteredResults.length / itemsPerPage));
    } else {
        tableAttendances = drivers;
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
            dispatch(attendanceTable(currentPage));
        }
    }

    const handleSearchSubmit = () => {
        if (!searchInput.trim()) {
            dispatch(showModal({
                title: 'Attendance Failed',
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

    const handleTableClick = (attendance) => {
        if (
            attendance && attendance.paid === 'Not Paid' &&
            (parseFloat(attendance.butaw) === 0 || parseFloat(attendance.boundary) === 0)
        ) {
            dispatch(showModal({
                title: 'Payment',
                message: 'Click the following buttons for butaw or boundary'
            }));

            dispatch(setPaymentFormData({ field: 'id', value: attendance.id }));
            dispatch(setPaymentFormData({ field: 'driver_id', value: attendance.driver_id }));
            dispatch(setPaymentFormData({ field: 'butaw', value: parseFloat(attendance.butaw) }));
            dispatch(setPaymentFormData({ field: 'boundary', value: parseFloat(attendance.boundary) }));
        }
    }

    const handlePaymentLogs = () => {
        navigate('payment-logs');
    }

    const handleDataAnalytics = () => {
        navigate('data-analytics');
    }

    const handlePaymentButawYesClick = async () => {
        try {
            await dispatch(paymentButaw(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An payment was updated');
            dispatch(attendanceTable(currentPage));

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
            dispatch(attendanceTable(currentPage));

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
            dispatch(attendanceTable(currentPage));

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
            <div className='attendance-main-container'>
                <div className='attendance-search-container'>
                    <Form onSubmit={e => {
                        e.preventDefault();
                        handleSearchSubmit();
                    }}>
                        <InputGroup>
                            <Button onClick={() => handleFilterClick()}>
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
                                className=''
                                value={searchInput}
                                onChange={handleSearchChange}
                                onFocus={() => {
                                    if (searchInput && debouncedQuery) setShowDropdown(true);
                                }}
                            />

                            <Button onClick={() => handleSearchSubmit()}>
                                <Image src={search} alt='Search' width={20} height={20} />
                            </Button>
                        </InputGroup>
                    </Form>

                    <div>
                        {showDropdown && (
                            <>
                                <Dropdown.Menu
                                    show
                                    className='attendance-search-suggestion-dropdown-menu'
                                    ref={dropdownRef}>
                                    {isLoading && <Dropdown.Item>Loading...</Dropdown.Item>}
                                    {uniqueDropdownResults.map((data, index) => {
                                        const field = data._matchedField;
                                        const value = data[field];
                                        const count = data._count;

                                        return (
                                            <Dropdown.Item
                                                key={data.id || index}
                                                className=''
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

                    <div className={windowWidth > 800 ? 'attendance-option-button-container-1' : 'attendance-option-button-container-2'}>
                        <Button onClick={() => handlePaymentLogs()}>Payment Logs</Button>
                        {(role === 'super-admin' || role === 'admin') && (
                            <Button onClick={() => handleDataAnalytics()}>Data Analytics</Button>
                        )}
                    </div>
                </div>

                <div>
                    <div className='attendance-table-container'>
                        {windowWidth > 800 && (
                            <Table className='attendance-table' hover>
                                <thead className='attendance-table-header'>
                                    <tr>
                                        <th>Driver ID</th>
                                        <th>Driver Name</th>
                                        <th>Date</th>
                                        <th>Time In</th>
                                        <th>Time Out</th>
                                        <th>Payment Status</th>
                                    </tr>
                                </thead>

                                <tbody className='attendance-table-body'>
                                    {Array.isArray(tableAttendances) && tableAttendances.length > 0 ? (
                                        tableAttendances.map((attendance, index) => {
                                            let rowClass = 'attendance-table-row';

                                            if (attendance.paid === 'Not Paid') {
                                                rowClass = 'attendance-table-not-paid-row'
                                            } else if (attendance.paid === 'Paid') {
                                                rowClass = 'attendance-table-paid-row'
                                            }

                                            return (
                                                <tr key={index} className={rowClass}
                                                    onClick={() => handleTableClick(attendance)}>
                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {attendance.driver_id}
                                                                </Tooltip>
                                                            }>
                                                            <span>{attendance.driver_id}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {attendance.full_name}
                                                                </Tooltip>
                                                            }>
                                                            <span>{attendance.full_name}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {
                                                                        attendance.createdAt && new Date(attendance.createdAt).toLocaleDateString()
                                                                    }
                                                                </Tooltip>
                                                            }>
                                                            <span>
                                                                {
                                                                    attendance.createdAt && new Date(attendance.createdAt).toLocaleDateString()
                                                                }
                                                            </span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {timeHelper.formatTime(attendance.time_in)}
                                                                </Tooltip>
                                                            }>
                                                            <span>{timeHelper.formatTime(attendance.time_in)}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {timeHelper.formatTime(attendance.time_out) || '-'}
                                                                </Tooltip>
                                                            }>
                                                            <span>{timeHelper.formatTime(attendance.time_out) || '-'}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {attendance.paid}
                                                                </Tooltip>
                                                            }>
                                                            <span>{attendance.paid}</span>
                                                        </OverlayTrigger>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}

                        {windowWidth <= 800 && (
                            <ListGroup className='attendance-listgroup-container'>
                                {Array.isArray(tableAttendances) && tableAttendances.length > 0 ? (
                                    tableAttendances.map((attendance, index) => {
                                        let rowClass = 'attendance-listgroup-item';

                                        if (attendance.paid === 'Not Paid') {
                                            rowClass = 'attendance-listgroup-not-paid-item'
                                        } else if (attendance.paid === 'Paid') {
                                            rowClass = 'attendance-listgroup-paid-item'
                                        }

                                        return(
                                            <ListGroup.Item
                                                key={index}
                                                className={rowClass}
                                                onClick={() => handleTableClick(attendance)}>
                                                <div className='attendance-listgroup-row'>
                                                    <span className='attendance-listgroup-label'>Driver ID:</span>
                                                    <span>{attendance.driver_id}</span>
                                                </div>
                                                <div className='attendance-listgroup-row'>
                                                    <span className='attendance-listgroup-label'>Driver Name:</span>
                                                    <span>{attendance.full_name}</span>
                                                </div>
                                                <div className='attendance-listgroup-row'>
                                                    <span className='attendance-listgroup-label'>Date:</span>
                                                    <span>{attendance.createdAt && new Date(attendance.createdAt).toLocaleDateString()}</span>                                                    
                                                </div>
                                                <div className='attendance-listgroup-row'>
                                                    <span className='attendance-listgroup-label'>Time In:</span>
                                                    <span>{timeHelper.formatTime(attendance.time_in)}</span>                                                    
                                                </div>
                                                <div className='attendance-listgroup-row'>
                                                    <span className='attendance-listgroup-label'>Time Out:</span>
                                                    <span>{timeHelper.formatTime(attendance.time_out)}</span>                                                    
                                                </div>   
                                                <div className='attendance-listgroup-row'>
                                                    <span className='attendance-listgroup-label'>Payment Status:</span>
                                                    <span>{attendance.paid}</span>                                                    
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
                            ? Math.min(Math.max(searchTablePage - 1, 0), tableTotalPages - 1)
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
                        title === 'Attendance Failed' ||
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

                    filter_data={title === 'Filter' ? attendanceFilters : {}}
                    filter_buttons={title === 'Filter'}
                />
            </div>
        </>
    );
}