import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Card, Button } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../context/AuthContext';

const Scheduling = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authState } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!authState?.user?.id) {
        console.log('No user ID available.');
        setLoading(false);
        return;
      }

      try {
        const ownerId = authState.user.id;
        const response = await fetch(`http://localhost:5000/api/bookings/owner/${ownerId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [authState]);

  useEffect(() => {
    const generateTimeSlots = () => {
      const slots = [];
      const startHour = 8;
      const endHour = 18;
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(new Date(selectedDate.setHours(hour, 0, 0, 0)));
      }
      return slots;
    };

    const slots = generateTimeSlots();

    // Filter out the slots that are already booked
    const filteredSlots = slots.filter((slot) => {
      return !bookings.some(
        (booking) =>
          new Date(booking.walkId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ===
          slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) &&
          new Date(booking.walkId.startTime).toDateString() === selectedDate.toDateString()
      );
    });

    setAvailableTimes(filteredSlots);
  }, [selectedDate, bookings]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleBookWalk = (timeSlot) => {
    // Handle booking logic here
    console.log('Booking time slot:', timeSlot);
    // You might want to navigate to a booking page or show a form
  };

  if (!authState.user) return <p>Please log in to view your bookings.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Filter bookings to only include those for the selected date
  const filteredBookings = bookings.filter(
    (booking) => new Date(booking.walkId.startTime).toDateString() === selectedDate.toDateString()
  );

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Scheduling</h1>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Select a Date</Card.Title>
              <Calendar onChange={handleDateChange} value={selectedDate} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Available Times for {selectedDate.toDateString()}</Card.Title>
              {availableTimes.length > 0 ? (
                <ListGroup>
                  {availableTimes.map((timeSlot, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      {timeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <Button variant="primary" onClick={() => handleBookWalk(timeSlot)}>Book Walk</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No available times for the selected date.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Your Scheduled Walks</Card.Title>
              <ListGroup>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <ListGroup.Item key={booking._id}>
                      <strong>Dog:</strong> {booking.dogId.name} <br />
                      <strong>Walker:</strong> {booking.walkerId.firstName} {booking.walkerId.lastName} <br />
                      <strong>Start Time:</strong> {new Date(booking.walkId.startTime).toLocaleString()} <br />
                      <strong>End Time:</strong> {new Date(booking.walkId.endTime).toLocaleString()}
                    </ListGroup.Item>
                  ))
                ) : (
                  <p>No scheduled walks for the selected date.</p>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Scheduling;
