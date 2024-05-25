/**  ---------------------------------- Construct Date Object ---------------------------------- *
* @param date <string> YYYY-MM-DD
* @param time <string> HH:MM:SS
* @returns <Date Object>
//  -------------------------------------------------------------------------------------------- */

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

const constructDateObject = (date, time) => {
  if (!date || !time) throw new Error("Invalid Request: Missing Required Data");
  date = formatDate(date);
  time = formatTime(time);
  
  const dateRegex = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}?$/;
  const timeRegex = /^[0-9]{2}:[0-9]{2}:[0-9]{2}?$/;

  if (!dateRegex.test(date) || !timeRegex.test(time)) {
    throw new Error("Invalid Date or Time Format.");
  }
  return new Date(date + " " + time);
};

module.exports = { constructDateObject };
