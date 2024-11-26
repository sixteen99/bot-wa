const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { default: axios } = require('axios');


const COOLDOWN_TIME = 10 * 1000; 
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

    await client.sendMessage(me, '_Bot telah terhubung!_');
});



// Menangani pesan yang diterima
client.on('message', async (message) => {
    if (!botReady) return; // Abaikan jika bot belum siap

    try {
        const senderNumber = message.from.replace('@c.us', ''); // Nomor pengirim
        const currentTime = Date.now(); // Waktu sekarang

        // Jika pengirim berada dalam cooldown
        if (cooldownMap.has(senderNumber)) {
            const lastMessageTime = cooldownMap.get(senderNumber);

            // Jika masih dalam cooldown, dan bukan pesan '#', abaikan
            if (currentTime - lastMessageTime < COOLDOWN_TIME) {
                console.log(`Pesan dari ${senderNumber} diabaikan karena masih dalam cooldown.`);
                return;
            }
        }

        // Update waktu terakhir pesan diterima untuk sender ini
        cooldownMap.set(senderNumber, currentTime);

        const chatId = message.from; // Mendapatkan ID chat pengirim
        if (chatId.includes('@g.us')) {
            // Pesan datang dari grup
            const mentions = message.mentionedIds;
            if (mentions.includes(me)) {
                await client.sendMessage(me, "Anda ditandai dalam pesan grup");
                message.reply("Terima kasih sudah menandai saya!\nPesan akan dibalas saat pemilik bangun/online.\n\n_*Dibalas oleh Bot Otomatis._");
            }

        } else if (chatId.includes('@c.us')) {
            
            // Jika belum ada gambar, kirim pesan otomatis dengan waktu
            message.reply(`
                Terima kasih.. \nPesan anda akan dibalas saat pemilik bangun/online.\n\n_*Dibalas oleh Bot Otomatis._\n\n\n*_Fitur Bot:_*\n\n
                1.Pencarian gambar: Command "*#*". \n
                2.Pencarian Google(Single index): Command "*/*".\n\n

                _Misalnya: '#Naruto' atau '/Siapa penemu gravitasi?'_\n\n

                Fitur lainnya masih dalam proses pengembangan😉.
                `);
        } else {
            await client.sendMessage(me, "_Seseorang mencoba mengirimi anda pesan dengan sumber yang tidak diketahui_");
        }
    } catch (error) {
        await client.sendMessage(me, error);
    }
});


// Inisialisasi dan mulai client
client.initialize();
