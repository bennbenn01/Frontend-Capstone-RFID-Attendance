import { useState, useEffect, useRef } from 'react'
import { Image, Table, Form, Button, OverlayTrigger, Tooltip, Dropdown, InputGroup, ListGroup } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setWindowWidth, setCurrentPage, clearError } from '../../store/slices/manage_usersSlice'
import {
    manage_usersTable,
    manage_usersAddInfo,
    manage_userUpdateDevice,
    manage_userDeleteDevice,
    manage_userUpdateDriver,
} from '../../store/api/manage_usersThunks'
import {
    showModal,
    hideModal,
    setDeviceFormData,
    setDriverImage,
    setDriverFormData,
    resetAddInfoFormData
} from '../../store/slices/modalsSlice'
import { generateRfidUuid } from '../../utils/generateRfidUuid'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { manageUsersSearchResults } from '../../store/queries/manage_usersQueries'
import debounce from 'lodash.debounce'
import { getSocket } from '../../utils/socket'
import ReactPaginate from 'react-paginate'
import Modals from '../../components/Modals/Modals'
import filter from '../../assets/filter.png'
import search from '../../assets/search.png'
import edit from '../../assets/edit.png'
import '../../styles/Manage_Users.css'

export default function Manage_Users() {
    const dispatch = useDispatch();
    const dropdownRef = useRef(false);
    const navigate = useNavigate();

    /* eslint-disable-next-line */
    const searchParams = new URLSearchParams(location.search);
    let pageParam = parseInt(searchParams.get('page'), 10);
    const { totalPages } = useSelector((state) => state.manage_users);
    if (!pageParam || pageParam < 1) {
        pageParam = 1;
    } else if (totalPages && pageParam > totalPages) {
        pageParam = totalPages;
    }

    const [_, setDriverImageFile] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTablePage, setSearchTablePage] = useState(1);

    const { drivers, currentPage, error, windowWidth } = useSelector((state) => state.manage_users);
    const { role } = useSelector((state) => state.auth);
    const { deviceFormData, driverFormData } = useSelector((state) => state.modal);
    const { addInfoFormData } = useSelector((state) => state.modal);
    const { manageUsersFilters, manageUsersSelectedFields, manageUsersSelectedFilters } = useSelector((state) => state.modal);
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
    }, [totalPages, pageParam, navigate, searchParams]);

    useEffect(() => {
        dispatch(setCurrentPage(pageParam));
        dispatch(manage_usersTable(pageParam));
    }, [dispatch, pageParam]);

    useEffect(() => {
        if (error) {
            dispatch(showModal({
                title: 'Manage Users Failed',
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

        const handleUpdated = (data) => {
            if (data?.status === 200 && !activeSearchQuery) {
                dispatch(manage_usersTable(currentPage));
            }
        }

        const handleCardDevMode = (data) => {
            if (data?.action === 'card_dev_mode_updated') {
                dispatch(manage_usersTable(currentPage));
            }
        }

        socket.on('updated', handleUpdated);
        socket.on('card_updated', handleCardDevMode);

        return () => {
            socket.off('updated', handleUpdated);
            socket.off('card_updated', handleCardDevMode);
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
        queryKey: ['search', { query: debouncedQuery, fields: manageUsersSelectedFields, page: currentPage }],
        queryFn: manageUsersSearchResults,
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
    const checkedFields = Object.entries(manageUsersSelectedFilters)
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
            dispatch(manage_usersTable(currentPage));
        }
    }

    const handleSearchSubmit = () => {
        if (!searchInput.trim()) {
            dispatch(showModal({
                title: 'Manage Users Failed',
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

    const handleAddInfoClick = () => {
        dispatch(showModal({ title: 'Add Info' }));
    }

    const handleAddInfoSubmit = async (imageFile) => {
        try {
            const dev_id = generateRfidUuid();

            const formData = new FormData();

            formData.append('dev_id', dev_id);

            if (imageFile) {
                formData.append('driver_img', imageFile);
            }

            formData.append('img_type', addInfoFormData.img_type);
            formData.append('driver_id', addInfoFormData.driver_id);
            formData.append('firstName', addInfoFormData.firstName);
            formData.append('lastName', addInfoFormData.lastName);
            formData.append('contact', addInfoFormData.contact);
            formData.append('plate_no', addInfoFormData.plate_no);

            await dispatch(manage_usersAddInfo(formData)).unwrap();
            handleSuccessOperation('Added Info', 'An new device was created!');
            dispatch(manage_usersTable(currentPage));
            
            dispatch(resetAddInfoFormData());

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Manage Devices Failed',
                message: typeof err === 'string' ? err : err.message || String(err)
            }));
        }
    }

    const handleDeviceClick = (driver) => {
        dispatch(showModal({ title: 'Manage Devices' }));

        dispatch(setDeviceFormData({ field: 'id', value: driver.id }));
        dispatch(setDeviceFormData({ field: 'dev_id', value: driver.dev_id }));
        dispatch(setDeviceFormData({ field: 'upd_dev_id', value: driver.upd_dev_id }));
        dispatch(setDeviceFormData({ field: 'full_name', value: driver.full_name }));
        dispatch(setDeviceFormData({ field: 'dev_status_mode', value: driver.dev_status_mode }));
    }

    const handleUpdateDeviceYesClick = async () => {
        try {
            await dispatch(manage_userUpdateDevice({ ...deviceFormData })).unwrap();
            handleSuccessOperation('Updated Device', 'An device has been updated');
            dispatch(manage_usersTable(currentPage));

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Manage Devices Failed',
                message: err
            }));
        }
    }

    const handleDeleteDeviceYesClick = async () => {
        try {
            await dispatch(manage_userDeleteDevice({ ...deviceFormData })).unwrap();
            handleSuccessOperation('Deleted Device', 'An device has been deleted')
            dispatch(manage_usersTable(currentPage));

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Manage Devices Failed',
                message: err
            }));
        }
    }

    const handleDriverClick = (driver) => {
        dispatch(showModal({ title: 'Manage Drivers' }));

        dispatch(setDriverFormData({ field: 'id', value: driver.id }));
        dispatch(setDriverFormData({ field: 'dev_id', value: driver.dev_id }));
        dispatch(setDriverImage({ field: 'driver_img', value: driver.driver_img }));
        dispatch(setDriverImage({ field: 'img_type', value: driver.img_type }));
        dispatch(setDriverFormData({ field: 'driver_id', value: driver.driver_id }));
        dispatch(setDriverFormData({ field: 'firstName', value: driver.firstName || driver.fname }));
        dispatch(setDriverFormData({ field: 'lastName', value: driver.lastName || driver.lname }));
        dispatch(setDriverFormData({ field: 'full_name', value: driver.full_name }));
        dispatch(setDriverFormData({ field: 'contact', value: driver.contact }));
        dispatch(setDriverFormData({ field: 'plate_no', value: driver.plate_no }));
    }

    const handleUpdateDriverYesClick = async (imageFile) => {
        try {
            const formData = new FormData();

            formData.append('id', driverFormData.id);
            formData.append('dev_id', driverFormData.dev_id);

            if (imageFile instanceof File) {
                formData.append('driver_img', imageFile);
            }

            formData.append('img_type', driverFormData.img_type);
            formData.append('driver_id', driverFormData.driver_id);
            formData.append('firstName', driverFormData.firstName);
            formData.append('lastName', driverFormData.lastName);
            formData.append('full_name', driverFormData.full_name);
            formData.append('contact', driverFormData.contact);
            formData.append('plate_no', driverFormData.plate_no);

            await dispatch(manage_userUpdateDriver(formData)).unwrap();
            handleSuccessOperation('Updated Driver', 'An driver has been updated');
            dispatch(manage_usersTable(currentPage));

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'search',
            });

        } catch (err) {
            dispatch(showModal({
                title: 'Manage Drivers Failed',
                message: err
            }));
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
            <div className='manage-users-main-container'>
                <div className='manage-users-search-container'>
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
                                    className='manage-users-search-suggestion-dropdown-menu'
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

                    {role === 'admin' && (
                        <Button onClick={() => handleAddInfoClick()}>Add Info</Button>
                    )}
                </div>

                <div>
                    <div className='manage-users-table-container'>
                        {windowWidth > 800 && (
                            <Table className='manage-users-table' hover>
                                <thead className='manage-users-table-header'>
                                    <tr>
                                        <th>Driver Image</th>
                                        <th>Device ID</th>
                                        <th>Device Status Mode</th>
                                        <th>Driver ID</th>
                                        <th>Driver Name</th>
                                        <th>Contact No</th>
                                        <th>Plate No</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody className='manage-users-table-body'>
                                    {Array.isArray(tableDrivers) && tableDrivers.length > 0 ? (
                                        tableDrivers.map((driver, index) => (
                                            <tr key={index} className='manage-users-table-row'>
                                                <td>
                                                    <Image
                                                        src={driver.driver_img}
                                                        alt=''
                                                        className='manage-users-table-data-driver-image'
                                                        width={70}
                                                        height={70} />
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>{driver.dev_id}</Tooltip>
                                                        }>
                                                        <span>{driver.dev_id}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>{driver.dev_status_mode}</Tooltip>
                                                        }>
                                                        <span>{driver.dev_status_mode}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>{driver.driver_id || '-'}</Tooltip>
                                                        }>
                                                        <span>{driver.driver_id || '-'}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>{driver.full_name}</Tooltip>
                                                        }>
                                                        <span>{driver.full_name}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>{driver.contact || '-'}</Tooltip>
                                                        }>
                                                        <span>{driver.contact || '-'}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>{driver.plate_no || '-'}</Tooltip>
                                                        }>
                                                        <span>{driver.plate_no || '-'}</span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <Dropdown>
                                                        <Dropdown.Toggle className='manage-users-table-data-dropdown-toggle'>
                                                            <Image
                                                                src={edit}
                                                                alt='Edit'
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span>Edit</span>
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu
                                                            className='manage-users-table-data-dropdown-menu'
                                                            renderOnMount
                                                            popperConfig={{ strategy: 'fixed' }}>
                                                            <Dropdown.Item onClick={() => handleDeviceClick(driver)}>Edit Device Info</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleDriverClick(driver)}>Edit Driver Info</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}

                        {windowWidth <= 800 && (
                            <ListGroup className='manage-users-listgroup-container'>
                                {Array.isArray(tableDrivers) && tableDrivers.length > 0 ? (
                                    tableDrivers.map((driver, index) => {
                                        return(
                                            <ListGroup.Item 
                                                key={index}
                                                className='manage-users-listgroup-item'>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Driver Image:</span>

                                                    <Image
                                                        src={driver.driver_img}
                                                        alt=''
                                                        className='manage-users-table-data-driver-image'
                                                        width={70}
                                                        height={70} />
                                                </div>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Device ID:</span>
                                                    <span>{driver.dev_id}</span>
                                                </div>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Device Status Mode:</span>
                                                    <span>{driver.dev_status_mode}</span>
                                                </div>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Driver ID:</span>
                                                    <span>{driver.driver_id || '-'}</span>
                                                </div>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Driver Name:</span>
                                                    <span>{driver.full_name}</span>
                                                </div>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Contact No:</span>
                                                    <span>{driver.contact || '-'}</span>
                                                </div>
                                                <div className='manage-users-listgroup-row'>
                                                    <span className='manage-users-listgroup-label'>Plate No:</span>
                                                    <span>{driver.plate_no || '-'}</span>
                                                </div>
                                                <Dropdown>
                                                    <Dropdown.Toggle className='manage-users-listgroup-data-dropdown-toggle'>
                                                        <Image
                                                            src={edit}
                                                            alt='Edit'
                                                            width={20}
                                                            height={20}
                                                        />
                                                        <span>Edit</span>
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu
                                                        className='manage-users-listgroup-data-dropdown-menu'
                                                        renderOnMount
                                                        popperConfig={{ strategy: 'fixed' }}>
                                                        <Dropdown.Item onClick={() => handleDeviceClick(driver)}>Edit Device Info</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => handleDriverClick(driver)}>Edit Driver Info</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
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
                        title === 'Manage Users Failed' ||
                        title === 'Manage Devices Failed' ||
                        title === 'Manage Drivers Failed' ||
                        title === 'Added Info' ||
                        title === 'Updated Device' ||
                        title === 'Deleted Device' ||
                        title === 'Updated Driver'
                    }

                    handleYesClick={
                        title === 'Updating Device' ||
                        title === 'Deleting Device' ||
                        title === 'Updating Driver'
                    }
                    handleModalYesClick={
                        title === 'Updating Device' && handleUpdateDeviceYesClick ||
                        title === 'Deleting Device' && handleDeleteDeviceYesClick ||
                        title === 'Updating Driver' && handleUpdateDriverYesClick
                    }
                    handleNoClick={
                        title === 'Updating Device' ||
                        title === 'Deleting Device' ||
                        title === 'Updating Driver'
                    }

                    add_info={title === 'Add Info' ? addInfoFormData : null}
                    add_info_buttons={title === 'Add Info'}
                    handleAddInfoSubmit={handleAddInfoSubmit}

                    manage_devices_data={title === 'Manage Devices' ? deviceFormData : null}
                    manage_devices_buttons={title === 'Manage Devices'}

                    manage_drivers_data={title === 'Manage Drivers' ? driverFormData : null}
                    manage_drivers_buttons={title === 'Manage Drivers'}
                    setDriverImageFile={setDriverImageFile}

                    filter_data={title === 'Filter' ? manageUsersFilters : {}}
                    filter_buttons={title === 'Filter'}
                />
            </div>
        </>
    );
}