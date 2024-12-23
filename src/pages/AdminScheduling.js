import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, ListGroup, Card, Button, Form, Modal } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminScheduling.css';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingsContext';
import { useModal } from '../context/ModalContext';

const BASE_URL = "http://localhost:5000";

const AdminScheduling = () => {
  const [bookings, setBookings] = useState([]); // All bookings
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Selected time slot for the modal
  


  const [availableTimes, setAvailableTimes] = useState([]);
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDogs, setAllDogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [ownerDogs, setOwnerDogs] = useState([]);

  const [meetGreetScheduled, setMeetGreetScheduled] = useState(false);
  const maxSlotsPerDay = 10; // Updated to 10 slots per day

  const { authState } = useAuth();
  const { selectedUser, setSelectedUser, selectedDog, setSelectedDog, selectedWalkTime, setSelectedWalkTime, cancelBooking, loadingSlots, loadingWeekSlots, loadingMonthSlots, handleAdminMonth, handleAdminWeek, handleAdminWalk } = useBooking();
  const { showBookWeekModal, setShowBookWeekModal } = useModal();
  const { showBookMonthModal, setShowBookMonthModal } = useModal();

  // Open and close modal handlers
  const handleOpenBookMonthModal = (timeSlot) => {
    
    if (!selectedDog) {
      alert("Please select a dog before booking.");
      return;
    }

    if (!selectedWalkTime) {
      alert("Please select a time before booking.");
      return;
    }

    setSelectedTimeSlot(timeSlot);
  
    // Get the start and end of the month for the selected date
    const { startOfMonth, endOfMonth } = getStartAndEndOfMonth(selectedDate);
  
    // Filter bookings to find unavailable times during the month
    const unavailableFromBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.walkId.startTime);
      return (
        bookingDate >= new Date(startOfMonth) &&
        bookingDate <= new Date(endOfMonth) &&
        bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ===
          timeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    });
  
    // Add logic to include times from the start of the month to today's date
    const today = new Date();
    const unavailableFromPastDays = [];
    if (today >= new Date(startOfMonth)) {
      let currentDate = new Date(startOfMonth);
  
      while (currentDate <= today) {
        unavailableFromPastDays.push({
          date: currentDate.toDateString(),
          time: timeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        currentDate.setDate(currentDate.getDate() + 1); // Increment day
      }
    }
  
    // Combine and remove duplicates by using a Set
    const allUnavailableTimeSlots = [];
  
    const seen = new Set(); // To track unique "date + time" combinations
  
    // Add unavailable times from bookings
    unavailableFromBookings.forEach((booking) => {
      const unavailableTime = new Date(booking.walkId.startTime);
      const key = `${unavailableTime.toDateString()}-${unavailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
      if (!seen.has(key)) {
        seen.add(key);
        allUnavailableTimeSlots.push({
          date: unavailableTime.toDateString(),
          time: unavailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });
  
    // Add unavailable times from past days
    unavailableFromPastDays.forEach((pastTime) => {
      const key = `${pastTime.date}-${pastTime.time}`;
      if (!seen.has(key)) {
        seen.add(key);
        allUnavailableTimeSlots.push(pastTime);
      }
    });
  
    // Sort all unavailable times chronologically
    allUnavailableTimeSlots.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
  
    // Set unavailable time slots and open modal
    setUnavailableTimeSlots(allUnavailableTimeSlots);
    setShowBookMonthModal(true);
  };
  
  
  
  

  const handleCloseBookMonthModal = () => {
    setSelectedTimeSlot(null);
    setShowBookMonthModal(false);
  };

  const handleOpenBookWeekModal = (timeSlot) => {
    
    
    if (!selectedDog) {
      alert("Please select a dog before booking.");
      return;
    }

    if (!selectedWalkTime) {
      alert("Please select a time before booking.");
      return;
    }
  
    setSelectedTimeSlot(timeSlot);
  
    // Get the start and end of the week for the selected date
    const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(selectedDate);
  
    // Ensure startOfWeek and endOfWeek are Date objects
    const startOfWeekDate = new Date(startOfWeek);
    const endOfWeekDate = new Date(endOfWeek);
  
    // Normalize to ensure startOfWeek and endOfWeek have the same time format as booking.walkId.startTime
    startOfWeekDate.setHours(0, 0, 0, 0); // Set to midnight of the start day
    endOfWeekDate.setHours(23, 59, 59, 999); // Set to the last moment of the end day
  
    // Filter bookings to find unavailable times during the week
    const unavailableFromBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.walkId.startTime);
      
      // Check if the booking date is within the start and end of the week
      return (
        bookingDate >= startOfWeekDate &&
        bookingDate <= endOfWeekDate &&
        bookingDate.getHours() === timeSlot.getHours() &&
        bookingDate.getMinutes() === timeSlot.getMinutes()
      );
    });
  
    // Add logic to include times from the start of the week to today's date
    const today = new Date();
    const unavailableFromPastDays = [];
    if (today >= startOfWeekDate) {
      let currentDate = new Date(startOfWeekDate);
  
      while (currentDate <= today) {
        unavailableFromPastDays.push({
          date: currentDate.toDateString(),
          time: timeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        currentDate.setDate(currentDate.getDate() + 1); // Increment day
      }
    }
  
    // Combine and remove duplicates by using a Set
    const allUnavailableTimeSlots = [];
    const seen = new Set(); // To track unique "date + time" combinations
  
    // Add unavailable times from bookings
    unavailableFromBookings.forEach((booking) => {
      const unavailableTime = new Date(booking.walkId.startTime);
      const key = `${unavailableTime.toDateString()}-${unavailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
      if (!seen.has(key)) {
        seen.add(key);
        allUnavailableTimeSlots.push({
          date: unavailableTime.toDateString(),
          time: unavailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });
  
    // Add unavailable times from past days
    unavailableFromPastDays.forEach((pastTime) => {
      const key = `${pastTime.date}-${pastTime.time}`;
      if (!seen.has(key)) {
        seen.add(key);
        allUnavailableTimeSlots.push(pastTime);
      }
    });
  
    // Sort all unavailable times chronologically
    allUnavailableTimeSlots.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
  
    // Set unavailable time slots and open modal
    setUnavailableTimeSlots(allUnavailableTimeSlots);
    setShowBookWeekModal(true);
  };
  
  
  const handleCloseBookWeekModal = () => {
    setSelectedTimeSlot(null);
    setShowBookWeekModal(false);
  };

  function getStartAndEndOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return {
      startOfMonth: startOfMonth.toDateString(),
      endOfMonth: endOfMonth.toDateString(),
    };
  }
  

  function getStartAndEndOfWeek(date) {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);
  
    // Adjusting the start of the week to Monday (assuming Sunday is the start of the week)
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;  // If today is Sunday (0), this will set it to 6 (last week)
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    
    // Setting the end of the week (Sunday)
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  
    // Formatting both dates to strings
    return {
      startOfWeek: startOfWeek.toDateString(),
      endOfWeek: endOfWeek.toDateString(),
    };
  }





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


  // Fetch all Users
  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
    fetchAllDogs();
    fetchAllUsers();
  }, [fetchAllBookings, fetchAllDogs, fetchAllUsers]);

  useEffect(() => {
    const fetchOwnerDogs = async () => {
      if (selectedUser) {
        try {
          const response = await fetch(`${BASE_URL}/api/dogs/owner/${selectedUser}`);
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
    };
  
    fetchOwnerDogs();
  }, [selectedUser]); // Trigger only when `selectedUser` changes

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

  const handleScheduleMeetAndGreet = async () => {
    try {
      // Destructure user info
      const { id, email, firstName } = authState.user;
      
      // Send request to backend to schedule meet and greet
      const response = await fetch(`${BASE_URL}/api/users/schedule-meet-greet`, {
        method: 'POST',
        body: JSON.stringify({ userId: id, userEmail: email, ownerName: firstName }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        setMeetGreetScheduled(true);
      } else {
        setMeetGreetScheduled(false);
      }
    } catch (err) {
      console.error('Error scheduling meet and greet:', err);
      setMeetGreetScheduled(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();



      const allBookings = bookings.filter(
        (booking) => new Date(booking.walkId.startTime).toDateString() === dateStr
      );


      if (allBookings.length >= maxSlotsPerDay) {
        return 'react-calendar__tile--fully-booked';
      }
      
      const userBookings = allBookings.filter(
        (booking) => booking.ownerId._id === authState.user.id
      );
    
      if (userBookings.length > 0) {
        return 'react-calendar__tile--user-booked';
      }
    }
    return null;
  };

  if (!authState.user) return <p>Please log in to view the scheduling page.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!authState.user.isMeetGreetVerified) {
    return (
      <Container className="mt-4">
        <div className="meet-greet-container">
          <h1>Schedule a Meet and Greet</h1>
          <Button variant="primary" onClick={handleScheduleMeetAndGreet}>
            Schedule Meet and Greet
          </Button>
          {meetGreetScheduled && (
            <p className="mt-3 text-success">
              Thank you! Owner Alex will contact you soon to schedule the meet and greet.
            </p>
          )}

        </div>
      </Container>
    );
  }
  

  // Filter bookings based on user ID
  const userBookings = bookings.filter(booking => booking.ownerId._id === authState.user.id);

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Admin Scheduling</h1>
      <Row>
        <Col md={6}>
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
  
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Select a Dog</Card.Title>
              <Form.Group controlId="selectUser">
                <Form.Label>Select User</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => setSelectedUser(e.target.value)}
                  value={selectedUser}
                >
                  <option value="">Select a User</option>
                  {allUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName + " " + user.lastName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="selectDog" className="mt-3">
                <Form.Label>Choose a Dog for the Walk</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => setSelectedDog(e.target.value)}
                  value={selectedDog}
                  disabled={!selectedUser}
                >
                  <option value="">Select a Dog</option>
                  {ownerDogs.map((dog) => (
                    <option key={dog._id} value={dog._id}>
                      {dog.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="walkTimeSelect" className="mt-3">
                <Form.Label>Select Walk Time</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedWalkTime}
                  onChange={(e) => setSelectedWalkTime(e.target.value)}
                >
                  <option value="">Select Walk Time</option>
                  <option value="30">30 mins</option>
                  <option value="60">1 hour</option>
                </Form.Control>
              </Form.Group>
              <Card.Title className="mt-4">
                Available Times for {selectedDate.toDateString()}
              </Card.Title>
              {availableTimes.length > 0 ? (
                <ListGroup>
                  {availableTimes.map((timeSlot, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {timeSlot.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
  
                      <Button
                        onClick={() => handleOpenBookWeekModal(timeSlot)}
                        className="book-week-button"
                        disabled={loadingWeekSlots[timeSlot.toISOString()]}
                      >
                        {loadingWeekSlots[timeSlot.toISOString()] ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Booking...
                          </>
                        ) : (
                          "Book Week"
                        )}
                      </Button>
  
                      <Button
                        onClick={() => handleOpenBookMonthModal(timeSlot)}
                        className="book-month-button"
                        disabled={loadingMonthSlots[timeSlot.toISOString()]}
                      >
                        {loadingMonthSlots[timeSlot.toISOString()] ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Booking...
                          </>
                        ) : (
                          "Book Month"
                        )}
                      </Button>
  
                      <Button
                        onClick={() => handleAdminWalk(timeSlot, fetchAllBookings)}
                        className="book-walk-button"
                        disabled={loadingSlots[timeSlot.toISOString()]}
                      >
                        {loadingSlots[timeSlot.toISOString()] ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Booking...
                          </>
                        ) : (
                          "Book Walk"
                        )}
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
      </Row>
  
      {/* BookMonth Modal */}
      <Modal show={showBookMonthModal} onHide={handleCloseBookMonthModal}>
        <Modal.Header closeButton>
          <Modal.Title>Monthly Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTimeSlot && (
            <>
              <p>
                This Month runs from <strong>{getStartAndEndOfMonth(selectedTimeSlot).startOfMonth}</strong> to <strong>{getStartAndEndOfMonth(selectedTimeSlot).endOfMonth}</strong>.
              </p>
              <p>Below dates are unavailable. Continue booking?</p>
              {unavailableTimeSlots.length > 0 ? (
                <ListGroup>
                  {unavailableTimeSlots.map((slot, index) => (
                    <ListGroup.Item key={index}>
                      {slot.date} - {slot.time}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No unavailable time slots for this Month.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBookMonthModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleAdminMonth(selectedTimeSlot, fetchAllBookings, unavailableTimeSlots);
              handleCloseBookMonthModal();
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
  
      {/* BookWeek Modal */}
      <Modal show={showBookWeekModal} onHide={handleCloseBookWeekModal}>
        <Modal.Header closeButton>
          <Modal.Title>Weekly Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTimeSlot && (
            <>
              <p>
                This week runs from <strong>{getStartAndEndOfWeek(selectedTimeSlot).startOfWeek}</strong> to <strong>{getStartAndEndOfWeek(selectedTimeSlot).endOfWeek}</strong>.
              </p>
              <p>Below dates are unavailable. Continue booking?</p>
              {unavailableTimeSlots.length > 0 ? (
                <ListGroup>
                  {unavailableTimeSlots.map((slot, index) => (
                    <ListGroup.Item key={index}>
                      {slot.date} - {slot.time}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No unavailable time slots for this week.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBookWeekModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleAdminWeek(selectedTimeSlot, fetchAllBookings, unavailableTimeSlots);
              handleCloseBookWeekModal();
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
  
};

export default AdminScheduling;