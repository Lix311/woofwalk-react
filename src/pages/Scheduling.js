import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, ListGroup, Card, Button, Form } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Scheduling.css';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingsContext';

const BASE_URL="http://localhost:5000"

const Scheduling = () => {
  const [bookings, setBookings] = useState([]); // All bookings
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDogs, setAllDogs] = useState([]);
  const [ownerDogs, setOwnerDogs] = useState([]);
  const maxSlotsPerDay = 10; // Updated to 10 slots per day

  const { authState } = useAuth();
  const { selectedDog, setSelectedDog, handleBookWalk, cancelBooking } = useBooking();

  // Fetch all bookings
  const fetchAllBookings = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bookings`);
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

  // Fetch all dogs
  const fetchAllDogs = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/dogs`);
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

  // Fetch owner-specific dogs
  const fetchOwnerDogs = useCallback(async () => {
    if (authState.user) {
      try {
        const response = await fetch(`${BASE_URL}/api/dogs/owner/${authState.user.id}`);
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
        // Create new date object to avoid modifying selectedDate directly
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, 0, 0, 0);
        slots.push(slotDate);
      }
      return slots;
    };
  
    const slots = generateTimeSlots();
    const currentTime = new Date();
  
    // Helper function to check if the slot is in the past or today
    const isPastOrToday = (slot) => {
      const slotDate = new Date(slot);
      return slotDate.toDateString() === currentTime.toDateString() || slot < currentTime;
    };
  
    // Filter slots to exclude past or today’s times
    const filteredSlots = slots.filter((slot) => {
      const isPastTime = isPastOrToday(slot);
      const isMaxSlotsReached = bookings.filter((booking) =>
        new Date(booking.walkId.startTime).toDateString() === selectedDate.toDateString()
      ).length >= maxSlotsPerDay;
  
      return !isPastTime && !isMaxSlotsReached;
    });
  
    // Limit slots after current time (to avoid showing future slots beyond 12pm)
    const availableSlots = filteredSlots.filter((slot) => {
      // Only show available times for the remaining slots if max slots are not yet reached
      return (
        bookings.filter(
          (booking) =>
            new Date(booking.walkId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ===
              slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) &&
            new Date(booking.walkId.startTime).toDateString() === selectedDate.toDateString()
        ).length === 0 &&
        filteredSlots.length <= maxSlotsPerDay
      );
    });
  
    setAvailableTimes(availableSlots);
  }, [selectedDate, bookings]);
  

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();

      // Check all bookings, not just the user's
      const allBookings = bookings.filter(
        (booking) => new Date(booking.walkId.startTime).toDateString() === dateStr
      );

      // Check if fully booked
      if (allBookings.length >= maxSlotsPerDay) {
        return 'react-calendar__tile--fully-booked'; // Fully booked class
      }

      // Check if the user has bookings on this date
      const userBookings = allBookings.filter(
        (booking) => booking.ownerId._id === authState.user.id
      );

      if (userBookings.length > 0) {
        return 'react-calendar__tile--user-booked'; // User booked class
      }
    }
    return null;
  };

  if (!authState.user) return <p>Please log in to view the scheduling page.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Filter bookings based on user ID
  const userBookings = bookings.filter(booking => booking.ownerId._id === authState.user.id);

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
                tileClassName={tileClassName}
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
              <Card.Title>Your Bookings for This Month</Card.Title>
              <ListGroup>
                {userBookings
                  .filter((booking) => {
                    const bookingDate = new Date(booking.walkId.startTime);
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
                  })
                  .map((booking) => {
                    const isPastBooking = new Date(booking.walkId.startTime) < new Date();

                    return (
                      <ListGroup.Item key={booking._id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Dog:</strong> {booking.dogId.name} <br />
                          <strong>Date:</strong> {new Date(booking.walkId.startTime).toLocaleString()}
                        </div>
                        {!isPastBooking && (
                          <Button
                            variant="danger"
                            onClick={() => cancelBooking(booking._id, booking.walkId._id, fetchAllBookings)}
                          >
                            Cancel Booking
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
