const formatPhoneNumber = (phone) => {
  
  if (typeof phone !== "string") throw new Error("Invalid Phone Number.");
  // Format Phone Number
  phone = phone.replace(/\D/g, "");
  if (phone.length === 10) {
    phone = "+1" + phone;
  }
  if (phone.length === 11) {
    phone = "+" + phone;
  }
  if (phone.length !== 12) {
    throw new Error("Invalid Phone Number.");
  }

  return phone;
};

module.exports = { formatPhoneNumber };
