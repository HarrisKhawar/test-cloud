// This function receives data and returns a vehicle object.
// It ensures that the vehicle object is formatted correctly.

const getVehicle = (data) => {
  try {
    if (!data.id) {
      throw new Error("Invalid data: Vehicle ID not provided.");
    }
    if (data.id.includes(" ")) {
      throw new Error("Invalid data: Follow proper naming conventions - bozo!");
    }
    if (!data.make || !data.model || !data.year) {
      throw new Error("Invalid data: Make, Model, or Year not provided.");
    }
    if (!data.location || !data.address) {
      throw new Error("Invalid data: Location or Address not provided.");
    }
    if (!data.license || !data.vin) {
      throw new Error("Invalid data: License Plate or VIN not provided.");
    }
    if (
      !data.trim ||
      !data.drive ||
      !data.fuel ||
      !data.seats ||
      !data.doors ||
      !data.color
    ) {
      throw new Error(
        "Invalid data: Trim, Drive, Fuel Type, Seats, Doors or Color not provided."
      );
    }
    if (!data.plan || !data.plan.name || !data.plan.id) {
      throw new Error("Invalid data: Plan not provided.");
    }
    if (!data.rates || !data.rates.daily || !data.rates.monthly || !data.rates.weekly) {
      throw new Error("Invalid data: Rates not provided.");
    }
    if (!data.status) {
      throw new Error("Invalid data: Status not provided.");
    }
    if (!data.images.corner) {
      throw new Error("Invalid data: Corner Image not provided.");
    }
    const vehicle = {
      id: data.id.trim(),
      make: data.make.trim(),
      model: data.model.trim(),
      year: data.year.trim(),
      address: data.address.trim(),
      location: data.location.trim(),
      license: data.license.trim(),
      vin: data.vin.trim(),
      trim: data.trim.trim(),
      color: data.color.trim(),
      doors: data.doors.trim(),
      seats: data.seats.trim(),
      drive: data.drive.trim(),
      fuel: data.fuel.trim(),
      status: {
        available: data.status?.available,
      },
      plan: {
        name: data.plan?.name.trim(),
        id: data.plan?.id,
      },
      rates: {
        daily: data.rates?.daily,
        monthly: data.rates?.monthly,
        weekly: data.rates?.weekly,
      },
      images: {
        corner: data.images?.corner || "",
        front: data.images?.front || "",
        back: data.images?.back || "",
        side: data.images?.side || "",
      },
      bookings: data.bookings || [],
    };

    // Return Vehicle
    return vehicle;

    // Handle Errors
  } catch (err) {
    throw new Error(`Error formatting vehicle object: ${err.message}`);
  }
};

module.exports = { getVehicle };
