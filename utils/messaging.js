const twilio = require('twilio');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


const scheduleTourneyNotifications = async function(tourneyObj, playerTag, phone_number) {
    /*
    console.log(tourneyObj)
    console.log(playerTag)
    console.log(phone_number)
    */
    try {
        for (const [key, value] of Object.entries(tourneyObj)) {
            createTourneyNotification(key, value, playerTag, phone_number)
                .then(result => {
                    if (result == false) {
                        throw new Error('Failed to schedule messages')
                    }
                })
        }
    }
    catch (err) {
        console.log(err)
        return Promise.resolve(false);

    }
    return Promise.resolve(true)
}

const createTourneyNotification = async function(tourneyName, timestamp, playerTag, phone_number) {
    client.messages
      .create({
         messagingServiceSid: `${process.env.TWILIO_MSG_SERVICE_SID}`,
         body: `${playerTag} will be playing at ${tourneyName} today!`,
         sendAt: new Date(timestamp * 1000),
         scheduleType: 'fixed',
         statusCallback: 'https://webhook.site/15195681-2d59-4ea5-ae39-c0978a8969c5',
         to: `+1${phone_number}`
       })
      .then(message => {
        return Promise.resolve(true)
      }).catch(err => {
        console.log("BRUH")
        console.log(err);
        return Promise.resolve(false);
      })
}
module.exports.scheduleTourneyNotifications = scheduleTourneyNotifications
