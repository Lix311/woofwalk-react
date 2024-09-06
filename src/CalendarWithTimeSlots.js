// CalendarWithTimeSlots.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Modal, Button } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import './CalendarStyles.css'; // Custom styles if needed

const availableTimeSlots = {
  '2024-09-05': ['09:00 AM', '10:00 AM', '11:00 AM'],
  '2024-09-06': ['01:00 PM', '02:00 PM', '03:00 PM'],
  '2024-09-07': ['09:00 AM', '12:00 PM', '04:00 PM'],
};

const CalendarWithTimeSlots = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState(null);

  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleBookAppointment = (time) => {
    setSelectedTime(time);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/walks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          // Add other required fields here
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule walk');
      }

      console.log('Walk scheduled successfully');
      setShowBookingModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={({ date }) => {
          const dateString = date.toISOString().split('T')[0];
          return availableTimeSlots[dateString] ? 'highlighted-date' : null;
        }}
      />

      {selectedDate && (
        <div>
          <h3>Available Time Slots for {selectedDate.toDateString()}</h3>
          <div>
            {availableTimeSlots[selectedDate.toISOString().split('T')[0]]?.map((time, index) => (
              <div key={index}>
                <span>{time}</span>
                <Button
                  variant="primary"
                  onClick={() => handleBookAppointment(time)}
                  className="ml-2"
                >
                  Book Appointment
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <p>Are you sure you want to book an appointment for {selectedDate?.toDateString()} at {selectedTime}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBookingSubmit}>
            Confirm Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarWithTimeSlots;
