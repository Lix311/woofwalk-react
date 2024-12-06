import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();
const BASE_URL="http://localhost:5000"

// Step 1: Example Walk
// const walkResponse = await fetch(`${BASE_URL}/api/walks`, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify(newWalk),
// });


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
      // Step 1: Create the walk
      const walkResponse = await fetch(`${BASE_URL}/api/walks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWalk),
      });
  
      if (!walkResponse.ok) {
        throw new Error('Failed to create walk');
      }
  
      const walkData = await walkResponse.json();
      const walkId = walkData._id;
  
      // Step 2: Create the booking
      const bookingData = {
        walkerId,
        ownerId,
        dogId: selectedDog,
        walkId,
        status: 'pending',
      };
  
      const bookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
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
  
      const booking = await bookingResponse.json();
      const bookingId = booking._id;
  
      // Step 3: Create the payment
      const paymentData = {
        amount: 50.00, // Example amount
        paymentMethod: 'credit_card', // Or 'paypal', etc.
        bookingId: bookingId, // Reference the booking
        ownerId: ownerId, // Who is paying
        status: 'pending'
      };

      //debugger 
  
      const paymentResponse = await fetch(`${BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(paymentData),
      });
      debugger
      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }
  
      const paymentResult = await paymentResponse.json();
      console.log('Payment successful:', paymentResult);
  
      // Step 4: Update the booking status to 'confirmed' or 'paid'
      const updateBookingData = { status: 'confirmed' }; // Example status
  
      const updateBookingResponse = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(updateBookingData),
      });
  
      if (!updateBookingResponse.ok) {
        throw new Error('Failed to update booking status');
      }
  
      const updatedBooking = await updateBookingResponse.json();
      console.log('Booking confirmed:', updatedBooking);
  
      // Step 5: Refresh bookings list
      fetchBookings();
      
    } catch (err) {
      console.error('Error creating booking and payment:', err);
      alert('Failed to book walk and process payment');
    }
  };
  

  const cancelBooking = async (bookingId, walkId, fetchBookings) => {
    try {
      // First delete the walk
      await fetch(`${BASE_URL}/api/walks/${walkId}`, {
        method: 'DELETE',
      });

      // Then delete the booking
      await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
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