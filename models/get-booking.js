// This function receives data and returns a booking object.
// It ensures that the booking object is formatted correctly.

const getBooking = (data) => {
  try {
    // Create booking object
    const booking = {
      id: data.id,
      date_created: data.date_created,
      start_date: data.start_date,
      end_date: data.end_date,
      location: data.location.trim(),
      pick_up_location: data.pick_up_location.trim(),
      drop_off_location: data.drop_off_location.trim(),
      delivery: data.delivery,
      paymentId: data.paymentId.trim(),
      status: data.status.trim(),
      check_in_images: data.check_in_images,
      price: {
        booking: data.price?.booking,
        delivery: data.price?.delivery,
        taxes: data.price?.taxes,
        total: data.price?.total,
        total_days: data.price?.total_days,
      },
      customer: {
        id: data.customer?.id,
        firstName: data.customer?.firstName,
        lastName: data.customer?.lastName,
        phone: data.customer?.phone,
        email: data.customer?.email,
        plan: data.customer?.plan,
      },
      vehicle: {
        id: data.vehicle?.id,
        image: data.vehicle?.image,
        license: data.vehicle?.license,
        make: data.vehicle?.make,
        model: data.vehicle?.model,
        year: data.vehicle?.year,
      },
    };

    // Return booking object
    return booking;

    // Handle Error
  } catch (err) {
    throw new Error(`Error formatting booking object: ${err.message}`);
  }
};

module.exports = { getBooking };
