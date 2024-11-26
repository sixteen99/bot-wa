const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { default: axios } = require('axios');


const COOLDOWN_TIME = 1 * 1000; 
const cooldownMap = new Map(); // Map untuk cooldown

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
    if (!message.body || message.body.trim() === '') {
        console.log('Pesan kosong, tidak diproses.');
        return;
    }

    console.log('Pesan diterima: ', message.body);

    const senderNumber = message.from.replace('@c.us', '');
    const currentTime = Date.now();

    // Cooldown
    if (cooldownMap.has(senderNumber)) {
        const lastMessageTime = cooldownMap.get(senderNumber);

        if (currentTime - lastMessageTime < COOLDOWN_TIME) {
            console.log(`Pesan dari ${senderNumber} diabaikan karena masih dalam cooldown.`);
            return;
        }
    }

    cooldownMap.set(senderNumber, currentTime);

    const waktuSekarang = getWaktuSekarang();
    const contact = await message.getContact();
    console.log("nama: " + contact.pushname);

    // Membalas dengan teks tertentu berdasarkan pesan
    if (message.body.startsWith('#')) {
        const searchQuery = message.body.slice(1).trim();
        axios.get(`https://api.ryzendesu.vip/api/search/pinterest?query=${searchQuery}`).then( async (res) => {
            // console.log(res.data);
            const results = res.data
            if (results && results.length > 0) {
                // Looping dan kirim setiap hasil
                for (let index = 0; index < results.length; index++) {
                    const media = await MessageMedia.fromUrl(results[index]); // Gunakan dari URL
                    console.log(media);
                    await message.reply(media);
                }
            } else {
                // Jika tidak ada hasil
                message.reply('Tidak ditemukan hasil untuk pencarian tersebut.');
            }
        }).catch((err) => {
            // message.reply(err.error);
            console.log(err.error);
        });
    // } else if (message.body.toLowerCase() === 'apa kabar') {
    //     message.reply('Saya baik, terima kasih! Bagaimana dengan kamu?');
    // } else if (message.body.toLowerCase().includes('gambar')) {
    //     const media = MessageMedia.fromFilePath('img/fuji.jpeg'); // Path ke gambar
    //     message.reply(media).catch(err => console.error('Error mengirim gambar:', err));
    } else {
        message.reply(`Selamat ${waktuSekarang}.. \nPesan anda akan dibalas saat pemilik ahaha/online.\n\n_*Dibalas oleh: Bot Haru._`);
    }


});

// Inisialisasi dan mulai client
client.initialize();
