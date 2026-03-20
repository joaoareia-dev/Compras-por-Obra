const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const host = "0.0.0.0";
const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao configurada. Defina a conexao com o Postgres antes de iniciar.");
}

const isLocalDatabase = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
});

const SESSION_COOKIE = "gc_session";
const SESSION_TTL_DAYS = 7;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml"
};

function randomId() {
  return crypto.randomUUID();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, storedValue) {
  if (!storedValue) {
    return false;
  }

  if (!storedValue.startsWith("scrypt:")) {
    return storedValue === password;
  }

  const [, salt, hash] = storedValue.split(":");
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, error.code === "ENOENT" ? 404 : 500, {
        error: error.code === "ENOENT" ? "Arquivo nao encontrado." : "Erro interno no servidor."
      });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const noCacheExtensions = new Set([".html", ".js", ".css"]);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": noCacheExtensions.has(extension) ? "no-store, must-revalidate" : "public, max-age=86400"
    });
    res.end(content);
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch (error) {
        reject(new Error("JSON invalido."));
      }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function buildSessionCookie(token, expiresAt) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${new Date(expiresAt).toUTCString()}`
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function clearSessionCookie() {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function requireFields(body, fields) {
  for (const field of fields) {
    if (!String(body[field] ?? "").trim()) {
      throw new Error(`Campo obrigatorio: ${field}.`);
    }
  }
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role
  };
}

function mapObra(row) {
  return {
    id: row.id,
    nome: row.nome,
    local: row.local,
    responsavel: row.responsavel,
    dataInicio: row.data_inicio,
    orcamento: Number(row.orcamento || 0),
    finalizacao: row.finalizacao_data_entrega || row.finalizacao_aditivos_info || Number(row.finalizacao_aditivos_valor || 0) > 0
      ? {
          dataEntrega: row.finalizacao_data_entrega,
          aditivosInfo: row.finalizacao_aditivos_info || "",
          aditivosValor: Number(row.finalizacao_aditivos_valor || 0),
          atualizadoEm: row.finalizacao_atualizado_em
        }
      : null
  };
}

function mapCompra(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    createdAt: row.created_at,
    data: row.data,
    descricao: row.descricao,
    categoria: row.categoria,
    fornecedor: row.fornecedor,
    unidade: row.unidade,
    quantidade: Number(row.quantidade || 0),
    precoUnitario: Number(row.preco_unitario || 0),
    precoTotal: Number(row.preco_total || 0),
    valor: Number(row.preco_total || 0),
    pago: Boolean(row.pago)
  };
}

async function ensureDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('administrador', 'usuario'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS obras (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      local TEXT NOT NULL,
      responsavel TEXT NOT NULL,
      data_inicio DATE NOT NULL,
      orcamento NUMERIC(14, 2) NOT NULL,
      finalizacao_data_entrega DATE,
      finalizacao_aditivos_info TEXT,
      finalizacao_aditivos_valor NUMERIC(14, 2) DEFAULT 0,
      finalizacao_atualizado_em TIMESTAMPTZ
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS compras (
      id TEXT PRIMARY KEY,
      obra_id TEXT NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      data DATE NOT NULL,
      descricao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      fornecedor TEXT NOT NULL,
      unidade TEXT NOT NULL,
      quantidade NUMERIC(14, 3) NOT NULL,
      preco_unitario NUMERIC(14, 2) NOT NULL,
      preco_total NUMERIC(14, 2) NOT NULL,
      pago BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  await pool.query(`UPDATE users SET role = 'administrador' WHERE role NOT IN ('administrador', 'usuario')`);
  const adminEmail = process.env.ADMIN_EMAIL || "admin@obra.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "123456";

  await pool.query(
    `
      INSERT INTO users (id, name, email, password, role)
      VALUES ($1, $2, $3, $4, 'administrador')
      ON CONFLICT (email) DO NOTHING
    `,
    [randomId(), "Administrador", adminEmail, hashPassword(adminPassword)]
  );

  await pool.query("DELETE FROM sessions WHERE expires_at < NOW()");
}

async function getBootstrapPayload() {
  const [obrasResult, comprasResult] = await Promise.all([
    pool.query("SELECT * FROM obras ORDER BY nome ASC"),
    pool.query("SELECT * FROM compras ORDER BY created_at ASC")
  ]);

  return {
    obras: obrasResult.rows.map(mapObra),
    compras: comprasResult.rows.map(mapCompra)
  };
}

async function getSessionUser(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT u.id, u.name, u.email, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires_at > NOW()
      LIMIT 1
    `,
    [token]
  );

  if (!result.rows.length) {
    return null;
  }

  return mapUser(result.rows[0]);
}

