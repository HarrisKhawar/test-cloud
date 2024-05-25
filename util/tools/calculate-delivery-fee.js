const calculateDeliveryFee = (pick, drop) => {
    let deliveryFee = 0;

    if (pick) deliveryFee += 60;
    if (drop) deliveryFee += 60;

    return deliveryFee.toFixed(2);
}

module.exports = { calculateDeliveryFee };