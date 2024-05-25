const validateEditVehicle = (request) => {
  if (!request.id) {
    throw new Error("Invalid Request: Vehicle ID not provided.");
  }
  if (!request.make || !request.model || !request.year) {
    throw new Error("Invalid Request: Make, Model, or Year not provided.");
  }
  if (!request.license || !request.vin) {
    throw new Error("Invalid Request: License Plate or VIN not provided.");
  }
  if (
    !request.trim ||
    !request.drive ||
    !request.fuel ||
    !request.seats ||
    !request.doors ||
    !request.color
  ) {
    throw new Error(
      "Invalid Request: Trim, Drive, Fuel Type, Seats, Color or Doors not provided."
    );
  }
  if (!request.plan || !request.plan.name || !request.plan.id) {
    throw new Error("Invalid Request: Plan not provided.");
  }
  if (!request.rates || !request.rates.daily || !request.rates.monthly) {
    throw new Error("Invalid Request: Rates not provided.");
  }
  if (!request.status) {
    throw new Error("Invalid Request: Status not provided.");
  }
  if (!request.images.corner) {
    throw new Error("Invalid Request: Corner Image not provided.");
  }

  return true;
};

module.exports = { validateEditVehicle };
