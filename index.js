const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { default: axios } = require('axios');


const COOLDOWN_TIME = 1 * 1000; 
const cooldownMap = new Map(); // Map untuk cooldown
const me = '6285757895223@c.us';

// Inisialisasi client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Menampilkan QR Code di terminal untuk login
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("Bot telah terhubung!");

    await client.sendMessage(me, 'Bot telah terhubung!');
});


function getWaktuSekarang() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 10) {
        return 'pagi';
    } else if (hour >= 10 && hour < 15) {
        return 'siang';
    } else if (hour >= 15 && hour < 18) {
        return 'sore';
    } else {
        return 'malam';
    }
}

// Menangani pesan yang diterima
client.on('message', async (message) => {
    try {
        const chatId = message.from; // Mendapatkan ID chat pengirim

        // Memvalidasi apakah pesan berasal dari grup, chat pribadi, atau status
        if (chatId.includes('@g.us')) {
            // console.log(mentions);
            const mentions = message.mentionedIds;
            if (mentions.includes(me)) {
                console.log("Anda ditandai dalam pesan grup!");
                message.reply("Terima kasih sudah menandai saya!");
                await client.sendMessage(me, 'Bot telah terhubung!');
            }
            
        } else if (chatId.includes('@c.us')) {
            console.log("Pesan berasal dari chat pribadi");
            message.reply("Terima kasih sudah mengirim pesan!");

        } else {
            console.log("Sumber pesan tidak diketahui");
        }
    } catch (error) {
        await client.sendMessage(me, error);
    }  
});

// Inisialisasi dan mulai client
client.initialize();
