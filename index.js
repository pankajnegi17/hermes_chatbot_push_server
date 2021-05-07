const express = require("express");
const webPush = require("web-push");
const https = require('https');
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");
const uuid = require("uuid").v1;
require("dotenv").config();
const fs = require('fs');

// var privateKey = fs.readFileSync('server.key', 'utf8');
// var certificate  = fs.readFileSync('server.cert', 'utf8');

var privateKey = fs.readFileSync('server-private-key.pem');
var certificate  = fs.readFileSync('server-public-key.crt');

var credentials = {key: privateKey, cert: certificate}



const format = require("pg-format");
const {
  getDateTime,
  sendNotiTo,
  getTimeString,
  get_Day,
  get_Date,
} = require("./services/push_map_services");
const {
  update_subscription,
  save_subscription,
  get_all_subscription,
  get_subscriptions_by_emails,
  update_reminder_status,
  delete_subscription,
  save_calender_alert,
} = require("./services/push_db_services");
const mailer = require("./mailer");

/*const vapidKeys = webPush.generateVAPIDKeys();
console.log(vapidKeys)
Setting FCM or GCM
webpush.setGCMAPIKey('<Your GCM API Key Here>');*/

webPush.setVapidDetails(
  "mailto:pnegi.dun@gmail.com",
  process.env.publicVapidKey,
  process.env.privateVapidKey
);

const app = express();

app.use(cors());
const clientFolder = path.join(__dirname, "client");
app.use(express.static(clientFolder));
app.use(bodyParser.json());

app.get("/deleteSubs", (req, res) => {
  delete_subscription();
  res.status(200).json({});
});

app.post("/createCalenderAlert", (req, res) => {
  //UserList
  const userlist = ["alvian@hermes.com"];
  //PAyload
  const payload = JSON.stringify({
    title: req.body.title,
  });
  //Calculating time
  var now = new Date();
  var millisTill10 = get_Date(req.body.time) - now;
  // if (millisTill10 < 0) {
  //   millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
  // }
  const time_string = getTimeString(req.body.time);
  const reminder_id = uuid();
  save_calender_alert(millisTill10, time_string, users, reminder_id)
    .then((result) => {
      console.log("Reminder saved");
    })
    .catch((err) => {
      console.log(err);
    });

  setTimeout(() => {
    console.log("Alert");
    get_subscriptions_by_emails(userlist)
      .then((result) => {
        sendNotiTo(result.rows, payload);
      })
      .catch((err) => {
        console.log(err);
      });
    update_reminder_status(reminder_id, "completed");
      //Sending via mail
  mailer(["pnegi.dun@gmail.com"], req.body.title);

  }, millisTill10);


  //Send 201 - resourse created
  res.status(201).json({});
});

/* This will create alerts for a given time and will remind the user time to time */
app.post("/createClockAlert", (req, res) => {
  //UserList
  const userlist = ["alvian@hermes.com"];
  //Calculating time
  var now = new Date();
  var reminder_date = get_Date(req.body.time);
  var millisTill10 = reminder_date - now;
  console.log("reminder_date", reminder_date);
  console.log("now", now);
  console.log("milloseconds :" + millisTill10);
  if (millisTill10 < 0) {
    res.status(201).json({});
    return;
  }
  var milli_day = get_Day(req.body.time) - now;
  var milli_30_before = reminder_date - now - 60000 * 30;
  var milli_10_before = reminder_date - now - 60000 * 2;
  var milli_5_before = reminder_date - now - 60000 * 1;
  var milli_0_before = millisTill10;
  const timeArray = [
    milli_0_before,
    milli_5_before,
    milli_10_before,
    milli_30_before,
    milli_day,
  ];
 

  for (let i = 0; i < timeArray.length; i++) {
    if (timeArray[i] < 1) {
      break;
    }
    //PAyload
    const payload = JSON.stringify({
      title: "Hey! This is a Reminder for your next appointment",
    });

    const time_string = getTimeString(req.body.time);
    const reminder_id = uuid();
    const users = format(
      `ARRAY[ 'pnegi.dun@gmail.com'  ,  'pankajnegi@botaiml.com' ]`
    );

    save_calender_alert(millisTill10, time_string, users, reminder_id);

    setTimeout(() => {
      get_subscriptions_by_emails(userlist)
        .then((result) => {
          sendNotiTo(result.rows, payload);
        })
        .catch((err) => {
          console.log(err);
        });
            //Sending via mail
    mailer(["pnegi.dun@gmail.com"], req.body.title);
      update_reminder_status(reminder_id, "completed");
    }, timeArray[i]);


  }
  //Send 201 - resourse created
  res.status(201).json({});
});

app.get("/", function (req, res) {
  res.sendfile(path.join(clientFolder, "index.html"));
});

//default route
app.get("/dwnloadFile", function (req, res) {
  res.download(path.join(clientFolder, "datafile.txt"));
});

//Subscripe route
app.post("/subscribe", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  //Get push subscription object
  const subscribtion = req.body; 
  const subscriber = JSON.stringify(subscribtion);
  const email = req.query.email_id;
  const login_time = new Date();
  const first_name = req.query.first_name;

  //Persist subscription
  save_subscription(subscriber, email, first_name)
    .then((msg) => {
      //Preparing welcome message
      const payload = JSON.stringify({ title: "Welcome to Our family" });
      //Pass object  into sendNotification
      setTimeout(
        () =>
          webPush
            .sendNotification(subscribtion, payload)
            .catch((err) => console.log(err)),
        5000
      );
    })
    .catch((error) => {
      console.log("Subscriber aleady exist", error.message);
      //create payload
      const payload = JSON.stringify({ title: "Welccome again" });
      //If user already registered --> Upadte the subscription
      update_subscription(email, subscriber)
        .then((msg) => { 
        })
        .catch((err) => console.log(err));

      //Pass object  into sendNotification
      setTimeout(() => {
        webPush
          .sendNotification(subscribtion, payload)
          .catch((err) => console.log(err));
      }, 5000);
    });

  //Send 201 - resourse created
  res.status(201).json({});
});

app.post("/notifySubs", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  const subs_list = ["alvian@hermes.com", "ronytan@hermes.com"];

  let userlist = subs_list.join();

  const payload = JSON.stringify({ title: "Push test" });

  get_subscriptions_by_emails(userlist)
    .then((result) => {
      sendNotiTo(result.rows, payload);
    })
    .catch((err) => {
      console.log(err);
    });

  //Send Mail
  mailer(["pnegi.dun@gmail.com"], "Push Test");

  res.status(201).json({});
});

app.get("/notifyAllSubs", (req, res) => {
  console.log("Notifing started")
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  ); 
  const payload = JSON.stringify({ title: "Message From Hermes" });

  //Send Mail
  // mailer(["pnegi.dun@gmail.com"], "Push test");
  console.log("Fetching all subscribers")
  get_all_subscription()
    .then((result) => {
      let subscribers = result.rows;
      // console.log(subscribers);
      sendNotiTo(subscribers, payload); 
    })
    .catch((err) => {
      console.log("ERR OCCURED", err);
    });
  res.status(201).json({});
});

const port = process.env.PORT;

var httpsServer = https.createServer(credentials, app)
httpsServer.listen(port);


//app.listen(port, () => console.log(`Server is running on ${port}`));
