import { useState, useEffect, useRef } from 'react'
import { Table, Image, Form, Button, InputGroup, Dropdown, OverlayTrigger, Tooltip, ListGroup } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { attendanceTable } from '../../store/api/attendanceThunks'
import { setWindowWidth, setCurrentPage, clearError } from '../../store/slices/attendanceSlice'
import { useNavigate } from 'react-router-dom'
import { showModal, hideModal, setPaymentFormData } from '../../store/slices/modalsSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentButaw, paymentBoundary, paymentBothPayment } from '../../store/api/paymentThunks'
import { paymentSearchResults } from '../../store/queries/paymentQueries'
import ReactPaginate from 'react-paginate'
import Modals from '../../components/Modals/Modals'
import debounce from 'lodash.debounce'
import { connectSocket } from '../../utils/socket'
import search from '../../assets/search.png'
import filter from '../../assets/filter.png'
import '../../styles/Payment.css'

export default function Payment() {
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
    const { paymentFormData } = useSelector((state) => state.modal);
    const { paymentFilters, paymentSelectedFields, paymentSelectedFilters } = useSelector((state) => state.modal);
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
                title: 'Payment Failed',
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
        const socket = connectSocket();

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

        socket.on('updated', handleTimeIn);
        socket.on('attendance:timein', handleTimeIn);
        socket.on('attendance:logout-completed', handleTimeOut);
        socket.on('updated_payment_butaw', handleTimeIn);
        socket.on('updated_payment_boundary', handleTimeIn);
        socket.on('updated_both_payments', handleTimeIn);

        return () => {
            socket.off('updated', handleTimeIn);
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
        queryKey: ['search', { query: debouncedQuery, fields: paymentSelectedFields, page: currentPage }],
        queryFn: paymentSearchResults,
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
    const checkedFields = Object.entries(paymentSelectedFilters)
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

    let tablePayments = [];
    let tableTotalPages = totalPages;

    if (isSearching) {
        const startIndex = (searchTablePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        tablePayments = tableFilteredResults.slice(startIndex, endIndex);
        tableTotalPages = Math.max(1, Math.ceil(tableFilteredResults.length / itemsPerPage));
    } else {
        tablePayments = drivers;
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
                title: 'Payment Failed',
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

    const handleTableClick = (payment) => {
        if (
            payment && payment.paid === 'Not Paid' &&
            (parseFloat(payment.butaw) === 0 || parseFloat(payment.boundary) === 0)
        ) {
            dispatch(showModal({
                title: 'Payment',
                message: 'Click the ff buttons if driver is already paid on butaw or boundary'
            }));

            dispatch(setPaymentFormData({ field: 'id', value: payment.id }));
            dispatch(setPaymentFormData({ field: 'driver_id', value: payment.driver_id }));
            dispatch(setPaymentFormData({ field: 'butaw', value: parseFloat(payment.butaw) }));
            dispatch(setPaymentFormData({ field: 'boundary', value: parseFloat(payment.boundary) }));
        }
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
            <div className='payment-main-container'>
                <div className='payment-search-container'>
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
                                    className='payment-search-suggestion-dropdown-menu'
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
                </div>

                <div>
                    <div className='payment-table-container'>
                        {windowWidth > 800 && (
                            <Table className='payment-table' hover>
                                <thead className='payment-table-header'>
                                    <tr>
                                        <th>Driver ID</th>
                                        <th>Driver Name</th>
                                        <th>Date</th>
                                        <th>Butaw</th>
                                        <th>Boundary</th>
                                        <th>Balance</th>
                                        <th>Payment Status</th>
                                    </tr>
                                </thead>

                                <tbody className='payment-table-body'>
                                    {Array.isArray(tablePayments) && tablePayments.length > 0 ? (
                                        tablePayments.map((payment, index) => {
                                            let rowClass = 'payment-table-row';

                                            if (payment.paid === 'Not Paid') {
                                                rowClass = 'payment-table-not-paid-row'
                                            } else if (payment.paid === 'Paid') {
                                                rowClass = 'payment-table-paid-row';
                                            }

                                            return (
                                                <tr key={index} className={rowClass}
                                                    onClick={() => handleTableClick(payment)}>
                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {payment.driver_id}
                                                                </Tooltip>
                                                            }>
                                                            <span>{payment.driver_id}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {payment.full_name}
                                                                </Tooltip>
                                                            }>
                                                            <span>{payment.full_name}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {
                                                                        payment.createdAt && new Date(payment.createdAt).toLocaleDateString()
                                                                    }
                                                                </Tooltip>
                                                            }>
                                                            <span>
                                                                {
                                                                    payment.createdAt && new Date(payment.createdAt).toLocaleDateString()
                                                                }
                                                            </span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {payment.butaw}
                                                                </Tooltip>
                                                            }>
                                                            <span>{payment.butaw}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {payment.boundary}
                                                                </Tooltip>
                                                            }>
                                                            <span>{payment.boundary}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {payment.balance}
                                                                </Tooltip>
                                                            }>
                                                            <span>{payment.balance}</span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td>
                                                        <OverlayTrigger
                                                            overlay={
                                                                <Tooltip>
                                                                    {payment.paid}
                                                                </Tooltip>
                                                            }>
                                                            <span>{payment.paid}</span>
                                                        </OverlayTrigger>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}

                        {windowWidth <= 800 && (
                            <ListGroup className='payment-listgroup-container'>
                                {Array.isArray(tablePayments) && tablePayments.length > 0 ? (
                                    tablePayments.map((payment, index) => {
                                        let rowClass = 'payment-listgroup-item';

                                        if (payment.paid === 'Not Paid') {
                                            rowClass = 'payment-listgroup-not-paid-item'
                                        } else if (payment.paid === 'Paid') {
                                            rowClass = 'payment-listgroup-paid-item';
                                        }

                                        return(
                                            <ListGroup.Item
                                                key={index}
                                                className={rowClass}
                                                onClick={() => handleTableClick(payment)}>
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Driver ID:</span>
                                                    <span>{payment.driver_id}</span>
                                                </div>
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Driver Name:</span>
                                                    <span>{payment.full_name}</span>
                                                </div>
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Date:</span>
                                                    <span>{payment.createdAt && new Date(payment.createdAt).toLocaleDateString()}</span>
                                                </div>   
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Butaw:</span>
                                                    <span>{payment.butaw}</span>
                                                </div> 
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Boundary:</span>
                                                    <span>{payment.boundary}</span>
                                                </div>   
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Balance:</span>
                                                    <span>{payment.balance}</span>
                                                </div>   
                                                <div className='payment-listgroup-row'>
                                                    <span className='payment-listgroup-label'>Payment Status:</span>
                                                    <span>{payment.paid}</span>
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
                        title === 'Payment Failed' ||
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

                    filter_data={title === 'Filter' ? paymentFilters : {}}
                    filter_buttons={title === 'Filter'}
                />
            </div>
        </>
    );
}