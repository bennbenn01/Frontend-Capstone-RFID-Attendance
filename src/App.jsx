import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-datepicker/dist/react-datepicker.css'
import { Spinner } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { checkPaidLogout } from './store/api/appThunks'
import { showModal, hideModal, clearError } from './store/slices/modalsSlice'
import { clearConfirmationLogoutData } from './store/slices/appSlice'
import { attendanceTable } from './store/api/attendanceThunks'
import { useQueryClient } from '@tanstack/react-query'
import { paymentButaw, paymentBoundary } from './store/api/paymentThunks'
import PrivateRoute from './hoc/PrivateRoute/PrivateRoute'
import PrivateVeriftyEmail from './hoc/PrivateVerifyEmail/PrivateVerifyEmail'
import SocketManager from './hoc/SocketManager/SocketManager'
import { initializeCsrfToken } from './utils/axios'
import Header from './components/Header/Header'
import Modals from './components/Modals/Modals'
import './App.css'

const Login = lazy(() => import('./pages/Login/Login'))
const Sign_up = lazy(() => import('./pages/Sign_up/Sign_up'))
const Forgot_Password = lazy(() => import('./pages/Forgot_Password/Forgot_Password'))
const Verify_Email = lazy(() => import('./pages/Verify_Email/Verify_Email'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Manage_Users = lazy(() => import('./pages/Manage_Users/Manage_Users'))
const Logs = lazy(() => import('./pages/Logs/Logs'))
const Payment = lazy(() => import('./pages/Payment/Payment'))
const Attendance = lazy(() => import('./pages/Attendance/Attendance'))
const Data_Analytics = lazy(() => import('./pages/Data_Analytics/Data_Analytics'))
const About_Us = lazy(() => import('./pages/About_Us/About_Us'))

const LoadingSpinner = () => {
  return(
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <Spinner animation='border' role='status'/>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();

  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const { confirmLogoutData } = useSelector((state) => state.app);
  const { paymentFormData } = useSelector((state) => state.modal);
  const { show, title, message, error } = useSelector((state) => state.modal);

  const queryClient = useQueryClient();

  useEffect(() => {
    initializeCsrfToken();
  }, [])

  useEffect(() => {
    if(error){
        dispatch(showModal({
            title: 'Confirmation Timeout Failed',
            message: error
        }));

        window.errorTimeoutId = setTimeout(() => {
            dispatch(clearError());
            window.errorTimeoutId = null;
        }, 5000);
        
        return () => {
            if(window.errorTimeoutId){
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

  if(isLoading){
    return <LoadingSpinner />
  }

  const handleSuccessOperation = (title, message) => {
      dispatch(clearError());

      if(window.errorTimeoutId){
          clearTimeout(window.errorTimeoutId);
          window.errorTimeoutId = null;
      }

      dispatch(showModal({
          title,
          message
      }));
  }

  const handleConfirmLogoutSubmit = async (driver) => {
    if (!isAuthenticated) return;

    try{
      await dispatch(checkPaidLogout({
        id: driver.id,
        driver_id: driver.driver_id
      })).unwrap();
      dispatch(showModal({
        title: 'Timeout Complete',
        message: 'Driver has time out completely'
      }));
    } catch (err) {
      dispatch(showModal({
          title: 'Confirmation Timeout Failed',
          message: err
      }))
    }
  }

  const handlePaymentButawYesClick = async () => {
    if (!isAuthenticated) return;

    try {
      await dispatch(paymentButaw(paymentFormData)).unwrap();
      handleSuccessOperation('Updated Payment', 'An payment was updated');
      dispatch(attendanceTable());

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
    if (!isAuthenticated) return;

    try {
      await dispatch(paymentBoundary(paymentFormData)).unwrap();
      handleSuccessOperation('Updated Payment', 'An payment was updated');
      dispatch(attendanceTable());

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

  const handleModalClose = () => {
    dispatch(clearError());
    dispatch(hideModal());
    dispatch(clearConfirmationLogoutData());
  }

  return (
    <>
      <Router>
        <SocketManager/>

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path='/login' element={<><Login/></>}/>
            <Route path='/sign-up' element={<><Sign_up/></>}/>
            <Route path='/forgot-password' element={<><Forgot_Password/></>}/>

            <Route path='/verify-email' element={
              <PrivateVeriftyEmail>
                <Verify_Email/>
              </PrivateVeriftyEmail>
            }/>

            <Route path='/dashboard' element={
              <PrivateRoute allowedRoles={['admin']}>
                <Header/><Dashboard/>
              </PrivateRoute>
            }/>

            <Route path='/manage-users' element={
              <PrivateRoute allowedRoles={['admin']}>
                <Header/><Manage_Users/>
              </PrivateRoute>
            }/>

            <Route path='/logs' element={
              <PrivateRoute allowedRoles={['admin']}>
                <Header/><Logs/>
              </PrivateRoute>
            }>
              <Route index element={<><Attendance/></>}/>
              <Route path='payment-logs' element={<><Payment/></>}/>
              <Route path='data-analytics' element={<><Data_Analytics/></>}/>
            </Route>

            <Route path='/about-us' element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Header/><About_Us/>
                </PrivateRoute>
            }/>

            <Route path='*' element={<><Login/></>}/>
          </Routes>
          
          {isAuthenticated && (
            <Modals
              show={(show && 
                title === 'Confirmation Timeout' ||
                title === 'Timeout Complete' 
              )}
              hide={handleModalClose}
              title={title}
              message={message}

              OK={
                title === 'Confirmation Timeout Failed' ||
                title === 'Updated Payment' ||
                title === 'Timeout Complete'
              }

              handleYesClick={
                title === 'Confirmation of Payment of Butaw' ||
                title === 'Confirmation of Payment of Boundary'
              }

              handleModalYesClick={
                title === 'Confirmation of Payment of Butaw' && handlePaymentButawYesClick  ||
                title === 'Confirmation of Payment of Boundary' && handlePaymentBoundaryYesClick
              }

              handleNoClick={
                title === 'Confirmation of Payment of Butaw' ||
                title === 'Confirmation of Payment of Boundary'
              }

              return_time_out_msg={title === 'Confirmation Timeout' && confirmLogoutData}
              handleConfirmLogoutSubmit={
                title === 'Confirmation Timeout' && confirmLogoutData
                  ? () => handleConfirmLogoutSubmit(confirmLogoutData) 
                  : undefined
              }

              payment_buttons={title === 'Payment'}
            />
          )}
        </Suspense>
      </Router>
    </>
  )
}

export default App