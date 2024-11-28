const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const express = require('express');
const path = require('path');
const { default: axios } = require('axios');

const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
    res.send('Server is running');
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
const imageFolder = path.join(__dirname, 'images');
app.use('/images', express.static(imageFolder));


const quotes = JSON.parse(fs.readFileSync(path.resolve(__dirname, './assets/quotes.json')));

randomJson = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};
const Quotes_ = () => {
    return randomJson(quotes);
};




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

    await client.sendMessage('6285757895223@c.us', 'Bot telah terhubung!');
});


// Menangani pesan yang diterima
client.on('message', async (message) => {
    if (!botReady) return; // Abaikan jika bot belum siap
    const now = Math.floor(Date.now() / 1000); // Waktu sekarang dalam detik
    if (now - message.timestamp > 5) {
        return; // Abaikan pesan lama
    }
    try {
        

        // Jika pesan dimulai dengan '#', abaikan cooldown
        if (message.type == 'chat' && message.body.startsWith('#')) {
            // Proses pesan yang diawali '#'
            const searchQuery = message.body.slice(1).trim();
            message.reply("mencari data..")
            axios.get(`https://api.ryzendesu.vip/api/search/pinterest?query=${searchQuery}`, { maxRedirects: 0 }).then(async (res) => {
                const results = res.data;
                if (results && results.length > 0) {
                    // Kirim setiap hasil gambar
                    for (let index = 0; index < results.length; index++) {
                        const media = await MessageMedia.fromUrl(results[index]);
                        await message.reply(media);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } else {
                    return message.reply('Tidak ditemukan hasil untuk pencarian tersebut.');
                }
                await message.reply("Done:)")
                return;
            }).catch(async (err) => {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\n_Search google error_");
                message.reply('Terjadi kesalahan saat mencari gambar.');
            });
            return; // Stop eksekusi lebih lanjut jika pesan dimulai dengan '#'
        } else if(message.type == 'chat' && message.body.startsWith('/')) {
            const searchQuery = message.body.slice(1).trim();
            message.reply("mencari data..")
            axios.get(`https://api.ryzendesu.vip/api/search/google?query=${searchQuery}`).then(async (res) => {
                await message.reply(`*${res.data[0].title}*\n\n${res.data[0].description}\n\n_Link: ${res.data[0].link}_`);
                message.reply("Done:)")
            }).catch(async (err) => {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\n_Search google error_");
            });
            return;
        } else if(message.type == 'chat' && message.body.startsWith('?')) {
            const searchQuery = message.body.slice(1).trim();
            message.reply("mencari data..")
            axios.get(`https://api.ryzendesu.vip/api/ai/blackbox?chat=${searchQuery}&options=blackboxai&imageurl=`).then(async (res) => {
                await message.reply(res.data.response);
                message.reply("Done:)")
            }).catch(async (err) => {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\nerror");
            });
            return;
        } 
        else if (message.type == 'chat' && message.body.startsWith('$')) {
            const searchQuery = message.body.slice(1).trim();
            message.reply("Sabarr..")
            axios.get(`https://api.ryzendesu.vip/api/sticker/brat?text=${searchQuery}`, {responseType: 'arraybuffer',}).then(async (res) => {
                const filePath = 'sticker.png';
                fs.writeFileSync(filePath, res.data);
                if(!fs.existsSync(filePath)) return message.reply("Sticker tidak tersedia.");
                const media = MessageMedia.fromFilePath("./sticker.png");  // Mengambil file gambar dari path
                await message.reply(media, null, { sendMediaAsSticker: true });

            }).catch(async (err) => {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\nerror");
                // await message.reply(res.data.response);
            });
            return;
        }
        else if (message.type == 'chat' && message.body.startsWith('&')) {
            const searchQuery = message.body.slice(1).trim();
            message.reply("Sabarr.. sedang di buat")
            axios.get(`https://api.ryzendesu.vip/api/ai/flux-schnell?prompt=${searchQuery}`, {responseType: 'arraybuffer',}).then(async (res) => {
                const filePath = 'image.jpg';
                fs.writeFileSync(filePath, res.data);
                if(!fs.existsSync(filePath)) return message.reply("image tidak tersedia.");
                const media = MessageMedia.fromFilePath("./image.jpg");  // Mengambil file gambar dari path
                await message.reply(media);

            }).catch(async (err) => {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\nerror");
                // await message.reply(res.data.response);
            });
            return;
        }
        else if (message.type == 'image' && message.body.startsWith('?')) {
            const searchQuery = message.body.slice(1).trim();
            message.reply("Sabarr..")
            const media = await message.downloadMedia();
            const filename = `images/sample.jpg`
            fs.writeFileSync(filename, media.data, 'base64');
            const imageUrl = 'https://test-01.aldosaman.my.id/images/sample.jpg';
            axios.get(`https://api.ryzendesu.vip/api/ai/blackbox?chat=${searchQuery}&options=blackboxai&imageurl=${imageUrl}`).then(async (res) => {
                await message.reply(res.data.response);
                console.log("oke");
            }).catch(async (err) => {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\nerror");
            });
            return;
        }
        else if (message.body == '!quotes') {
            try {
                const quote = Quotes_();
                message.reply(`${quote.quotes}\n#${quote.author}`);
            } catch (err) {
                const error = err.stack || err.toString();
                await client.sendMessage('6285757895223@c.us', error, "\nerror");
            }
            return;
        }

        if(message.body == '!detail') {
            message.reply(`*Alert! Fitur ini berfungsi hanya pada jam kerja(08:00-16:00).*\n\n1. Blackbox AI =  *?*.\n2. Pembuat gambar AI =  *&*.\n3. Search Google(Single index) =  */*.\n4. Gambar Pinterest =  *#*.\n5. Text to Sticker =  *$*.\n\n_Misalnya: " *#Naruto* " atau " *?Siapa penemu gravitasi?* "_\n\nFitur lainnya masih dalam proses pengembangan😉.`)
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
        await client.sendMessage(me, error);
        return;
    }
});

client.on('message_create', async (message) => {
    if(message.from != '6285757895223@c.us') return;
    const receivedNumber = message.to.replace('@c.us', ''); // Nomor pengirim
    const currentTime = Date.now(); // Waktu sekarang
    updateCooldown(receivedNumber, currentTime);
});

const updateCooldown = (number, currentTime) => {
    cooldownMap.set(number, currentTime);
};



// Inisialisasi dan mulai client
client.initialize();
