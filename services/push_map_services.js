const webPush = require("web-push");

const getDateTime= (time)=> {
    return time;
}


//Push method
const sendNotiTo =(subscribers, payload) => {
    for (let i = 0; i < subscribers.length; i++) {
      webPush
        .sendNotification(JSON.parse(subscribers[i].subscriber), payload)
        .catch((err) => console.log(err));
    }
  }

const getTimeString = (time) =>{
  const year = time.year;
  const month = time.month - 1;
  const date = time.date;
  const hour = time.hour;
  const minutes = time.minutes;
  const seconds = time.seconds;
  const mili_seconds = time.miliseconds;

const time_String =`${year}-${month}-${date}-${hour}-${minutes}-${seconds}-${mili_seconds}`

  return time_String
}


const get_Date = (time) =>{
  return new Date(time.year, time.month-1, time.date, time.hour, time.minutes, time.seconds, time.miliseconds)
}

const get_Day = (time) =>{
  return new Date(time.year, time.month-1, time.date, 0, 0, 0, 0)
}

module.exports.getDateTime = getDateTime;
module.exports.sendNotiTo = sendNotiTo;
module.exports.getTimeString = getTimeString
module.exports.get_Date = get_Date
module.exports.get_Day = get_Day