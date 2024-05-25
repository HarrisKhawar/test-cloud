const sendSignal = async (vehicle, action) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Vehicle Smartcar
      const smartcar = vehicle.smartcar;
      if (!smartcar);
    } catch (err) {
      resolve(false);
    }
  });
};
