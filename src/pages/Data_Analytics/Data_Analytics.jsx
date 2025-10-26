import { useState, useEffect, useRef } from 'react'
import { Form, Button, Image, InputGroup, Dropdown } from 'react-bootstrap'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, Legend } from 'recharts'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import { data_analyticsData, dataAnalyticsDateSearchResults, dataAnalyticsAllDateSearchResults } from '../../store/api/data_analyticsThunks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dataAnalyticsSearchResults } from '../../store/queries/data_analyticsQueries'
import { setPaymentFormData, showModal, hideModal } from '../../store/slices/modalsSlice'
import { setWindowWidth, setUpdateDataAnalyticsChange, clearError } from '../../store/slices/data_analyticsSlice'
import { paymentButaw, paymentBoundary, paymentBothPayment } from '../../store/api/paymentThunks'
import { chartToolTip } from '../../utils/customToolTip'
import Modals from '../../components/Modals/Modals'
import { DateTime } from 'luxon'
import ExcelJS from 'exceljs'
import { getSocket, connectSocket } from '../../utils/socket'
import debounce from 'lodash.debounce'
import search from '../../assets/search.png'
import filter from '../../assets/filter.png'
import '../../styles/Data_Analytics.css'
// TODO: Selecting an driver
export default function Data_Analytics() {
    const dispatch = useDispatch();
    const dropdownRef = useRef();

    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [selectedDetailsDriver, setSelectedDetailsDriver] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const { 
        drivers: driversData, 
        dataAnalyticsSearchQuery, 
        dateSearchResults, 
        allDateSearchResults, 
        error, 
        windowWidth 
    } = useSelector((state) => state.data_analytics);
    const { dataAnalyticsFilters, dataAnalyticsSelectedFields, dataAnalyticsSelectedFilters } = useSelector((state) => state.modal);
    const { paymentFormData } = useSelector((state) => state.modal);
    const { show, title, message } = useSelector((state) => state.modal);

    const drivers = driversData?.drivers || [];

    useEffect(() => {
        const handleResize = () => {
            dispatch(setWindowWidth(window.innerWidth));
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch]);

    useEffect(() => {
        dispatch(data_analyticsData());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            dispatch(showModal({
                title: 'Data Analytics Failed',
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

        socket.on('connect', () => {});

        return () => {
            socket.off('connect');
        };
    }, []);

    useEffect(() => {
        const socket = getSocket(); 

        const handleDataAnalytics = (data) => {
            if (data?.status === 200 && !activeSearchQuery) {
                dispatch(data_analyticsData());
            }
        }

        const listeners = () => {
            socket.on('attendance:timein', handleDataAnalytics);
            socket.on('attendance:logout-completed', handleDataAnalytics);
            socket.on('updated_payment_butaw', handleDataAnalytics);
            socket.on('updated_payment_boundary', handleDataAnalytics);
            socket.on('updated_both_payments', handleDataAnalytics);
        }

        if (socket.connected) {
            listeners();
        } else {
            socket.once('connect', () => {
                listeners();
            })
        }

        return () => {
            socket.off('attendance:timein', handleDataAnalytics);
            socket.off('attendance:logout-completed', handleDataAnalytics);
            socket.off('updated_payment_butaw', handleDataAnalytics);
            socket.off('updated_payment_boundary', handleDataAnalytics);
            socket.off('updated_both_payments', handleDataAnalytics);
        }
    }, [dispatch, activeSearchQuery]);

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

    const { data: searchResults = { drivers: [] }, isLoading } = useQuery({
        queryKey: ['search', { query: debouncedQuery, fields: dataAnalyticsSelectedFields }],
        queryFn: dataAnalyticsSearchResults,
        enabled: !!debouncedQuery,
        staleTime: 1000,
    });

    const queryClient = useQueryClient();

    const debouncedSetQuery = useRef(
        debounce((val) => setDebouncedQuery(val), 300)
    ).current;

    const isSearching = !!activeSearchQuery;

    const checkedFields = Object.entries(dataAnalyticsSelectedFilters)
        .filter(([checked]) => checked)
        .map(([field]) => field)

    const dropdownFilteredResults = searchResults.drivers?.filter((dri) =>
        checkedFields.some((field) =>
            typeof dri[field] === 'string' &&
            dri[field].toLowerCase().includes(debouncedQuery.toLowerCase())
        )
    ) || [];

    const searchFilteredResults = searchResults.drivers?.filter((dri) =>
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

    let driData = [];

    if (
        selectedDetailsDriver?.driver_id &&
        selectedDetailsDriver?.full_name &&
        dataAnalyticsSearchQuery.from_date &&
        dataAnalyticsSearchQuery.to_date
    ) {
        driData = dateSearchResults?.drivers || [];
    } else if (dataAnalyticsSearchQuery.from_date && dataAnalyticsSearchQuery.to_date) {
        driData = allDateSearchResults?.drivers || [];
    } else if (isSearching) {
        driData = searchFilteredResults || [];
    } else {
        driData = drivers || [];
    }

    const chartData = driData.map(dri => {
        const dateObj = new Date(dri.createdAt);

        return {
            id: dri.id,
            full_name: dri.full_name,
            Date: dateObj,
            butaw: dri.butaw,
            boundary: dri.boundary,
            Paid: Number(dri.paid === 'Paid'),
            'Not Paid': Number(dri.paid === 'Not Paid'),
        }
    }).filter(Boolean);

    const drivers_total_balance = drivers.reduce((sum, dri) => {
        const balance = parseFloat(dri.total_balance);
        return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const drivers_total_paid = drivers.reduce((sum, dri) => {
        const paid = parseFloat(dri.total_paid);
        return sum + (isNaN(paid) ? 0 : paid);
    }, 0);

    const date_total_balance = (dateSearchResults?.drivers || []).reduce((sum, dri) => {
        const balance = parseFloat(dri.total_balance);
        return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const all_date_total_balance = (allDateSearchResults?.drivers || []).reduce((sum, dri) => {
        const balance = parseFloat(dri.total_balance);
        return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const date_total_paid = (dateSearchResults?.drivers || []).reduce((sum, dri) => {
        const paid = parseFloat(dri.total_paid);
        return sum + (isNaN(paid) ? 0 : paid);
    }, 0);

    const all_date_total_paid = (allDateSearchResults?.drivers || []).reduce((sum, dri) => {
        const paid = parseFloat(dri.total_paid);
        return sum + (isNaN(paid) ? 0 : paid);
    }, 0);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        debouncedSetQuery(val);
        setShowDropdown(!!val);

        if (!val) {
            setActiveSearchQuery('');
            setSelectedDetailsDriver(null); 
        }
    }

    const handleSearchSubmit = () => {
        dispatch(setUpdateDataAnalyticsChange({ field: 'from_date', value: null }));
        dispatch(setUpdateDataAnalyticsChange({ field: 'to_date', value: null }));

        if (!searchInput.trim()) {
            dispatch(showModal({
                title: 'Data Analytics Failed',
                message: 'Invalid Request'
            }));
            setActiveSearchQuery('');
            setShowDropdown(false);
            return;
        }

        const matchedDriver = dropdownFilteredResults.find((dri) =>
            checkedFields.some((field) =>
                typeof dri[field] === 'string' &&
                dri[field].toLowerCase() === searchInput.trim().toLowerCase()
            )
        );

        if (matchedDriver) {
            handleSearchClick(matchedDriver);
        } else {
            setActiveSearchQuery(searchInput.trim());
            setSelectedDetailsDriver(null);
        }

        setShowDropdown(false);
    }

    const handleSearchClick = (data) => {
        dispatch(setUpdateDataAnalyticsChange({ field: 'from_date', value: null }));
        dispatch(setUpdateDataAnalyticsChange({ field: 'to_date', value: null }));

        const matchedField = checkedFields.find(field =>
            typeof data[field] === 'string' &&
            data[field].toLowerCase().includes(searchInput.trim().toLowerCase())
        )

        if (!matchedField) {
            setActiveSearchQuery('');
            setShowDropdown(false);
            setSelectedDetailsDriver(null);
            return;
        }

        const value = data[matchedField] || '';
        setSearchInput(value);
        setDebouncedQuery(value);
        setActiveSearchQuery(value);
        setShowDropdown(false);

        setSelectedDetailsDriver(data);
    }

    const handleFilterClick = () => {
        dispatch(showModal({ title: 'Filter' }));
    }

    const handleUpdateDataAnalyticsChange = (date, field) => {
        const ISOString = DateTime.fromJSDate(date, { zone: 'Asia/Manila' }).toISODate();
        dispatch(setUpdateDataAnalyticsChange({ field, value: date ? ISOString : null }));
    }

    const handleDateSearchSubmit = async () => {
        try {
            const exactDriver = searchFilteredResults.length > 0 ? searchFilteredResults[0] : null;

            const query = {
                driver_id: exactDriver?.driver_id,
                full_name: exactDriver?.full_name,
                from_date: dataAnalyticsSearchQuery.from_date,
                to_date: dataAnalyticsSearchQuery.to_date
            }

            dispatch(setUpdateDataAnalyticsChange({ field: 'driver_id', value: query.driver_id }));
            dispatch(setUpdateDataAnalyticsChange({ field: 'full_name', value: query.full_name }));

            if (!query.driver_id && !query.full_name) {
                return dispatch(showModal({
                    title: 'Data Analytics Failed',
                    message: 'Please select a driver for date range search'
                }));
            }

            if (query.from_date === '' || query.to_date === '') {
                return dispatch(showModal({
                    title: 'Data Analytics Failed',
                    message: 'Please select an start date and end date range'
                }));
            }

            await dispatch(dataAnalyticsDateSearchResults(query)).unwrap();
        } catch (err) {
            dispatch(showModal({
                title: 'Data Analytics Failed',
                message: err
            }));
        }
    }

    const handleAllDateSearchSubmit = async () => {
        try {
            setSearchInput('');
            setDebouncedQuery('');
            setActiveSearchQuery('');
            setShowDropdown(false);

            dispatch(setUpdateDataAnalyticsChange({ field: 'from_date', value: dataAnalyticsSearchQuery.from_date }));
            dispatch(setUpdateDataAnalyticsChange({ field: 'to_date', value: dataAnalyticsSearchQuery.to_date }));

            await dispatch(dataAnalyticsAllDateSearchResults(dataAnalyticsSearchQuery)).unwrap();
        } catch (err) {
            dispatch(showModal({
                title: 'Data Analytics Failed',
                message: err
            }));
        }
    }

    const handlePaymentOptionClick = (attendance) => {
        if (attendance && attendance.paid === 'Not Paid' && !attendance.isDeleted) {
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

    const handleDownloadAnaytics = async () => {
        try {
            let exportData = [];

            if (selectedDetailsDriver) {
                exportData = driData.filter(
                    d => d.driver_id === selectedDetailsDriver.driver_id
                );
            } else if (dataAnalyticsSearchQuery.from_data && dataAnalyticsSearchQuery.to_date) {
                exportData = allDateSearchResults?.drivers || [];
            } else {
                exportData = drivers || [];
            }

            if (!exportData || exportData.length === 0) {
                dispatch(showModal({
                    title: 'Data Analytics Failed',
                    message: 'No data available to download.'
                }));
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Analytics");

            worksheet.columns = [
                { header: "Driver ID", key: "driver_id" },
                { header: "Full Name", key: "full_name" },
                { header: "Butaw", key: "butaw" },
                { header: "Boundary", key: "boundary" },
                { header: "Paid", key: "paid" },
                { header: "Total Balance", key: "total_balance" },
                { header: "Total Paid", key: "total_paid" },
                { header: "Data", key: "date" },
            ];

            exportData.forEach(dri => {
                worksheet.addRow({
                    driver_id: dri.driver_id,
                    full_name: dri.full_name,
                    butaw: dri.butaw,
                    boundary: dri.boundary,
                    paid: dri.paid,
                    total_balance: dri.total_balance,
                    total_paid: dri.total_paid,
                    date: dri.createdAt
                        ? new Date(dri.createdAt).toLocaleDateString("en-PH")
                        : ''
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();

            let fileName = "Bluman_Toda_Data_Analytics.xlsx";
            if (selectedDetailsDriver) {
                const start = dataAnalyticsSearchQuery.from_date || '';
                const end = dataAnalyticsSearchQuery.to_date || '';
                fileName = `${selectedDetailsDriver.full_name}_${start || ''}_${end || ''}.xlsx`;
            } else if (dataAnalyticsSearchQuery.from_date && dataAnalyticsSearchQuery.to_date) {
                const start = dataAnalyticsSearchQuery.from_date;
                const end = dataAnalyticsSearchQuery.to_date;
                fileName = `All_Drivers_${start}_to_${end}.xlsx`;
            }

            if (window.showSaveFilePicker) {
                const options = {
                    suggestedName: fileName,
                    types: [
                        {
                            description: "Excel File",
                            accept: {
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
                            }
                        }
                    ]
                }

                const handle = await window.showSaveFilePicker(options);
                const writable = await handle.createWritable();
                await writable.write(buffer);
                await writable.close();
            } else {
                const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                return;
            }
        }
    }

    const handlePaymentButawYesClick = async () => {
        try {
            const updated = await dispatch(paymentButaw(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An payment was updated');

            setSelectedDetailsDriver(updated);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Data Analytics Failed',
                message: err
            }))
        }
    }

    const handlePaymentBoundaryYesClick = async () => {
        try {
            const updated = await dispatch(paymentBoundary(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An payment was updated');

            setSelectedDetailsDriver(updated);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Data Analytics Failed',
                message: err
            }))
        }
    }

    const handleBothPaymentYesClick = async () => {
        try {
            const updated = await dispatch(paymentBothPayment(paymentFormData)).unwrap();
            handleSuccessOperation('Updated Payment', 'An both payment was updated');

            setSelectedDetailsDriver(updated);

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
            <div className='data-analytics-main-container'>
                <div className='data-analytics-search-container'>
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
                                    className='data-analytics-search-suggestion-dropdown-menu'
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

                    <div>
                        <div className={windowWidth > 800 ? 'data-analytics-datepicker-container-1': 'data-analytics-datepicker-container-2'}>
                            <span className='data-analytics-form-text'>Start Date</span>

                            <DatePicker
                                className={windowWidth > 800 ? null : 'data-analytics-datepicker'}
                                placeholderText='Select Start Date'
                                showIcon
                                showDateSelect
                                selected={dataAnalyticsSearchQuery.from_date ?
                                    DateTime.fromISO(dataAnalyticsSearchQuery.from_date, { zone: 'Asia/Manila' }).toJSDate() : null
                                }
                                onChange={(date) => handleUpdateDataAnalyticsChange(date, 'from_date')}
                                withPortal />

                            <span className='data-analytics-form-text'>End Date</span>

                            <DatePicker
                                className={windowWidth > 800 ? null : 'data-analytics-datepicker'}
                                placeholderText='Select End Date'
                                showIcon
                                showDateSelect
                                selected={dataAnalyticsSearchQuery.to_date ?
                                    DateTime.fromISO(dataAnalyticsSearchQuery.to_date, { zone: 'Asia/Manila' }).toJSDate() : null
                                }
                                onChange={(date) => handleUpdateDataAnalyticsChange(date, 'to_date')}
                                withPortal />

                            <Button onClick={() => handleDateSearchSubmit()} className='data-analytics-button-container'>
                                <span>Search</span>
                                <Image src={search} alt='Search' width={20} height={20} />
                            </Button>

                            <Button onClick={() => handleAllDateSearchSubmit()} className='data-analytics-button-container'>
                                <span>Search for all drivers</span>
                                <Image src={search} alt='Search' width={20} height={20} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className='data-analytics-recharts-container'>
                        {driData && driData.length > 0 ? (
                            <ResponsiveContainer width='100%' height={450}>
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 50, bottom: 5, left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray='1 1' />
                                    <text
                                        x='50%' y='7%'
                                        textAnchor='middle'
                                        fontWeight='bold'>
                                        Driver Name: {selectedDetailsDriver?.full_name || '-'}
                                    </text>

                                    <XAxis
                                        dataKey='Date'
                                        tickFormatter={(d) =>
                                            new Date(d).toLocaleDateString('en-PH', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit'
                                            })
                                        } />

                                    <Tooltip content={chartToolTip} />
                                    <Legend content={() => (
                                        <div className='data-analytics-legend-container'>
                                            <span className='data-analytics-legend-text-1'>🟩 Paid</span>
                                            <span className='data-analytics-legend-text-2'>🟥 Not Paid</span>
                                        </div>
                                    )} />
                                    <Bar dataKey='Paid' stackId='a' barSize={60} fill='green' />
                                    <Bar dataKey='Not Paid' stackId='a' barSize={60} fill='red' />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width='100%' height={450}>
                                <BarChart
                                    margin={{ top: 50, bottom: 5, left: -20, right: 35 }}>
                                    <CartesianGrid strokeDasharray='1 1' />
                                    <text
                                        x='50%' y='50%'
                                        textAnchor='middle'
                                        fontWeight='bold'>
                                        No active attendance available.
                                    </text>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div>
                    <div className='data-analytics-driver-att-container'>
                        <span><b>Driver Payment Summary</b></span>

                        <span>Total Balance: ₱
                            {
                                selectedDetailsDriver
                                    ? driData
                                        .filter(d => d.driver_id === selectedDetailsDriver.driver_id)
                                        .reduce((sum, d) => sum + parseFloat(d.total_balance || 0), 0)
                                    : dataAnalyticsSearchQuery.from_date && dataAnalyticsSearchQuery.to_date
                                        ? (date_total_balance || all_date_total_balance)
                                        : drivers_total_balance
                            }
                        </span>

                        <span>Total Paid: ₱
                            {
                                selectedDetailsDriver
                                    ? driData
                                        .filter(d => d.driver_id === selectedDetailsDriver.driver_id)
                                        .reduce((sum, d) => sum + parseFloat(d.total_paid || 0), 0)
                                    : dataAnalyticsSearchQuery.from_date && dataAnalyticsSearchQuery.to_date
                                        ? (date_total_paid || all_date_total_paid)
                                        : drivers_total_paid
                            }
                        </span>

                        <Button onClick={() => handleDownloadAnaytics()}>Download Analytics as Excel</Button>

                        {selectedDetailsDriver && selectedDetailsDriver.paid === 'Not Paid' && !selectedDetailsDriver.isDeleted && (
                            <Button onClick={() => handlePaymentOptionClick(selectedDetailsDriver)}>Payment Option</Button>
                        )}
                    </div>
                </div>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Confirmation Logout Failed' ||
                        title === 'Data Analytics Failed' ||
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

                    filter_data={title === 'Filter' ? dataAnalyticsFilters : {}}
                    filter_buttons={title === 'Filter'}
                />
            </div>
        </>
    );
}