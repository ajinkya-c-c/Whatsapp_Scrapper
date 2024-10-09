const { ipcRenderer } = require('electron');

ipcRenderer.on('display-qr', (event, qrImage) => {
    document.getElementById('qr-code').src = qrImage; // Update img element with QR code
});

// Optional: Close the application from the renderer
document.getElementById('close-btn').addEventListener('click', () => {
    ipcRenderer.send('close-app');
});
