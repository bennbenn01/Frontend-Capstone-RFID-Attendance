import { useEffect } from 'react'
import { Table, OverlayTrigger, Tooltip, Button, ListGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { adminTable, updateAdminTable, deleteAdminTable } from '../../store/api/adminThunks'
import { setWindowWidth, setCurrentPage, clearError } from '../../store/slices/adminSlice'
import { showModal, hideModal, setUpdateAccData } from '../../store/slices/modalsSlice'
import Modals from '../../components/Modals/Modals'
import '../../styles/Admin_Dashboard.css'

export default function Admin_Dashboard() {
    const dispatch = useDispatch();
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

    const { admins, error, windowWidth } = useSelector((state) => state.admin);
    const { updateAccData } = useSelector((state) => state.modal);
    const { show, title, message } = useSelector((state) => state.modal);

    useEffect(() => {
        dispatch(setCurrentPage(pageParam));
        dispatch(adminTable(pageParam));
    }, [dispatch, pageParam]);

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
        if (error) {
            dispatch(showModal({
                title: 'Admin Failed',
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

    let tableAdmins = admins;

    const handleUpdateClick = (admin) => {
        dispatch(showModal({ title: 'Updating Account' }));

        dispatch(setUpdateAccData({ field: 'id', value: admin.id }));
        dispatch(setUpdateAccData({ field: 'fname', value: admin.fname }));
        dispatch(setUpdateAccData({ field: 'lname', value: admin.lname }));
        dispatch(setUpdateAccData({ field: 'email', value: admin.email }));
        dispatch(setUpdateAccData({ field: 'admin_name', value: admin.admin_name }));
        dispatch(setUpdateAccData({ field: 'contact', value: admin.contact }));
    }

    const handleDeleteClick = (admin) => {
        dispatch(setUpdateAccData({ field: 'id', value: admin.id }));

        dispatch(showModal({
            title: 'Deleting Account',
            message: 'Are you sure about deleting this account?'
        }));
    }

    const handleUpdatedYesClick = async () => {
        try {
            await dispatch(updateAdminTable({ ...updateAccData })).unwrap();
            handleSuccessOperation('Updated Account', 'An account has been updated');
            dispatch(adminTable());

        } catch (err) {
            dispatch(showModal({
                title: 'Update Account Failed',
                message: err
            })) 
        }
    }

    const handleDeletedYesClick = async () => {
        try {
            await dispatch(deleteAdminTable({ id: updateAccData.id })).unwrap();
            handleSuccessOperation('Deleted Account', 'An account has been deleted');
            dispatch(adminTable());

        } catch (err) {
            dispatch(showModal({
                title: 'Delete Account Failed',
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
            <div className='admin-dashboard-main-container'>
                <div className='admin-dashboard-table-container'>
                    {windowWidth > 1200 && (
                        <Table className='admin-dashboard-table' hover>
                            <thead className='admin-dashboard-table-header'>
                                <tr>
                                    <th>Operator Name</th>
                                    <th>Email</th>
                                    <th>Auth Type</th>
                                    <th>Status</th>
                                    <th>Verified</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody className='admin-dashboard-table-body'>
                                {Array.isArray(tableAdmins) && tableAdmins.length > 0 ? (
                                    tableAdmins.map((admin, index) => (
                                        <tr key={index} className='admin-dashboard-table-row'>
                                            <td>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            {`${admin.fname?.trim() || ''} ${admin.lname?.trim() || ''}`.trim() || '-'}
                                                        </Tooltip>
                                                    }>
                                                    <span>{`${admin.fname?.trim() || ''} ${admin.lname?.trim() || ''}`.trim() || '-'}</span>
                                                </OverlayTrigger>
                                            </td>

                                            <td>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            {admin.email || '-'}
                                                        </Tooltip>
                                                    }>
                                                    <span>{admin.email || '-'}</span>
                                                </OverlayTrigger>
                                            </td>

                                            <td>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            {admin.authType || '-'}
                                                        </Tooltip>
                                                    }>
                                                    <span>{admin.authType || '-'}</span>
                                                </OverlayTrigger>
                                            </td>

                                            <td>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            {admin.isActive ? 'Active' : 'Not Active'}
                                                        </Tooltip>
                                                    }>
                                                    <span>{admin.isActive ? 'Active' : 'Not Active'}</span>
                                                </OverlayTrigger>
                                            </td>

                                            <td>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            {admin.verified ? 'Yes' : 'No'}
                                                        </Tooltip>
                                                    }>
                                                    <span>{admin.verified ? 'Yes' : 'No'}</span>
                                                </OverlayTrigger>
                                            </td>

                                            <td>
                                                <div className='admin-dashboard-table-action-buttons'>
                                                    <Button onClick={() => handleUpdateClick(admin)}>Edit</Button>
                                                    <Button onClick={() => handleDeleteClick(admin)}>Delete</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6}>No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}

                    {windowWidth <= 1200 && (
                        <ListGroup className='admin-dashboard-listgroup-container'>
                            {Array.isArray(tableAdmins) && tableAdmins.length > 0 ? (
                                tableAdmins.map((admin, index) => {
                                    return (
                                        <ListGroup.Item
                                            key={index}>
                                            <div className='admin-dashboard-listgroup-row'>
                                                <span className='admin-dashboard-listgroup-label'>Operator Name:</span>
                                                <span>{`${admin.fname?.trim() || ''} ${admin.lname?.trim() || ''}`.trim() || '-'}</span>
                                            </div>
                                            <div className='admin-dashboard-listgroup-row'>
                                                <span className='admin-dashboard-listgroup-label'>Email:</span>
                                                <span>{admin.email}</span>
                                            </div>
                                            <div className='admin-dashboard-listgroup-row'>
                                                <span className='admin-dashboard-listgroup-label'>Auth Type:</span>
                                                <span>{admin.authType}</span>
                                            </div>
                                            <div className='admin-dashboard-listgroup-row'>
                                                <span className='admin-dashboard-listgroup-label'>Status:</span>
                                                <span>{admin.isActive ? 'Active' : 'Not Active'}</span>
                                            </div>
                                            <div className='admin-dashboard-listgroup-row'>
                                                <span className='admin-dashboard-listgroup-label'>Verified:</span>
                                                <span>{admin.verified ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className='admin-dashboard-listgroup-button-container'>
                                                <Button className='admin-dashboard-button' onClick={() => handleUpdateClick(admin)}>Edit</Button>
                                                <Button className='admin-dashboard-button' onClick={() => handleDeleteClick(admin)}>Delete</Button>
                                            </div>
                                        </ListGroup.Item>
                                    )
                                })
                            ) : (
                                <ListGroup.Item>No data available</ListGroup.Item>
                            )}

                        </ListGroup>
                    )}
                </div>

                <Modals
                    show={show}
                    hide={handleModalClose}
                    title={title}
                    message={message}

                    OK={
                        title === 'Confirmation Timeout Failed' ||
                        title === 'Admin Failed' ||
                        title === 'Update Account Failed' || 
                        title === 'Delete Account Failed' ||
                        title === 'Updated Account' ||
                        title === 'Deleted Account'
                    }

                    handleYesClick={
                        title === 'Deleting Account'
                    }

                    handleModalYesClick={
                        title === 'Updating Account' && handleUpdatedYesClick ||
                        title === 'Deleting Account' && handleDeletedYesClick
                    }

                    handleNoClick={
                        title === 'Deleting Account'
                    }

                    update_acc={ title === 'Updating Account' ? updateAccData : null }
                    update_acc_buttons={ title === 'Updating Account'}
                    handleUpdateAccSubmit={handleUpdatedYesClick}
                />
            </div>
        </>
    );
}