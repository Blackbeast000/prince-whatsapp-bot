export const jidNumber = jid => String(jid || '').split('@')[0].split(':')[0];

export function getText(message) {
  const m = message?.message || {};
  return m.conversation || m.extendedTextMessage?.text ||
    m.imageMessage?.caption || m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId || '';
}

export function mentionedJids(message) {
  const m = message?.message || {};
  return m.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.imageMessage?.contextInfo?.mentionedJid || [];
}

export async function isGroupAdmin(sock, chat, sender) {
  if (!chat.endsWith('@g.us')) return false;
  const meta = await sock.groupMetadata(chat);
  return meta.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
}

export async function isBotAdmin(sock, chat) {
  const meta = await sock.groupMetadata(chat);
  const me = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
  return meta.participants.some(p => p.id === me && (p.admin === 'admin' || p.admin === 'superadmin'));
}
