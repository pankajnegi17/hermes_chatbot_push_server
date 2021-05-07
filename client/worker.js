console.log('Service worker loaded')

this.addEventListener('push', (e)=>{
    const data = e.data.json();
    console.log('Push has been received')
    this.registration.showNotification(data.title, {
        body: 'Notification By Pankaj',
        icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple113/v4/ee/91/eb/ee91ebc6-f7e6-2fa2-356e-d5930900691b/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/1200x630wa.png'
    });
})