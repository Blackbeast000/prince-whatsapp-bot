# 𓉳 𝐏𝐫𝐢𝐧𝐜𝐞 🥀 — WhatsApp Bot v3.0.0

Node.js 20+ WhatsApp bot using Baileys. Owner number: `2347053098253`. Default prefix: `.`. Public/private mode is supported.

## Commands currently implemented

- General: `.menu`, `.menu2`, `.help`, `.allmenu`, `.alive`, `.ping`, `.runtime`, `.owner`
- Owner/settings: `.mode public|private`, `.public`, `.private`, `.setprefix`, `.setname`, persistent `.com-old-to-new` aliases
- Economy: `.balance`, `.bal`, `.wallet`, `.daily`, `.work`
- Games: `.coinflip`, `.flip`, `.roll`, `.rps`, group multiplayer `.ttt challenge @user` then `.ttt 1-9`
- Group administration: `.kick`, `.promote`, `.demote`, `.tagall`, `.warn`, `.resetwarn`, `.groupinfo`, `.gcinfo`, `.linkgroup`, `.getlink`, `.close`, `.open`
- Utilities/fun: `.jid`, `.time`, `.quote`

Group moderation requires the invoking user to be a group admin (or bot owner) and the bot itself to be a group admin where WhatsApp requires it. Warning counts are tracked; warnings do not automatically kick users.

## Not yet implemented

The rest of the requested catalogue—including media conversion, sticker tools, downloads, AI, speech, sports/live data, status tools, advanced protection, image/audio processing, and the remaining games and social commands—is not yet implemented. Commands are not advertised as working until their handlers are added and tested. Many features will require third-party API keys, provider terms/limits, or media-processing binaries.

## Railway deployment

1. Create a Railway project from this GitHub repository.
2. Add PostgreSQL and make `DATABASE_URL` available to the bot service.
3. Add a persistent Railway Volume mounted at `/data` (required for WhatsApp login credentials).
4. Set `OWNER_NUMBER=2347053098253`, `AUTH_DIR=/data/auth`, and `BOT_MODE=public`. Optionally set `PREFIX=.`.
5. Deploy and open service logs. Pair WhatsApp by scanning the QR code with WhatsApp → Linked devices.

## Local run

```sh
npm install
cp .env.example .env
npm start
```

## Persistence and security

PostgreSQL persists settings, wallet data, and group warning counts. Without `DATABASE_URL`, state is in-memory and resets on restart. Keep the auth directory, QR code, session credentials, and API keys private; never commit them. Baileys is an unofficial WhatsApp Web client. Use responsibly and comply with WhatsApp's terms.
