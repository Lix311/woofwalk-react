import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, ListGroup, Card, Button, Form } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../CalendarWithTimeSlots.css';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingsContext';

const Scheduling = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDogs, setAllDogs] = useState([]);
  const [ownerDogs, setOwnerDogs] = useState([]);

  const { authState } = useAuth();
  const { selectedDog, setSelectedDog, handleBookWalk, cancelBooking } = useBooking();

  const fetchAllBookings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllDogs = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dogs');
      if (!response.ok) {
        throw new Error('Failed to fetch dogs');
      }
      const data = await response.json();
      setAllDogs(data);
    } catch (err) {
      console.error('Error fetching dogs:', err);
      setError('Failed to fetch dogs');
    }
  }, []);

  const fetchOwnerDogs = useCallback(async () => {
    if (authState.user) {
      try {
        const response = await fetch(`http://localhost:5000/api/dogs/owner/${authState.user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch owner dogs');
        }
        const data = await response.json();
        setOwnerDogs(data);
      } catch (err) {
        console.error('Error fetching owner dogs:', err);
        setError('Failed to fetch owner dogs');
      }
    }
  }, [authState.user]);

  useEffect(() => {
    fetchAllBookings();
    fetchAllDogs();
    fetchOwnerDogs();
  }, [fetchAllBookings, fetchAllDogs, fetchOwnerDogs]);

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

    const filteredSlots = slots.filter((slot) => {
      const isPastTime = slot < new Date();
      return (
        !isPastTime &&
        !bookings.some(
          (booking) =>
            new Date(booking.walkId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ===
              slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) &&
            new Date(booking.walkId.startTime).toDateString() === selectedDate.toDateString()
        )
      );
    });

    setAvailableTimes(filteredSlots);
  }, [selectedDate, bookings]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (!authState.user) return <p>Please log in to view the scheduling page.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const bookedDates = bookings.map((booking) =>
    new Date(booking.walkId.startTime).toDateString()
  );

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
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={({ date }) =>
                  bookedDates.includes(date.toDateString()) ? 'booked-date' : null
                }
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Select a Dog</Card.Title>
              <Form.Group controlId="selectDog">
                <Form.Label>Choose a Dog for the Walk</Form.Label>
                <Form.Control as="select" onChange={(e) => setSelectedDog(e.target.value)} value={selectedDog}>
                  <option value="">Select a Dog</option>
                  {ownerDogs.map((dog) => (
                    <option key={dog._id} value={dog._id}>
                      {dog.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Card.Title className="mt-4">Available Times for {selectedDate.toDateString()}</Card.Title>
              {availableTimes.length > 0 ? (
                <ListGroup>
                  {availableTimes.map((timeSlot, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      {timeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <Button
                        variant="primary"
                        onClick={() => handleBookWalk(timeSlot, authState, fetchAllBookings)}
                      >
                        Book Walk
                      </Button>
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
              <Card.Title>All Bookings for {selectedDate.toDateString()}</Card.Title>
              <ListGroup>
                {filteredBookings.map((booking) => {
                  const isPastBooking = new Date(booking.walkId.startTime) < new Date();
                  return (
                    <ListGroup.Item key={booking._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Dog:</strong> {booking.dogId.name} <br />
                        <strong>Owner:</strong> {booking.ownerId.firstName} {booking.ownerId.lastName} <br />
                        <strong>Time:</strong>{' '}
                        {new Date(booking.walkId.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        <br />
                        <strong>Date:</strong>{' '}
                        {new Date(booking.walkId.startTime).toLocaleDateString()}
                      </div>

                      {authState.user &&
                        booking.ownerId &&
                        booking.ownerId._id &&
                        authState.user.id.toString() === booking.ownerId._id.toString() && (
                          <Button
                            variant="danger"
                            onClick={() => cancelBooking(booking._id, booking.walkId._id, fetchAllBookings)}
                            disabled={isPastBooking}
                            title={isPastBooking ? 'Cannot cancel past walks' : ''}
                          >
                            Cancel Walk
                          </Button>
                        )}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Scheduling;
