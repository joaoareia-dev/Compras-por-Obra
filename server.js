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
const JSON_BODY_LIMIT_BYTES = Number(process.env.JSON_BODY_LIMIT_BYTES) || 20 * 1024 * 1024;
const noCacheExtensions = new Set([".html", ".js", ".mjs", ".css", ".webmanifest"]);
const RDO_CLIMA_OPTIONS = new Set(["Ensolarado", "Nublado", "Chuvoso"]);
const AUDIT_ACTIONS = new Set(["cadastro", "edicao", "exclusao"]);
const CLIENT_VERSION_TARGETS = {
  mobile: [
    "rdo-mobile.html",
    "rdo-mobile.js",
    "rdo-mobile.css",
    "rdo-mobile.webmanifest",
    "rdo-mobile-sw.js"
  ],
  portal: [
    "index.html",
    "app.js",
    "style.css"
  ]
};
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
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
  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = Buffer.from(candidate, "hex");
  if (hashBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const stream = fs.createReadStream(filePath);

  stream.on("open", () => {
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": noCacheExtensions.has(extension) ? "no-store, must-revalidate" : "public, max-age=86400"
    });
    stream.pipe(res);
  });

  stream.on("error", (error) => {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    sendJson(res, error.code === "ENOENT" ? 404 : 500, {
      error: error.code === "ENOENT" ? "Arquivo nao encontrado." : "Erro interno no servidor."
    });
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let settled = false;

    req.on("data", (chunk) => {
      if (settled) {
        return;
      }

      chunks.push(chunk);
      totalBytes += chunk.length;
      if (totalBytes > JSON_BODY_LIMIT_BYTES) {
        settled = true;
        reject(new Error("Corpo da requisicao excede o limite permitido."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (settled) {
        return;
      }

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
    req.on("error", (error) => {
      if (!settled) {
        reject(error);
      }
    });
  });
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};

  header
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      const index = item.indexOf("=");
      if (index <= 0) {
        return;
      }

      const key = item.slice(0, index);
      const value = item.slice(index + 1);
      cookies[key] = decodeURIComponent(value);
    });

  return cookies;
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

function getClientVersion(target = "portal") {
  if (process.env.RENDER_GIT_COMMIT) {
    return process.env.RENDER_GIT_COMMIT;
  }

  const files = CLIENT_VERSION_TARGETS[target] || CLIENT_VERSION_TARGETS.portal;
  const latestTimestamp = files.reduce((currentMax, relativeFilePath) => {
    try {
      const stats = fs.statSync(path.join(rootDir, relativeFilePath));
      return Math.max(currentMax, Number(stats.mtimeMs || 0));
    } catch (error) {
      return currentMax;
    }
  }, 0);

  return latestTimestamp ? String(Math.trunc(latestTimestamp)) : "0";
}

function requireFields(body, fields) {
  for (const field of fields) {
    if (!String(body[field] ?? "").trim()) {
      throw new Error(`Campo obrigatorio: ${field}.`);
    }
  }
}

function validateNewPassword(newPassword) {
  if (!newPassword) {
    throw new Error("Informe a nova senha.");
  }

  if (newPassword.length < 6) {
    throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
  }
}

function getResourceId(pathname) {
  return pathname.split("/")[3];
}

async function updateUserPasswordAndSessions(userId, newPassword, currentToken = "", keepCurrentSession = true) {
  await pool.query("UPDATE users SET password = $2 WHERE id = $1", [userId, hashPassword(newPassword)]);

  if (keepCurrentSession) {
    await pool.query("DELETE FROM sessions WHERE user_id = $1 AND token <> $2", [userId, currentToken]);
    return;
  }

  await pool.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role
  };
}

function parseStoredAttachment(value) {
  if (!value) {
    return null;
  }

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const name = String(parsed.name || "").trim();
    const dataUrl = String(parsed.dataUrl || "").trim();
    const mimeType = String(parsed.mimeType || "").trim();
    if (!name || !dataUrl) {
      return null;
    }

    return {
      name,
      dataUrl,
      mimeType
    };
  } catch (error) {
    return null;
  }
}

