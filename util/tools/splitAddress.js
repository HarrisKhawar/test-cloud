const splitAddress = (address) => {
  try {
    const addrArr = address.trim().split(",");
    let street = "";
    let street2 = "";
    let city = "";
    let state = "";
    let zip = "";
    let country = "";

    const splitStateZip = (stateZip) => {
      const split = stateZip.trim().split(" ");
      if (split.length !== 2 || split[1].length !== 5)
        throw new Error("Invalid Address Format: Must match: Main Street Apt 1, City, State 12345");
      return {
        state: split[0],
        zip: split[1],
      };
    };

    // Check Format: Main Street, Apt 1, City, State 12345
    if (addrArr.length === 4 && addrArr[3].length !== 2) {
      street = addrArr[0].trim();
      street2 = addrArr[1].trim();
      city = addrArr[2].trim();
      const stateZip = splitStateZip(addrArr[3]);
      state = stateZip.state;
      zip = stateZip.zip;
      country = "US";
    // Check Format: Main Street, City, State 12345
    } else if (addrArr.length === 3) {
      street = addrArr[0].trim();
      city = addrArr[1].trim();
      const stateZip = splitStateZip(addrArr[2]);
      state = stateZip.state;
      zip = stateZip.zip;
      country = "US";
    // Check Format: Main Street Apt 1, City, State 12345, US
    } else if (addrArr.length === 4) {
      street = addrArr[0].trim();
      city = addrArr[1].trim();
      const stateZip = splitStateZip(addrArr[2]);
      state = stateZip.state;
      zip = stateZip.zip;
      if (addrArr[3].length !== 2) throw new Error("Invalid Address Format: Must match: Main Street Apt 1, City, State 12345");
      country = addrArr[3].trim();
    } else {
      throw new Error("Invalid Address Format: Must match: Main Street Apt 1, City, State 12345");
    }

    return {
      street: street,
      street2: street2,
      city: city,
      state: state,
      zip: zip,
      country: country,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = splitAddress;
