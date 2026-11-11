import pg from 'pg';
const { Pool } = pg;
let pool;
const memory = new Map();
const users = new Map();
const warnings = new Map();

export async function initStore(connectionString) {
  if (!connectionString) {
    console.warn('[store] DATABASE_URL missing: state is in-memory and resets on restart.');
    return;
  }
  pool = new Pool({ connectionString, ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false } });
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS bot_settings (setting_key TEXT PRIMARY KEY, setting_value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    await pool.query('CREATE TABLE IF NOT EXISTS bot_users (jid TEXT PRIMARY KEY, balance BIGINT NOT NULL DEFAULT 0, experience BIGINT NOT NULL DEFAULT 0, last_daily TIMESTAMPTZ, last_work TIMESTAMPTZ)');
    await pool.query('CREATE TABLE IF NOT EXISTS bot_warnings (jid TEXT NOT NULL, chat TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(jid, chat))');
  } catch (error) {
    console.warn(`[store] PostgreSQL unavailable (${error.code || error.message}); continuing with temporary in-memory storage. Fix DATABASE_URL/networking for persistence.`);
    await pool.end().catch(() => {});
    pool = undefined;
  }
}
export async function getSetting(key, fallback = null) {
  if (!pool) return memory.has(key) ? memory.get(key) : fallback;
  const { rows } = await pool.query('SELECT setting_value FROM bot_settings WHERE setting_key=$1', [key]);
  return rows[0]?.setting_value ?? fallback;
}
export async function setSetting(key, value) {
  const v = String(value);
  if (!pool) { memory.set(key, v); return; }
  await pool.query('INSERT INTO bot_settings(setting_key,setting_value) VALUES($1,$2) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()', [key, v]);
}
export async function getUser(jid) {
  if (!pool) return users.get(jid) || { jid, balance: 0, experience: 0, last_daily: null, last_work: null };
  const { rows } = await pool.query('SELECT * FROM bot_users WHERE jid=$1', [jid]);
  if (rows[0]) return rows[0];
  const { rows: created } = await pool.query('INSERT INTO bot_users(jid) VALUES($1) RETURNING *', [jid]);
  return created[0];
}
export async function updateUser(jid, patch) {
  const next = { ...(await getUser(jid)), ...patch };
  if (!pool) { users.set(jid, next); return next; }
  await pool.query('INSERT INTO bot_users(jid,balance,experience,last_daily,last_work) VALUES($1,$2,$3,$4,$5) ON CONFLICT(jid) DO UPDATE SET balance=EXCLUDED.balance,experience=EXCLUDED.experience,last_daily=EXCLUDED.last_daily,last_work=EXCLUDED.last_work', [jid, next.balance, next.experience, next.last_daily, next.last_work]);
  return next;
}
export async function addWarning(jid, chat) {
  if (!pool) { const key = `${chat}:${jid}`; const count = (warnings.get(key) || 0) + 1; warnings.set(key, count); return count; }
  const { rows } = await pool.query('INSERT INTO bot_warnings(jid,chat,count) VALUES($1,$2,1) ON CONFLICT(jid,chat) DO UPDATE SET count=bot_warnings.count+1 RETURNING count', [jid, chat]);
  return rows[0].count;
}
export async function clearWarnings(jid, chat) {
  if (!pool) { warnings.delete(`${chat}:${jid}`); return; }
  await pool.query('DELETE FROM bot_warnings WHERE jid=$1 AND chat=$2', [jid, chat]);
}