function toDateOnlyString(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function mapObra(row) {
  return {
    id: row.id,
    nome: row.nome,
    local: row.local,
    responsavel: row.responsavel,
    dataInicio: toDateOnlyString(row.data_inicio),
    orcamento: Number(row.orcamento || 0),
    contratante: {
      nome: String(row.contratante_nome || "").trim(),
      logo: String(row.contratante_logo || "").trim()
    },
    contratada: {
      nome: String(row.contratada_nome || "").trim(),
      logo: String(row.contratada_logo || "").trim()
    },
    orcamentoSinteticoArquivo: parseStoredAttachment(row.orcamento_sintetico_arquivo),
    orcamentoAnaliticoArquivo: parseStoredAttachment(row.orcamento_analitico_arquivo),
    finalizacao: row.finalizacao_data_entrega || row.finalizacao_aditivos_info || Number(row.finalizacao_aditivos_valor || 0) > 0
      ? {
          dataEntrega: toDateOnlyString(row.finalizacao_data_entrega),
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
    data: toDateOnlyString(row.data),
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

function mapMaoDeObra(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    createdAt: row.created_at,
    descricao: row.descricao,
    categoria: "Mao de Obra",
    periodoInicio: toDateOnlyString(row.periodo_inicio),
    periodoFim: toDateOnlyString(row.periodo_fim),
    dataPagamento: toDateOnlyString(row.data_pagamento),
    valor: Number(row.valor || 0)
  };
}

function normalizeOptionalDecimal(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePhotoList(values, options = {}) {
  const requireComment = Boolean(options.requireComment);
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value, index) => {
      const photo = value && typeof value === "object" ? value : {};
      const dataUrl = String(photo.dataUrl || "").trim();
      if (!dataUrl.startsWith("data:image/")) {
        return null;
      }

      const name = String(photo.name || `foto-${index + 1}.jpg`).trim() || `foto-${index + 1}.jpg`;
      const comentario = String(photo.comentario || "").trim();
      if (requireComment && !comentario) {
        throw new Error(`Informe o comentario da foto ${index + 1}.`);
      }

      return {
        id: String(photo.id || randomId()),
        name,
        dataUrl,
        comentario
      };
    })
    .filter(Boolean);
}

function normalizeRdoItemList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (typeof value === "string") {
        const descricao = value.trim();
        return descricao
          ? {
              id: randomId(),
              descricao,
              unidade: "",
              quantidade: null
            }
          : null;
      }

      const item = value && typeof value === "object" ? value : {};
      const descricao = String(item.descricao || "").trim();
      const unidade = String(item.unidade || "").trim();
      const quantidade = normalizeOptionalDecimal(item.quantidade);

      if (!descricao && !unidade && quantidade === null) {
        return null;
      }

      return {
        id: String(item.id || randomId()),
        descricao,
        unidade,
        quantidade
      };
    })
    .filter(Boolean);
}

function normalizeRdoCrewList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      const item = value && typeof value === "object" ? value : {};
      const cargoSource = typeof value === "string" ? value : item.cargo || "";
      const cargo = String(cargoSource).trim();
      const quantidade = normalizeOptionalDecimal(item.quantidade);

      if (!cargo && quantidade === null) {
        return null;
      }

      return {
        id: String(item.id || randomId()),
        cargo,
        quantidade
      };
    })
    .filter(Boolean);
}

function validateRdoClima(clima) {
  if (!RDO_CLIMA_OPTIONS.has(String(clima || "").trim())) {
    throw new Error("Selecione um clima valido para o RDO.");
  }
}

function normalizeCatalogKey(value) {
  return String(value || "").trim().toLowerCase();
}

function buildMedicaoItemKey(item) {
  const codigo = normalizeCatalogKey(item.codigo);
  if (codigo) {
    return `codigo:${codigo}`;
  }

  return [
    "item",
    normalizeCatalogKey(item.etapa),
    normalizeCatalogKey(item.descricao),
    normalizeCatalogKey(item.unidade)
  ].join(":");
}

function normalizeMedicaoItemList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      const item = value && typeof value === "object" ? value : {};
      const codigo = String(item.codigo || "").trim();
      const etapa = String(item.etapa || "").trim();
      const descricao = String(item.descricao || "").trim();
      const unidade = String(item.unidade || "").trim();
      const quantidadeTotal = Number(item.quantidadeTotal || 0);
      const valorUnitario = Number(item.valorUnitario || 0);
      const valorTotal = Number(item.valorTotal || 0);
      const quantidadeMedida = Number(item.quantidadeMedida || 0);

      if (!descricao || !unidade) {
        return null;
      }

      const normalized = {
        id: String(item.id || randomId()),
        key: String(item.key || buildMedicaoItemKey({ codigo, etapa, descricao, unidade })),
        codigo,
        etapa,
        descricao,
        unidade,
        quantidadeTotal: Number.isFinite(quantidadeTotal) ? quantidadeTotal : 0,
        valorUnitario: Number.isFinite(valorUnitario) ? valorUnitario : 0,
        valorTotal: Number.isFinite(valorTotal) ? valorTotal : 0,
        quantidadeMedida: Number.isFinite(quantidadeMedida) ? quantidadeMedida : 0
      };

      return normalized;
    })
    .filter(Boolean);
}

