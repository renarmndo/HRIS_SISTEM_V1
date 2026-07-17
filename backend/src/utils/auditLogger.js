import sequelize from "../config/sequelize.js";

const TABLE = "m_audit_log";

async function ensureTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin PRIMARY KEY,
      actor_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
      actor_role VARCHAR(50),
      entity VARCHAR(100) NOT NULL,
      entity_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
      action VARCHAR(50) NOT NULL,
      \`before\` JSON,
      \`after\` JSON,
      ip_address VARCHAR(64),
      user_agent TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_log_actor_id (actor_id),
      INDEX idx_audit_log_entity (entity, entity_id),
      INDEX idx_audit_log_created_at (createdAt),
      CONSTRAINT fk_audit_log_actor FOREIGN KEY (actor_id) REFERENCES m_users(id) ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
}

let initialized = false;
async function initOnce() {
  if (initialized) return;
  try {
    await ensureTable();
    initialized = true;
  } catch (e) {
    console.error("[audit] gagal inisialisasi tabel:", e.message);
  }
}
initOnce();

function genId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function audit({
  req,
  entity,
  entityId = null,
  action,
  before = null,
  after = null,
}) {
  try {
    const actorId = req?.user?.id || null;
    const actorRole = req?.user?.role || null;
    const ip = req?.ip || req?.headers?.["x-forwarded-for"] || null;
    const ua = req?.headers?.["user-agent"] || null;

    await sequelize.query(
      `INSERT INTO ${TABLE}
        (id, actor_id, actor_role, entity, entity_id, action, \`before\`, \`after\`, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          genId(),
          actorId,
          actorRole,
          entity,
          entityId,
          action,
          before ? JSON.stringify(before) : null,
          after ? JSON.stringify(after) : null,
          ip,
          ua,
        ],
      },
    );
  } catch (e) {
    // Audit tidak boleh memblokir flow bisnis; log saja.
    console.error("[audit] gagal mencatat:", e.message);
  }
}

export default audit;
