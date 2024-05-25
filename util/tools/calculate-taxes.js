const calculateTaxes = (bookingFee) => {
    const taxes = bookingFee * 0.015;
    return taxes
}

module.exports = { calculateTaxes };