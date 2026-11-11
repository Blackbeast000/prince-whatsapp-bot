const CATEGORY_STYLE = {
  GENERAL: { icon: '✧', title: 'THE FRONT GATE', note: 'Core bot commands' },
  STATUS: { icon: '◉', title: 'LIVE SIGNALS', note: 'Presence and status tools' },
  MESSAGE: { icon: '⌁', title: 'MESSAGE ARSENAL', note: 'Message controls' },
  MEDIA: { icon: '▣', title: 'MEDIA LAB', note: 'Media utilities' },
  GROUP: { icon: '♜', title: 'SQUAD CONTROL', note: 'Group management' },
  OWNER: { icon: '♛', title: 'ROYAL ACCESS', note: 'Owner-only controls' },
  CONTACT: { icon: '♧', title: 'IDENTITY FILES', note: 'Contact and profile tools' },
  SYSTEM: { icon: '⌘', title: 'CORE SYSTEM', note: 'Diagnostics and system info' },
  UTILITY: { icon: '⌖', title: 'QUICK UTILITIES', note: 'Useful everyday tools' },
  ECONOMY: { icon: '₦', title: 'TREASURE VAULT', note: 'Wallet and rewards' },
  GAMES: { icon: '♠', title: 'PLAYGROUND', note: 'Games and challenges' },
  FUN: { icon: '☄', title: 'CHAOS CORNER', note: 'Fun commands' },
  INTERACTIVE: { icon: '⟡', title: 'LIVE INTERACTION', note: 'Reactions and interactive tools' }
};

const line = '━━━━━━━━━━━━━━━━━━━━';
const commandLine = (prefix, command) => {
  const usage = command.usage ? ` ${command.usage}` : '';
  const description = command.description ? `  _${command.description}_` : '';
  return `│  ⟡ ${prefix}${command.name}${usage}${description}`;
};

export function buildMenu(prefix, botName, mode, commands) {
  const groups = new Map();
  for (const command of commands) {
    const category = String(command.category || 'GENERAL').toUpperCase();
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(command);
  }

  const sections = [...groups].map(([category, items]) => {
    const style = CATEGORY_STYLE[category] || { icon: '✦', title: category.replace(/_/g, ' '), note: 'Available commands' };
    return [
      `╭━━━〔 ${style.icon} *${style.title}* 〕`,
      `│  _${style.note}_`,
      ...items.map(item => commandLine(prefix, item)),
      `╰${'─'.repeat(25)}`
    ].join('\n');
  }).join('\n\n');

  const total = commands.length;
  const categoryCount = groups.size;
  return [
    `╭━━〔 𓉳 *𝐏𝐑𝐈𝐍𝐂𝐄* 🥀 〕━━╮`,
    `│`,
    `│  ✦ *THE ROYAL COMMAND INDEX*`,
    `│  _A different kind of WhatsApp experience._`,
    `│`,
    `│  ◈ Identity  : ${botName}`,
    `│  ◈ Version   : 3.0.0`,
    `│  ◈ Access    : ${String(mode).toUpperCase()}`,
    `│  ◈ Prefix    : ${prefix}`,
    `│  ◈ Commands  : ${total}`,
    `│  ◈ Sections  : ${categoryCount}`,
    `│`,
    `╰━━━━━━━━━━━━━━━━━━━━╯`,
    ` `,
    `       𓆩 *CHOOSE YOUR POWER* 𓆪`,
    ` `,
    sections,
    `╭━━〔 🥀 *PRINCE SIGNATURE* 〕━━╮`,
    `│  ◈ Type *${prefix}menu2* for the quick list`,
    `│  ◈ Type *${prefix}alive* to check the pulse`,
    `│  ◈ Respect the crown. Use power wisely.`,
    `╰━━━━━━━━━━━━━━━━━━━━╯`,
    `       *𓉳 𝐏𝐫𝐢𝐧𝐜𝐞 🥀*`,
    `       _Silent power. Royal control._`
  ].join('\n');
}
