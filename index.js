const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Sayaç Botu 7/24 Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const channelId = '1485700953586794616';  // Kahvehane kanal ID'si
const guildId = '1485274571778162878';      // Sunucu ID'si

function baglan() {
    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    // Eğer eski bir bağlantı kalıntısı varsa önce onu temizle
    const oldConnection = getVoiceConnection(guildId);
    if (oldConnection) oldConnection.destroy();

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false // Seste tamamen aktif görünmesi için mute'u kapattık
    });

    // 🛡️ KALKAN 1: Bot ağ koptuğunda otomatik tekrar bağlanmayı dener
    connection.on('stateChange', (oldState, newState) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            console.log("Bağlantı koptu, milisaniyeler içinde geri bağlanılıyor...");
            setTimeout(() => baglan(), 1000);
        }
    });

    // 🛡️ KALKAN 2: Discord botu odadan atmaya çalışırsa (Signalling hatası vs.) engelle
    connection.on('error', (error) => {
        console.error("Ses hatası engellendi, bağlantı yenileniyor:", error);
        setTimeout(() => baglan(), 1000);
    });
}

client.once('ready', () => {
    console.log(`${client.user.tag} aktif! Sayaç kalkanı devreye girdi.`);
    baglan();

    // 🛡️ KALKAN 3: ZAMANLAYICI (Her 10 dakikada bir botun gerçekten seste olup olmadığını kontrol eder)
    // Eğer bir şekilde düşmüşse kimseye çaktırmadan geri sokar. Sayacın garantisidir.
    setInterval(() => {
        const connection = getVoiceConnection(guildId);
        if (!connection || connection.state.status === VoiceConnectionStatus.Disconnected) {
            console.log("Zamanlayıcı tetiklendi: Bot seste bulunamadı, içeri sokuluyor...");
            baglan();
        }
    }, 10 * 60 * 1000); // 10 dakikada bir kontrol
});

// Sistem genelinde çıkabilecek ufak tefek internet hatalarının kodu çökertmesini engeller
process.on('unhandledRejection', error => {
    console.error('Çökme engellendi:', error);
});

client.login(process.env.TOKEN);
