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
    if (!botReady) return; // Abaikan jika bot belum siap

    try {
        const senderNumber = message.from.replace('@c.us', ''); // Nomor pengirim
        const currentTime = Date.now(); // Waktu sekarang

        // Jika pesan dimulai dengan '#', abaikan cooldown
        if (message.body.startsWith('#')) {
            // Proses pesan yang diawali '#'
            const searchQuery = message.body.slice(1).trim();
            axios.get(`https://api.ryzendesu.vip/api/search/pinterest?query=${searchQuery}`).then(async (res) => {
                const results = res.data;
                if (results && results.length > 0) {
                    // Kirim setiap hasil gambar
                    for (let index = 0; index < results.length; index++) {
                        const media = await MessageMedia.fromUrl(results[index]);
                        console.log(media);
                        await message.reply(media);
                    }
                } else {
                    message.reply('Tidak ditemukan hasil untuk pencarian tersebut.');
                }
            }).catch(async (err) => {
                await client.sendMessage(me, err);
                message.reply('Terjadi kesalahan saat mencari gambar.');
            });
            return; // Stop eksekusi lebih lanjut jika pesan dimulai dengan '#'
        } else if(message.body.startsWith('$')) {
            message.reply('yakin ingin menggunakan fitur ini?');
            return;
        }

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
                console.log("Anda ditandai dalam pesan grup!");
                message.reply("Terima kasih sudah menandai saya!");
            }

        } else if (chatId.includes('@c.us')) {
            // Pesan datang dari chat pribadi
            const waktuSekarang = getWaktuSekarang();
            
            // Jika belum ada gambar, kirim pesan otomatis dengan waktu
            message.reply(`Selamat ${waktuSekarang}.. \nPesan anda akan dibalas saat pemilik bangun/online.\n\n_*Dibalas oleh: Bot Otomatis._`);
        } else {
            console.log("Sumber pesan tidak diketahui");
        }
    } catch (error) {
        await client.sendMessage(me, error);
    }
});


// Inisialisasi dan mulai client
client.initialize();
