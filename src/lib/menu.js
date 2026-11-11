export function buildMenu(prefix, botName, mode, commands) {
  const groups = new Map();
  for (const c of commands) {
    const key = c.category || 'GENERAL';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(`${prefix}${c.name}${c.usage ? ` ${c.usage}` : ''}`);
  }
  const sections = [...groups].map(([key, values]) =>
    `╭─「 ${key} 」\n${values.map(v => `│ • ${v}`).join('\n')}\n╰────────────`
  ).join('\n\n');
  return `╭━━〔 ${botName} 〕━━╮\n│ Version: 3.0.0\n│ Mode: ${mode}\n│ Prefix: ${prefix}\n│ Commands: ${commands.length}\n╰━━━━━━━━━━━━━━╯\n\n▶ Type ${prefix}menu2 for compact menu\n\n${sections}\n\n© Powered by 𓉳 𝐏𝐫𝐢𝐧𝐜𝐞 🥀`;
}
