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
  const [loadingSlots, setLoadingSlots] = useState({}); // Track loading state for each slot
  const [loadingWeekSlots, setLoadingWeekSlots] = useState({});


  const handleBookWeek = async (timeSlot, authState, fetchBookings, unavailableTimes = []) => {
    console.log("calling BookWeek");
  
    if (!selectedDog) {
      alert("Please select a dog before booking.");
      return;
    }
  
    const walkerId = '66c63ca7a283afffb1194d38'; // Replace with actual walker ID
    const ownerId = authState.user.id;
  
    // Helper function to calculate Monday of the current week
    const getMonday = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };
  
    // Helper function to generate dates for the week (Monday to Sunday)
    const generateWeekDates = (monday, timeSlot) => {
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        date.setHours(timeSlot.getHours(), timeSlot.getMinutes(), 0, 0);
        dates.push(date);
      }
      return dates;
    };
  
    const today = new Date();
    const monday = getMonday(timeSlot);
    const weekDates = generateWeekDates(monday, timeSlot);
  
    // Set loading state for all the week slots
    setLoadingWeekSlots((prev) => {
      const newLoadingWeekSlots = { ...prev };
      weekDates.forEach((day) => {
        newLoadingWeekSlots[day.toISOString()] = true;
      });
      return newLoadingWeekSlots;
    });
  
    // Iterate through each date and book the walk
    for (const day of weekDates) {
      // Skip the unavailable dates
      const unavailable = unavailableTimes.some((unavailableTime) => {
        // Format both date and time to compare
        const unavailableDate = new Date(unavailableTime.date);
  
        // Extract hours and minutes from the "time" string
        const [time, modifier] = unavailableTime.time.split(" "); // Split AM/PM
        const [hours, minutes] = time.split(":"); // Split hours and minutes
  
        // Adjust hour to 24-hour format if needed
        let hoursIn24 = parseInt(hours, 10);
        if (modifier === "PM" && hoursIn24 !== 12) {
          hoursIn24 += 12;
        }
        if (modifier === "AM" && hoursIn24 === 12) {
          hoursIn24 = 0;
        }
  
        // Set the time on the unavailableDate
        unavailableDate.setHours(hoursIn24, parseInt(minutes, 10), 0, 0);
  
        return day.getTime() === unavailableDate.getTime(); // Compare both time and date
      });
  
      if (unavailable) {
        console.log(`Skipping unavailable time: ${day.toISOString()}`);
        continue; // Skip booking for this day
      }
  
      const newWalk = {
        startTime: day.toISOString(),
        endTime: new Date(day.getTime() + 60 * 60 * 1000).toISOString(), // 1-hour duration
        dogId: selectedDog,
        walkerId: walkerId,
        location: {
          lat: 40.7128, // Replace with the actual latitude
          lng: -74.0060, // Replace with the actual longitude
        },
      };
  
      try {
        // Create the walk
        const walkResponse = await fetch(`${BASE_URL}/api/walks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newWalk),
        });
  
        if (!walkResponse.ok) {
          throw new Error("Failed to create walk");
        }
  
        const walkData = await walkResponse.json();
        const walkId = walkData._id;
  
        // Create the booking
        const bookingData = {
          walkerId,
          ownerId,
          dogId: selectedDog,
          walkId,
          status: "pending",
        };
  
        const bookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify(bookingData),
        });
  
        if (!bookingResponse.ok) {
          throw new Error("Failed to create booking");
        }
  
        const booking = await bookingResponse.json();
        const bookingId = booking._id;
  
        // Create the payment
        const paymentData = {
          amount: 50.0, // Example amount
          paymentMethod: "credit_card", // Or 'paypal', etc.
          bookingId: bookingId, // Reference the booking
          ownerId: ownerId, // Who is paying
          status: "pending",
        };
  
        const paymentResponse = await fetch(`${BASE_URL}/api/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify(paymentData),
        });
  
        if (!paymentResponse.ok) {
          throw new Error("Payment failed");
        }
  
        const paymentResult = await paymentResponse.json();
        console.log("Payment successful:", paymentResult);
  
        // Update the booking status to 'confirmed' or 'paid'
        const updateBookingData = { status: "confirmed" };
        const updateBookingResponse = await fetch(
          `${BASE_URL}/api/bookings/${bookingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify(updateBookingData),
          }
        );
  
        if (!updateBookingResponse.ok) {
          throw new Error("Failed to update booking status");
        }
  
        const updatedBooking = await updateBookingResponse.json();
        console.log("Booking confirmed:", updatedBooking);
      } catch (err) {
        console.error("Error creating booking and payment:", err);
        alert(`Failed to book walk for ${day.toISOString()}`);
      }
    }
  
    // Refresh bookings list after all requests are done
    fetchBookings();
    // Reset the week slots loading state after all the bookings are done
    setLoadingWeekSlots((prev) => {
      const newLoadingWeekSlots = { ...prev };
      weekDates.forEach((day) => {
        newLoadingWeekSlots[day.toISOString()] = false;
      });
      return newLoadingWeekSlots;
    });
  };
  
  
  
  
  


  const handleBookWalk = async (timeSlot, authState, fetchBookings) => {
    console.log("calling BookWalk")
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

    // Set loading state for this specific slot
  setLoadingSlots((prev) => ({
    ...prev,
    [timeSlot.toISOString()]: true
  }));
  
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

      
  
      const paymentResponse = await fetch(`${BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(paymentData),
      });

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
    } finally {

      setLoadingSlots((prev) => ({
        ...prev,
        [timeSlot.toISOString()]: false
      }));

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
    <BookingContext.Provider value={{ selectedDog, setSelectedDog, handleBookWalk, handleBookWeek, cancelBooking, loadingSlots, loadingWeekSlots }}>
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