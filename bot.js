require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const N8N_URL = process.env.N8N_URL;

const COMMANDS = [
  '!all', '!diesel', '!95', '!91', '!e20', '!e85',
  '!benzine', '!b20', '!d-premium', '!compare', '!help'
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const raw = message.content.trim();
  const lower = raw.toLowerCase();

  const isCommand = COMMANDS.includes(lower);
  const isMention = message.mentions.has(client.user);
  const isAsk = lower.startsWith('!ask ');

  if (!isCommand && !isMention && !isAsk) return;

  let content = lower;
  if (isMention) {
    content = raw.replace(/<@!?\d+>/g, '').trim();
  } else if (isAsk) {
    content = raw.slice(5).trim();
  }

  if (!content) return;

  try {
    await message.channel.sendTyping();

    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: message.channel.id,
        userId: message.author.id,
        username: message.author.username,
        content: content,
        isChat: !isCommand
      })
    });

    if (!res.ok) {
      console.error(`n8n error: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('Failed to send to n8n:', err.message);
  }
});

client.login(BOT_TOKEN);