function mapMedicaoSummary(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    data: toDateOnlyString(row.data),
    referencia: String(row.referencia || "").trim(),
    itensCount: Number(row.itens_count || 0),
    totalMedido: Number(row.total_medido || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapMedicao(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    data: toDateOnlyString(row.data),
    referencia: String(row.referencia || "").trim(),
    pdfNome: String(row.pdf_nome || "").trim(),
    items: normalizeMedicaoItemList(row.items_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function buildRdoCatalogos(rows) {
  const materiais = new Map();
  const maoDeObra = new Map();

  rows.forEach((row) => {
    [...normalizeRdoItemList(row.materiais_recebidos), ...normalizeRdoItemList(row.materiais_consumidos)].forEach((item) => {
      const key = normalizeCatalogKey(item.descricao);
      if (!key) {
        return;
      }

      materiais.set(key, {
        descricao: item.descricao,
        unidade: item.unidade || ""
      });
    });

    normalizeRdoCrewList(row.mao_obra_presente).forEach((item) => {
      const key = normalizeCatalogKey(item.cargo);
      if (!key) {
        return;
      }

      maoDeObra.set(key, {
        cargo: item.cargo
      });
    });
  });

  return {
    materiais: Array.from(materiais.values()).sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR")),
    maoDeObra: Array.from(maoDeObra.values()).sort((a, b) => a.cargo.localeCompare(b.cargo, "pt-BR"))
  };
}

function mapRdoSummary(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    data: toDateOnlyString(row.data),
    fotosCount: Number(row.fotos_count || 0),
    servicosCount: Number(row.servicos_count || 0),
    materiaisRecebidosCount: Number(row.materiais_recebidos_count || 0),
    materiaisConsumidosCount: Number(row.materiais_consumidos_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRdo(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    data: toDateOnlyString(row.data),
    fotos: normalizePhotoList(row.fotos),
    servicosExecutados: normalizeRdoItemList(row.servicos_executados),
    materiaisRecebidos: normalizeRdoItemList(row.materiais_recebidos),
    materiaisConsumidos: normalizeRdoItemList(row.materiais_consumidos),
    maoDeObraPresente: normalizeRdoCrewList(row.mao_obra_presente),
    clima: String(row.clima || "").trim(),
    observacoesAdicionais: String(row.observacoes_adicionais || "").trim(),
    createdAt: row.created_at,
    updatedAt: row.updated_at
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
      contratante_nome TEXT,
      contratante_logo TEXT,
      contratada_nome TEXT,
      contratada_logo TEXT,
      orcamento_sintetico_arquivo TEXT,
      orcamento_analitico_arquivo TEXT,
      finalizacao_data_entrega DATE,
      finalizacao_aditivos_info TEXT,
      finalizacao_aditivos_valor NUMERIC(14, 2) DEFAULT 0,
      finalizacao_atualizado_em TIMESTAMPTZ
    );
  `);

  await pool.query("ALTER TABLE obras ADD COLUMN IF NOT EXISTS contratante_nome TEXT");
  await pool.query("ALTER TABLE obras ADD COLUMN IF NOT EXISTS contratante_logo TEXT");
  await pool.query("ALTER TABLE obras ADD COLUMN IF NOT EXISTS contratada_nome TEXT");
  await pool.query("ALTER TABLE obras ADD COLUMN IF NOT EXISTS contratada_logo TEXT");
  await pool.query("ALTER TABLE obras ADD COLUMN IF NOT EXISTS orcamento_sintetico_arquivo TEXT");
  await pool.query("ALTER TABLE obras ADD COLUMN IF NOT EXISTS orcamento_analitico_arquivo TEXT");

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mao_obra_pagamentos (
      id TEXT PRIMARY KEY,
      obra_id TEXT NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      descricao TEXT NOT NULL,
      periodo_inicio DATE NOT NULL,
      periodo_fim DATE NOT NULL,
      data_pagamento DATE NOT NULL,
      valor NUMERIC(14, 2) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rdos (
      id TEXT PRIMARY KEY,
      obra_id TEXT NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
      data DATE NOT NULL,
      fotos JSONB NOT NULL DEFAULT '[]'::jsonb,
      servicos_executados JSONB NOT NULL DEFAULT '[]'::jsonb,
      materiais_recebidos JSONB NOT NULL DEFAULT '[]'::jsonb,
      materiais_consumidos JSONB NOT NULL DEFAULT '[]'::jsonb,
      clima TEXT,
      observacoes_adicionais TEXT,
      mao_obra_presente JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query("ALTER TABLE rdos ADD COLUMN IF NOT EXISTS clima TEXT");
  await pool.query("ALTER TABLE rdos ADD COLUMN IF NOT EXISTS observacoes_adicionais TEXT");
  await pool.query("ALTER TABLE rdos ADD COLUMN IF NOT EXISTS mao_obra_presente JSONB NOT NULL DEFAULT '[]'::jsonb");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS medicoes (
      id TEXT PRIMARY KEY,
      obra_id TEXT NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
      data DATE NOT NULL,
      referencia TEXT,
      pdf_nome TEXT,
      items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query("ALTER TABLE medicoes ADD COLUMN IF NOT EXISTS referencia TEXT");
  await pool.query("ALTER TABLE medicoes ADD COLUMN IF NOT EXISTS pdf_nome TEXT");
  await pool.query("ALTER TABLE medicoes ADD COLUMN IF NOT EXISTS items_json JSONB NOT NULL DEFAULT '[]'::jsonb");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      summary TEXT NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      client_ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb");
  await pool.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS client_ip TEXT");
  await pool.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT");

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
  const [obrasResult, comprasResult, maoDeObraResult, rdosResult, rdoCatalogRowsResult, medicoesResult] = await Promise.all([
    pool.query("SELECT * FROM obras ORDER BY nome ASC"),
    pool.query("SELECT * FROM compras ORDER BY created_at ASC"),
    pool.query("SELECT * FROM mao_obra_pagamentos ORDER BY created_at ASC"),
    pool.query(`
      SELECT
        id,
        obra_id,
        data,
        created_at,
        updated_at,
        jsonb_array_length(COALESCE(fotos, '[]'::jsonb)) AS fotos_count,
        jsonb_array_length(COALESCE(servicos_executados, '[]'::jsonb)) AS servicos_count,
        jsonb_array_length(COALESCE(materiais_recebidos, '[]'::jsonb)) AS materiais_recebidos_count,
        jsonb_array_length(COALESCE(materiais_consumidos, '[]'::jsonb)) AS materiais_consumidos_count
      FROM rdos
      ORDER BY data DESC, created_at DESC
    `),
    pool.query(`
      SELECT materiais_recebidos, materiais_consumidos, mao_obra_presente
      FROM rdos
      ORDER BY data ASC, created_at ASC
    `),
    pool.query(`
      SELECT
        id,
        obra_id,
        data,
        referencia,
        created_at,
        updated_at,
        jsonb_array_length(COALESCE(items_json, '[]'::jsonb)) AS itens_count,
        COALESCE((
          SELECT SUM(
            COALESCE((item ->> 'quantidadeMedida')::numeric, 0) *
            COALESCE((item ->> 'valorUnitario')::numeric, 0)
          )
          FROM jsonb_array_elements(COALESCE(items_json, '[]'::jsonb)) AS item
        ), 0) AS total_medido
      FROM medicoes
      ORDER BY data DESC, created_at DESC
    `)
  ]);

  return {
    obras: obrasResult.rows.map(mapObra),
    compras: comprasResult.rows.map(mapCompra),
    maoDeObra: maoDeObraResult.rows.map(mapMaoDeObra),
    rdos: rdosResult.rows.map(mapRdoSummary),
    rdoCatalogos: buildRdoCatalogos(rdoCatalogRowsResult.rows),
    medicoes: medicoesResult.rows.map(mapMedicaoSummary)
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

function getRequestClientData(req) {
  return {
    ip: String((req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress || "").trim(),
    userAgent: String(req.headers["user-agent"] || "").trim()
  };
}

function mapAuditLog(row) {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    details: row.details || {},
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || ""),
    clientIp: row.client_ip || "",
    userAgent: row.user_agent || "",
    user: {
      id: row.user_id || "",
      name: row.user_name || "",
      email: row.user_email || ""
    }
  };
}

async function createAuditLog(req, user, action, entityType, entityId, summary, details = {}) {
  if (!user || !AUDIT_ACTIONS.has(action)) {
    return;
  }

  const client = getRequestClientData(req);
  await pool.query(
    `
      INSERT INTO audit_logs (
        id, user_id, user_name, user_email, action, entity_type, entity_id, summary, details, client_ip, user_agent, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, NOW())
    `,
    [
      randomId(),
      user.id || null,
      user.name || "Usuario",
      user.email || "",
      action,
      entityType,
      entityId || null,
      summary,
      JSON.stringify(details || {}),
      client.ip,
      client.userAgent
    ]
  );
}

async function verifyCurrentUserPassword(userId, password) {
  const result = await pool.query("SELECT password FROM users WHERE id = $1 LIMIT 1", [userId]);
  if (!result.rows.length) {
    return false;
  }

  return verifyPassword(String(password || ""), result.rows[0].password);
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/healthz") {
    sendJson(res, 200, { status: "ok", environment: process.env.NODE_ENV });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/client-version") {
    const target = new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams.get("target") || "portal";
    sendJson(res, 200, {
      target,
      version: getClientVersion(target),
      generatedAt: new Date().toISOString()
    });
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

    try {
      validateNewPassword(newPassword);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }

    const result = await pool.query("SELECT password FROM users WHERE id = $1 LIMIT 1", [user.id]);
    if (!result.rows.length || !verifyPassword(currentPassword, result.rows[0].password)) {
      sendJson(res, 400, { error: "Senha atual invalida." });
      return true;
    }

    await updateUserPasswordAndSessions(user.id, newPassword, parseCookies(req)[SESSION_COOKIE] || "", true);
    await createAuditLog(req, user, "edicao", "usuario", user.id, "Alteracao da propria senha.", {
      ownUser: true
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && pathname.startsWith("/api/users/") && pathname.endsWith("/change-password")) {
    const targetUserId = getResourceId(pathname);
    const body = await parseRequestBody(req);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const isOwnUser = targetUserId === user.id;

    if (!isOwnUser && user.role !== "administrador") {
      sendJson(res, 403, { error: "Voce so pode alterar a propria senha." });
      return true;
    }

    try {
      validateNewPassword(newPassword);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return true;
    }

    const result = await pool.query("SELECT password FROM users WHERE id = $1 LIMIT 1", [targetUserId]);
    if (!result.rows.length) {
      sendJson(res, 404, { error: "Usuario nao encontrado." });
      return true;
    }

    if (isOwnUser && user.role !== "administrador" && !verifyPassword(currentPassword, result.rows[0].password)) {
      sendJson(res, 400, { error: "Senha atual invalida." });
      return true;
    }

    if (isOwnUser && user.role === "administrador" && currentPassword && !verifyPassword(currentPassword, result.rows[0].password)) {
      sendJson(res, 400, { error: "Senha atual invalida." });
      return true;
    }

    await updateUserPasswordAndSessions(
      targetUserId,
      newPassword,
      parseCookies(req)[SESSION_COOKIE] || "",
      isOwnUser
    );

    await createAuditLog(
      req,
      user,
      "edicao",
      "usuario",
      targetUserId,
      isOwnUser ? "Alteracao da propria senha." : `Senha redefinida para ${targetUserId}.`,
      { ownUser: isOwnUser }
    );

    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(res, 200, await getBootstrapPayload());
    return true;
  }

  if (req.method === "GET" && pathname === "/api/users") {
    const result = user.role === "administrador"
      ? await pool.query("SELECT id, name, email, role FROM users ORDER BY name ASC")
      : await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [user.id]);
    sendJson(res, 200, { users: result.rows.map(mapUser) });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/audit-logs") {
    if (!requireAdmin(res, user)) {
      return true;
    }

    const result = await pool.query(
      `
        SELECT id, user_id, user_name, user_email, action, entity_type, entity_id, summary, details, client_ip, user_agent, created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 400
      `
    );
    sendJson(res, 200, { logs: result.rows.map(mapAuditLog) });
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
    await createAuditLog(req, user, "cadastro", "usuario", id, `Usuario ${String(body.name).trim()} cadastrado.`, {
      role: body.role,
      email: String(body.email).trim().toLowerCase()
    });
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/users/")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const userId = getResourceId(pathname);
    if (userId === user.id) {
      sendJson(res, 400, { error: "Voce nao pode excluir o proprio usuario." });
      return true;
    }
    const targetUserResult = await pool.query("SELECT name, email, role FROM users WHERE id = $1 LIMIT 1", [userId]);
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    if (targetUserResult.rows.length) {
      const targetUser = targetUserResult.rows[0];
      await createAuditLog(req, user, "exclusao", "usuario", userId, `Usuario ${targetUser.name} excluido.`, {
        email: targetUser.email,
        role: targetUser.role
      });
    }
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
      `
        INSERT INTO obras (
          id, nome, local, responsavel, data_inicio, orcamento,
          contratante_nome, contratante_logo, contratada_nome, contratada_logo,
          orcamento_sintetico_arquivo, orcamento_analitico_arquivo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        id,
        body.nome,
        body.local,
        body.responsavel,
        body.dataInicio,
        Number(body.orcamento || 0),
        String(body.contratanteNome || "").trim(),
        String(body.contratanteLogo || "").trim(),
        String(body.contratadaNome || "").trim(),
        String(body.contratadaLogo || "").trim(),
        body.orcamentoSinteticoArquivo ? JSON.stringify(body.orcamentoSinteticoArquivo) : null,
        body.orcamentoAnaliticoArquivo ? JSON.stringify(body.orcamentoAnaliticoArquivo) : null
      ]
    );
    await createAuditLog(req, user, "cadastro", "obra", id, `Obra ${String(body.nome).trim()} cadastrada.`, {
      nome: String(body.nome).trim(),
      local: String(body.local).trim(),
      responsavel: String(body.responsavel).trim()
    });
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/obras/") && !pathname.endsWith("/finalizacao")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const obraId = getResourceId(pathname);
    const body = await parseRequestBody(req);
    await pool.query(
      `
        UPDATE obras
        SET nome = $2,
            local = $3,
            responsavel = $4,
            data_inicio = $5,
            orcamento = $6,
            contratante_nome = $7,
            contratante_logo = $8,
            contratada_nome = $9,
            contratada_logo = $10,
            orcamento_sintetico_arquivo = $11,
            orcamento_analitico_arquivo = $12
        WHERE id = $1
      `,
      [
        obraId,
        body.nome,
        body.local,
        body.responsavel,
        body.dataInicio,
        Number(body.orcamento || 0),
        String(body.contratanteNome || "").trim(),
        String(body.contratanteLogo || "").trim(),
        String(body.contratadaNome || "").trim(),
        String(body.contratadaLogo || "").trim(),
        body.orcamentoSinteticoArquivo ? JSON.stringify(body.orcamentoSinteticoArquivo) : null,
        body.orcamentoAnaliticoArquivo ? JSON.stringify(body.orcamentoAnaliticoArquivo) : null
      ]
    );
    await createAuditLog(req, user, "edicao", "obra", obraId, `Obra ${String(body.nome || "").trim() || obraId} atualizada.`, {
      nome: String(body.nome || "").trim(),
      local: String(body.local || "").trim(),
      responsavel: String(body.responsavel || "").trim()
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "PUT" && pathname.endsWith("/finalizacao")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const obraId = getResourceId(pathname);
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
    await createAuditLog(req, user, "edicao", "obra", obraId, `Finalizacao da obra ${obraId} atualizada.`, {
      dataEntrega: body.dataEntrega,
      aditivosValor: Number(body.aditivosValor || 0)
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/obras/")) {
    if (!requireAdmin(res, user)) {
      return true;
    }
    const obraId = getResourceId(pathname);
    const obraResult = await pool.query("SELECT nome, local FROM obras WHERE id = $1 LIMIT 1", [obraId]);
    await pool.query("DELETE FROM obras WHERE id = $1", [obraId]);
    if (obraResult.rows.length) {
      const obra = obraResult.rows[0];
      await createAuditLog(req, user, "exclusao", "obra", obraId, `Obra ${obra.nome} excluida.`, {
        nome: obra.nome,
        local: obra.local
      });
    }
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
    await createAuditLog(req, user, "cadastro", "compra", id, `Compra ${String(body.descricao || "").trim() || id} cadastrada.`, {
      obraId: body.obraId,
      descricao: String(body.descricao || "").trim(),
      categoria: String(body.categoria || "").trim(),
      precoTotal: Number(body.precoTotal || 0)
    });
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/compras/")) {
    const compraId = getResourceId(pathname);
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
    await createAuditLog(req, user, "edicao", "compra", compraId, `Compra ${String(body.descricao || "").trim() || compraId} atualizada.`, {
      obraId: body.obraId,
      descricao: String(body.descricao || "").trim(),
      categoria: String(body.categoria || "").trim(),
      precoTotal: Number(body.precoTotal || 0)
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/compras/")) {
    const compraId = getResourceId(pathname);
    const compraResult = await pool.query("SELECT obra_id, descricao, categoria, preco_total FROM compras WHERE id = $1 LIMIT 1", [compraId]);
    await pool.query("DELETE FROM compras WHERE id = $1", [compraId]);
    if (compraResult.rows.length) {
      const compra = compraResult.rows[0];
      await createAuditLog(req, user, "exclusao", "compra", compraId, `Compra ${compra.descricao} excluida.`, {
        obraId: compra.obra_id,
        categoria: compra.categoria,
        precoTotal: Number(compra.preco_total || 0)
      });
    }
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/mao-de-obra") {
    const body = await parseRequestBody(req);
    requireFields(body, ["obraId", "descricao", "periodoInicio", "periodoFim", "dataPagamento"]);
    const id = randomId();
    await pool.query(
      `
        INSERT INTO mao_obra_pagamentos (
          id, obra_id, created_at, descricao, periodo_inicio, periodo_fim, data_pagamento, valor
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        id,
        body.obraId,
        new Date().toISOString(),
        body.descricao,
        body.periodoInicio,
        body.periodoFim,
        body.dataPagamento,
        Number(body.valor || 0)
      ]
    );
    await createAuditLog(req, user, "cadastro", "mao_de_obra", id, `Pagamento de mao de obra ${String(body.descricao || "").trim() || id} cadastrado.`, {
      obraId: body.obraId,
      descricao: String(body.descricao || "").trim(),
      valor: Number(body.valor || 0)
    });
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/mao-de-obra/")) {
    const pagamentoId = getResourceId(pathname);
    const body = await parseRequestBody(req);
    await pool.query(
      `
        UPDATE mao_obra_pagamentos
        SET obra_id = $2,
            descricao = $3,
            periodo_inicio = $4,
            periodo_fim = $5,
            data_pagamento = $6,
            valor = $7
        WHERE id = $1
      `,
      [
        pagamentoId,
        body.obraId,
        body.descricao,
        body.periodoInicio,
        body.periodoFim,
        body.dataPagamento,
        Number(body.valor || 0)
      ]
    );
    await createAuditLog(req, user, "edicao", "mao_de_obra", pagamentoId, `Pagamento de mao de obra ${String(body.descricao || "").trim() || pagamentoId} atualizado.`, {
      obraId: body.obraId,
      descricao: String(body.descricao || "").trim(),
      valor: Number(body.valor || 0)
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/mao-de-obra/")) {
    const pagamentoId = getResourceId(pathname);
    const pagamentoResult = await pool.query("SELECT obra_id, descricao, valor FROM mao_obra_pagamentos WHERE id = $1 LIMIT 1", [pagamentoId]);
    await pool.query("DELETE FROM mao_obra_pagamentos WHERE id = $1", [pagamentoId]);
    if (pagamentoResult.rows.length) {
      const pagamento = pagamentoResult.rows[0];
      await createAuditLog(req, user, "exclusao", "mao_de_obra", pagamentoId, `Pagamento de mao de obra ${pagamento.descricao} excluido.`, {
        obraId: pagamento.obra_id,
        valor: Number(pagamento.valor || 0)
      });
    }
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/medicoes") {
    const searchParams = new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams;
    const obraId = searchParams.get("obraId") || "";
    const includeItems = searchParams.get("includeItems") === "1";

    if (includeItems) {
      const result = obraId
        ? await pool.query(
            `
              SELECT *
              FROM medicoes
              WHERE obra_id = $1
              ORDER BY data DESC, created_at DESC
            `,
            [obraId]
          )
        : await pool.query(`
              SELECT *
              FROM medicoes
              ORDER BY data DESC, created_at DESC
            `);
      sendJson(res, 200, { medicoes: result.rows.map(mapMedicao) });
      return true;
    }

    const result = obraId
      ? await pool.query(
          `
            SELECT
              id,
              obra_id,
              data,
              referencia,
              created_at,
              updated_at,
              jsonb_array_length(COALESCE(items_json, '[]'::jsonb)) AS itens_count,
              COALESCE((
                SELECT SUM(
                  COALESCE((item ->> 'quantidadeMedida')::numeric, 0) *
                  COALESCE((item ->> 'valorUnitario')::numeric, 0)
                )
                FROM jsonb_array_elements(COALESCE(items_json, '[]'::jsonb)) AS item
              ), 0) AS total_medido
            FROM medicoes
            WHERE obra_id = $1
            ORDER BY data DESC, created_at DESC
          `,
          [obraId]
        )
      : await pool.query(
          `
            SELECT
              id,
              obra_id,
              data,
              referencia,
              created_at,
              updated_at,
              jsonb_array_length(COALESCE(items_json, '[]'::jsonb)) AS itens_count,
              COALESCE((
                SELECT SUM(
                  COALESCE((item ->> 'quantidadeMedida')::numeric, 0) *
                  COALESCE((item ->> 'valorUnitario')::numeric, 0)
                )
                FROM jsonb_array_elements(COALESCE(items_json, '[]'::jsonb)) AS item
              ), 0) AS total_medido
            FROM medicoes
            ORDER BY data DESC, created_at DESC
          `
        );
    sendJson(res, 200, { medicoes: result.rows.map(mapMedicaoSummary) });
    return true;
  }

  if (req.method === "GET" && pathname.startsWith("/api/medicoes/")) {
    const medicaoId = getResourceId(pathname);
    const result = await pool.query("SELECT * FROM medicoes WHERE id = $1 LIMIT 1", [medicaoId]);
    if (!result.rows.length) {
      sendJson(res, 404, { error: "Medicao nao encontrada." });
      return true;
    }

    sendJson(res, 200, { medicao: mapMedicao(result.rows[0]) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/medicoes") {
    const body = await parseRequestBody(req);
    requireFields(body, ["obraId", "data"]);
    const items = normalizeMedicaoItemList(body.items);
    if (!items.length) {
      sendJson(res, 400, { error: "Importe ou carregue os itens da medicao antes de salvar." });
      return true;
    }

    const id = randomId();
    const now = new Date().toISOString();
    await pool.query(
      `
        INSERT INTO medicoes (id, obra_id, data, referencia, pdf_nome, items_json, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
      `,
      [
        id,
        body.obraId,
        body.data,
        String(body.referencia || "").trim(),
        String(body.pdfNome || "").trim(),
        JSON.stringify(items),
        now,
        now
      ]
    );

    await createAuditLog(req, user, "cadastro", "medicao", id, `Medicao de ${body.data} cadastrada.`, {
      obraId: body.obraId,
      data: body.data,
      itensCount: items.length
    });
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/medicoes/")) {
    const medicaoId = getResourceId(pathname);
    const body = await parseRequestBody(req);
    requireFields(body, ["obraId", "data"]);
    const items = normalizeMedicaoItemList(body.items);
    if (!items.length) {
      sendJson(res, 400, { error: "A medicao precisa conter ao menos um item." });
      return true;
    }

    await pool.query(
      `
        UPDATE medicoes
        SET obra_id = $2,
            data = $3,
            referencia = $4,
            pdf_nome = $5,
            items_json = $6::jsonb,
            updated_at = $7
        WHERE id = $1
      `,
      [
        medicaoId,
        body.obraId,
        body.data,
        String(body.referencia || "").trim(),
        String(body.pdfNome || "").trim(),
        JSON.stringify(items),
        new Date().toISOString()
      ]
    );

    await createAuditLog(req, user, "edicao", "medicao", medicaoId, `Medicao de ${body.data} atualizada.`, {
      obraId: body.obraId,
      data: body.data,
      itensCount: items.length
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "GET" && pathname.startsWith("/api/rdos/")) {
    const rdoId = getResourceId(pathname);
    const result = await pool.query("SELECT * FROM rdos WHERE id = $1 LIMIT 1", [rdoId]);
    if (!result.rows.length) {
      sendJson(res, 404, { error: "RDO nao encontrado." });
      return true;
    }

    sendJson(res, 200, { rdo: mapRdo(result.rows[0]) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/rdos") {
    const body = await parseRequestBody(req);
    requireFields(body, ["obraId", "data", "clima"]);
    validateRdoClima(body.clima);

    const id = randomId();
    const fotos = normalizePhotoList(body.fotos, { requireComment: true });
    const servicosExecutados = normalizeRdoItemList(body.servicosExecutados);
    const materiaisRecebidos = normalizeRdoItemList(body.materiaisRecebidos);
    const materiaisConsumidos = normalizeRdoItemList(body.materiaisConsumidos);
    const maoDeObraPresente = normalizeRdoCrewList(body.maoDeObraPresente);
    const observacoesAdicionais = String(body.observacoesAdicionais || "").trim();
    const now = new Date().toISOString();

    await pool.query(
      `
        INSERT INTO rdos (
          id,
          obra_id,
          data,
          fotos,
          servicos_executados,
          materiais_recebidos,
          materiais_consumidos,
          clima,
          observacoes_adicionais,
          mao_obra_presente,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9, $10::jsonb, $11, $12)
      `,
      [
        id,
        body.obraId,
        body.data,
        JSON.stringify(fotos),
        JSON.stringify(servicosExecutados),
        JSON.stringify(materiaisRecebidos),
        JSON.stringify(materiaisConsumidos),
        String(body.clima).trim(),
        observacoesAdicionais,
        JSON.stringify(maoDeObraPresente),
        now,
        now
      ]
    );

    await createAuditLog(req, user, "cadastro", "rdo", id, `RDO de ${body.data} cadastrado.`, {
      obraId: body.obraId,
      data: body.data,
      clima: String(body.clima).trim()
    });

    sendJson(res, 201, { ok: true, id });
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/rdos/")) {
    const rdoId = getResourceId(pathname);
    const body = await parseRequestBody(req);
    requireFields(body, ["obraId", "data", "clima"]);
    validateRdoClima(body.clima);

    const fotos = normalizePhotoList(body.fotos, { requireComment: true });
    const servicosExecutados = normalizeRdoItemList(body.servicosExecutados);
    const materiaisRecebidos = normalizeRdoItemList(body.materiaisRecebidos);
    const materiaisConsumidos = normalizeRdoItemList(body.materiaisConsumidos);
    const maoDeObraPresente = normalizeRdoCrewList(body.maoDeObraPresente);
    const observacoesAdicionais = String(body.observacoesAdicionais || "").trim();

    await pool.query(
      `
        UPDATE rdos
        SET obra_id = $2,
            data = $3,
            fotos = $4::jsonb,
            servicos_executados = $5::jsonb,
            materiais_recebidos = $6::jsonb,
            materiais_consumidos = $7::jsonb,
            clima = $8,
            observacoes_adicionais = $9,
            mao_obra_presente = $10::jsonb,
            updated_at = $11
        WHERE id = $1
      `,
      [
        rdoId,
        body.obraId,
        body.data,
        JSON.stringify(fotos),
        JSON.stringify(servicosExecutados),
        JSON.stringify(materiaisRecebidos),
        JSON.stringify(materiaisConsumidos),
        String(body.clima).trim(),
        observacoesAdicionais,
        JSON.stringify(maoDeObraPresente),
        new Date().toISOString()
      ]
    );

    await createAuditLog(req, user, "edicao", "rdo", rdoId, `RDO de ${body.data} atualizado.`, {
      obraId: body.obraId,
      data: body.data,
      clima: String(body.clima).trim()
    });

    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/rdos/")) {
    const rdoId = getResourceId(pathname);
    const body = await parseRequestBody(req);
    const password = String(body.password || "");

    if (!password) {
      sendJson(res, 400, { error: "Informe a senha do usuario para excluir o RDO." });
      return true;
    }

    if (!(await verifyCurrentUserPassword(user.id, password))) {
      sendJson(res, 401, { error: "Senha invalida. Exclusao cancelada." });
      return true;
    }

    const rdoResult = await pool.query("SELECT obra_id, data, clima FROM rdos WHERE id = $1 LIMIT 1", [rdoId]);
    if (!rdoResult.rows.length) {
      sendJson(res, 404, { error: "RDO nao encontrado." });
      return true;
    }

    await pool.query("DELETE FROM rdos WHERE id = $1", [rdoId]);
    const rdo = rdoResult.rows[0];
    await createAuditLog(req, user, "exclusao", "rdo", rdoId, `RDO de ${toDateOnlyString(rdo.data)} excluido.`, {
      obraId: rdo.obra_id,
      data: toDateOnlyString(rdo.data),
      clima: rdo.clima || ""
    });
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

