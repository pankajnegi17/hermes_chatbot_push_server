// const { sendNotification } = require("web-push");

// import sendNotification from 'web-push'


const puublicVapidKey = 'BE84RnNoCCzbby8LeJ3YsbTs_enS74Dg9dg8XVfpBh1Q7DoFrSP5bM9LDaERfGSWzKsqiVLBNQrjZbUqPm_p73M';

//Chech for SW

if("serviceWorker" in navigator){
    send().catch(err=>console.error(err))
}

//Register the SW, Register Push, Send the Push
async function send(){
    console.log('Resitering service worker')
    const register = await navigator.serviceWorker.register('./worker.js', {
        scope: '/'
    })
    console.log('Service Worker Registered....')


    //Register Push
    console.log('Registering Push')
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(puublicVapidKey)
    })
    console.log('Push Registered')

    //Send Push Noti
    console.log('Sending Push')
    await fetch('./subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json'
        }
    });
    console.log('Push sent..')
}




function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
   
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
   
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
