// This function receives data and returns a user object.
// It ensures that the user object is formatted correctly.

const getCustomer = (data) => {
  try {
    // Create user object
    const customer = {
      id: data.id,
      date_created: data.date_created,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      drivers_license_front: data.drivers_license_front,
      drivers_license_back: data.drivers_license_back,
      stripeId: data.stripeId,
      payment_methods: data.payment_methods,
      preferences: data.preferences || {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      },
    };

    if (data.address)
      customer.address = {
        street: data.address?.street,
        city: data.address?.city,
        state: data.address?.state,
        country: data.address?.country,
        zip: data.address?.zip,
      };

    if (data.default_payment_method)
      customer.default_payment_method = {
        id: data.default_payment_method?.id,
        brand: data.default_payment_method?.brand,
        last4: data.default_payment_method?.last4,
      };

    if (data.plan)
      customer.plan = {
        active: data.plan?.active,
        date_created: data.plan?.date_created,
        id: data.plan?.id,
        name: data.plan?.name,
        subscriptionId: data.plan?.subscriptionId,
        start_date: data.plan?.start_date,
        renewal_date: data.plan?.renewal_date,
        end_date: data.plan?.end_date,
        trial: data.plan?.trial,
        rate: data.plan?.rate,
      };

    if (data.booking) {
      customer.booking = {
        id: data.booking?.id,
        vehicleId: data.booking?.vehicleId,
        start_date: data.booking?.start_date,
        end_date: data.booking?.end_date,
        make: data.booking?.make,
        model: data.booking?.model,
        year: data.booking?.year,
        license: data.booking?.license,
        image: data.booking?.image,
      }
    }

    // Return user
    return customer;

    // Handle Error
  } catch (err) {
    throw new Error(`Error formatting user object: ${err.message}`);
  }
};

module.exports = { getCustomer };
