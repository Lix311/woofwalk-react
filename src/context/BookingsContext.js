import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedDog, setSelectedDog] = useState(null);

  const handleBookWalk = async (timeSlot, authState, fetchBookings) => {
    if (!selectedDog) {
      alert('Please select a dog before booking.');
      return;
    }

    const walkerId = '66c63ca7a283afffb1194d38'; // Replace with actual walker ID
    const ownerId = authState.user.id;

    const newWalk = {
      startTime: timeSlot.toISOString(),
      endTime: new Date(timeSlot.getTime() + 60 * 60 * 1000).toISOString(), // 1-hour duration
      dogId: selectedDog,
      walkerId: walkerId,
      location: {
        lat: 40.7128,  // Replace with the actual latitude
        lng: -74.0060  // Replace with the actual longitude
      }
    };

    try {
      const walkResponse = await fetch('http://localhost:5000/api/walks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWalk),
      });

      if (!walkResponse.ok) {
        throw new Error('Failed to create walk');
      }

      const walkData = await walkResponse.json();
      const walkId = walkData._id;

      const bookingData = {
        walkerId,
        ownerId,
        dogId: selectedDog,
        walkId,
        status: 'pending',
      };

      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await bookingResponse.json();
      console.log('Booking successful:', result);
      
      fetchBookings();
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to book walk');
    }
  };

  const cancelBooking = async (bookingId, walkId, fetchBookings) => {
    try {
      // First delete the walk
      await fetch(`http://localhost:5000/api/walks/${walkId}`, {
        method: 'DELETE',
      });

      // Then delete the booking
      await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      console.log('Booking and walk canceled successfully.');
      fetchBookings();
    } catch (err) {
      console.error('Error canceling booking:', err);
      alert('Failed to cancel walk');
    }
  };

  return (
    <BookingContext.Provider value={{ selectedDog, setSelectedDog, handleBookWalk, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
