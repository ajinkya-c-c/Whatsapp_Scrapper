// require('electron-reload')(__dirname);
// const { app, BrowserWindow, ipcMain } = require('electron');
// const { Client, AuthStrategy, LocalAuth } = require('whatsapp-web.js');
// const QRCode = require('qrcode');
// const path = require('path');
// const Main = require('electron/main');

// let mainWindow;

// // Create Electron window
// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//             enableRemoteModule: true,
//         }
//     });

//     // Load the HTML file to display the QR code
//     mainWindow.loadFile(path.join(__dirname, 'index.html'));
// }




// // Initialize WhatsApp client
// const client = new Client();

// client.on('qr', (qr) => {
//     QRCode.toDataURL(qr, (err, url) => {
//         if (err) {
//             console.error('Failed to generate QR code:', err);
//         } else {
//             mainWindow.webContents.send('qr', url);
//         }
//     });
// });

// client.on('authenticated', () => {
//   console.log('Client Authenticated!'); // Debug log
//   mainWindow.webContents.send('authenticated');
// });

// client.on('ready', async () => {
//   console.log('WhatsApp Web is ready!'); // Debug log
//   mainWindow.webContents.send('ready');

//   const chats = await client.getChats();
//   console.log('chats-', chats)

// //   const chatsWithPics = await Promise.all(chats.map(async (chat) => {
// //       let picUrl = await client.getProfilePicUrl(chat.id._serialized);
// //       if (!picUrl) {
// //           picUrl = chat.isGroup ? 'https://via.placeholder.com/40/25D366/fff?text=G' : 'https://via.placeholder.com/40/128C7E/fff?text=P';
// //       }
// //       console.log(picUrl)
// //       return { name: chat.name || chat.formattedTitle, picUrl, isGroup: chat.isGroup };
// //   }));
// //   useEffect(() => {
// //     console.log('chatsWithPics', chatsWithPics)
  
// //   }, [])
  

//   console.log('Sending chats to renderer'); // Debug log
//   mainWindow.webContents.send('chats', chats);
// });


// client.initialize();


// // Electron app lifecycle
// app.whenReady().then(() => {
//     createWindow();

//     app.on('activate', () => {
//         if (BrowserWindow.getAllWindows().length === 0) {
//             createWindow();
//         }
//     });
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });





const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');

let mainWindow;

// Create Electron window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    // Load the HTML file to display the QR code
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

// Initialize WhatsApp client with LocalAuth for persistent login
const client = new Client();

client.on('qr', (qr) => {
    // Convert the QR code string to a QR image (data URL)
    QRCode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Failed to generate QR code:', err);
        } else {
            // Send the QR code data URL to the renderer process
            mainWindow.webContents.send('qr', url);
        }
    });
});

// Listen for successful authentication
client.on('authenticated', () => {
    console.log('Client authenticated!');
    mainWindow.webContents.send('authenticated');
});

// When WhatsApp is ready, fetch and display contacts/groups
client.on('ready', async () => {
    console.log('WhatsApp Web is ready!');
    
    // Fetch the chats (contacts and groups)
    const chats = await client.getChats();
    console.log(chats);

    // For each chat, get profile picture URL
    const chatsWithPics = await Promise.all(chats.map(async (chat) => {
        let picUrl = await client.getProfilePicUrl(chat.id._serialized); // Fetch profile picture URL
        if (!picUrl) {
            picUrl = chat.isGroup 
                ? 'https://via.placeholder.com/40/25D366/fff?text=G' // Placeholder for groups
                : 'https://via.placeholder.com/40/128C7E/fff?text=P'; // Placeholder for contacts
        }
        return { name: chat.name || chat.formattedTitle, picUrl, isGroup: chat.isGroup };
    }));

    // Send chats with profile pictures to the renderer process
    mainWindow.webContents.send('chats', chatsWithPics);
});

// Initialize the client
client.initialize();

// Handle Electron app lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