async function requireAuth(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: "Sessao expirada. Faca login novamente." });
    return null;
  }

  return user;
}

function requireAdmin(res, user) {
  if (user.role !== "administrador") {
    sendJson(res, 403, { error: "Apenas administradores podem executar esta acao." });
    return false;
  }

  return true;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/healthz") {
    sendJson(res, 200, { status: "ok", environment: process.env.NODE_ENV });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await parseRequestBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const force = Boolean(body.force);
    const result = await pool.query(
      "SELECT id, name, email, role, password FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (!result.rows.length || !verifyPassword(password, result.rows[0].password)) {
      sendJson(res, 401, { error: "Usuario ou senha invalidos." });
      return true;
    }

    const user = mapUser(result.rows[0]);
    const activeSessions = await pool.query(
      "SELECT token FROM sessions WHERE user_id = $1 AND expires_at > NOW()",
      [user.id]
    );

    if (activeSessions.rows.length > 0 && !force) {
      sendJson(res, 409, {
        error: "Este usuario ja esta logado em outro aparelho. Repita o login para encerrar a outra sessao.",
        code: "SESSION_ACTIVE"
      });
      return true;
    }

    if (activeSessions.rows.length > 0 && force) {
      await pool.query("DELETE FROM sessions WHERE user_id = $1", [user.id]);
    }

    const token = randomId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
    await pool.query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", [token, user.id, expiresAt.toISOString()]);
    sendJson(res, 200, { user }, { "Set-Cookie": buildSessionCookie(token, expiresAt) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/authorize-manager") {
    const body = await parseRequestBody(req);
    const result = await pool.query(
      "SELECT id, password FROM users WHERE id = $1 AND role = 'administrador' LIMIT 1",
      [body.userId]
    );
    const authorized = result.rows.length > 0 && verifyPassword(String(body.password || ""), result.rows[0].password);
    sendJson(res, 200, { authorized });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) {
      await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
    }
    sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/me") {
    const user = await requireAuth(req, res);
    if (!user) {
      return true;
    }
    sendJson(res, 200, { user });
    return true;
  }

  const user = await requireAuth(req, res);
  if (!user) {
    return true;
  }

  if (req.method === "POST" && pathname === "/api/change-password") {
    const body = await parseRequestBody(req);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      sendJson(res, 400, { error: "Informe a senha atual e a nova senha." });
      return true;
    }

    if (newPassword.length < 6) {
      sendJson(res, 400, { error: "A nova senha deve ter pelo menos 6 caracteres." });
      return true;
    }

    const result = await pool.query("SELECT password FROM users WHERE id = $1 LIMIT 1", [user.id]);
    if (!result.rows.length || !verifyPassword(currentPassword, result.rows[0].password)) {
      sendJson(res, 400, { error: "Senha atual invalida." });
      return true;
    }

    await pool.query("UPDATE users SET password = $2 WHERE id = $1", [user.id, hashPassword(newPassword)]);
    await pool.query("DELETE FROM sessions WHERE user_id = $1 AND token <> $2", [user.id, parseCookies(req)[SESSION_COOKIE] || ""]);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(res, 200, await getBootstrapPayload());
    return true;
  }

  if (req.method === "GET" && pathname === "/api/users") {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const result = await pool.query("SELECT id, name, email, role FROM users ORDER BY name ASC");
    sendJson(res, 200, { users: result.rows.map(mapUser) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/users") {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const body = await parseRequestBody(req);
    requireFields(body, ["name", "email", "password", "role"]);
    if (!["administrador", "usuario"].includes(body.role)) {
      throw new Error("Perfil invalido.");
    }
    const id = randomId();
    await pool.query(
      "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)",
      [id, String(body.name).trim(), String(body.email).trim().toLowerCase(), hashPassword(String(body.password)), body.role]
    );
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/users/")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const userId = pathname.split("/")[3];
    if (userId === user.id) {
      sendJson(res, 400, { error: "Voce nao pode excluir o proprio usuario." });
      return true;
    }
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/obras") {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const body = await parseRequestBody(req);
    requireFields(body, ["nome", "local", "responsavel", "dataInicio"]);
    const id = randomId();
    await pool.query(
      `INSERT INTO obras (id, nome, local, responsavel, data_inicio, orcamento) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, body.nome, body.local, body.responsavel, body.dataInicio, Number(body.orcamento || 0)]
    );
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/obras/") && !pathname.endsWith("/finalizacao")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const obraId = pathname.split("/")[3];
    const body = await parseRequestBody(req);
    await pool.query(
      `UPDATE obras SET nome = $2, local = $3, responsavel = $4, data_inicio = $5, orcamento = $6 WHERE id = $1`,
      [obraId, body.nome, body.local, body.responsavel, body.dataInicio, Number(body.orcamento || 0)]
    );
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "PUT" && pathname.endsWith("/finalizacao")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const obraId = pathname.split("/")[3];
    const body = await parseRequestBody(req);
    await pool.query(
      `
        UPDATE obras
        SET finalizacao_data_entrega = $2,
            finalizacao_aditivos_info = $3,
            finalizacao_aditivos_valor = $4,
            finalizacao_atualizado_em = $5
        WHERE id = $1
      `,
      [obraId, body.dataEntrega, body.aditivosInfo, Number(body.aditivosValor || 0), new Date().toISOString()]
    );
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/obras/")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const obraId = pathname.split("/")[3];
    await pool.query("DELETE FROM obras WHERE id = $1", [obraId]);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/compras") {
    const body = await parseRequestBody(req);
    const id = randomId();
    await pool.query(
      `
        INSERT INTO compras (
          id, obra_id, created_at, data, descricao, categoria, fornecedor, unidade,
          quantidade, preco_unitario, preco_total, pago
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        id,
        body.obraId,
        new Date().toISOString(),
        body.data,
        body.descricao,
        body.categoria,
        body.fornecedor,
        body.unidade,
        Number(body.quantidade || 0),
        Number(body.precoUnitario || 0),
        Number(body.precoTotal || 0),
        Boolean(body.pago)
      ]
    );
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/compras/")) {
    const compraId = pathname.split("/")[3];
    const body = await parseRequestBody(req);
    await pool.query(
      `
        UPDATE compras
        SET obra_id = $2,
            data = $3,
            descricao = $4,
            categoria = $5,
            fornecedor = $6,
            unidade = $7,
            quantidade = $8,
            preco_unitario = $9,
            preco_total = $10,
            pago = $11
        WHERE id = $1
      `,
      [
        compraId,
        body.obraId,
        body.data,
        body.descricao,
        body.categoria,
        body.fornecedor,
        body.unidade,
        Number(body.quantidade || 0),
        Number(body.precoUnitario || 0),
        Number(body.precoTotal || 0),
        Boolean(body.pago)
      ]
    );
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/compras/")) {
    const compraId = pathname.split("/")[3];
    await pool.query("DELETE FROM compras WHERE id = $1", [compraId]);
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      sendJson(res, 400, { error: "Requisicao invalida." });
      return;
    }

    const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;

    if (pathname === "/healthz") {
      sendJson(res, 200, { status: "ok", environment: process.env.NODE_ENV });
      return;
    }

    if (pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, pathname);
      if (!handled) {
        sendJson(res, 404, { error: "Endpoint nao encontrado." });
      }
      return;
    }

    const normalizedPath = pathname === "/" ? "/index.html" : pathname;
    const filePath = path.normalize(path.join(rootDir, normalizedPath));

    if (!filePath.startsWith(rootDir)) {
      sendJson(res, 403, { error: "Acesso negado." });
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(res, filePath);
        return;
      }

      sendFile(res, path.join(rootDir, "index.html"));
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Erro interno no servidor." });
  }
});

ensureDatabase()
  .then(() => {
    server.listen(port, host, () => {
      console.log(`Servidor em execucao em http://${host}:${port} (${process.env.NODE_ENV})`);
    });
  })
  .catch((error) => {
    console.error("Falha ao inicializar o banco:", error);
    process.exit(1);
  });
