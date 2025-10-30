import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransaction } from '../../store/api/transactionThunks'
import { clearTransaction } from '../../store/slices/transactionSlice'
import { Container, Table, Button, Spinner, Modal } from 'react-bootstrap'
import '../../styles/Invoice.css'; 

const Invoice = () => {
  const dispatch = useDispatch();
  const { transaction, loading, error } = useSelector((state) => state.transaction);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTransaction());
    return () => {
      dispatch(clearTransaction());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) setShowModal(true);
  }, [error]);

  const handleClose = () => setShowModal(false);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!transaction) return null;

  const { driver_id, fullname, email, contact, amount, status, details, createdAt } = transaction;
  const now = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalButaw = details?.reduce((sum, d) => sum + Number(d.butaw || 0), 0) || 0;
  const totalBoundary = details?.reduce((sum, d) => sum + Number(d.boundary || 0), 0) || 0;
  const totalBalance = details?.reduce((sum, d) => sum + Number(d.balance || 0), 0) || 0;

  return (
    <>
      <Container className="my-5">
        <div className="invoice-container p-4 bg-white shadow rounded mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-success mb-1">Blumantoda</h3>
            <div>505 F.Manalo St. San Juan City</div>
            <strong>Statement of Account (SOA)</strong>
          </div>

          <Table borderless className="mb-4">
            <tbody>
              <tr>
                <td><strong>Driver ID:</strong> {driver_id}</td>
                <td><strong>Status:</strong> <span className={status === 'Unpaid' ? 'text-danger' : 'text-success'}>{status}</span></td>
              </tr>
              <tr>
                <td><strong>Name:</strong> {fullname}</td>
                <td><strong>Email:</strong> {email}</td>
              </tr>
              <tr>
                <td colSpan={2}><strong>Contact:</strong> {contact}</td>
              </tr>
            </tbody>
          </Table>

          <h5 className="mb-3">Daily Payment Breakdown</h5>
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Butaw (₱)</th>
                <th>Boundary (₱)</th>
                <th>Balance (₱)</th>
                <th>Daily Total (₱)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {details && details.length > 0 ? (
                details.map((detail, index) => {
                  const dailyTotal =
                    Number(detail.butaw || 0) +
                    Number(detail.boundary || 0) +
                    Number(detail.balance || 0);
                  return (
                    <tr key={index}>
                      <td>{new Date(detail.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>₱{Number(detail.butaw || 0).toFixed(2)}</td>
                      <td>₱{Number(detail.boundary || 0).toFixed(2)}</td>
                      <td>₱{Number(detail.balance || 0).toFixed(2)}</td>
                      <td><strong>₱{dailyTotal.toFixed(2)}</strong></td>
                      <td>
                        <span className={detail.paid === 'Not Paid' ? 'text-danger' : 'text-success'}>
                          {detail.paid}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No outstanding payments
                  </td>
                </tr>
              )}
            </tbody>
            {details && details.length > 0 && (
              <tfoot className="table-light">
                <tr>
                  <th>Total</th>
                  <th>₱{totalButaw.toFixed(2)}</th>
                  <th>₱{totalBoundary.toFixed(2)}</th>
                  <th>₱{totalBalance.toFixed(2)}</th>
                  <th>₱{(totalButaw + totalBoundary + totalBalance).toFixed(2)}</th>
                  <th></th>
                </tr>
              </tfoot>
            )}
          </Table>

          <div className="border-top pt-3 mt-4">
            <Table borderless className="mb-0">
              <tbody>
                <tr>
                  <td className="text-end"><strong>Total Butaw:</strong></td>
                  <td><strong>₱{totalButaw.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td className="text-end"><strong>Total Boundary:</strong></td>
                  <td><strong>₱{totalBoundary.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td className="text-end"><strong>Total Balance:</strong></td>
                  <td><strong>₱{totalBalance.toFixed(2)}</strong></td>
                </tr>
                <tr className="border-top">
                  <td className="text-end"><h5 className="mb-0">Grand Total:</h5></td>
                  <td><h5 className="mb-0 text-danger">₱{Number(amount).toFixed(2)}</h5></td>
                </tr>
              </tbody>
            </Table>
          </div>

          <div className="text-center my-3"><strong>Generated on {now}</strong></div>

          <div className="text-center text-muted small">
            <p>This document serves as proof of transaction for Blumantoda.</p>
            <p>For inquiries, contact <strong>blumantoda@gmail.com</strong></p>
          </div>

          <div className="text-center mt-4 no-print">
            <Button variant="success" onClick={() => window.print()}>
              Download / Print SOA
            </Button>
          </div>
        </div>

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{error}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Invoice;