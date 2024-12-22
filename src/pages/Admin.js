import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table, Button, ButtonGroup } from 'react-bootstrap';

const AdminPage = () => {
  const { authState } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Combined state
  const [error, setError] = useState(null);
  const BASE_URL = 'http://localhost:5000';
  

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/admin-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const data = await response.json();
        setAdminData(data.data);
        debugger
      } catch (err) {
        setError(err.message);
      }
    };

    if (authState.token) {
      fetchAdminData();
    }
  }, [authState.token]);

  const handleCheckboxToggle = (bookingId, paymentId) => {
    const itemId = `${bookingId}-${paymentId}`; // Unique identifier for booking and payment pair
    setSelectedItems((prev) => {
      const updatedSet = new Set(prev);
      if (updatedSet.has(itemId)) {
        updatedSet.delete(itemId);
      } else {
        updatedSet.add(itemId);
      }
      return updatedSet;
    });
  };

  const updatePaymentStatus = async (status) => {
    try {
      const selectedPaymentIds = Array.from(selectedItems).map((item) => item.split('-')[1]);
      console.log('Selected Payments:', selectedPaymentIds);

      const response = await fetch(`${BASE_URL}/api/payments/update-payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          paymentIds: selectedPaymentIds,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const updatedPayments = await response.json();

      setAdminData((prevState) => ({
        ...prevState,
        bookings: prevState.bookings.map((booking) => ({
          ...booking,
          paymentDetails: booking.paymentDetails.map((payment) =>
            updatedPayments.some((updated) => updated._id === payment._id)
              ? { ...payment, status }
              : payment
          ),
        })),
      }));

      setSelectedItems(new Set()); // Clear selection
    } catch (error) {
      console.error('Error updating payment status:', error.message);
    }
  };

  // FUTUR NOTE: WHY DOESNT /BATCH WORK?
  const deleteBookings = async () => {
    try {
      const selectedBookingIds = Array.from(selectedItems).map((item) => item.split('-')[0]);
      console.log('Deleting bookings:', selectedBookingIds);
      console.log("Sending request with body:", { bookingIds: [...new Set(selectedBookingIds)] });
  
      // Loop through each booking ID and send individual DELETE requests
      const deletePromises = selectedBookingIds.map(async (bookingId) => {
        // Find the booking from adminData to get the walkId
        const booking = adminData.bookings.find((booking) => booking._id === bookingId);
        const walkId = booking?.walkDetails?._id;
  
        if (!walkId) {
          throw new Error(`Walk ID not found for booking ${bookingId}`);
        }
  
        // First, delete the walk associated with the booking
        const walkResponse = await fetch(`${BASE_URL}/api/walks/${walkId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
        });
  
        if (!walkResponse.ok) {
          throw new Error(`Failed to delete walk with ID: ${walkId}`);
        }
  
        // Now, delete the booking itself
        const bookingDeleteResponse = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
        });
  
        if (!bookingDeleteResponse.ok) {
          throw new Error(`Failed to delete booking with ID: ${bookingId}`);
        }
  
        return bookingId; // Return the bookingId to track which bookings were deleted
      });
  
      // Wait for all the delete requests to complete
      const deletedBookingIds = await Promise.all(deletePromises);
  
      console.log('Deleted bookings and walks:', deletedBookingIds);
  
      // Update state to remove deleted bookings
      setAdminData((prevState) => ({
        ...prevState,
        bookings: prevState.bookings.filter(
          (booking) => !deletedBookingIds.includes(booking._id)
        ),
      }));
  
      setSelectedItems(new Set()); // Clear selection
    } catch (error) {
      console.error('Error deleting bookings and walks:', error.message);
    }
  };
  
  

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>
      {error && <div className="alert alert-danger">Error: {error}</div>}
      {adminData ? (
        <div>
          <h2>Bookings</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Select</th>
                <th>Owner Name</th>
                <th>Dog Name</th>
                <th>Walk Info</th>
                <th>Walk Time</th>
                <th>Total Payment</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {adminData.bookings.map((booking) => (
                <tr key={booking._id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={booking.paymentDetails.some(
                        (payment) => selectedItems.has(`${booking._id}-${payment._id}`)
                      )}
                      onChange={() =>
                        booking.paymentDetails.forEach((payment) =>
                          handleCheckboxToggle(booking._id, payment._id)
                        )
                      }
                    />
                  </td>
                  <td>{`${booking.ownerDetails.firstName} ${booking.ownerDetails.lastName}`}</td>
                  <td>{booking.dogDetails.name}</td>
                  <td>
                    {booking.walkDetails
                      ? `${new Date(booking.walkDetails.startTime).toLocaleString()} to ${new Date(
                          booking.walkDetails.endTime
                        ).toLocaleString()}`
                      : 'N/A'}
                  </td>
                  <td>{booking.walkDetails ? booking.walkDetails.walkTime : 'N/A'}</td>
                  <td>
                    {booking.paymentDetails && booking.paymentDetails.length > 0
                      ? `$${booking.paymentDetails
                          .reduce((total, payment) => total + payment.amount, 0)
                          .toFixed(2)}`
                      : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        color:
                          booking.paymentDetails?.[0]?.status === 'completed'
                            ? 'green'
                            : 'red',
                        marginLeft: '10px',
                      }}
                    >
                      {booking.paymentDetails?.[0]?.status === 'completed'
                        ? 'PAID'
                        : 'UNPAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-end mt-3">
            <ButtonGroup>
              <Button
                variant="success"
                className="me-2"
                onClick={() => updatePaymentStatus('completed')}
                disabled={selectedItems.size === 0}
              >
                Mark Paid
              </Button>
              <Button
                variant="warning"
                className="me-2"
                onClick={() => updatePaymentStatus('pending')}
                disabled={selectedItems.size === 0}
              >
                Mark Unpaid
              </Button>
              <Button
                variant="danger"
                onClick={deleteBookings}
                disabled={selectedItems.size === 0}
              >
                Delete Booking
              </Button>
            </ButtonGroup>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AdminPage;
