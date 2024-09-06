import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // Adjust the import path as necessary

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authState } = useAuth(); // Access authState from useAuth

  useEffect(() => {
    if (!authState?.user?.id) return; // Exit if user ID is not available

    const fetchPayments = async () => {
      try {
        const ownerId = authState.user.id;
        const response = await fetch(`http://localhost:5000/api/payments/owner/${ownerId}`); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        setError('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [authState?.user?.id]); // Add authState.user.id as a dependency

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Payments</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Status</th> {/* New column for payment status */}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index}>
              <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              <td>${payment.amount.toFixed(2)}</td>
              <td>{payment.paymentMethod}</td>
              <td>{payment.status}</td> {/* Display the payment status */}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Payments;
