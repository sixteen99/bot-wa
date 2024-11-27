const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { default: axios } = require('axios');


const COOLDOWN_TIME = 3600 * 1000; 
const cooldownMap = new Map(); // Map untuk cooldown
const me = '6285757895223@c.us';
let botReady = false;
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

    botReady = true;

    await client.sendMessage('6285757895223@c.us', '_Bot telah terhubung!_');
});



// Menangani pesan yang diterima
client.on('message', async (message) => {
    if (!botReady) return; // Abaikan jika bot belum siap
    try {

        if(message.body == '!detail') {
            message.reply(`*Alert! Fitur ini berfungsi hanya pada jam kerja.*\n\n1. Blackbox AI =  *?*.\n2. Search Google(Single index) =  */*.\n3. Gambar Pinterest =  *#*.\n4. Text to Sticker =  *$*.\n\n_Misalnya: " *#Naruto* " atau " *?Siapa penemu gravitasi?* "_\n\nFitur lainnya masih dalam proses pengembangan😉.`)
        }

        const senderNumber = message.from.replace('@c.us', ''); // Nomor pengirim
        const currentTime = Date.now(); // Waktu sekarang

        // Jika pengirim berada dalam cooldown
        if (cooldownMap.has(senderNumber)) {
            const lastMessageTime = cooldownMap.get(senderNumber);
            // Jika masih dalam cooldown, dan bukan pesan '#', abaikan
            if (currentTime - lastMessageTime < COOLDOWN_TIME) {
                return;
            }
        }

        // Update waktu terakhir pesan diterima untuk sender ini
        updateCooldown(senderNumber, currentTime);

        const chatId = message.from; // Mendapatkan ID chat pengirim
        if (chatId.includes('@g.us')) {
            // Pesan datang dari grup
            const mentions = message.mentionedIds;
            if (mentions.includes('6285757895223@c.us')) {
                await client.sendMessage('6285757895223@c.us', "Anda ditandai dalam pesan grup");
                message.reply(`Terima kasih sudah menandai saya!\nPesan akan dibalas ketika pemilik online.\n\n_*Dibalas oleh Bot Otomatis._\n\n*Fitur Bot kirim pesan " !detail. "*.`);
            }

        } else if (chatId.includes('@c.us')) {
            
            // Jika belum ada gambar, kirim pesan otomatis dengan waktu
            message.reply(`Terima kasih.. \nPesan anda akan dibalas ketika pemilik online.\n\n_*Dibalas oleh Bot Otomatis._\n\n*Fitur Bot kirim pesan " !detail. "*.`);
        } else {
            await client.sendMessage('6285757895223@c.us', "_Seseorang mencoba mengirimi anda pesan dengan sumber yang tidak diketahui_");
        }
    } catch (error) {
        await client.sendMessage('6285757895223@c.us', `Error: ${error.message || error}`);
    }
});

client.on('message_create', async (message) => {
    if(message.from != '6285757895223@c.us') return;

    const receivedNumber = message.to.replace('@c.us', ''); // Nomor pengirim
    const currentTime = Date.now(); // Waktu sekarang

        // Update waktu terakhir pesan diterima untuk sender ini
    updateCooldown(receivedNumber, currentTime);
});

// Fungsi untuk mengupdate cooldown saat pesan masuk atau keluar
const updateCooldown = (number, currentTime) => {
    cooldownMap.set(number, currentTime);
};

const config = {
    cooldownTime: 60000  // Menentukan waktu cooldown dalam milidetik (60 detik)
};
setInterval(() => {
    const now = Date.now();
    cooldownMap.forEach((lastTime, sender) => {
        if (now - lastTime > config.cooldownTime) {
            cooldownMap.delete(sender);
        }
    });
}, 60000); // Bersihkan setiap 1 menit

// Inisialisasi dan mulai client
client.initialize();
