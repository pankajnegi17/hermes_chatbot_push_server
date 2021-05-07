const pg = require("pg");

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "GunungFirstPOCDB",
  password: "postgres",
  port: 5432,
});

const update_subscription = (user, subscription) => {
  return new Promise((resolve, reject) => {
    const dbQuery = `UPDATE public.subscribers_data
        SET subscriber= '${subscription}', last_login=to_timestamp(${Date.now()} / 1000.0), active=true
        WHERE email_id = '${user}';`;
    pool.query(dbQuery, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve("Subscription Updated");
      }
    });
  });
};

const save_subscription = (subscriber, email, first_name) => {
  return new Promise((resolve, reject) => {
    const dbQuery = `insert into subscribers_data VALUES('${subscriber}', '${email}', to_timestamp(${Date.now()} / 1000.0), true,  '${first_name}')`;
    pool.query(dbQuery, (err, result) => {
      if (err) {
        console.log("Subscriber saved failed")
        reject(err);
      } else {
        console.log("Subscriber saved")
        resolve("Subscriber saved");
      }
    });
  });
};

const delete_subscription = (user) => {
  const dbQuery = `DELETE FROM public.subscribers_data`;
  pool.query(dbQuery, (err, result) => {
    if (err) {
      reject();
    } else {
      resolve("Subscribers deleted");
    }
  });
};

const get_all_subscription = () => {
  return new Promise((resolve, reject) => {
    const dbQuery = `select subscriber from subscribers_data`;
    pool.query(dbQuery, (err, result) => {
      if (err) {
        console.log("Error in get_all_subscriber: ",err)
        reject(err);
      } else {
        console.log("Result of get_all_subscribers: ",result)
        resolve(result);
      }
    });
  });
};

const get_subscriptions_by_emails = (emails) => {
  return new Promise((resolve, reject) => {
    const dbQuery = `SELECT subscriber	FROM public.subscribers_data  WHERE  "email_id" = any('{${emails}}'::text[])`;
    pool.query(dbQuery, (err, result) => {
      if (err) {
        reject();
      } else {
        resolve(result);
      }
    });
  });
};

const update_reminder_status = (reminder_id, status) => {
  return new Promise((resolve, reject) => {
    const dbQuery = `UPDATE public.reminders
    SET   status='completed' 
    WHERE reminder_id= '${reminder_id}'`;
    pool.query(dbQuery, (err, result) => {
      if (err) {
        reject();
      } else {
        resolve("Status change for Reminder ID:" + reminder_id);
      }
    });
  });
};

const save_calender_alert = (millisTill10, time_string, users, reminder_id) => {
  return new Promise((resolve, reject) => {
    const dbQuery = `INSERT INTO public.reminders(duration, base_time, notification_data,  subscribers, status, reminder_id) VALUES
    ('${millisTill10}', '${time_string}',  '{"aa":"asdad"}', ${users}, 'upcoming', '${reminder_id}')`;

    pool.query(dbQuery, (err, result) => {
      if (err) {
        reject();
      } else {
        resolve(result);
      }
    });
  });
};

module.exports.update_subscription = update_subscription;
module.exports.save_subscription = save_subscription;
module.exports.get_all_subscription = get_all_subscription;
module.exports.get_subscriptions_by_emails = get_subscriptions_by_emails;
module.exports.update_reminder_status = update_reminder_status;
module.exports.delete_subscription = delete_subscription;
module.exports.save_calender_alert = save_calender_alert;
