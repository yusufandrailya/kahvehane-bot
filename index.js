const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Kahvehane Botu 7/24 Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.once('ready', () => {
    console.log(`${client.user.tag} aktif! Kanala bağlanılıyor...`);
    
    const channelId = '1485700953586794616';  
    const guildId = '1485274571778162878';      

    const channel = client.channels.cache.get(channelId);
    if (channel) {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true
        });
        console.log("Bot başarıyla sese bağlandı!");
    }
});


client.login(process.env.TOKEN);