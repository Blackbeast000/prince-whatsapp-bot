import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { mkdir } from 'node:fs/promises';
import { config } from './config.js';
import { initStore, getSetting, setSetting } from './database/store.js';
import { commands } from './commands/index.js';
import { buildMenu } from './lib/menu.js';
import { getText, jidNumber } from './lib/helpers.js';

const logger = pino({ level: config.logLevel });
const commandMap = new Map();
for (const command of commands) {
  commandMap.set(command.name, command);
  for (const alias of command.aliases || []) commandMap.set(alias, command);
}
await initStore(config.databaseUrl);
config.prefix = await getSetting('prefix', config.prefix);
config.mode = await getSetting('mode', config.mode);
config.name = await getSetting('bot_name', config.name);
const savedAliases = JSON.parse(await getSetting('command_aliases', '{}'));
for (const [alias, target] of Object.entries(savedAliases)) {
  const command = commandMap.get(target);
  if (command) commandMap.set(alias, command);
}
await mkdir(config.authDir, { recursive: true });
let reconnecting = false;
let pairingRequested = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version, auth: state, logger, printQRInTerminal: false,
    browser: [config.name, 'Chrome', '3.0.0'],
    markOnlineOnConnect: false, syncFullHistory: false
  });
  sock.ev.on('creds.update', saveCreds);
  if (!state.creds.registered && !pairingRequested) {
    pairingRequested = true;
    setTimeout(async () => {
      try {
        const pairingCode = await sock.requestPairingCode(config.pairingNumber);
        logger.info(`WHATSAPP PAIRING CODE: ${pairingCode}`);
        logger.info('On your phone: WhatsApp → Linked devices → Link a device → Link with phone number instead.');
      } catch (error) {
        pairingRequested = false;
        logger.error({ error }, 'Could not generate WhatsApp pairing code. Check OWNER_NUMBER includes country code and digits only.');
      }
    }, 2000);
  }
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr && state.creds.registered) qrcode.generate(qr, { small: true });
    if (connection === 'open') { reconnecting = false; logger.info(`Connected as ${sock.user?.id}`); }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut && !reconnecting) {
        reconnecting = true;
        setTimeout(() => startBot().catch(error => logger.error(error)), 3000);
      } else if (code === DisconnectReason.loggedOut) logger.error('WhatsApp logged out. Clear the auth volume and pair again.');
    }
  });
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const message of messages) {
      if (!message.message || message.key.fromMe) continue;
      const chat = message.key.remoteJid;
      if (!chat || chat === 'status@broadcast') continue;
      const sender = message.key.participant || chat;
      const body = getText(message).trim();
      if (!body.startsWith(config.prefix)) continue;
      const [trigger, ...args] = body.slice(config.prefix.length).trim().split(/\s+/);
      const name = (trigger || '').toLowerCase();
      const isOwner = jidNumber(sender) === config.owner;
      const alias = name.match(/^com-([a-z0-9_-]+)-to-([a-z0-9_-]+)$/);
      if (alias) {
        if (!isOwner) { await sock.sendMessage(chat, { text: 'Owner only.' }, { quoted: message }); continue; }
        const [, oldName, newName] = alias;
        const target = commandMap.get(oldName);
        if (!target) { await sock.sendMessage(chat, { text: `Unknown command: ${oldName}` }); continue; }
        if (commandMap.has(newName)) { await sock.sendMessage(chat, { text: `Trigger ${newName} already exists.` }); continue; }
        commandMap.set(newName, target);
        savedAliases[newName] = target.name;
        await setSetting('command_aliases', JSON.stringify(savedAliases));
        await sock.sendMessage(chat, { text: `New trigger saved: ${config.prefix}${newName} → ${config.prefix}${target.name}` });
        continue;
      }
      const command = commandMap.get(name);
      if (!command) continue;
      if (config.mode === 'private' && !isOwner) continue;
      if (command.ownerOnly && !isOwner) { await sock.sendMessage(chat, { text: 'This command is restricted to the bot owner.' }, { quoted: message }); continue; }
      try {
        const menu = buildMenu(config.prefix, config.name, config.mode, commands);
        await command.run({ sock, chat, sender, args, message, config, menu, isOwner });
      } catch (error) {
        logger.error({ error, command: name }, 'Command failed');
        await sock.sendMessage(chat, { text: `Command failed: ${error.message?.slice(0, 180) || 'unexpected error'}` }, { quoted: message });
      }
    }
  });
}
startBot().catch(error => { logger.error(error); process.exit(1); });
