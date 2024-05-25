const formatDate = (date) => {
  date.replaceAll("/", "-");
  if (date.length != 10) {
    throw new Error("Invalid date format.");
  }

  return date;
};

const formatTime = (time) => {
  time.replaceAll("-", ":");
  if (time.length != 8) {
    time += ":00";
  }
  if (time.length != 8) {
    throw new Error("Invalid time format.");
  }

  return time;
};

module.exports = { formatDate, formatTime };
