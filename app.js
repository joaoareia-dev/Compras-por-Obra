const state = {
  obras: [],
  compras: [],
  maoDeObra: [],
  medicoes: [],
  rdos: [],
  rdoCatalogos: {
    materiais: [],
    maoDeObra: []
  },
  auditLogs: [],
  usuarios: [],
  sessionUser: null,
  loginTakeoverEmail: null,
  lastCompraDate: "",
  lastMaoDeObraDates: {
    periodoInicio: "",
    periodoFim: "",
    dataPagamento: ""
  },
  obraLogoDrafts: {
    contratante: "",
    contratada: ""
  },
  obraArquivoDrafts: {
    orcamentoSintetico: null
  },
  medicaoDraftItems: [],
  medicaoBaseDraft: null,
  medicaoHistory: [],
  medicaoHistoryObraId: "",
  rdoDraftPhotos: [],
  selectedRdoIds: new Set()
};

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const welcomeText = document.getElementById("welcomeText");
const dashboardSection = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");

const obraForm = document.getElementById("obraForm");
const obrasTableBody = document.getElementById("obrasTableBody");
const obraEditIdInput = document.getElementById("obraEditId");
const obraOrcamentoInput = document.getElementById("obraOrcamento");
const obraContratanteNomeInput = document.getElementById("obraContratanteNome");
const obraContratadaNomeInput = document.getElementById("obraContratadaNome");
const obraContratanteLogoInput = document.getElementById("obraContratanteLogoInput");
const obraContratadaLogoInput = document.getElementById("obraContratadaLogoInput");
const obraContratanteLogoPreview = document.getElementById("obraContratanteLogoPreview");
const obraContratadaLogoPreview = document.getElementById("obraContratadaLogoPreview");
const obraOrcamentoTemplateBtn = document.getElementById("obraOrcamentoTemplateBtn");
const obraOrcamentoSinteticoInput = document.getElementById("obraOrcamentoSinteticoInput");
const obraOrcamentoSinteticoPreview = document.getElementById("obraOrcamentoSinteticoPreview");
const obraSubmitBtn = document.getElementById("obraSubmitBtn");
const obraCancelEditBtn = document.getElementById("obraCancelEditBtn");
const obraNewBtn = document.getElementById("obraNewBtn");
const obraEditorPanel = document.getElementById("obraEditorPanel");
const obraEditorTitle = document.getElementById("obraEditorTitle");
const obraEditorSubtitle = document.getElementById("obraEditorSubtitle");
const obraCloseEditorBtn = document.getElementById("obraCloseEditorBtn");
const finalizacaoPanel = document.getElementById("finalizacaoPanel");

const finalizacaoForm = document.getElementById("finalizacaoForm");
const finalizacaoObraSelect = document.getElementById("finalizacaoObra");
const finalizacaoAditivosValorInput = document.getElementById("finalizacaoAditivosValor");

const medicoesTableBody = document.getElementById("medicoesTableBody");
const medicaoFiltroObraSelect = document.getElementById("medicaoFiltroObra");
const medicaoFiltroDataInicioInput = document.getElementById("medicaoFiltroDataInicio");
const medicaoFiltroDataFimInput = document.getElementById("medicaoFiltroDataFim");
const medicaoBuscarBtn = document.getElementById("medicaoBuscarBtn");
const medicaoLimparBuscaBtn = document.getElementById("medicaoLimparBuscaBtn");
const medicaoNewBtn = document.getElementById("medicaoNewBtn");
const medicaoEditorPanel = document.getElementById("medicaoEditorPanel");
const medicaoEditorTitle = document.getElementById("medicaoEditorTitle");
const medicaoEditorSubtitle = document.getElementById("medicaoEditorSubtitle");
const medicaoCloseEditorBtn = document.getElementById("medicaoCloseEditorBtn");
const medicaoForm = document.getElementById("medicaoForm");
const medicaoEditIdInput = document.getElementById("medicaoEditId");
const medicaoObraSelect = document.getElementById("medicaoObra");
const medicaoDataInput = document.getElementById("medicaoData");
const medicaoReferenciaInput = document.getElementById("medicaoReferencia");
const medicaoUseObraPlanilhaBtn = document.getElementById("medicaoUseObraPlanilhaBtn");
const medicaoPlanilhaStatus = document.getElementById("medicaoPlanilhaStatus");
const medicaoItensTableBody = document.getElementById("medicaoItensTableBody");
const medicaoSubmitBtn = document.getElementById("medicaoSubmitBtn");
const medicaoCancelEditBtn = document.getElementById("medicaoCancelEditBtn");

const compraForm = document.getElementById("compraForm");
const comprasTableBody = document.getElementById("comprasTableBody");
const compraEditIdInput = document.getElementById("compraEditId");
const compraSubmitBtn = document.getElementById("compraSubmitBtn");
const compraCancelEditBtn = document.getElementById("compraCancelEditBtn");
const compraObraSelect = document.getElementById("compraObra");
const compraPagoInput = document.getElementById("compraPago");
const compraDescricaoInput = document.getElementById("compraDescricao");
const compraCategoriaInput = document.getElementById("compraCategoria");
const compraFornecedorInput = document.getElementById("compraFornecedor");
const compraUnidadeInput = document.getElementById("compraUnidade");
const compraQuantidadeInput = document.getElementById("compraQuantidade");
const compraPrecoUnitarioInput = document.getElementById("compraPrecoUnitario");
const compraPrecoTotalInput = document.getElementById("compraPrecoTotal");
const descricaoOptions = document.getElementById("descricaoOptions");
const categoriaOptions = document.getElementById("categoriaOptions");
const fornecedorOptions = document.getElementById("fornecedorOptions");
const unidadeOptions = document.getElementById("unidadeOptions");

const maoDeObraForm = document.getElementById("maoDeObraForm");
const maoDeObraTableBody = document.getElementById("maoDeObraTableBody");
const maoDeObraEditIdInput = document.getElementById("maoDeObraEditId");
const maoDeObraSubmitBtn = document.getElementById("maoDeObraSubmitBtn");
const maoDeObraCancelEditBtn = document.getElementById("maoDeObraCancelEditBtn");
const maoDeObraObraSelect = document.getElementById("maoDeObraObra");
const maoDeObraDescricaoInput = document.getElementById("maoDeObraDescricao");
const maoDeObraPeriodoInicioInput = document.getElementById("maoDeObraPeriodoInicio");
const maoDeObraPeriodoFimInput = document.getElementById("maoDeObraPeriodoFim");
const maoDeObraDataPagamentoInput = document.getElementById("maoDeObraDataPagamento");
const maoDeObraValorInput = document.getElementById("maoDeObraValor");

const rdoForm = document.getElementById("rdoForm");
const rdoTableBody = document.getElementById("rdoTableBody");
const rdoEditIdInput = document.getElementById("rdoEditId");
const rdoSubmitBtn = document.getElementById("rdoSubmitBtn");
const rdoCancelEditBtn = document.getElementById("rdoCancelEditBtn");
const rdoNewBtn = document.getElementById("rdoNewBtn");
const rdoEditorPanel = document.getElementById("rdoEditorPanel");
const rdoEditorTitle = document.getElementById("rdoEditorTitle");
const rdoEditorSubtitle = document.getElementById("rdoEditorSubtitle");
const rdoCloseEditorBtn = document.getElementById("rdoCloseEditorBtn");
const rdoObraSelect = document.getElementById("rdoObra");
const rdoDataInput = document.getElementById("rdoData");
const rdoClimaSelect = document.getElementById("rdoClima");
const rdoObservacoesAdicionaisInput = document.getElementById("rdoObservacoesAdicionais");
const rdoFiltroObraSelect = document.getElementById("rdoFiltroObra");
const rdoFiltroDataInicioInput = document.getElementById("rdoFiltroDataInicio");
const rdoFiltroDataFimInput = document.getElementById("rdoFiltroDataFim");
const rdoBuscarBtn = document.getElementById("rdoBuscarBtn");
const rdoLimparBuscaBtn = document.getElementById("rdoLimparBuscaBtn");
const rdoImprimirSelecionadosBtn = document.getElementById("rdoImprimirSelecionadosBtn");
const rdoSelectAllInput = document.getElementById("rdoSelectAll");
const rdoFotosContainer = document.getElementById("rdoFotosContainer");
const rdoServicosContainer = document.getElementById("rdoServicosContainer");
const rdoMateriaisRecebidosContainer = document.getElementById("rdoMateriaisRecebidosContainer");
const rdoMateriaisConsumidosContainer = document.getElementById("rdoMateriaisConsumidosContainer");
const rdoMaoDeObraPresenteContainer = document.getElementById("rdoMaoDeObraPresenteContainer");
const rdoPrintArea = document.getElementById("rdoPrintArea");
const rdoMaterialDescricaoOptions = document.getElementById("rdoMaterialDescricaoOptions");
const rdoMaoDeObraCargoOptions = document.getElementById("rdoMaoDeObraCargoOptions");

const relatorioObraSelect = document.getElementById("relatorioObra");
const relatorioTipoSelect = document.getElementById("relatorioTipo");
const relatorioTodasComprasInput = document.getElementById("relatorioTodasCompras");
const relatorioCurvaAbcInput = document.getElementById("relatorioCurvaAbc");
const relatorioCategoriasSelect = document.getElementById("relatorioCategorias");
const relatorioCabecalho = document.getElementById("relatorioCabecalho");
const relatorioTableHead = document.getElementById("relatorioTableHead");
const relatorioTableBody = document.getElementById("relatorioTableBody");
const resumoRelatorio = document.getElementById("resumoRelatorio");
const aplicarRelatorioBtn = document.getElementById("aplicarRelatorio");
const imprimirRelatorioBtn = document.getElementById("imprimirRelatorio");
const senhaForm = document.getElementById("senhaForm");
const senhaFeedback = document.getElementById("senhaFeedback");
const senhaPanel = document.getElementById("senhaPanel");
const senhaPanelTitle = document.getElementById("senhaPanelTitle");
const senhaPanelSubtitle = document.getElementById("senhaPanelSubtitle");
const senhaTargetUserIdInput = document.getElementById("senhaTargetUserId");
const senhaAtualGroup = document.getElementById("senhaAtualGroup");
const senhaClosePanelBtn = document.getElementById("senhaClosePanelBtn");
const usuarioForm = document.getElementById("usuarioForm");
const usuariosTableBody = document.getElementById("usuariosTableBody");
const usuarioNewBtn = document.getElementById("usuarioNewBtn");
const usuarioFormPanel = document.getElementById("usuarioFormPanel");
const usuarioClosePanelBtn = document.getElementById("usuarioClosePanelBtn");
const auditLogsTableBody = document.getElementById("auditLogsTableBody");
const logsRefreshBtn = document.getElementById("logsRefreshBtn");

const menuButtons = Array.from(document.querySelectorAll(".menu-btn"));
const pages = Array.from(document.querySelectorAll(".page"));
const relatorioDataInicioInput = document.getElementById("relatorioDataInicio");
const relatorioDataFimInput = document.getElementById("relatorioDataFim");

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});
const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short"
});
const numberFormatter = new Intl.NumberFormat("pt-BR");
const currencyInputFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const structuredQuantityFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
});
const RDO_STRUCTURED_FIELD_CONFIGS = {
  servicos: {
    rowClass: "structured",
    primaryKey: "descricao",
    fields: [
      { key: "descricao", type: "text", placeholder: "Descricao do servico executado" },
      { key: "unidade", type: "text", placeholder: "Unidade" },
      { key: "quantidade", type: "number", placeholder: "Quantidade", min: "0", step: "0.001", inputMode: "decimal" }
    ]
  },
  materiais: {
    rowClass: "structured",
    primaryKey: "descricao",
    datalistId: "rdoMaterialDescricaoOptions",
    autocompleteKind: "materiais",
    autoFillFieldKey: "unidade",
    fields: [
      { key: "descricao", type: "text", placeholder: "Descricao do material" },
      { key: "unidade", type: "text", placeholder: "Unidade" },
      { key: "quantidade", type: "number", placeholder: "Quantidade", min: "0", step: "0.001", inputMode: "decimal" }
    ]
  },
  equipe: {
    rowClass: "crew",
    primaryKey: "cargo",
    datalistId: "rdoMaoDeObraCargoOptions",
    autocompleteKind: "maoDeObra",
    fields: [
      { key: "cargo", type: "text", placeholder: "Cargo" },
      { key: "quantidade", type: "number", placeholder: "Quantidade", min: "0", step: "1", inputMode: "numeric" }
    ]
  }
};

function clearLegacyBrowserData() {
  const legacyKeys = ["gc_users", "gc_obras", "gc_compras", "gc_session"];
  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore browser storage cleanup failures and continue booting the app.
    }
  });
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Falha na comunicacao com o servidor.");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
}

async function refreshData() {
  const payload = await apiFetch("/api/bootstrap");
  state.obras = payload.obras || [];
  state.compras = payload.compras || [];
  state.maoDeObra = payload.maoDeObra || [];
  state.medicoes = payload.medicoes || [];
  state.rdos = payload.rdos || [];
  state.rdoCatalogos = payload.rdoCatalogos || { materiais: [], maoDeObra: [] };
  const availableIds = new Set(state.rdos.map((rdo) => rdo.id));
  state.selectedRdoIds = new Set(Array.from(state.selectedRdoIds).filter((id) => availableIds.has(id)));
}

async function refreshUsers() {
  const payload = await apiFetch("/api/users");
  state.usuarios = payload.users || [];
}

async function refreshAuditLogs() {
  if (!isAdmin()) {
    state.auditLogs = [];
    return;
  }

  const payload = await apiFetch("/api/audit-logs");
  state.auditLogs = payload.logs || [];
}

async function refreshAuditLogsIfNeeded() {
  if (isAdmin()) {
    await refreshAuditLogs();
  }
}

function getObras() {
  return state.obras;
}

function getCompras() {
  return state.compras;
}

function getUsuarios() {
  return state.usuarios;
}

function getPagamentosMaoDeObra() {
  return state.maoDeObra;
}

function getMedicoes() {
  return state.medicoes || [];
}

function getRdos() {
  return state.rdos;
}

function getRdoCatalogos() {
  return state.rdoCatalogos || { materiais: [], maoDeObra: [] };
}

function getAuditLogs() {
  return state.auditLogs || [];
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : dateTimeFormatter.format(parsed);
}

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatCurrencyInputValue(value) {
  return currencyInputFormatter.format(Number(value || 0));
}

function parseCurrencyInputValue(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}

function setCurrencyInputValue(input, value) {
  input.value = formatCurrencyInputValue(value);
}

function bindCurrencyInput(input) {
  if (!input || input.readOnly) {
    return;
  }

  input.addEventListener("input", () => {
    input.value = formatCurrencyInputValue(parseCurrencyInputValue(input.value));
  });

  input.addEventListener("blur", () => {
    input.value = formatCurrencyInputValue(parseCurrencyInputValue(input.value));
  });
}

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateInputValue(value) {
  if (!value) {
    return "";
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
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function formatDate(isoDate) {
  if (!isoDate) {
    return "-";
  }

  const normalized = String(isoDate).trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("pt-BR");
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return monthFormatter.format(date);
}

function calcularClasseCurvaAbc(percentualAcumulado) {
  if (percentualAcumulado <= 80) {
    return "A";
  }

  if (percentualAcumulado <= 95) {
    return "B";
  }

  return "C";
}

function getPeriodoRelatorioTexto() {
  if (relatorioTodasComprasInput.checked) {
    return "Todos os lanÃ§amentos da obra";
  }

  const dataInicio = document.getElementById("relatorioDataInicio").value;
  const dataFim = document.getElementById("relatorioDataFim").value;

  if (dataInicio && dataFim) {
    return `${formatDate(dataInicio)} ate ${formatDate(dataFim)}`;
  }

  if (dataInicio) {
    return `A partir de ${formatDate(dataInicio)}`;
  }

  if (dataFim) {
    return `Ate ${formatDate(dataFim)}`;
  }

  return "Sem periodo informado";
}

function getCompraTotal(compra) {
  if (typeof compra.precoTotal === "number") {
    return compra.precoTotal;
  }

  if (typeof compra.quantidade === "number" && typeof compra.precoUnitario === "number") {
    return compra.quantidade * compra.precoUnitario;
  }

  return Number(compra.valor || 0);
}

function getPagamentoMaoDeObraTotal(pagamento) {
  return Number(pagamento?.valor || 0);
}

function getUltimaObraLancadaId() {
  const compras = getCompras();
  if (!compras.length) {
    return "";
  }

  return compras[compras.length - 1]?.obraId || "";
}

function getLastCompraDateValue() {
  return state.lastCompraDate || getCompras()[getCompras().length - 1]?.data || getTodayIsoDate();
}

function getLastMaoDeObraDateValues() {
  const ultimoPagamento = getPagamentosMaoDeObra()[getPagamentosMaoDeObra().length - 1];
  return {
    periodoInicio: state.lastMaoDeObraDates.periodoInicio || ultimoPagamento?.periodoInicio || getTodayIsoDate(),
    periodoFim: state.lastMaoDeObraDates.periodoFim || ultimoPagamento?.periodoFim || getTodayIsoDate(),
    dataPagamento: state.lastMaoDeObraDates.dataPagamento || ultimoPagamento?.dataPagamento || getTodayIsoDate()
  };
}

function rememberCompraDate(dateValue) {
  state.lastCompraDate = normalizeDateInputValue(dateValue) || getTodayIsoDate();
}

function rememberMaoDeObraDates(values) {
  state.lastMaoDeObraDates = {
    periodoInicio: normalizeDateInputValue(values?.periodoInicio) || getTodayIsoDate(),
    periodoFim: normalizeDateInputValue(values?.periodoFim) || getTodayIsoDate(),
    dataPagamento: normalizeDateInputValue(values?.dataPagamento) || getTodayIsoDate()
  };
}

function getAditivosValor(obra) {
  return Number(obra?.finalizacao?.aditivosValor || 0);
}

function getOrcamentoComAditivos(obra) {
  return Number(obra.orcamento || 0) + getAditivosValor(obra);
}

function buildDespesaStats(compras, pagamentosMaoDeObra) {
  const totaisPorObra = new Map();
  let totalGasto = 0;
  let totalPago = 0;

  compras.forEach((compra) => {
    const totalCompra = getCompraTotal(compra);
    totalGasto += totalCompra;
    totalPago += compra.pago ? totalCompra : 0;
    totaisPorObra.set(compra.obraId, (totaisPorObra.get(compra.obraId) || 0) + totalCompra);
  });

  pagamentosMaoDeObra.forEach((pagamento) => {
    const totalPagamento = getPagamentoMaoDeObraTotal(pagamento);
    totalGasto += totalPagamento;
    totalPago += totalPagamento;
    totaisPorObra.set(pagamento.obraId, (totaisPorObra.get(pagamento.obraId) || 0) + totalPagamento);
  });

  return {
    totaisPorObra,
    totalGasto,
    totalPago,
    totalAberto: totalGasto - totalPago
  };
}

function buildObraNameMap(obras) {
  return new Map(obras.map((obra) => [obra.id, obra.nome]));
}

function compareIsoDatesDesc(left, right) {
  return String(right || "").localeCompare(String(left || ""));
}

function getCategoriaLancamentoDisplay(categoria) {
  const normalized = normalizeValue(categoria);
  if (normalized === "mao de obra" || normalized === "mÃ£o de obra") {
    return "MÃ£o de Obra";
  }

  return String(categoria || "").trim() || "Sem categoria";
}

function getLancamentosRelatorio() {
  const compras = getCompras().map((compra) => ({
    tipo: "compra",
    id: compra.id,
    obraId: compra.obraId,
    dataReferencia: compra.data,
    descricao: compra.descricao,
    categoria: getCategoriaLancamentoDisplay(compra.categoria),
    unidade: compra.unidade || "-",
    quantidade: Number(compra.quantidade || 0),
    total: getCompraTotal(compra),
    pago: Boolean(compra.pago)
  }));

  const maoDeObra = getPagamentosMaoDeObra().map((pagamento) => ({
    tipo: "maoDeObra",
    id: pagamento.id,
    obraId: pagamento.obraId,
    dataReferencia: pagamento.dataPagamento,
    descricao: pagamento.descricao,
    categoria: "MÃ£o de Obra",
    unidade: "-",
    quantidade: 1,
    total: getPagamentoMaoDeObraTotal(pagamento),
    pago: true
  }));

  return [...compras, ...maoDeObra];
}

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function buildUniqueValues(values) {
  const unique = new Map();

  values.forEach((value) => {
    const cleaned = String(value || "").trim();
    if (!cleaned) {
      return;
    }

    const normalized = normalizeValue(cleaned);
    if (!unique.has(normalized)) {
      unique.set(normalized, cleaned);
    }
  });

  return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function updateDatalist(element, values) {
  element.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
}

function createClientId(prefix = "item") {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeRdoPhoto(photo, index = 0) {
  const dataUrl = String(photo?.dataUrl || "").trim();
  if (!dataUrl.startsWith("data:image/")) {
    return null;
  }

  const latitude = Number(photo?.latitude);
  const longitude = Number(photo?.longitude);
  const capturedAt = String(photo?.capturedAt || "").trim();

  return {
    id: String(photo?.id || createClientId("rdo-foto")),
    name: String(photo?.name || `Foto ${index + 1}`).trim() || `Foto ${index + 1}`,
    dataUrl,
    comentario: String(photo?.comentario || "").trim(),
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    capturedAt
  };
}

function formatRdoPhotoCoordinate(value, positiveHemisphere, negativeHemisphere) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  const absValue = Math.abs(numeric).toFixed(6).replace(".", ",");
  return `${absValue} deg ${numeric >= 0 ? positiveHemisphere : negativeHemisphere}`;
}

function getRdoPhotoLocationLabel(photo) {
  if (!Number.isFinite(Number(photo?.latitude)) || !Number.isFinite(Number(photo?.longitude))) {
    return "";
  }

  const latitudeLabel = formatRdoPhotoCoordinate(photo.latitude, "N", "S");
  const longitudeLabel = formatRdoPhotoCoordinate(photo.longitude, "L", "O");
  return `Lat: ${latitudeLabel} | Lon: ${longitudeLabel}`;
}

function getRdoDraftPhotos() {
  return state.rdoDraftPhotos;
}

function setRdoDraftPhotos(photos) {
  state.rdoDraftPhotos = Array.isArray(photos)
    ? photos.map((photo, index) => normalizeRdoPhoto(photo, index)).filter(Boolean)
    : [];
  renderRdoFotos();
}

function setObraLogoDraft(type, dataUrl) {
  state.obraLogoDrafts = {
    ...state.obraLogoDrafts,
    [type]: String(dataUrl || "")
  };
  renderObraLogoPreviews();
}

function normalizeObraArquivoDraft(fileDraft) {
  if (!fileDraft || typeof fileDraft !== "object") {
    return null;
  }

  const name = String(fileDraft.name || "").trim();
  const dataUrl = String(fileDraft.dataUrl || "").trim();
  const mimeType = String(fileDraft.mimeType || "").trim();
  if (!name || !dataUrl) {
    return null;
  }

  return {
    name,
    dataUrl,
    mimeType
  };
}

function setObraArquivoDraft(type, fileDraft) {
  state.obraArquivoDrafts = {
    ...state.obraArquivoDrafts,
    [type]: normalizeObraArquivoDraft(fileDraft)
  };
  renderObraArquivoPreviews();
}

function renderObraLogoPreview(container, label, dataUrl, type) {
  if (!container) {
    return;
  }

  if (!dataUrl) {
    container.className = "logo-preview empty";
    container.innerHTML = `Nenhum logotipo de ${label.toLowerCase()} carregado.`;
    return;
  }

  container.className = "logo-preview";
  container.innerHTML = `
    <img src="${dataUrl}" alt="Logotipo da ${label.toLowerCase()}" />
    <button type="button" class="btn ghost" data-obra-logo-clear="${type}">Remover logotipo</button>
  `;
}

function renderObraLogoPreviews() {
  renderObraLogoPreview(obraContratanteLogoPreview, "Contratante", state.obraLogoDrafts.contratante, "contratante");
  renderObraLogoPreview(obraContratadaLogoPreview, "Contratada", state.obraLogoDrafts.contratada, "contratada");
}

function renderObraArquivoPreview(container, label, fileDraft, type) {
  if (!container) {
    return;
  }

  if (!fileDraft) {
    container.className = "file-preview empty";
    container.innerHTML = `Nenhuma ${label.toLowerCase()} anexada.`;
    return;
  }

  container.className = "file-preview";
  container.innerHTML = `
    <div class="file-preview-info">
      <strong>${escapeHtml(fileDraft.name)}</strong>
      <a href="${fileDraft.dataUrl}" download="${escapeHtml(fileDraft.name)}">Baixar arquivo</a>
    </div>
    <button type="button" class="btn ghost" data-obra-arquivo-clear="${type}">Remover arquivo</button>
  `;
}

function renderObraArquivoPreviews() {
  renderObraArquivoPreview(
    obraOrcamentoSinteticoPreview,
    "planilha sintÃ©tica",
    state.obraArquivoDrafts.orcamentoSintetico,
    "orcamentoSintetico"
  );
}

function normalizeMedicaoItemKey(item) {
  const codigo = normalizeValue(item?.codigo);
  if (codigo) {
    return `codigo:${codigo}`;
  }

  return [
    "item",
    normalizeValue(item?.etapa),
    normalizeValue(item?.descricao),
    normalizeValue(item?.unidade)
  ].join(":");
}

function parseLocaleNumber(value) {
  const normalized = String(value || "")
    .replace(/\s+/g, "")
    .replace(/R\$/gi, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getObraMedicaoBaseArquivo(obra) {
  if (!obra) {
    return null;
  }

  return obra.orcamentoSinteticoArquivo || null;
}

async function createFileFromStoredAttachment(fileDraft) {
  const normalizedDraft = normalizeObraArquivoDraft(fileDraft);
  if (!normalizedDraft?.dataUrl || !normalizedDraft?.name) {
    return null;
  }

  const response = await fetch(normalizedDraft.dataUrl);
  const blob = await response.blob();
  return new File([blob], normalizedDraft.name, {
    type: normalizedDraft.mimeType || blob.type || "application/vnd.ms-excel"
  });
}

function normalizeMedicaoItem(item = {}, index = 0) {
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

  return {
    id: String(item.id || createClientId(`medicao-${index + 1}`)),
    key: String(item.key || normalizeMedicaoItemKey({ codigo, etapa, descricao, unidade })),
    codigo,
    etapa,
    descricao,
    unidade,
    quantidadeTotal: Number.isFinite(quantidadeTotal) ? quantidadeTotal : 0,
    valorUnitario: Number.isFinite(valorUnitario) ? valorUnitario : 0,
    valorTotal: Number.isFinite(valorTotal) ? valorTotal : 0,
    quantidadeMedida: Number.isFinite(quantidadeMedida) ? quantidadeMedida : 0
  };
}

function cloneMedicaoItems(items, options = {}) {
  const { zeroMeasured = false } = options;
  return Array.isArray(items)
    ? items
        .map((item, index) => {
          const normalized = normalizeMedicaoItem(item, index);
          if (!normalized) {
            return null;
          }

          return {
            ...normalized,
            id: createClientId("medicao-item"),
            quantidadeMedida: zeroMeasured ? 0 : normalized.quantidadeMedida
          };
        })
        .filter(Boolean)
    : [];
}

function getMedicaoDraftItems() {
  return state.medicaoDraftItems || [];
}

function setMedicaoDraftItems(items) {
  state.medicaoDraftItems = Array.isArray(items)
    ? items.map((item, index) => normalizeMedicaoItem(item, index)).filter(Boolean)
    : [];
  renderMedicaoDraftTable();
}

function setMedicaoBaseDraft(fileDraft = null) {
  if (!fileDraft || typeof fileDraft !== "object") {
    state.medicaoBaseDraft = null;
    return;
  }

  const name = String(fileDraft.name || "").trim();
  const source = String(fileDraft.source || "").trim();
  state.medicaoBaseDraft = name ? { name, source } : null;
}

function setMedicaoHistory(obraId, medicoes = []) {
  state.medicaoHistoryObraId = String(obraId || "");
  state.medicaoHistory = Array.isArray(medicoes) ? medicoes : [];
}

function getMedicaoSummaryById(id) {
  return getMedicoes().find((medicao) => medicao.id === id) || null;
}

async function fetchMedicaoDetail(medicaoId) {
  const result = await apiFetch(`/api/medicoes/${medicaoId}`);
  return result.medicao;
}

async function fetchMedicoesByObra(obraId, includeItems = false) {
  if (!obraId) {
    return [];
  }

  const params = new URLSearchParams({ obraId });
  if (includeItems) {
    params.set("includeItems", "1");
  }

  const result = await apiFetch(`/api/medicoes?${params.toString()}`);
  return result.medicoes || [];
}

function buildMedicaoAcumuladoAnteriorMap(obraId, currentMedicaoId = "") {
  if (!obraId || state.medicaoHistoryObraId !== obraId) {
    return new Map();
  }

  const totais = new Map();
  state.medicaoHistory
    .filter((medicao) => medicao.id !== currentMedicaoId)
    .forEach((medicao) => {
      (medicao.items || []).forEach((item) => {
        const key = item.key || normalizeMedicaoItemKey(item);
        totais.set(key, (totais.get(key) || 0) + Number(item.quantidadeMedida || 0));
      });
    });

  return totais;
}

function formatMedicaoBaseStatus(message = "") {
  if (medicaoPlanilhaStatus) {
    medicaoPlanilhaStatus.textContent = message;
  }
}

function getFilteredMedicoes() {
  const obraId = medicaoFiltroObraSelect?.value || "";
  const dataInicio = medicaoFiltroDataInicioInput?.value || "";
  const dataFim = medicaoFiltroDataFimInput?.value || "";

  return [...getMedicoes()]
    .filter((medicao) => {
      const matchObra = !obraId || medicao.obraId === obraId;
      const matchInicio = !dataInicio || medicao.data >= dataInicio;
      const matchFim = !dataFim || medicao.data <= dataFim;
      return matchObra && matchInicio && matchFim;
    })
    .sort((left, right) => compareIsoDatesDesc(left.data, right.data));
}

function renderMedicoes() {
  if (!medicoesTableBody) {
    return;
  }

  const medicoes = getFilteredMedicoes();
  const obraMap = buildObraNameMap(getObras());

  if (!medicoes.length) {
    medicoesTableBody.innerHTML = `<tr><td colspan="6" class="empty">Nenhuma mediÃƒÂ§ÃƒÂ£o encontrada para os filtros selecionados.</td></tr>`;
    return;
  }

  medicoesTableBody.innerHTML = medicoes
    .map(
      (medicao) => `
        <tr>
          <td>${formatDate(medicao.data)}</td>
          <td>${escapeHtml(obraMap.get(medicao.obraId) || "Obra removida")}</td>
          <td>${escapeHtml(medicao.referencia || "-")}</td>
          <td>${medicao.itensCount}</td>
          <td>${formatCurrency(medicao.totalMedido || 0)}</td>
          <td>
            <button class="btn ghost" data-medicao-edit="${medicao.id}">Editar</button>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderMedicaoDraftTable() {
  if (!medicaoItensTableBody) {
    return;
  }

  const items = getMedicaoDraftItems();
  if (!items.length) {
    medicaoItensTableBody.innerHTML = `<tr><td colspan="10" class="empty">Leia a planilha sintética da obra ou reaproveite os itens da última medição.</td></tr>`;
    return;
  }

  const obraId = medicaoObraSelect?.value || "";
  const currentMedicaoId = medicaoEditIdInput?.value || "";
  const acumuladoAnteriorMap = buildMedicaoAcumuladoAnteriorMap(obraId, currentMedicaoId);

  medicaoItensTableBody.innerHTML = items
    .map((item) => {
      const acumuladoAnterior = acumuladoAnteriorMap.get(item.key) || 0;
      const quantidadeMedida = Number(item.quantidadeMedida || 0);
      const quantidadeAcumulada = acumuladoAnterior + quantidadeMedida;
      const saldo = Number(item.quantidadeTotal || 0) - quantidadeAcumulada;

      return `
        <tr>
          <td>${escapeHtml(item.etapa || "-")}</td>
          <td>${escapeHtml(item.codigo || "-")}</td>
          <td class="medicao-item-desc">${escapeHtml(item.descricao)}</td>
          <td>${escapeHtml(item.unidade)}</td>
          <td class="numeric-cell">${formatStructuredQuantity(item.quantidadeTotal)}</td>
          <td class="numeric-cell">${formatCurrency(item.valorUnitario)}</td>
          <td class="numeric-cell">${formatCurrency(item.valorTotal)}</td>
          <td>
            <input
              type="number"
              class="medicao-measured-input"
              data-medicao-qtd="${item.id}"
              min="0"
              step="0.001"
              inputmode="decimal"
              value="${Number.isFinite(quantidadeMedida) ? quantidadeMedida : 0}"
            />
          </td>
          <td class="numeric-cell">${formatStructuredQuantity(quantidadeAcumulada)}</td>
          <td class="numeric-cell ${saldo < 0 ? "saldo-negative" : ""}">${formatStructuredQuantity(saldo)}</td>
        </tr>
      `;
    })
    .join("");
}

function resetMedicaoForm() {
  if (!medicaoForm) {
    return;
  }

  medicaoForm.reset();
  medicaoForm.dataset.originalObraId = "";
  medicaoEditIdInput.value = "";
  medicaoDataInput.value = getTodayIsoDate();
  medicaoReferenciaInput.value = "";
  medicaoSubmitBtn.textContent = "Salvar MediÃ§Ã£o";
  medicaoCancelEditBtn.classList.add("hidden");
  setMedicaoHistory("", []);
  setMedicaoBaseDraft(null);
  setMedicaoDraftItems([]);

  const obraSelecionada = medicaoFiltroObraSelect?.value || medicaoObraSelect?.value || "";
  if (obraSelecionada && Array.from(medicaoObraSelect.options).some((option) => option.value === obraSelecionada)) {
    medicaoObraSelect.value = obraSelecionada;
  }

  formatMedicaoBaseStatus("Selecione a obra e leia a planilha sintÃ©tica padrÃ£o cadastrada, com colunas Item, CÃ³digo, Banco, DescriÃ§Ã£o, Und, Quant., Valor Unit, Valor Unit com BDI, Total e Peso (%).");
}

function preencherFormularioMedicao(medicao) {
  medicaoForm.dataset.originalObraId = medicao.obraId;
  medicaoEditIdInput.value = medicao.id;
  medicaoObraSelect.value = medicao.obraId;
  medicaoDataInput.value = normalizeDateInputValue(medicao.data);
  medicaoReferenciaInput.value = medicao.referencia || "";
  medicaoSubmitBtn.textContent = "Atualizar MediÃ§Ã£o";
  medicaoCancelEditBtn.classList.remove("hidden");
  setMedicaoBaseDraft(medicao.pdfNome ? { name: medicao.pdfNome, source: "salvo" } : null);
  formatMedicaoBaseStatus(
    medicao.pdfNome
      ? `Base carregada da mediÃ§Ã£o salva. Planilha de origem: ${medicao.pdfNome}.`
      : "Base carregada da mediÃ§Ã£o salva."
  );
  setMedicaoDraftItems(cloneMedicaoItems(medicao.items));
}

async function loadMedicaoHistoryForObra(obraId) {
  if (!obraId) {
    setMedicaoHistory("", []);
    return [];
  }

  const medicoes = await fetchMedicoesByObra(obraId, true);
  setMedicaoHistory(obraId, medicoes);
  return medicoes;
}

async function carregarBaseNovaMedicao(obraId) {
  if (!obraId) {
    setMedicaoHistory("", []);
    setMedicaoDraftItems([]);
    setMedicaoBaseDraft(null);
    formatMedicaoBaseStatus("Selecione uma obra para iniciar a mediÃ§Ã£o.");
    return;
  }

  const medicoes = await loadMedicaoHistoryForObra(obraId);
  const ultimaMedicao = medicoes[0] || null;

  if (!medicaoReferenciaInput.value.trim()) {
    medicaoReferenciaInput.value = `MediÃ§Ã£o ${String(medicoes.length + 1).padStart(2, "0")}`;
  }

  if (!ultimaMedicao) {
    setMedicaoDraftItems([]);
    setMedicaoBaseDraft(null);
    formatMedicaoBaseStatus("Nenhuma mediÃ§Ã£o anterior encontrada para esta obra. Cadastre a planilha sintÃ©tica da obra no menu Obras e use a leitura local da planilha.");
    return;
  }

  setMedicaoDraftItems(cloneMedicaoItems(ultimaMedicao.items, { zeroMeasured: true }));
  setMedicaoBaseDraft(ultimaMedicao.pdfNome ? { name: ultimaMedicao.pdfNome, source: "historico" } : null);
  formatMedicaoBaseStatus(
    `Itens reaproveitados da Ãºltima mediÃ§Ã£o da obra (${formatDate(ultimaMedicao.data)}). ${
      ultimaMedicao.pdfNome ? `Planilha de origem: ${ultimaMedicao.pdfNome}.` : ""
    }`
  );
}

async function openMedicaoEditor(medicao = null) {
  if (!medicaoEditorPanel) {
    return;
  }

  medicaoEditorPanel.classList.remove("hidden");

  if (medicao) {
    medicaoEditorTitle.textContent = "Editar MediÃ§Ã£o";
    medicaoEditorSubtitle.textContent = "Atualize as quantidades medidas mantendo o histÃ³rico do item por obra.";
    await loadMedicaoHistoryForObra(medicao.obraId);
    preencherFormularioMedicao(medicao);
    return;
  }

  medicaoEditorTitle.textContent = "Nova MediÃ§Ã£o";
  medicaoEditorSubtitle.textContent = "Reaproveite a base da Ãºltima mediÃ§Ã£o da obra ou releia a planilha sintÃ©tica padrÃ£o.";
  resetMedicaoForm();
  const obraPrefill = medicaoFiltroObraSelect?.value || medicaoObraSelect?.value || "";
  if (obraPrefill && Array.from(medicaoObraSelect.options).some((option) => option.value === obraPrefill)) {
    medicaoObraSelect.value = obraPrefill;
    await carregarBaseNovaMedicao(obraPrefill);
  }
}

function closeMedicaoEditor() {
  if (!medicaoEditorPanel) {
    return;
  }

  medicaoEditorPanel.classList.add("hidden");
  resetMedicaoForm();
}

function mergeMedicaoMeasuredValues(items) {
  const currentMap = new Map(getMedicaoDraftItems().map((item) => [item.key, Number(item.quantidadeMedida || 0)]));
  return items.map((item) => ({
    ...item,
    quantidadeMedida: currentMap.get(item.key) || 0
  }));
}

function buildPdfRows(textItems) {
  const rows = [];

  textItems.forEach((item) => {
    const text = String(item.str || "").replace(/\s+/g, " ").trim();
    if (!text) {
      return;
    }

    const y = Math.round((item.transform?.[5] || 0) * 2) / 2;
    const x = item.transform?.[4] || 0;
    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 1.5);
    if (!row) {
      row = { y, parts: [] };
      rows.push(row);
    }

    row.parts.push({ x, text });
  });

  return rows
    .sort((left, right) => right.y - left.y)
    .map((row) => ({
      y: row.y,
      parts: row.parts.sort((left, right) => left.x - right.x)
    }));
}

function buildPdfTextLines(textItems) {
  return buildPdfRows(textItems)
    .map((row) => row.parts.map((part) => part.text).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const ORCAMENTO_SINTETICO_TEMPLATE_HEADERS = [
  "Item",
  "Código",
  "Banco",
  "Descrição",
  "Und",
  "Quant.",
  "Valor Unit",
  "Valor Unit com BDI",
  "Total",
  "Peso (%)"
];

function getXlsxLibrary() {
  if (!window.XLSX) {
    throw new Error("A biblioteca de planilhas não foi carregada. Atualize a página e tente novamente.");
  }

  return window.XLSX;
}

function normalizeSpreadsheetHeader(value) {
  return normalizeValue(value).replace(/[^a-z0-9%]+/g, "");
}

function isStandardMedicaoNumericCode(value) {
  return /^\d+(?:\.\d+)*$/.test(String(value || "").trim());
}

function getStandardMedicaoHierarchyLevel(code) {
  const normalized = String(code || "").trim();
  return normalized ? normalized.split(".").filter(Boolean).length : 0;
}

function updateStandardMedicaoStageTrail(stageTrail, code, description) {
  const level = getStandardMedicaoHierarchyLevel(code);
  if (!level || !description) {
    return;
  }

  stageTrail[level - 1] = `${code} - ${description}`.trim();
  stageTrail.length = level;
}

function buildStandardMedicaoStagePath(stageTrail, itemCode) {
  const itemLevel = getStandardMedicaoHierarchyLevel(itemCode);
  if (!itemLevel) {
    return stageTrail.filter(Boolean).join(" / ");
  }

  return stageTrail.slice(0, Math.max(0, itemLevel - 1)).filter(Boolean).join(" / ");
}

function finalizeStandardMedicaoItem(items, item) {
  if (!item?.descricao || !item?.unidade) {
    return;
  }

  const normalized = normalizeMedicaoItem({
    codigo: item.codigo || "",
    etapa: item.etapa || "",
    descricao: item.descricao,
    unidade: item.unidade,
    quantidadeTotal: Number(item.quantidadeTotal || 0),
    valorUnitario: Number(item.valorUnitario || 0),
    valorTotal: Number(item.valorTotal || 0),
    quantidadeMedida: 0
  });

  if (normalized) {
    items.push({
      ...normalized,
      id: createClientId("medicao-item")
    });
  }
}

function findOrcamentoSinteticoHeaderIndexes(rows) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
    const indexes = {};

    row.forEach((cell, cellIndex) => {
      const normalized = normalizeSpreadsheetHeader(cell);
      if (normalized === "item") {
        indexes.item = cellIndex;
      } else if (normalized === "codigo") {
        indexes.codigo = cellIndex;
      } else if (normalized === "banco") {
        indexes.banco = cellIndex;
      } else if (normalized === "descricao") {
        indexes.descricao = cellIndex;
      } else if (normalized === "und" || normalized === "unid" || normalized === "unidade") {
        indexes.unidade = cellIndex;
      } else if (normalized.startsWith("quant")) {
        indexes.quantidade = cellIndex;
      } else if (normalized === "valorunit") {
        indexes.valorUnit = cellIndex;
      } else if (normalized === "valorunitcombdi") {
        indexes.valorUnitBdi = cellIndex;
      } else if (normalized === "total") {
        indexes.total = cellIndex;
      } else if (normalized.startsWith("peso")) {
        indexes.peso = cellIndex;
      }
    });

    if (
      Number.isInteger(indexes.item) &&
      Number.isInteger(indexes.codigo) &&
      Number.isInteger(indexes.banco) &&
      Number.isInteger(indexes.descricao) &&
      Number.isInteger(indexes.unidade) &&
      Number.isInteger(indexes.quantidade) &&
      Number.isInteger(indexes.valorUnitBdi) &&
      Number.isInteger(indexes.total)
    ) {
      return {
        headerRowIndex: rowIndex,
        indexes
      };
    }
  }

  return null;
}

function readSpreadsheetCell(row, index) {
  if (!Array.isArray(row) || !Number.isInteger(index)) {
    return "";
  }

  return String(row[index] ?? "").trim();
}

function isEmptySpreadsheetRow(row) {
  return !Array.isArray(row) || row.every((cell) => String(cell ?? "").trim() === "");
}

function parseStandardMedicaoItemsFromSpreadsheetRows(rows) {
  const headerInfo = findOrcamentoSinteticoHeaderIndexes(rows);
  if (!headerInfo) {
    return [];
  }

  const { headerRowIndex, indexes } = headerInfo;
  const items = [];
  const stageTrail = [];
  let currentItem = null;

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isEmptySpreadsheetRow(row)) {
      continue;
    }

    const columns = {
      item: readSpreadsheetCell(row, indexes.item),
      code: readSpreadsheetCell(row, indexes.codigo),
      bank: readSpreadsheetCell(row, indexes.banco),
      desc: readSpreadsheetCell(row, indexes.descricao),
      unit: readSpreadsheetCell(row, indexes.unidade),
      qty: readSpreadsheetCell(row, indexes.quantidade),
      unitPrice: readSpreadsheetCell(row, indexes.valorUnit),
      unitPriceBdi: readSpreadsheetCell(row, indexes.valorUnitBdi),
      total: readSpreadsheetCell(row, indexes.total),
      weight: readSpreadsheetCell(row, indexes.peso)
    };

    const hasItemCode = isStandardMedicaoNumericCode(columns.item);
    const hasCodeBank = Boolean(columns.code && columns.bank);
    const hasDescription = Boolean(columns.desc);
    const hasUnit = Boolean(columns.unit);
    const hasQty = Boolean(columns.qty);
    const hasBdiValue = Boolean(columns.unitPriceBdi || columns.unitPrice);
    const hasTotal = Boolean(columns.total);

    if (hasItemCode && !hasCodeBank && hasDescription && !hasUnit && hasTotal) {
      finalizeStandardMedicaoItem(items, currentItem);
      currentItem = null;
      updateStandardMedicaoStageTrail(stageTrail, columns.item, columns.desc);
      continue;
    }

    if (hasItemCode && hasCodeBank && hasDescription && hasUnit && hasQty && hasBdiValue && hasTotal) {
      finalizeStandardMedicaoItem(items, currentItem);
      currentItem = {
        codigo: columns.item,
        etapa: buildStandardMedicaoStagePath(stageTrail, columns.item),
        descricao: columns.desc,
        unidade: columns.unit,
        quantidadeTotal: parseLocaleNumber(columns.qty),
        valorUnitario: parseLocaleNumber(columns.unitPriceBdi) || parseLocaleNumber(columns.unitPrice),
        valorTotal: parseLocaleNumber(columns.total)
      };
      continue;
    }

    if (currentItem && !columns.item && !columns.code && !columns.bank && hasDescription) {
      currentItem.descricao = `${currentItem.descricao} ${columns.desc}`.replace(/\s+/g, " ").trim();
    }
  }

  finalizeStandardMedicaoItem(items, currentItem);
  return items;
}

function buildOrcamentoSinteticoTemplateWorkbook() {
  const XLSX = getXlsxLibrary();
  const worksheetRows = [
    ORCAMENTO_SINTETICO_TEMPLATE_HEADERS,
    ["1", "", "", "SERVIÇOS PRELIMINARES", "", "1", "", "451872,55", "451872,55", "8,69"],
    ["1.1", "103689", "SINAPI", "FORNECIMENTO E INSTALAÇÃO DE PLACA DE OBRA COM CHAPA GALVANIZADA E ESTRUTURA DE MADEIRA. AF_03/2022_PS", "m²", "6,48", "405,25", "506,56", "3282,50", "0,06"]
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orcamento Sintetico");
  return workbook;
}

function downloadOrcamentoSinteticoTemplate() {
  const XLSX = getXlsxLibrary();
  const workbook = buildOrcamentoSinteticoTemplateWorkbook();
  XLSX.writeFile(workbook, "modelo_orcamento_sintetico.xls", { bookType: "xls" });
}

async function importMedicaoPlanilha(file) {
  const XLSX = getXlsxLibrary();
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("A planilha selecionada nao possui abas legiveis.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false
  });

  const parsedItems = parseStandardMedicaoItemsFromSpreadsheetRows(rows);
  if (!parsedItems.length) {
    throw new Error("Nao foi possivel identificar itens na planilha. Use o modelo padrao do orcamento sintetico.");
  }

  setMedicaoBaseDraft({ name: file.name, source: "importado" });
  setMedicaoDraftItems(mergeMedicaoMeasuredValues(parsedItems));
  formatMedicaoBaseStatus(`${parsedItems.length} itens lidos da planilha ${file.name}. Revise as quantidades medidas antes de salvar.`);
}

function populateRdoAutocomplete() {
  const catalogos = getRdoCatalogos();
  updateDatalist(
    rdoMaterialDescricaoOptions,
    buildUniqueValues(catalogos.materiais.map((item) => item.descricao))
  );
  updateDatalist(
    rdoMaoDeObraCargoOptions,
    buildUniqueValues(catalogos.maoDeObra.map((item) => item.cargo))
  );
}

function findRdoMaterialSuggestion(descricao) {
  const target = normalizeValue(descricao);
  if (!target) {
    return null;
  }

  return getRdoCatalogos().materiais.find((item) => normalizeValue(item.descricao) === target) || null;
}

function findRdoMaoDeObraSuggestion(cargo) {
  const target = normalizeValue(cargo);
  if (!target) {
    return null;
  }

  return getRdoCatalogos().maoDeObra.find((item) => normalizeValue(item.cargo) === target) || null;
}

function createDynamicTextRow(value = "", placeholder = "") {
  const row = document.createElement("div");
  row.className = "dynamic-input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "dynamic-text-input";
  input.value = value;
  input.placeholder = placeholder;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn ghost dynamic-remove-btn";
  removeButton.dataset.dynamicRemove = "true";
  removeButton.textContent = "Remover";

  row.appendChild(input);
  row.appendChild(removeButton);
  return row;
}

function createStructuredRow(config, value = {}) {
  const row = document.createElement("div");
  row.className = `dynamic-input-row ${config.rowClass || ""}`.trim();

  config.fields.forEach((field) => {
    const input = document.createElement("input");
    input.type = field.type || "text";
    input.className = "dynamic-structured-input";
    input.dataset.fieldKey = field.key;
    input.placeholder = field.placeholder || "";
    if (field.min !== undefined) {
      input.min = field.min;
    }
    if (field.step !== undefined) {
      input.step = field.step;
    }
    if (field.inputMode) {
      input.inputMode = field.inputMode;
    }
    if (config.datalistId && field.key === config.primaryKey) {
      input.setAttribute("list", config.datalistId);
      input.autocomplete = "off";
    }

    const fieldValue = value?.[field.key];
    input.value = fieldValue === null || fieldValue === undefined ? "" : String(fieldValue);
    row.appendChild(input);
  });

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn ghost dynamic-remove-btn";
  removeButton.dataset.dynamicRemove = "true";
  removeButton.textContent = "Remover";
  row.appendChild(removeButton);
  return row;
}

function syncDynamicTextContainer(container) {
  if (!container) {
    return;
  }

  const placeholder = container.dataset.placeholder || "";
  const rows = Array.from(container.querySelectorAll(".dynamic-input-row"));

  rows.forEach((row, index) => {
    const input = row.querySelector(".dynamic-text-input");
    if (!input) {
      row.remove();
      return;
    }

    if (!input.value.trim() && index < rows.length - 1) {
      row.remove();
    }
  });

  const currentRows = Array.from(container.querySelectorAll(".dynamic-input-row"));
  const lastRow = currentRows[currentRows.length - 1];
  const lastInput = lastRow?.querySelector(".dynamic-text-input");

  if (!lastInput || lastInput.value.trim()) {
    container.appendChild(createDynamicTextRow("", placeholder));
  }

  Array.from(container.querySelectorAll(".dynamic-input-row")).forEach((row, index, allRows) => {
    const input = row.querySelector(".dynamic-text-input");
    const removeButton = row.querySelector("[data-dynamic-remove]");
    const isOnlyEmptyRow = allRows.length === 1 && !input?.value.trim();
    removeButton?.classList.toggle("hidden", isOnlyEmptyRow);
    row.classList.toggle("is-empty", !input?.value.trim() && index === allRows.length - 1);
  });
}

function hydrateDynamicTextContainer(container, values, placeholder) {
  if (!container) {
    return;
  }

  container.dataset.placeholder = placeholder;
  container.innerHTML = "";

  const normalizedValues = Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];

  normalizedValues.forEach((value) => {
    container.appendChild(createDynamicTextRow(value, placeholder));
  });

  container.appendChild(createDynamicTextRow("", placeholder));
  syncDynamicTextContainer(container);
}

function getDynamicTextValues(container) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(".dynamic-text-input"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function getStructuredRowValues(row, config) {
  const values = {};
  config.fields.forEach((field) => {
    const input = row.querySelector(`[data-field-key="${field.key}"]`);
    values[field.key] = String(input?.value || "").trim();
  });
  return values;
}

function isStructuredRowEmpty(values) {
  return Object.values(values).every((value) => !String(value || "").trim());
}

function applyStructuredAutocomplete(row, config) {
  if (!row || !config?.autocompleteKind) {
    return;
  }

  const primaryInput = row.querySelector(`[data-field-key="${config.primaryKey}"]`);
  if (!primaryInput) {
    return;
  }

  const primaryValue = primaryInput.value.trim();
  if (!primaryValue) {
    return;
  }

  if (config.autocompleteKind === "materiais") {
    const suggestion = findRdoMaterialSuggestion(primaryValue);
    if (!suggestion) {
      return;
    }

    if (config.autoFillFieldKey) {
      const unitInput = row.querySelector(`[data-field-key="${config.autoFillFieldKey}"]`);
      if (unitInput) {
        unitInput.value = suggestion.unidade || "";
      }
    }
    return;
  }

  if (config.autocompleteKind === "maoDeObra") {
    findRdoMaoDeObraSuggestion(primaryValue);
  }
}

function syncStructuredContainer(container, config) {
  if (!container) {
    return;
  }

  const rows = Array.from(container.querySelectorAll(".dynamic-input-row"));
  rows.forEach((row, index) => {
    const values = getStructuredRowValues(row, config);
    if (isStructuredRowEmpty(values) && index < rows.length - 1) {
      row.remove();
    }
  });

  const currentRows = Array.from(container.querySelectorAll(".dynamic-input-row"));
  const lastRow = currentRows[currentRows.length - 1];
  const lastValues = lastRow ? getStructuredRowValues(lastRow, config) : null;
  if (!lastRow || !isStructuredRowEmpty(lastValues)) {
    container.appendChild(createStructuredRow(config));
  }

  Array.from(container.querySelectorAll(".dynamic-input-row")).forEach((row, index, allRows) => {
    const values = getStructuredRowValues(row, config);
    const removeButton = row.querySelector("[data-dynamic-remove]");
    const isLastEmpty = isStructuredRowEmpty(values) && index === allRows.length - 1;
    const isOnlyEmptyRow = allRows.length === 1 && isStructuredRowEmpty(values);
    removeButton?.classList.toggle("hidden", isOnlyEmptyRow);
    row.classList.toggle("is-empty", isLastEmpty);
  });
}

function hydrateStructuredContainer(container, config, values) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const normalizedValues = Array.isArray(values) ? values : [];
  normalizedValues.forEach((value) => {
    container.appendChild(createStructuredRow(config, value));
  });
  container.appendChild(createStructuredRow(config));
  syncStructuredContainer(container, config);
}

function getStructuredContainerValues(container, config) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(".dynamic-input-row"))
    .map((row) => getStructuredRowValues(row, config))
    .filter((values) => !isStructuredRowEmpty(values))
    .map((values) => {
      const normalized = {};
      config.fields.forEach((field) => {
        const rawValue = String(values[field.key] || "").trim();
        if (field.type === "number") {
          normalized[field.key] = rawValue ? Number(rawValue) : null;
        } else {
          normalized[field.key] = rawValue;
        }
      });
      return normalized;
    });
}

function bindStructuredContainer(container, config) {
  if (!container) {
    return;
  }

  hydrateStructuredContainer(container, config, []);

  container.addEventListener("input", (event) => {
    const input = event.target.closest(".dynamic-structured-input");
    if (!input) {
      return;
    }

    const row = input.closest(".dynamic-input-row");
    if (input.dataset.fieldKey === config.primaryKey) {
      applyStructuredAutocomplete(row, config);
    }
    syncStructuredContainer(container, config);
  });

  container.addEventListener("change", (event) => {
    const input = event.target.closest(".dynamic-structured-input");
    if (!input || input.dataset.fieldKey !== config.primaryKey) {
      return;
    }

    applyStructuredAutocomplete(input.closest(".dynamic-input-row"), config);
  });

  container.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-dynamic-remove]");
    if (!removeButton) {
      return;
    }

    removeButton.closest(".dynamic-input-row")?.remove();
    syncStructuredContainer(container, config);
  });

  container.addEventListener("keydown", (event) => {
    const input = event.target.closest(".dynamic-structured-input");
    if (!input || event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    syncStructuredContainer(container, config);
    const inputs = Array.from(container.querySelectorAll(".dynamic-structured-input"));
    const currentIndex = inputs.indexOf(input);
    const nextInput = inputs[currentIndex + 1] || inputs[inputs.length - 1];
    nextInput?.focus();
  });
}

function bindDynamicTextContainer(container, placeholder) {
  if (!container) {
    return;
  }

  hydrateDynamicTextContainer(container, [], placeholder);

  container.addEventListener("input", (event) => {
    if (!event.target.closest(".dynamic-text-input")) {
      return;
    }

    syncDynamicTextContainer(container);
  });

  container.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-dynamic-remove]");
    if (!removeButton) {
      return;
    }

    removeButton.closest(".dynamic-input-row")?.remove();
    syncDynamicTextContainer(container);
  });

  container.addEventListener("keydown", (event) => {
    const input = event.target.closest(".dynamic-text-input");
    if (!input || event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    syncDynamicTextContainer(container);
    const rows = Array.from(container.querySelectorAll(".dynamic-text-input"));
    const currentIndex = rows.indexOf(input);
    const nextInput = rows[currentIndex + 1] || rows[rows.length - 1];
    nextInput?.focus();
  });
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo selecionado."));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file) {
  const originalDataUrl = await readFileAsDataUrl(file);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1600;
      const ratio = Math.min(1, maxDimension / Math.max(image.width || 1, image.height || 1));
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        resolve({
          id: createClientId("rdo-foto"),
          name: file.name,
          dataUrl: originalDataUrl
        });
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve({
        id: createClientId("rdo-foto"),
        name: file.name,
        dataUrl: canvas.toDataURL("image/jpeg", 0.82)
      });
    };

    image.onerror = () =>
      resolve({
        id: createClientId("rdo-foto"),
        name: file.name,
        dataUrl: originalDataUrl
      });

    image.src = originalDataUrl;
  });
}

async function handleObraLogoFileInput(input, type) {
  const file = input?.files?.[0];
  if (!file) {
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    setObraLogoDraft(type, dataUrl);
    input.value = "";
  } catch (error) {
    alert(error.message);
  }
}

async function handleObraArquivoFileInput(input, type) {
  const file = input?.files?.[0];
  if (!file) {
    return;
  }

  try {
    const extensaoValida = /\.xlsx?$/i.test(file.name || "");
    if (type === "orcamentoSintetico" && !extensaoValida) {
      throw new Error("Use apenas a planilha sintética em formato XLS ou XLSX.");
    }

    const dataUrl = await readFileAsDataUrl(file);
    setObraArquivoDraft(type, {
      name: file.name,
      mimeType: file.type || "",
      dataUrl
    });
    input.value = "";
  } catch (error) {
    alert(error.message);
  }
}

function renderRdoFotos() {
  if (!rdoFotosContainer) {
    return;
  }

  const photos = getRdoDraftPhotos();
  const photoCards = photos
    .map(
      (photo) => `
        <article class="photo-card">
          <img src="${photo.dataUrl}" alt="${escapeHtml(photo.name)}" />
          <div class="photo-card-info">
            <strong>${escapeHtml(photo.name)}</strong>
            <label class="photo-comment-field">
              Comentario da foto
              <textarea data-rdo-photo-comment="${photo.id}" placeholder="Descreva o que esta sendo mostrado na foto." required>${escapeHtml(photo.comentario || "")}</textarea>
            </label>
            <button type="button" class="btn ghost" data-rdo-photo-remove="${photo.id}">Remover</button>
          </div>
        </article>
      `
    )
    .join("");

  rdoFotosContainer.innerHTML = `
    <div class="photo-list">
      ${photoCards || '<p class="empty">Nenhuma foto adicionada ainda.</p>'}
    </div>
    <label class="photo-upload-field">
      Adicionar foto
      <input type="file" accept="image/*" data-rdo-photo-input />
    </label>
  `;
}

function validateRdoPhotos() {
  const photos = getRdoDraftPhotos();
  for (let index = 0; index < photos.length; index += 1) {
    if (!String(photos[index].comentario || "").trim()) {
      throw new Error(`Informe o comentario obrigatorio da foto ${index + 1}.`);
    }
  }
}

function getRdoById(rdoId) {
  return getRdos().find((rdo) => rdo.id === rdoId) || null;
}

function clearPrintMode() {
  document.body.classList.remove("printing-relatorios", "printing-rdos");
}

async function waitForImagesToLoad(container) {
  if (!container) {
    return;
  }

  const images = Array.from(container.querySelectorAll("img"));
  if (!images.length) {
    return;
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }

          const finish = () => {
            image.removeEventListener("load", finish);
            image.removeEventListener("error", finish);
            resolve();
          };

          image.addEventListener("load", finish);
          image.addEventListener("error", finish);
        })
    )
  );
}

function refreshCompraAutocomplete() {
  const compras = getCompras();
  updateDatalist(descricaoOptions, buildUniqueValues(compras.map((compra) => compra.descricao)));
  updateDatalist(categoriaOptions, buildUniqueValues(compras.map((compra) => compra.categoria)));
  updateDatalist(fornecedorOptions, buildUniqueValues(compras.map((compra) => compra.fornecedor)));
  updateDatalist(unidadeOptions, buildUniqueValues(compras.map((compra) => compra.unidade)));
}

function populateRelatorioCategorias() {
  const categorias = buildUniqueValues([
    ...getCompras().map((compra) => getCategoriaLancamentoDisplay(compra.categoria)),
    ...getPagamentosMaoDeObra().map(() => "MÃ£o de Obra"),
    "MÃ£o de Obra"
  ]);
  const selectedValues = new Set(Array.from(relatorioCategoriasSelect.selectedOptions).map((option) => option.value));

  relatorioCategoriasSelect.innerHTML = categorias
    .map((categoria) => `<option value="${escapeHtml(categoria)}">${categoria}</option>`)
    .join("");

  Array.from(relatorioCategoriasSelect.options).forEach((option) => {
    option.selected = selectedValues.has(option.value);
  });
}

function getSelectedRelatorioCategorias() {
  return Array.from(relatorioCategoriasSelect.selectedOptions).map((option) => option.value);
}

function findLastCompraByDescricao(descricao) {
  const descricaoAlvo = normalizeValue(descricao);
  if (!descricaoAlvo) {
    return null;
  }

  const compras = getCompras();
  for (let index = compras.length - 1; index >= 0; index -= 1) {
    const compra = compras[index];
    if (normalizeValue(compra.descricao) === descricaoAlvo) {
      return compra;
    }
  }

  return null;
}

function preencherCamposPorDescricao() {
  const ultimaCompra = findLastCompraByDescricao(compraDescricaoInput.value);
  if (!ultimaCompra) {
    return;
  }

  compraCategoriaInput.value = ultimaCompra.categoria || "";
  compraFornecedorInput.value = ultimaCompra.fornecedor || "";
  compraUnidadeInput.value = ultimaCompra.unidade || "";
}

function getSessionUser() {
  return state.sessionUser;
}

function setSession(user) {
  state.sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function clearSession() {
  state.sessionUser = null;
}

function getCurrentUserRecord() {
  return getSessionUser();
}

async function confirmarAutorizacaoGerente(motivo) {
  const currentUser = getCurrentUserRecord();
  if (!currentUser) {
    alert("Sessao invalida. Faca login novamente.");
    return false;
  }

  if (currentUser.role !== "administrador") {
    alert("Apenas administradores podem executar esta acao.");
    return false;
  }

  const senhaInformada = prompt(`Autorizacao de administrador necessaria (${motivo}). Informe a senha do usuario atual:`);
  if (senhaInformada === null) {
    return false;
  }

  try {
    const result = await apiFetch("/api/authorize-manager", {
      method: "POST",
      body: JSON.stringify({
        userId: currentUser.id,
        password: senhaInformada
      })
    });

    if (!result.authorized) {
      alert("Senha de administrador invalida. Acao cancelada.");
      return false;
    }
  } catch (error) {
    alert(error.message);
    return false;
  }

  return true;
}

function solicitarSenhaUsuarioParaExclusao(tipoItem) {
  const confirmouAcao = confirm(`Tem certeza que deseja excluir este ${tipoItem}?`);
  if (!confirmouAcao) {
    return null;
  }

  const senhaInformada = prompt(`Confirme a exclusao digitando a senha do usuario atual:`);
  if (senhaInformada === null) {
    return null;
  }

  if (!senhaInformada.trim()) {
    alert("Informe a senha para concluir a exclusao.");
    return null;
  }

  return senhaInformada;
}

async function confirmarExclusaoObraComSenhaGerente() {
  const confirmouAcao = confirm("Tem certeza que deseja excluir esta obra? Esta acao tambem remove as compras vinculadas.");
  if (!confirmouAcao) {
    return false;
  }

  return confirmarAutorizacaoGerente("exclusao de obra");
}

function getObraById(obraId) {
  return getObras().find((obra) => obra.id === obraId) || null;
}

function getUsuarioById(userId) {
  return getUsuarios().find((usuario) => usuario.id === userId) || null;
}

function isObraFinalizada(obraId) {
  return Boolean(getObraById(obraId)?.finalizacao?.dataEntrega);
}

function resetObraForm() {
  obraForm.reset();
  obraEditIdInput.value = "";
  obraSubmitBtn.textContent = "Salvar Obra";
  obraCancelEditBtn.classList.add("hidden");
  document.getElementById("obraDataInicio").value = getTodayIsoDate();
  setCurrencyInputValue(obraOrcamentoInput, 0);
  obraContratanteNomeInput.value = "";
  obraContratadaNomeInput.value = "";
  if (obraContratanteLogoInput) {
    obraContratanteLogoInput.value = "";
  }
  if (obraContratadaLogoInput) {
    obraContratadaLogoInput.value = "";
  }
  if (obraOrcamentoSinteticoInput) {
    obraOrcamentoSinteticoInput.value = "";
  }
  state.obraLogoDrafts = {
    contratante: "",
    contratada: ""
  };
  state.obraArquivoDrafts = {
    orcamentoSintetico: null
  };
  renderObraLogoPreviews();
  renderObraArquivoPreviews();
}

function resetFinalizacaoForm() {
  finalizacaoForm.reset();
  document.getElementById("finalizacaoDataEntrega").value = getTodayIsoDate();
  setCurrencyInputValue(finalizacaoAditivosValorInput, 0);
}

function openObraEditor(obra = null) {
  obraEditorPanel.classList.remove("hidden");

  if (obra) {
    obraEditorTitle.textContent = "Editar Obra";
    obraEditorSubtitle.textContent = "Atualize os dados da obra e, se necessÃ¡rio, finalize a entrega.";
    preencherFormularioObra(obra);
    finalizacaoPanel.classList.remove("hidden");
    finalizacaoObraSelect.value = obra.id;
    document.getElementById("finalizacaoDataEntrega").value = normalizeDateInputValue(obra.finalizacao?.dataEntrega) || getTodayIsoDate();
    document.getElementById("finalizacaoAditivosInfo").value = obra.finalizacao?.aditivosInfo || "";
    setCurrencyInputValue(finalizacaoAditivosValorInput, Number(obra.finalizacao?.aditivosValor || 0));
    return;
  }

  obraEditorTitle.textContent = "Cadastrar nova Obra";
  obraEditorSubtitle.textContent = "Preencha os dados da obra para salvar o cadastro.";
  resetObraForm();
  resetFinalizacaoForm();
  finalizacaoPanel.classList.add("hidden");
}

function closeObraEditor() {
  obraEditorPanel.classList.add("hidden");
  resetObraForm();
  resetFinalizacaoForm();
  finalizacaoPanel.classList.add("hidden");
}

function resetCompraForm() {
  compraForm.reset();
  compraEditIdInput.value = "";
  compraSubmitBtn.textContent = "Registrar Compra";
  compraCancelEditBtn.classList.add("hidden");
  compraPagoInput.value = "true";
  document.getElementById("compraData").value = getLastCompraDateValue();
  const ultimaObra = getUltimaObraLancadaId();
  if (ultimaObra) {
    compraObraSelect.value = ultimaObra;
  }
  setCurrencyInputValue(compraPrecoUnitarioInput, 0);
  atualizarPrecoTotalCompraForm();
}

function resetMaoDeObraForm() {
  maoDeObraForm.reset();
  maoDeObraEditIdInput.value = "";
  maoDeObraSubmitBtn.textContent = "Registrar Pagamento";
  maoDeObraCancelEditBtn.classList.add("hidden");
  const lastDates = getLastMaoDeObraDateValues();
  maoDeObraPeriodoInicioInput.value = lastDates.periodoInicio;
  maoDeObraPeriodoFimInput.value = lastDates.periodoFim;
  maoDeObraDataPagamentoInput.value = lastDates.dataPagamento;
  setCurrencyInputValue(maoDeObraValorInput, 0);
}

function preencherFormularioCompra(compra) {
  compraEditIdInput.value = compra.id;
  compraObraSelect.value = compra.obraId;
  compraPagoInput.value = String(Boolean(compra.pago));
  document.getElementById("compraData").value = normalizeDateInputValue(compra.data);
  compraDescricaoInput.value = compra.descricao || "";
  compraCategoriaInput.value = compra.categoria || "";
  compraFornecedorInput.value = compra.fornecedor || "";
  compraUnidadeInput.value = compra.unidade || "";
  compraQuantidadeInput.value = Number(compra.quantidade || 0);
  setCurrencyInputValue(compraPrecoUnitarioInput, Number(compra.precoUnitario || 0));
  compraSubmitBtn.textContent = "Atualizar Compra";
  compraCancelEditBtn.classList.remove("hidden");
  atualizarPrecoTotalCompraForm();
}

function preencherFormularioMaoDeObra(pagamento) {
  maoDeObraEditIdInput.value = pagamento.id;
  maoDeObraObraSelect.value = pagamento.obraId;
  maoDeObraDescricaoInput.value = pagamento.descricao || "";
  maoDeObraPeriodoInicioInput.value = normalizeDateInputValue(pagamento.periodoInicio);
  maoDeObraPeriodoFimInput.value = normalizeDateInputValue(pagamento.periodoFim);
  maoDeObraDataPagamentoInput.value = normalizeDateInputValue(pagamento.dataPagamento);
  setCurrencyInputValue(maoDeObraValorInput, Number(pagamento.valor || 0));
  maoDeObraSubmitBtn.textContent = "Atualizar Pagamento";
  maoDeObraCancelEditBtn.classList.remove("hidden");
}

function preencherFormularioObra(obra) {
  obraEditIdInput.value = obra.id;
  document.getElementById("obraNome").value = obra.nome || "";
  document.getElementById("obraLocal").value = obra.local || "";
  document.getElementById("obraResponsavel").value = obra.responsavel || "";
  document.getElementById("obraDataInicio").value = normalizeDateInputValue(obra.dataInicio);
  setCurrencyInputValue(obraOrcamentoInput, Number(obra.orcamento || 0));
  obraContratanteNomeInput.value = obra.contratante?.nome || "";
  obraContratadaNomeInput.value = obra.contratada?.nome || "";
  state.obraLogoDrafts = {
    contratante: obra.contratante?.logo || "",
    contratada: obra.contratada?.logo || ""
  };
  state.obraArquivoDrafts = {
    orcamentoSintetico: normalizeObraArquivoDraft(obra.orcamentoSinteticoArquivo),
    
  };
  if (obraContratanteLogoInput) {
    obraContratanteLogoInput.value = "";
  }
  if (obraContratadaLogoInput) {
    obraContratadaLogoInput.value = "";
  }
  if (obraOrcamentoSinteticoInput) {
    obraOrcamentoSinteticoInput.value = "";
  }
  renderObraLogoPreviews();
  renderObraArquivoPreviews();
  obraSubmitBtn.textContent = "Atualizar Obra";
  obraCancelEditBtn.classList.remove("hidden");
}

function resetUsuarioForm() {
  if (!usuarioForm) {
    return;
  }

  usuarioForm.reset();
}

function openUsuarioFormPanel() {
  if (!usuarioFormPanel) {
    return;
  }

  resetUsuarioForm();
  usuarioFormPanel.classList.remove("hidden");
}

function closeUsuarioFormPanel() {
  if (!usuarioFormPanel) {
    return;
  }

  usuarioFormPanel.classList.add("hidden");
  resetUsuarioForm();
}

function resetSenhaForm() {
  if (!senhaForm) {
    return;
  }

  senhaForm.reset();
  senhaTargetUserIdInput.value = "";
  senhaFeedback.textContent = "";
  senhaFeedback.classList.add("hidden");
  senhaAtualGroup.classList.remove("hidden");
  document.getElementById("senhaAtual").required = true;
}

function openSenhaPanel(usuario) {
  if (!usuario) {
    return;
  }

  const currentUser = getSessionUser();
  const isOwnUser = usuario.id === currentUser?.id;
  const exigeSenhaAtual = !isAdmin() || isOwnUser;

  resetSenhaForm();
  senhaTargetUserIdInput.value = usuario.id;
  senhaPanelTitle.textContent = isOwnUser ? "Trocar minha Senha" : `Trocar senha de ${usuario.name}`;
  senhaPanelSubtitle.textContent = exigeSenhaAtual
    ? "Confirme a senha atual para concluir a alteraÃ§Ã£o."
    : "Como gerente, vocÃª pode definir uma nova senha para este usuÃ¡rio.";
  senhaAtualGroup.classList.toggle("hidden", !exigeSenhaAtual);
  document.getElementById("senhaAtual").required = exigeSenhaAtual;
  senhaPanel.classList.remove("hidden");
}

function closeSenhaPanel() {
  if (!senhaPanel) {
    return;
  }

  senhaPanel.classList.add("hidden");
  resetSenhaForm();
}

function showLogin() {
  loginSection.classList.remove("hidden");
  appSection.classList.add("hidden");
}

function showApp() {
  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
}

function isAdmin() {
  return getSessionUser()?.role === "administrador";
}

function syncPermissionsUI() {
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.classList.toggle("hidden", !isAdmin());
  });

  if (!isAdmin() && ["obras", "logs"].includes(document.querySelector(".menu-btn.active")?.dataset.section)) {
    activatePage("dashboard");
  }
}

function renderUsuarios() {
  if (!usuariosTableBody) {
    return;
  }

  const usuarios = getUsuarios();
  if (!usuarios.length) {
    usuariosTableBody.innerHTML = `<tr><td colspan="4" class="empty">Nenhum usuario cadastrado.</td></tr>`;
    return;
  }

  const currentUserId = getSessionUser()?.id;
  usuariosTableBody.innerHTML = usuarios
    .map(
      (usuario) => `
      <tr>
        <td>${usuario.name}</td>
        <td>${usuario.email}</td>
        <td>${usuario.role === "administrador" ? "Gerente" : "Usuario"}</td>
        <td>
          ${isAdmin() || usuario.id === currentUserId ? `<button class="btn ghost" data-usuario-password="${usuario.id}">Trocar senha</button>` : ""}
          ${isAdmin() && usuario.id !== currentUserId ? `<button class="btn delete" data-usuario-delete="${usuario.id}">Excluir</button>` : ""}
        </td>
      </tr>
    `
    )
    .join("");
}

function formatAuditAction(action) {
  return {
    cadastro: "Cadastro",
    edicao: "EdiÃ§Ã£o",
    exclusao: "ExclusÃ£o"
  }[action] || action || "-";
}

function formatAuditEntityType(entityType) {
  return {
    obra: "Obra",
    compra: "Compra",
    medicao: "MediÃ§Ã£o",
    mao_de_obra: "MÃ£o de Obra",
    rdo: "RDO",
    usuario: "UsuÃ¡rio"
  }[entityType] || entityType || "-";
}

function renderAuditLogs() {
  if (!auditLogsTableBody) {
    return;
  }

  if (!isAdmin()) {
    auditLogsTableBody.innerHTML = `<tr><td colspan="5" class="empty">Apenas gerentes podem visualizar os logs.</td></tr>`;
    return;
  }

  const logs = getAuditLogs();
  if (!logs.length) {
    auditLogsTableBody.innerHTML = `<tr><td colspan="5" class="empty">Nenhum log de auditoria disponÃ­vel.</td></tr>`;
    return;
  }

  auditLogsTableBody.innerHTML = logs
    .map(
      (log) => `
        <tr>
          <td>${formatDateTime(log.createdAt)}</td>
          <td>${escapeHtml(log.user?.name || "-")}</td>
          <td>${formatAuditAction(log.action)}</td>
          <td>${formatAuditEntityType(log.entityType)}</td>
          <td>${escapeHtml(log.summary || "-")}</td>
        </tr>
      `
    )
    .join("");
}

function activatePage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("hidden", page.id !== pageId);
  });

  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === pageId);
  });

  if (pageId === "relatorios") {
    renderRelatorios();
  }

  if (pageId === "medicoes") {
    renderMedicoes();
  }

  if (pageId === "rdos") {
    renderRdos();
  }

  if (pageId === "logs") {
    renderAuditLogs();
    if (isAdmin()) {
      refreshAuditLogs()
        .then(() => renderAuditLogs())
        .catch((error) => alert(error.message));
    }
  }
}

function renderDashboard() {
  const obras = getObras();
  const compras = getCompras();
  const pagamentosMaoDeObra = getPagamentosMaoDeObra();
  const obrasFinalizadas = obras.filter((obra) => obra.finalizacao?.dataEntrega).length;
  const { totaisPorObra, totalGasto, totalAberto } = buildDespesaStats(compras, pagamentosMaoDeObra);
  const resumoObras = obras
    .map((obra) => {
      const totalObra = totaisPorObra.get(obra.id) || 0;
      const orcamentoTotal = getOrcamentoComAditivos(obra);
      const saldo = orcamentoTotal - totalObra;
      const percentualConsumido = orcamentoTotal > 0 ? (totalObra / orcamentoTotal) * 100 : 0;

      return `
        <article class="obra-summary-card">
          <div class="obra-summary-head">
            <div>
              <h4>${obra.nome}</h4>
              <p>${obra.local}</p>
            </div>
            <span class="obra-status ${obra.finalizacao?.dataEntrega ? "status-finished" : "status-progress"}">
              ${obra.finalizacao?.dataEntrega ? "Finalizada" : "Em andamento"}
            </span>
          </div>
          <div class="obra-summary-grid">
            <p><strong>Responsavel:</strong> ${obra.responsavel}</p>
            <p><strong>Inicio:</strong> ${formatDate(obra.dataInicio)}</p>
            <p><strong>Entrega:</strong> ${formatDate(obra.finalizacao?.dataEntrega)}</p>
            <p><strong>Orcamento:</strong> ${formatCurrency(orcamentoTotal)}</p>
            <p><strong>Gasto:</strong> ${formatCurrency(totalObra)}</p>
            <p><strong>Saldo:</strong> ${formatCurrency(saldo)}</p>
            <p><strong>Aditivos:</strong> ${formatCurrency(getAditivosValor(obra))}</p>
            <p><strong>Consumo:</strong> ${percentualConsumido.toFixed(1)}%</p>
          </div>
        </article>
      `;
    })
    .join("");

  dashboardSection.innerHTML = `
    <h3>Dashboard</h3>
    <div class="cards-grid">
      <article class="metric-card">
        <p class="metric-title">Obras cadastradas</p>
        <p class="metric-value">${obras.length}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">Compras lancadas</p>
        <p class="metric-value">${compras.length}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">MÃ£o de obra lanÃ§ada</p>
        <p class="metric-value">${pagamentosMaoDeObra.length}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">Obras finalizadas</p>
        <p class="metric-value">${obrasFinalizadas}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">Total em aberto</p>
        <p class="metric-value">${formatCurrency(totalAberto)}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">Total gasto</p>
        <p class="metric-value">${formatCurrency(totalGasto)}</p>
      </article>
    </div>
    <div class="dashboard-obras-header">
      <h4>Resumo por obra</h4>
      <p class="subtitle">Visao consolidada de orcamento, gastos e andamento.</p>
    </div>
    <div class="obra-summary-list">
      ${resumoObras || '<p class="empty">Nenhuma obra cadastrada.</p>'}
    </div>
  `;
}

function populateObraSelects() {
  const obras = getObras();
  const ultimaObraLancadaId = getUltimaObraLancadaId();
  const medicaoObraValue = medicaoObraSelect?.value || "";
  const medicaoFiltroObraValue = medicaoFiltroObraSelect?.value || "";
  const rdoObraValue = rdoObraSelect?.value || "";
  const rdoFiltroObraValue = rdoFiltroObraSelect?.value || "";

  if (!obras.length) {
    if (medicaoObraSelect) {
      medicaoObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    }
    if (medicaoFiltroObraSelect) {
      medicaoFiltroObraSelect.innerHTML = `<option value="">Todas as obras</option>`;
    }
    compraObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    maoDeObraObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    finalizacaoObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    relatorioObraSelect.innerHTML = `<option value="">Todas as obras</option>`;
    if (rdoObraSelect) {
      rdoObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    }
    if (rdoFiltroObraSelect) {
      rdoFiltroObraSelect.innerHTML = `<option value="">Todas as obras</option>`;
    }
    return;
  }

  if (medicaoObraSelect) {
    medicaoObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");
    medicaoObraSelect.value = obras.some((obra) => obra.id === medicaoObraValue)
      ? medicaoObraValue
      : medicaoFiltroObraValue && obras.some((obra) => obra.id === medicaoFiltroObraValue)
        ? medicaoFiltroObraValue
        : obras[0].id;
  }

  if (medicaoFiltroObraSelect) {
    medicaoFiltroObraSelect.innerHTML = `
      <option value="">Todas as obras</option>
      ${obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("")}
    `;
    if (obras.some((obra) => obra.id === medicaoFiltroObraValue)) {
      medicaoFiltroObraSelect.value = medicaoFiltroObraValue;
    }
  }

  compraObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");
  if (ultimaObraLancadaId && obras.some((obra) => obra.id === ultimaObraLancadaId)) {
    compraObraSelect.value = ultimaObraLancadaId;
  }

  maoDeObraObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");

  finalizacaoObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");

  relatorioObraSelect.innerHTML = `
    <option value="">Todas as obras</option>
    ${obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("")}
  `;

  if (rdoObraSelect) {
    rdoObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");
    rdoObraSelect.value = obras.some((obra) => obra.id === rdoObraValue)
      ? rdoObraValue
      : ultimaObraLancadaId && obras.some((obra) => obra.id === ultimaObraLancadaId)
        ? ultimaObraLancadaId
        : obras[0].id;
  }

  if (rdoFiltroObraSelect) {
    rdoFiltroObraSelect.innerHTML = `
      <option value="">Todas as obras</option>
      ${obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("")}
    `;
    if (obras.some((obra) => obra.id === rdoFiltroObraValue)) {
      rdoFiltroObraSelect.value = rdoFiltroObraValue;
    }
  }
}

function renderObras() {
  const obras = getObras();

  if (!obras.length) {
    obrasTableBody.innerHTML = `<tr><td colspan="7" class="empty">Nenhuma obra cadastrada.</td></tr>`;
    return;
  }

  obrasTableBody.innerHTML = obras
    .map(
      (obra) => `
      <tr>
        <td>${obra.nome}</td>
        <td>${obra.local}</td>
        <td>${obra.responsavel}</td>
        <td>${formatDate(obra.dataInicio)}</td>
        <td>${formatCurrency(getOrcamentoComAditivos(obra))}</td>
        <td>${obra.finalizacao?.dataEntrega ? "Finalizada" : "Em andamento"}</td>
        <td>
          <button class="btn ghost" data-obra-edit="${obra.id}">Editar</button>
          <button class="btn delete" data-obra-delete="${obra.id}">Excluir</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderCompras() {
  const compras = getCompras();
  const obras = getObras();
  const obraMap = buildObraNameMap(obras);

  if (!compras.length) {
    comprasTableBody.innerHTML = `<tr><td colspan="10" class="empty">Nenhuma compra lancada.</td></tr>`;
    return;
  }

  const sorted = [...compras].sort((a, b) => compareIsoDatesDesc(a.data, b.data));

  comprasTableBody.innerHTML = sorted
    .map(
      (compra) => `
      <tr>
        <td>${formatDate(compra.data)}</td>
        <td>${obraMap.get(compra.obraId) || "Obra removida"}</td>
        <td>${compra.descricao}</td>
        <td>${compra.fornecedor}</td>
        <td>${compra.categoria}</td>
        <td>${compra.unidade || "-"}</td>
        <td>${formatNumber(compra.quantidade || 0)}</td>
        <td>${formatCurrency(compra.precoUnitario || 0)}</td>
        <td>${formatCurrency(getCompraTotal(compra))}</td>
        <td>
          <button class="btn ghost" data-compra-edit="${compra.id}">Editar</button>
          <button class="btn delete" data-compra-delete="${compra.id}">Excluir</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderMaoDeObra() {
  const pagamentos = getPagamentosMaoDeObra();
  const obraMap = buildObraNameMap(getObras());

  if (!pagamentos.length) {
    maoDeObraTableBody.innerHTML = `<tr><td colspan="6" class="empty">Nenhum pagamento de mÃ£o de obra lanÃ§ado.</td></tr>`;
    return;
  }

  const sorted = [...pagamentos].sort((a, b) => compareIsoDatesDesc(a.dataPagamento, b.dataPagamento));

  maoDeObraTableBody.innerHTML = sorted
    .map(
      (pagamento) => `
      <tr>
        <td>${formatDate(pagamento.dataPagamento)}</td>
        <td>${obraMap.get(pagamento.obraId) || "Obra removida"}</td>
        <td>${pagamento.descricao}</td>
        <td>${formatDate(pagamento.periodoInicio)} a ${formatDate(pagamento.periodoFim)}</td>
        <td>${formatCurrency(getPagamentoMaoDeObraTotal(pagamento))}</td>
        <td>
          <button class="btn ghost" data-mao-de-obra-edit="${pagamento.id}">Editar</button>
          <button class="btn delete" data-mao-de-obra-delete="${pagamento.id}">Excluir</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function getFilteredRdos() {
  const obraId = rdoFiltroObraSelect?.value || "";
  const dataInicio = rdoFiltroDataInicioInput?.value || "";
  const dataFim = rdoFiltroDataFimInput?.value || "";

  return [...getRdos()]
    .filter((rdo) => {
      const matchObra = !obraId || rdo.obraId === obraId;
      const matchInicio = !dataInicio || rdo.data >= dataInicio;
      const matchFim = !dataFim || rdo.data <= dataFim;
      return matchObra && matchInicio && matchFim;
    })
    .sort((a, b) => compareIsoDatesDesc(a.data, b.data));
}

function updateRdoSelectAllState(rdosVisiveis) {
  if (!rdoSelectAllInput) {
    return;
  }

  const visibleIds = rdosVisiveis.map((rdo) => rdo.id);
  const selectedCount = visibleIds.filter((id) => state.selectedRdoIds.has(id)).length;
  rdoSelectAllInput.checked = visibleIds.length > 0 && selectedCount === visibleIds.length;
  rdoSelectAllInput.indeterminate = selectedCount > 0 && selectedCount < visibleIds.length;
}

function renderRdos() {
  if (!rdoTableBody) {
    return;
  }

  const rdos = getFilteredRdos();
  const obraMap = buildObraNameMap(getObras());

  if (!rdos.length) {
    rdoTableBody.innerHTML = `<tr><td colspan="8" class="empty">Nenhum RDO encontrado para os filtros selecionados.</td></tr>`;
    updateRdoSelectAllState([]);
    if (rdoImprimirSelecionadosBtn) {
      rdoImprimirSelecionadosBtn.disabled = state.selectedRdoIds.size === 0;
    }
    return;
  }

  rdoTableBody.innerHTML = rdos
    .map(
      (rdo) => `
        <tr>
          <td>
            <input type="checkbox" data-rdo-select="${rdo.id}" ${state.selectedRdoIds.has(rdo.id) ? "checked" : ""} />
          </td>
          <td>${formatDate(rdo.data)}</td>
          <td>${obraMap.get(rdo.obraId) || "Obra removida"}</td>
          <td>${rdo.fotosCount}</td>
          <td>${rdo.servicosCount}</td>
          <td>${rdo.materiaisRecebidosCount}</td>
          <td>${rdo.materiaisConsumidosCount}</td>
          <td>
            <button class="btn ghost" data-rdo-edit="${rdo.id}">Editar</button>
            <button class="btn ghost" data-rdo-print="${rdo.id}">Exportar PDF</button>
            <button class="btn delete" data-rdo-delete="${rdo.id}">Excluir</button>
          </td>
        </tr>
      `
    )
    .join("");

  updateRdoSelectAllState(rdos);
  if (rdoImprimirSelecionadosBtn) {
    rdoImprimirSelecionadosBtn.disabled = state.selectedRdoIds.size === 0;
  }
}

function resetRdoForm() {
  if (!rdoForm) {
    return;
  }

  rdoForm.reset();
  rdoEditIdInput.value = "";
  rdoSubmitBtn.textContent = "Salvar RDO";
  rdoCancelEditBtn.classList.add("hidden");
  rdoDataInput.value = getTodayIsoDate();
  rdoClimaSelect.value = "";
  rdoObservacoesAdicionaisInput.value = "";
  hydrateStructuredContainer(rdoServicosContainer, RDO_STRUCTURED_FIELD_CONFIGS.servicos, []);
  hydrateStructuredContainer(rdoMateriaisRecebidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais, []);
  hydrateStructuredContainer(rdoMateriaisConsumidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais, []);
  hydrateStructuredContainer(rdoMaoDeObraPresenteContainer, RDO_STRUCTURED_FIELD_CONFIGS.equipe, []);
  setRdoDraftPhotos([]);

  if (getObras().length) {
    rdoObraSelect.value = getUltimaObraLancadaId() || getObras()[0].id;
  }
}

function preencherFormularioRdo(rdo) {
  rdoEditIdInput.value = rdo.id;
  rdoObraSelect.value = rdo.obraId;
  rdoDataInput.value = normalizeDateInputValue(rdo.data);
  rdoClimaSelect.value = rdo.clima || "";
  rdoObservacoesAdicionaisInput.value = rdo.observacoesAdicionais || "";
  hydrateStructuredContainer(rdoServicosContainer, RDO_STRUCTURED_FIELD_CONFIGS.servicos, rdo.servicosExecutados);
  hydrateStructuredContainer(rdoMateriaisRecebidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais, rdo.materiaisRecebidos);
  hydrateStructuredContainer(rdoMateriaisConsumidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais, rdo.materiaisConsumidos);
  hydrateStructuredContainer(rdoMaoDeObraPresenteContainer, RDO_STRUCTURED_FIELD_CONFIGS.equipe, rdo.maoDeObraPresente);
  setRdoDraftPhotos(rdo.fotos || []);
  rdoSubmitBtn.textContent = "Atualizar RDO";
  rdoCancelEditBtn.classList.remove("hidden");
}

function openRdoEditor(rdo = null) {
  if (!rdoEditorPanel) {
    return;
  }

  rdoEditorPanel.classList.remove("hidden");
  if (rdo) {
    rdoEditorTitle.textContent = "Editar RDO";
    rdoEditorSubtitle.textContent = "Atualize o diario de obra selecionado e mantenha os registros completos.";
    preencherFormularioRdo(rdo);
    return;
  }

  rdoEditorTitle.textContent = "Cadastrar novo RDO";
  rdoEditorSubtitle.textContent = "Registre o andamento diario da obra, fotos e itens executados.";
  resetRdoForm();
}

function closeRdoEditor() {
  if (!rdoEditorPanel) {
    return;
  }

  rdoEditorPanel.classList.add("hidden");
  resetRdoForm();
}

async function fetchRdoDetail(rdoId) {
  const result = await apiFetch(`/api/rdos/${rdoId}`);
  return result.rdo;
}

function renderRdoPrintList(title, items) {
  if (!items.length) {
    return "";
  }

  return `
    <section class="rdo-print-section">
      <h5>${title}</h5>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderRdoHeaderLogo(logo, label, positionClass) {
  if (!String(logo || "").trim()) {
    return `<div class="rdo-print-logo-slot ${positionClass} empty"></div>`;
  }

  return `
    <div class="rdo-print-logo-slot ${positionClass}">
      <img src="${logo}" alt="${escapeHtml(label)}" class="rdo-company-logo" />
    </div>
  `;
}

function formatStructuredQuantity(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return structuredQuantityFormatter.format(Number(value || 0));
}

function renderRdoStructuredTable(title, items, type = "itens") {
  if (!items.length) {
    return "";
  }

  const isEquipe = type === "equipe";
  return `
    <section class="rdo-print-section">
      <h5>${title}</h5>
      <table class="rdo-print-table">
        <thead>
          <tr>
            <th>${isEquipe ? "Cargo" : "Descricao"}</th>
            ${isEquipe ? "" : "<th>Unidade</th>"}
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
                <tr>
                  <td>${escapeHtml(isEquipe ? item.cargo || "-" : item.descricao || "-")}</td>
                  ${isEquipe ? "" : `<td>${escapeHtml(item.unidade || "-")}</td>`}
                  <td>${escapeHtml(formatStructuredQuantity(item.quantidade) || "-")}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderRdoSignatureBlock(obra) {
  const companyName = String(obra?.contratada?.nome || "").trim() || "Empresa contratada";

  return `
    <section class="rdo-print-signature">
      <div class="rdo-signature-line"></div>
      <strong>${escapeHtml(companyName)}</strong>
      <span>Assinatura do RDO</span>
    </section>
  `;
}

function renderRdoMetaList(rdo, obra, obraName) {
  const rows = [
    { label: "Nome da Obra", value: obraName || "Obra removida" },
    { label: "Contratada", value: obra?.contratada?.nome || "-" },
    { label: "Contratante", value: obra?.contratante?.nome || "-" },
    { label: "Data", value: formatDate(rdo.data) },
    { label: "Clima", value: rdo.clima || "-" }
  ];

  return `
    <div class="rdo-print-meta-grid">
      ${chunkItems(rows, 2)
        .map(
          (rowGroup) => `
            <div class="rdo-print-meta-row">
              ${rowGroup
                .map(
                  (row) => `
                    <p class="rdo-print-meta-item">
                      <strong>${row.label}</strong>
                      <span>${escapeHtml(row.value)}</span>
                    </p>
                  `
                )
                .join("")}
              ${rowGroup.length < 2 ? `<span class="rdo-print-meta-item empty" aria-hidden="true"></span>` : ""}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderRdoHeaderBlock(obra, rdo, obraName) {
  return `
    <header class="rdo-print-header">
      <div class="rdo-print-title-row">
        ${renderRdoHeaderLogo(obra?.contratante?.logo, "Logotipo da contratante", "left")}
        <div class="rdo-print-title-block">
          <h4>Relatorio Diario de Obras</h4>
        </div>
        ${renderRdoHeaderLogo(obra?.contratada?.logo, "Logotipo da contratada", "right")}
      </div>
      ${renderRdoMetaList(rdo, obra, obraName)}
    </header>
  `;
}

function chunkItems(items, chunkSize) {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

function renderRdoPhotoFigure(photo) {
  const locationLabel = getRdoPhotoLocationLabel(photo);

  return `
    <figure class="rdo-print-photo">
      <div class="rdo-print-photo-media">
        <img src="${photo.dataUrl}" alt="${escapeHtml(photo.name)}" />
      </div>
      <figcaption>
        ${locationLabel ? `<strong class="rdo-print-photo-location">${escapeHtml(locationLabel)}</strong>` : ""}
        ${photo.comentario ? `<span>${escapeHtml(photo.comentario)}</span>` : ""}
      </figcaption>
    </figure>
  `;
}

function renderRdoMainPage(rdo, obra, obraName, hasPhotoPages) {
  return `
    <section class="rdo-pdf-page rdo-main-page">
      ${renderRdoHeaderBlock(obra, rdo, obraName)}
      ${renderRdoStructuredTable("Mao de obra presente", rdo.maoDeObraPresente, "equipe")}
      ${renderRdoStructuredTable("Servicos executados", rdo.servicosExecutados)}
      ${renderRdoStructuredTable("Materiais recebidos", rdo.materiaisRecebidos)}
      ${renderRdoStructuredTable("Materiais consumidos", rdo.materiaisConsumidos)}
      ${rdo.observacoesAdicionais ? renderRdoPrintList("Observacoes adicionais", [rdo.observacoesAdicionais]) : ""}
      ${hasPhotoPages ? "" : renderRdoSignatureBlock(obra)}
    </section>
  `;
}

function renderRdoPhotoPage(rdo, obra, obraName, photos, photoPageIndex, totalPhotoPages) {
  return `
    <section class="rdo-pdf-page rdo-photo-page">
      <div class="rdo-photo-page-header">
        <h5>Fotos</h5>
        <p>
          ${escapeHtml(obraName || "Obra removida")}
          <span class="rdo-photo-page-separator">|</span>
          ${formatDate(rdo.data)}
          ${totalPhotoPages > 1 ? `<span class="rdo-photo-page-separator">|</span>Pagina ${photoPageIndex + 1} de ${totalPhotoPages}` : ""}
        </p>
      </div>
      <div class="rdo-photo-page-grid">
        ${photos.map(renderRdoPhotoFigure).join("")}
      </div>
      ${photoPageIndex === totalPhotoPages - 1 ? renderRdoSignatureBlock(obra) : ""}
    </section>
  `;
}

function renderRdoPrintDocuments(rdos) {
  if (!rdoPrintArea) {
    return;
  }

  const obraMap = buildObraNameMap(getObras());
  rdoPrintArea.innerHTML = rdos
    .map((rdo) => {
      const obra = getObraById(rdo.obraId);
      const obraName = obraMap.get(rdo.obraId) || "Obra removida";
      const photoPages = chunkItems(rdo.fotos || [], 6);

      return `
        <article class="rdo-print-document">
          ${renderRdoMainPage(rdo, obra, obraName, photoPages.length > 0)}
          ${photoPages
            .map((photoGroup, index) => renderRdoPhotoPage(rdo, obra, obraName, photoGroup, index, photoPages.length))
            .join("")}
        </article>
      `;
    })
    .join("");
}

function compareRdosByChronology(left, right) {
  const dateComparison = String(left?.data || "").localeCompare(String(right?.data || ""));
  if (dateComparison !== 0) {
    return dateComparison;
  }

  return String(left?.createdAt || "").localeCompare(String(right?.createdAt || ""));
}

function sanitizeFileNamePart(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildRdoPdfFileName(rdos) {
  const orderedRdos = [...rdos].sort(compareRdosByChronology);
  if (orderedRdos.length === 1) {
    const rdo = orderedRdos[0];
    const obra = getObraById(rdo.obraId);
    const obraSlug = sanitizeFileNamePart(obra?.nome || "obra");
    const dateSlug = sanitizeFileNamePart(rdo.data || getTodayIsoDate());
    return `rdo-${obraSlug || "obra"}-${dateSlug || "data"}.pdf`;
  }

  const firstDate = orderedRdos[0]?.data || getTodayIsoDate();
  const lastDate = orderedRdos[orderedRdos.length - 1]?.data || firstDate;
  return `rdos-${sanitizeFileNamePart(firstDate)}-a-${sanitizeFileNamePart(lastDate)}.pdf`;
}

function getPdfLibraries() {
  const html2canvasLib = window.html2canvas;
  const jsPdfLib = window.jspdf?.jsPDF;

  if (!html2canvasLib || !jsPdfLib) {
    throw new Error("As bibliotecas de PDF nao foram carregadas. Atualize a pagina e tente novamente.");
  }

  return {
    html2canvas: html2canvasLib,
    jsPDF: jsPdfLib
  };
}

async function nextFrame(times = 1) {
  for (let index = 0; index < times; index += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

async function exportarRdosPdfPorIds(rdoIds) {
  if (!rdoIds.length) {
    alert("Selecione pelo menos um RDO para exportar.");
    return;
  }

  const buttonLabel = rdoImprimirSelecionadosBtn?.textContent || "";

  try {
    if (rdoImprimirSelecionadosBtn) {
      rdoImprimirSelecionadosBtn.disabled = true;
      rdoImprimirSelecionadosBtn.textContent = "Gerando PDF...";
    }

    const { html2canvas, jsPDF } = getPdfLibraries();
    const rdos = (await Promise.all(rdoIds.map((id) => fetchRdoDetail(id)))).sort(compareRdosByChronology);

    renderRdoPrintDocuments(rdos);
    clearPrintMode();
    document.body.classList.add("printing-rdos");
    await waitForImagesToLoad(rdoPrintArea);
    await nextFrame(2);

    const pageElements = Array.from(rdoPrintArea.querySelectorAll(".rdo-pdf-page"));
    if (!pageElements.length) {
      throw new Error("Nao foi possivel montar o conteudo do RDO para exportacao.");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    let isFirstPage = true;

    for (const pageElement of pageElements) {
      const canvas = await html2canvas(pageElement, {
        backgroundColor: "#ffffff",
        logging: false,
        scale: 1.8,
        useCORS: true,
        windowWidth: 1280,
        windowHeight: Math.max(1600, pageElement.scrollHeight)
      });

      const scale = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
      const renderedWidth = canvas.width * scale;
      const renderedHeight = canvas.height * scale;
      const imageData = canvas.toDataURL("image/jpeg", 0.92);

      if (!isFirstPage) {
        pdf.addPage();
      }

      pdf.addImage(
        imageData,
        "JPEG",
        margin + (usableWidth - renderedWidth) / 2,
        margin,
        renderedWidth,
        renderedHeight,
        undefined,
        "FAST"
      );
      isFirstPage = false;
    }

    pdf.save(buildRdoPdfFileName(rdos));
  } catch (error) {
    alert(error.message);
  } finally {
    clearPrintMode();
    if (rdoImprimirSelecionadosBtn) {
      rdoImprimirSelecionadosBtn.disabled = state.selectedRdoIds.size === 0;
      rdoImprimirSelecionadosBtn.textContent = buttonLabel || "Exportar PDF selecionados";
    }
  }
}

function filtrarLancamentosParaRelatorio() {
  const obraId = relatorioObraSelect.value;
  const dataInicio = relatorioDataInicioInput.value;
  const dataFim = relatorioDataFimInput.value;
  const todasComprasDaObra = relatorioTodasComprasInput.checked;
  const categoriasSelecionadas = getSelectedRelatorioCategorias();

  return getLancamentosRelatorio().filter((lancamento) => {
    const matchObra = !obraId || lancamento.obraId === obraId;
    const matchInicio = todasComprasDaObra || !dataInicio || lancamento.dataReferencia >= dataInicio;
    const matchFim = todasComprasDaObra || !dataFim || lancamento.dataReferencia <= dataFim;
    const matchCategoria = !categoriasSelecionadas.length || categoriasSelecionadas.includes(lancamento.categoria);
    return matchObra && matchInicio && matchFim && matchCategoria;
  });
}

function montarCabecalhoRelatorio(lancamentosFiltrados) {
  const obras = getObras();
  const obraSelecionada = obras.find((obra) => obra.id === relatorioObraSelect.value) || null;
  const tipo = relatorioTipoSelect.value === "mensal" ? "Totais em intervalos mensais" : "Por descriÃ§Ã£o";
  const categoriasSelecionadas = getSelectedRelatorioCategorias();
  const meta = [
    `<span><strong>Tipo:</strong> ${tipo}</span>`,
    obraSelecionada ? `<span><strong>Obra:</strong> ${obraSelecionada.nome}</span>` : "",
    categoriasSelecionadas.length ? `<span><strong>Categorias:</strong> ${categoriasSelecionadas.join(", ")}</span>` : "",
    getPeriodoRelatorioTexto() !== "Sem periodo informado"
      ? `<span><strong>Periodo:</strong> ${getPeriodoRelatorioTexto()}</span>`
      : "",
    lancamentosFiltrados.length ? `<span><strong>Registros:</strong> ${lancamentosFiltrados.length}</span>` : ""
  ].filter(Boolean);

  relatorioCabecalho.innerHTML = `
    <div>
      <h4>Relatorio para impressao</h4>
    </div>
    <div class="report-meta">
      ${meta.join("")}
    </div>
  `;
}

function renderRelatorioPorDescricao(lancamentosFiltrados) {
  const obras = getObras();
  const obraMap = buildObraNameMap(obras);
  const grupos = new Map();
  const agruparPorObra = !relatorioObraSelect.value;

  lancamentosFiltrados.forEach((lancamento) => {
    const chave = [
      normalizeValue(lancamento.categoria),
      normalizeValue(lancamento.descricao),
      agruparPorObra ? lancamento.obraId : ""
    ].join("|");
    if (!chave) {
      return;
    }

    if (!grupos.has(chave)) {
      grupos.set(chave, {
        descricao: lancamento.descricao,
        categoria: lancamento.categoria,
        obraNome: obraMap.get(lancamento.obraId) || "Obra removida",
        unidade: lancamento.unidade || "-",
        quantidade: 0,
        total: 0
      });
    }

    const grupo = grupos.get(chave);
    grupo.quantidade += Number(lancamento.quantidade || 0);
    grupo.total += Number(lancamento.total || 0);
    if (grupo.unidade !== (lancamento.unidade || "-")) {
      grupo.unidade = "-";
    }
  });

  const totalGeral = Array.from(grupos.values()).reduce((sum, linha) => sum + linha.total, 0);
  const usarCurvaAbc = relatorioCurvaAbcInput.checked;
  let acumulado = 0;

  const linhasBase = Array.from(grupos.values()).map((linha) => ({
    ...linha,
    participacao: totalGeral > 0 ? (linha.total / totalGeral) * 100 : 0,
    curvaAbc: "-"
  }));

  const linhas = usarCurvaAbc
    ? linhasBase.sort((a, b) => b.total - a.total || a.descricao.localeCompare(b.descricao, "pt-BR"))
    : linhasBase.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));

  if (usarCurvaAbc) {
    linhas.forEach((linha) => {
      acumulado += linha.participacao;
      linha.curvaAbc = calcularClasseCurvaAbc(acumulado);
    });
  }

  relatorioTableHead.innerHTML = `
    <tr>
      <th>Descricao</th>
      <th>Categoria</th>
      ${relatorioObraSelect.value ? "" : "<th>Obra</th>"}
      <th>Unidade</th>
      <th>Qtd.</th>
      <th>Total</th>
      ${usarCurvaAbc ? "<th>%</th><th>ABC</th>" : ""}
    </tr>
  `;

  relatorioTableBody.innerHTML = linhas.length
    ? linhas
        .map(
          (linha) => `
        <tr>
          <td>${linha.descricao}</td>
          <td>${linha.categoria}</td>
          ${relatorioObraSelect.value ? "" : `<td>${linha.obraNome}</td>`}
          <td>${linha.unidade}</td>
          <td>${formatNumber(linha.quantidade)}</td>
          <td>${formatCurrency(linha.total)}</td>
          ${usarCurvaAbc ? `<td>${linha.participacao.toFixed(1)}%</td><td>${linha.curvaAbc}</td>` : ""}
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="${relatorioObraSelect.value ? (usarCurvaAbc ? 7 : 5) : (usarCurvaAbc ? 8 : 6)}" class="empty">Nenhum lanÃ§amento encontrado para os filtros selecionados.</td></tr>`;
}

function renderRelatorioMensal(lancamentosFiltrados) {
  const grupos = new Map();

  lancamentosFiltrados.forEach((lancamento) => {
    const monthKey = String(lancamento.dataReferencia || "").slice(0, 7);
    if (!monthKey) {
      return;
    }

    if (!grupos.has(monthKey)) {
      grupos.set(monthKey, {
        mes: monthKey,
        quantidadeLancamentos: 0,
        total: 0
      });
    }

    const grupo = grupos.get(monthKey);
    const totalLancamento = Number(lancamento.total || 0);
    grupo.quantidadeLancamentos += 1;
    grupo.total += totalLancamento;
  });

  const linhas = Array.from(grupos.values()).sort((a, b) => a.mes.localeCompare(b.mes));

  relatorioTableHead.innerHTML = `
    <tr>
      <th>Mes</th>
      <th>Quantidade de lanÃ§amentos</th>
      <th>Total do mes</th>
    </tr>
  `;

  relatorioTableBody.innerHTML = linhas.length
    ? linhas
        .map(
          (linha) => `
        <tr>
          <td>${formatMonthLabel(linha.mes)}</td>
          <td>${linha.quantidadeLancamentos}</td>
          <td>${formatCurrency(linha.total)}</td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="3" class="empty">Nenhum lanÃ§amento encontrado para os filtros selecionados.</td></tr>`;
}

function renderRelatorios() {
  const lancamentosFiltrados = filtrarLancamentosParaRelatorio();
  const tipo = relatorioTipoSelect.value;
  const totalCompras = lancamentosFiltrados.reduce((sum, lancamento) => sum + Number(lancamento.total || 0), 0);
  const resumoItems = [
    { titulo: "Total", valor: totalCompras, mostrar: totalCompras > 0 || lancamentosFiltrados.length > 0 }
  ].filter((item) => item.mostrar);

  resumoRelatorio.innerHTML = resumoItems.length
    ? resumoItems
        .map(
          (item) => `
      <article class="metric-card compact">
        <p class="metric-title">${item.titulo}</p>
        <p class="metric-value">${formatCurrency(item.valor)}</p>
      </article>
    `
        )
        .join("")
    : "";

  montarCabecalhoRelatorio(lancamentosFiltrados);

  if (tipo === "mensal") {
    renderRelatorioMensal(lancamentosFiltrados);
    return;
  }

  renderRelatorioPorDescricao(lancamentosFiltrados);
}

function renderAll() {
  syncPermissionsUI();
  renderDashboard();
  populateObraSelects();
  populateRelatorioCategorias();
  refreshCompraAutocomplete();
  populateRdoAutocomplete();
  renderObras();
  renderMedicoes();
  renderCompras();
  renderMaoDeObra();
  renderRdos();
  renderUsuarios();
  renderAuditLogs();
  renderRelatorios();
}

function atualizarPrecoTotalCompraForm() {
  const quantidade = Number(compraQuantidadeInput.value || 0);
  const precoUnitario = parseCurrencyInputValue(compraPrecoUnitarioInput.value);
  setCurrencyInputValue(compraPrecoTotalInput, quantidade * precoUnitario);
}

function atualizarEstadoPeriodoRelatorio() {
  const disabled = relatorioTodasComprasInput.checked;
  relatorioDataInicioInput.disabled = disabled;
  relatorioDataFimInput.disabled = disabled;
}

function atualizarEstadoCurvaAbc() {
  const habilitado = relatorioTipoSelect.value === "descricao";
  relatorioCurvaAbcInput.disabled = !habilitado;

  if (!habilitado) {
    relatorioCurvaAbcInput.checked = false;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const result = await apiFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        force: state.loginTakeoverEmail === email
      })
    });

    state.loginTakeoverEmail = null;
    setSession(result.user);
    await initializeApp();
  } catch (error) {
    if (error.code === "SESSION_ACTIVE") {
      state.loginTakeoverEmail = email;
    } else {
      state.loginTakeoverEmail = null;
    }

    loginError.textContent = error.message || "Usuario ou senha invalidos.";
    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  apiFetch("/api/logout", { method: "POST" })
    .catch(() => null)
    .finally(() => {
      clearSession();
      showLogin();
    });
});

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activatePage(button.dataset.section);
  });
});

if (obraNewBtn) {
  obraNewBtn.addEventListener("click", () => {
    openObraEditor();
  });
}

if (obraCloseEditorBtn) {
  obraCloseEditorBtn.addEventListener("click", () => {
    closeObraEditor();
  });
}

if (obraContratanteLogoInput) {
  obraContratanteLogoInput.addEventListener("change", () => {
    handleObraLogoFileInput(obraContratanteLogoInput, "contratante");
  });
}

if (obraContratadaLogoInput) {
  obraContratadaLogoInput.addEventListener("change", () => {
    handleObraLogoFileInput(obraContratadaLogoInput, "contratada");
  });
}

if (obraOrcamentoSinteticoInput) {
  obraOrcamentoSinteticoInput.addEventListener("change", () => {
    handleObraArquivoFileInput(obraOrcamentoSinteticoInput, "orcamentoSintetico");
  });
}

[obraContratanteLogoPreview, obraContratadaLogoPreview].forEach((container) => {
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-obra-logo-clear]");
    if (!clearButton) {
      return;
    }

    setObraLogoDraft(clearButton.getAttribute("data-obra-logo-clear"), "");
  });
});

[obraOrcamentoSinteticoPreview].forEach((container) => {
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-obra-arquivo-clear]");
    if (!clearButton) {
      return;
    }

    setObraArquivoDraft(clearButton.getAttribute("data-obra-arquivo-clear"), null);
  });
});

if (obraOrcamentoTemplateBtn) {
  obraOrcamentoTemplateBtn.addEventListener("click", () => {
    try {
      downloadOrcamentoSinteticoTemplate();
    } catch (error) {
      alert(error.message);
    }
  });
}

obraForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const obraId = obraEditIdInput.value;
    if (obraId && isObraFinalizada(obraId) && !(await confirmarAutorizacaoGerente("edicao de obra finalizada"))) {
      return;
    }

      const payload = {
        nome: document.getElementById("obraNome").value.trim(),
        local: document.getElementById("obraLocal").value.trim(),
        responsavel: document.getElementById("obraResponsavel").value.trim(),
        dataInicio: document.getElementById("obraDataInicio").value,
        orcamento: parseCurrencyInputValue(obraOrcamentoInput.value),
        contratanteNome: obraContratanteNomeInput.value.trim(),
        contratanteLogo: state.obraLogoDrafts.contratante || "",
        contratadaNome: obraContratadaNomeInput.value.trim(),
        contratadaLogo: state.obraLogoDrafts.contratada || "",
        orcamentoSinteticoArquivo: state.obraArquivoDrafts.orcamentoSintetico,
        
      };

    await apiFetch(obraId ? `/api/obras/${obraId}` : "/api/obras", {
      method: obraId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    await refreshData();
    await refreshAuditLogsIfNeeded();
    closeObraEditor();
    renderAll();
    activatePage("obras");
  } catch (error) {
    alert(error.message);
  }
});

obraCancelEditBtn.addEventListener("click", () => {
  closeObraEditor();
});

finalizacaoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const obraId = finalizacaoObraSelect.value;
  if (!obraId) {
    alert("Selecione uma obra para finalizar.");
    return;
  }

  try {
    if (isObraFinalizada(obraId) && !(await confirmarAutorizacaoGerente("alteracao em obra finalizada"))) {
      return;
    }

    await apiFetch(`/api/obras/${obraId}/finalizacao`, {
      method: "PUT",
      body: JSON.stringify({
        dataEntrega: document.getElementById("finalizacaoDataEntrega").value,
        aditivosInfo: document.getElementById("finalizacaoAditivosInfo").value.trim(),
        aditivosValor: parseCurrencyInputValue(finalizacaoAditivosValorInput.value)
      })
    });

    await refreshData();
    await refreshAuditLogsIfNeeded();
    renderAll();
    openObraEditor(getObraById(obraId));
    activatePage("obras");
  } catch (error) {
    alert(error.message);
  }
});

if (medicaoNewBtn) {
  medicaoNewBtn.addEventListener("click", async () => {
    try {
      await openMedicaoEditor();
      activatePage("medicoes");
    } catch (error) {
      alert(error.message);
    }
  });
}

if (medicaoCloseEditorBtn) {
  medicaoCloseEditorBtn.addEventListener("click", () => {
    closeMedicaoEditor();
  });
}

if (medicaoCancelEditBtn) {
  medicaoCancelEditBtn.addEventListener("click", () => {
    closeMedicaoEditor();
  });
}

if (medicaoBuscarBtn) {
  medicaoBuscarBtn.addEventListener("click", () => {
    if (
      medicaoFiltroDataInicioInput.value &&
      medicaoFiltroDataFimInput.value &&
      medicaoFiltroDataFimInput.value < medicaoFiltroDataInicioInput.value
    ) {
      alert("A data final da busca nao pode ser anterior a data inicial.");
      return;
    }

    renderMedicoes();
  });
}

if (medicaoLimparBuscaBtn) {
  medicaoLimparBuscaBtn.addEventListener("click", () => {
    medicaoFiltroObraSelect.value = "";
    medicaoFiltroDataInicioInput.value = "";
    medicaoFiltroDataFimInput.value = "";
    renderMedicoes();
  });
}

if (medicaoObraSelect) {
  medicaoObraSelect.addEventListener("change", async () => {
    const medicaoId = medicaoEditIdInput.value;
    if (medicaoId) {
      const originalObraId = medicaoForm?.dataset.originalObraId || "";
      if (originalObraId && medicaoObraSelect.value !== originalObraId) {
        const confirmed = confirm("Ao trocar a obra, a base de itens da mediÃ§Ã£o serÃ¡ recarregada a partir do histÃ³rico da nova obra. Deseja continuar?");
        if (!confirmed) {
          medicaoObraSelect.value = originalObraId;
          return;
        }

        medicaoEditIdInput.value = "";
        medicaoForm.dataset.originalObraId = "";
        medicaoSubmitBtn.textContent = "Salvar MediÃ§Ã£o";
        medicaoCancelEditBtn.classList.add("hidden");
        medicaoReferenciaInput.value = "";
        try {
          await carregarBaseNovaMedicao(medicaoObraSelect.value);
        } catch (error) {
          alert(error.message);
        }
        return;
      }

      try {
        await loadMedicaoHistoryForObra(medicaoObraSelect.value);
        renderMedicaoDraftTable();
      } catch (error) {
        alert(error.message);
      }
      return;
    }

    try {
      await carregarBaseNovaMedicao(medicaoObraSelect.value);
    } catch (error) {
      alert(error.message);
    }
  });
}

if (medicaoUseObraPlanilhaBtn) {
  medicaoUseObraPlanilhaBtn.addEventListener("click", async () => {
    const obra = getObraById(medicaoObraSelect?.value || "");
    const arquivoObra = getObraMedicaoBaseArquivo(obra);
    if (!obra) {
      alert("Selecione uma obra antes de carregar a planilha sintética.");
      return;
    }

    if (!arquivoObra) {
      alert("Esta obra não possui planilha sintética cadastrada.");
      return;
    }

    medicaoUseObraPlanilhaBtn.disabled = true;
    formatMedicaoBaseStatus(`Lendo a planilha sintética cadastrada da obra ${obra.nome}...`);

    try {
      const file = await createFileFromStoredAttachment(arquivoObra);
      if (!file) {
        throw new Error("Não foi possível abrir a planilha sintética cadastrada da obra.");
      }

      await importMedicaoPlanilha(file);
    } catch (error) {
      formatMedicaoBaseStatus("Falha na leitura da planilha sintética cadastrada da obra.");
      alert(error.message);
    } finally {
      medicaoUseObraPlanilhaBtn.disabled = false;
    }
  });
}

if (medicaoItensTableBody) {
  medicaoItensTableBody.addEventListener("change", (event) => {
    const input = event.target.closest("[data-medicao-qtd]");
    if (!input) {
      return;
    }

    const itemId = input.getAttribute("data-medicao-qtd");
    const quantidadeMedida = Math.max(0, Number(input.value || 0));
    state.medicaoDraftItems = getMedicaoDraftItems().map((item) => (
      item.id === itemId
        ? { ...item, quantidadeMedida: Number.isFinite(quantidadeMedida) ? quantidadeMedida : 0 }
        : item
    ));
    renderMedicaoDraftTable();
  });
}

if (medicoesTableBody) {
  medicoesTableBody.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-medicao-edit]");
    if (!editButton) {
      return;
    }

    try {
      const medicao = await fetchMedicaoDetail(editButton.getAttribute("data-medicao-edit"));
      await openMedicaoEditor(medicao);
      activatePage("medicoes");
    } catch (error) {
      alert(error.message);
    }
  });
}

if (medicaoForm) {
  medicaoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const obraId = medicaoObraSelect.value;
    if (!obraId) {
      alert("Selecione uma obra para registrar a medicao.");
      return;
    }

    const items = getMedicaoDraftItems();
    if (!items.length) {
      alert("Leia a planilha sintética da obra ou carregue a base da última medição antes de salvar.");
      return;
    }

    try {
      const medicaoId = medicaoEditIdInput.value;
      await apiFetch(medicaoId ? `/api/medicoes/${medicaoId}` : "/api/medicoes", {
        method: medicaoId ? "PUT" : "POST",
        body: JSON.stringify({
          obraId,
          data: medicaoDataInput.value,
          referencia: medicaoReferenciaInput.value.trim(),
          pdfNome: state.medicaoBaseDraft?.name || "",
          items
        })
      });

      await refreshData();
      await refreshAuditLogsIfNeeded();
      closeMedicaoEditor();
      renderAll();
      activatePage("medicoes");
    } catch (error) {
      alert(error.message);
    }
  });
}

compraForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const obraId = compraObraSelect.value;
  const compraDataValue = document.getElementById("compraData").value;
  if (!obraId) {
    alert("Cadastre uma obra antes de lancar compras.");
    return;
  }

  try {
    if (isObraFinalizada(obraId) && !(await confirmarAutorizacaoGerente("lancamento em obra finalizada"))) {
      return;
    }

    const compraId = compraEditIdInput.value;
    const quantidade = Number(compraQuantidadeInput.value);
    const precoUnitario = parseCurrencyInputValue(compraPrecoUnitarioInput.value);
    const precoTotal = quantidade * precoUnitario;

    await apiFetch(compraId ? `/api/compras/${compraId}` : "/api/compras", {
      method: compraId ? "PUT" : "POST",
      body: JSON.stringify({
        obraId,
        data: compraDataValue,
        descricao: compraDescricaoInput.value.trim(),
        categoria: compraCategoriaInput.value.trim(),
        fornecedor: compraFornecedorInput.value.trim(),
        unidade: compraUnidadeInput.value.trim(),
        quantidade,
        precoUnitario,
        precoTotal,
        pago: compraPagoInput.value === "true"
      })
    });

    rememberCompraDate(compraDataValue);
      await refreshData();
      await refreshAuditLogsIfNeeded();
      resetCompraForm();
    renderAll();
    activatePage("compras");
  } catch (error) {
    alert(error.message);
  }
});

compraCancelEditBtn.addEventListener("click", () => {
  resetCompraForm();
});

maoDeObraForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const obraId = maoDeObraObraSelect.value;
  const periodoInicioValue = maoDeObraPeriodoInicioInput.value;
  const periodoFimValue = maoDeObraPeriodoFimInput.value;
  const dataPagamentoValue = maoDeObraDataPagamentoInput.value;
  if (!obraId) {
    alert("Cadastre uma obra antes de lanÃ§ar pagamentos de mÃ£o de obra.");
    return;
  }

  if (periodoFimValue < periodoInicioValue) {
    alert("A data final do perÃ­odo trabalhado nÃ£o pode ser anterior Ã  data inicial.");
    return;
  }

  try {
    if (isObraFinalizada(obraId) && !(await confirmarAutorizacaoGerente("lancamento de mÃ£o de obra em obra finalizada"))) {
      return;
    }

    const pagamentoId = maoDeObraEditIdInput.value;
    await apiFetch(pagamentoId ? `/api/mao-de-obra/${pagamentoId}` : "/api/mao-de-obra", {
      method: pagamentoId ? "PUT" : "POST",
      body: JSON.stringify({
        obraId,
        descricao: maoDeObraDescricaoInput.value.trim(),
        periodoInicio: periodoInicioValue,
        periodoFim: periodoFimValue,
        dataPagamento: dataPagamentoValue,
        valor: parseCurrencyInputValue(maoDeObraValorInput.value)
      })
    });

    rememberMaoDeObraDates({
      periodoInicio: periodoInicioValue,
      periodoFim: periodoFimValue,
      dataPagamento: dataPagamentoValue
    });
      await refreshData();
      await refreshAuditLogsIfNeeded();
      resetMaoDeObraForm();
    renderAll();
    activatePage("maoDeObra");
  } catch (error) {
    alert(error.message);
  }
});

maoDeObraCancelEditBtn.addEventListener("click", () => {
  resetMaoDeObraForm();
});

if (rdoNewBtn) {
  rdoNewBtn.addEventListener("click", () => {
    openRdoEditor();
    activatePage("rdos");
  });
}

if (rdoCloseEditorBtn) {
  rdoCloseEditorBtn.addEventListener("click", () => {
    closeRdoEditor();
  });
}

if (rdoCancelEditBtn) {
  rdoCancelEditBtn.addEventListener("click", () => {
    closeRdoEditor();
  });
}

if (rdoBuscarBtn) {
  rdoBuscarBtn.addEventListener("click", () => {
    if (
      rdoFiltroDataInicioInput.value &&
      rdoFiltroDataFimInput.value &&
      rdoFiltroDataFimInput.value < rdoFiltroDataInicioInput.value
    ) {
      alert("A data final da busca nao pode ser anterior a data inicial.");
      return;
    }

    renderRdos();
  });
}

if (rdoLimparBuscaBtn) {
  rdoLimparBuscaBtn.addEventListener("click", () => {
    rdoFiltroObraSelect.value = "";
    rdoFiltroDataInicioInput.value = "";
    rdoFiltroDataFimInput.value = "";
    renderRdos();
  });
}

if (rdoImprimirSelecionadosBtn) {
  rdoImprimirSelecionadosBtn.addEventListener("click", () => {
    exportarRdosPdfPorIds(Array.from(state.selectedRdoIds));
  });
}

if (rdoForm) {
  rdoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const obraId = rdoObraSelect.value;
    const rdoId = rdoEditIdInput.value;
    if (!obraId) {
      alert("Selecione uma obra para registrar o RDO.");
      return;
    }

    try {
      const authorizationLabel = rdoId ? "edicao de RDO de obra finalizada" : "lancamento de RDO em obra finalizada";
      if (isObraFinalizada(obraId) && !(await confirmarAutorizacaoGerente(authorizationLabel))) {
        return;
      }

      validateRdoPhotos();

      await apiFetch(rdoId ? `/api/rdos/${rdoId}` : "/api/rdos", {
        method: rdoId ? "PUT" : "POST",
        body: JSON.stringify({
          obraId,
          data: rdoDataInput.value,
          clima: rdoClimaSelect.value,
          fotos: getRdoDraftPhotos(),
          servicosExecutados: getStructuredContainerValues(rdoServicosContainer, RDO_STRUCTURED_FIELD_CONFIGS.servicos),
          materiaisRecebidos: getStructuredContainerValues(rdoMateriaisRecebidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais),
          materiaisConsumidos: getStructuredContainerValues(rdoMateriaisConsumidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais),
          maoDeObraPresente: getStructuredContainerValues(rdoMaoDeObraPresenteContainer, RDO_STRUCTURED_FIELD_CONFIGS.equipe),
          observacoesAdicionais: rdoObservacoesAdicionaisInput.value.trim()
        })
      });

      await refreshData();
      await refreshAuditLogsIfNeeded();
      closeRdoEditor();
      renderAll();
      activatePage("rdos");
    } catch (error) {
      alert(error.message);
    }
  });
}

if (rdoFotosContainer) {
  rdoFotosContainer.addEventListener("change", async (event) => {
    const input = event.target.closest("[data-rdo-photo-input]");
    const file = input?.files?.[0];
    if (!input || !file) {
      return;
    }

    input.disabled = true;

    try {
      const compressedPhoto = await compressImageFile(file);
      setRdoDraftPhotos([...getRdoDraftPhotos(), compressedPhoto]);
    } catch (error) {
      alert(error.message);
      renderRdoFotos();
    }
  });

  rdoFotosContainer.addEventListener("input", (event) => {
    const commentField = event.target.closest("[data-rdo-photo-comment]");
    if (!commentField) {
      return;
    }

    const photoId = commentField.getAttribute("data-rdo-photo-comment");
    state.rdoDraftPhotos = getRdoDraftPhotos().map((photo) => (
      photo.id === photoId
        ? { ...photo, comentario: commentField.value.trimStart() }
        : photo
    ));
  });

  rdoFotosContainer.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-rdo-photo-remove]");
    if (!removeButton) {
      return;
    }

    const photoId = removeButton.getAttribute("data-rdo-photo-remove");
    setRdoDraftPhotos(getRdoDraftPhotos().filter((photo) => photo.id !== photoId));
  });
}

if (rdoTableBody) {
  rdoTableBody.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-rdo-select]");
    if (!checkbox) {
      return;
    }

    const rdoId = checkbox.getAttribute("data-rdo-select");
    if (checkbox.checked) {
      state.selectedRdoIds.add(rdoId);
    } else {
      state.selectedRdoIds.delete(rdoId);
    }

    updateRdoSelectAllState(getFilteredRdos());
    if (rdoImprimirSelecionadosBtn) {
      rdoImprimirSelecionadosBtn.disabled = state.selectedRdoIds.size === 0;
    }
  });

  rdoTableBody.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-rdo-edit]");
    if (editButton) {
      const rdoId = editButton.getAttribute("data-rdo-edit");
      const rdoSummary = getRdoById(rdoId);
      if (rdoSummary && isObraFinalizada(rdoSummary.obraId) && !(await confirmarAutorizacaoGerente("edicao de RDO de obra finalizada"))) {
        return;
      }

      try {
        const rdo = await fetchRdoDetail(rdoId);
        openRdoEditor(rdo);
        activatePage("rdos");
      } catch (error) {
        alert(error.message);
      }
      return;
    }

    const printButton = event.target.closest("[data-rdo-print]");
    if (printButton) {
      await exportarRdosPdfPorIds([printButton.getAttribute("data-rdo-print")]);
      return;
    }

    const deleteButton = event.target.closest("[data-rdo-delete]");
    if (!deleteButton) {
      return;
    }

    const rdoId = deleteButton.getAttribute("data-rdo-delete");
    const senhaInformada = solicitarSenhaUsuarioParaExclusao("RDO");
    if (!senhaInformada) {
      return;
    }

    try {
      await apiFetch(`/api/rdos/${rdoId}`, {
        method: "DELETE",
        body: JSON.stringify({ password: senhaInformada })
      });
      state.selectedRdoIds.delete(rdoId);
      if (rdoEditIdInput.value === rdoId) {
        closeRdoEditor();
      }
      await refreshData();
      await refreshAuditLogsIfNeeded();
      renderAll();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (rdoSelectAllInput) {
  rdoSelectAllInput.addEventListener("change", () => {
    getFilteredRdos().forEach((rdo) => {
      if (rdoSelectAllInput.checked) {
        state.selectedRdoIds.add(rdo.id);
      } else {
        state.selectedRdoIds.delete(rdo.id);
      }
    });

    renderRdos();
  });
}

compraQuantidadeInput.addEventListener("input", atualizarPrecoTotalCompraForm);
compraPrecoUnitarioInput.addEventListener("input", atualizarPrecoTotalCompraForm);
compraDescricaoInput.addEventListener("input", preencherCamposPorDescricao);
compraDescricaoInput.addEventListener("change", preencherCamposPorDescricao);
compraDescricaoInput.addEventListener("blur", preencherCamposPorDescricao);

obrasTableBody.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-obra-edit]");
  if (editButton) {
    const id = editButton.getAttribute("data-obra-edit");
    const obra = getObraById(id);
    if (!obra) {
      return;
    }

    if (isObraFinalizada(id) && !(await confirmarAutorizacaoGerente("edicao de obra finalizada"))) {
      return;
    }

    openObraEditor(obra);
    activatePage("obras");
    return;
  }

  const deleteButton = event.target.closest("[data-obra-delete]");
  if (!deleteButton) {
    return;
  }

  try {
    if (!(await confirmarExclusaoObraComSenhaGerente())) {
      return;
    }

    const id = deleteButton.getAttribute("data-obra-delete");
    await apiFetch(`/api/obras/${id}`, { method: "DELETE" });
    await refreshData();
    await refreshAuditLogsIfNeeded();
    if (obraEditIdInput.value === id) {
      closeObraEditor();
    }
    renderAll();
  } catch (error) {
    alert(error.message);
  }
});

comprasTableBody.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-compra-edit]");
  if (editButton) {
    const id = editButton.getAttribute("data-compra-edit");
    const compra = getCompras().find((item) => item.id === id);
    if (!compra) {
      return;
    }

    if (isObraFinalizada(compra.obraId) && !(await confirmarAutorizacaoGerente("edicao de compra de obra finalizada"))) {
      return;
    }

    preencherFormularioCompra(compra);
    activatePage("compras");
    return;
  }

  const deleteButton = event.target.closest("[data-compra-delete]");
  if (!deleteButton) {
    return;
  }

  try {
    const id = deleteButton.getAttribute("data-compra-delete");
    const compra = getCompras().find((item) => item.id === id);
    if (compra && isObraFinalizada(compra.obraId)) {
      if (!(await confirmarAutorizacaoGerente("exclusao de compra de obra finalizada"))) {
        return;
      }
    }

    await apiFetch(`/api/compras/${id}`, { method: "DELETE" });
    await refreshData();
    await refreshAuditLogsIfNeeded();
    renderAll();
  } catch (error) {
    alert(error.message);
  }
});

maoDeObraTableBody.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-mao-de-obra-edit]");
  if (editButton) {
    const id = editButton.getAttribute("data-mao-de-obra-edit");
    const pagamento = getPagamentosMaoDeObra().find((item) => item.id === id);
    if (!pagamento) {
      return;
    }

    if (isObraFinalizada(pagamento.obraId) && !(await confirmarAutorizacaoGerente("edicao de mÃ£o de obra de obra finalizada"))) {
      return;
    }

    preencherFormularioMaoDeObra(pagamento);
    activatePage("maoDeObra");
    return;
  }

  const deleteButton = event.target.closest("[data-mao-de-obra-delete]");
  if (!deleteButton) {
    return;
  }

  try {
    const id = deleteButton.getAttribute("data-mao-de-obra-delete");
    const pagamento = getPagamentosMaoDeObra().find((item) => item.id === id);
    if (pagamento && isObraFinalizada(pagamento.obraId)) {
      if (!(await confirmarAutorizacaoGerente("exclusao de mÃ£o de obra de obra finalizada"))) {
        return;
      }
    }

    await apiFetch(`/api/mao-de-obra/${id}`, { method: "DELETE" });
    await refreshData();
    await refreshAuditLogsIfNeeded();
    renderAll();
  } catch (error) {
    alert(error.message);
  }
});

if (usuarioForm) {
  usuarioForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("usuarioNome").value.trim(),
          email: document.getElementById("usuarioEmail").value.trim().toLowerCase(),
          password: document.getElementById("usuarioSenha").value,
          role: document.getElementById("usuarioRole").value
        })
      });

      closeUsuarioFormPanel();
      await refreshUsers();
      await refreshAuditLogsIfNeeded();
      renderUsuarios();
      activatePage("conta");
    } catch (error) {
      alert(error.message);
    }
  });
}

if (usuarioNewBtn) {
  usuarioNewBtn.addEventListener("click", () => {
    openUsuarioFormPanel();
  });
}

if (usuarioClosePanelBtn) {
  usuarioClosePanelBtn.addEventListener("click", () => {
    closeUsuarioFormPanel();
  });
}

if (usuariosTableBody) {
  usuariosTableBody.addEventListener("click", async (event) => {
    const passwordButton = event.target.closest("[data-usuario-password]");
    if (passwordButton) {
      const usuario = getUsuarioById(passwordButton.getAttribute("data-usuario-password"));
      if (!usuario) {
        return;
      }

      openSenhaPanel(usuario);
      return;
    }

    const button = event.target.closest("[data-usuario-delete]");
    if (!button) {
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este usuario?")) {
      return;
    }

    try {
      await apiFetch(`/api/users/${button.getAttribute("data-usuario-delete")}`, {
        method: "DELETE"
      });
      await refreshUsers();
      await refreshAuditLogsIfNeeded();
      renderUsuarios();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (senhaForm) {
  senhaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    senhaFeedback.classList.add("hidden");

    const targetUserId = senhaTargetUserIdInput.value;
    const targetUser = getUsuarioById(targetUserId) || getSessionUser();
    const isOwnUser = targetUserId === getSessionUser()?.id;
    const currentPassword = document.getElementById("senhaAtual").value;
    const newPassword = document.getElementById("senhaNova").value;
    const confirmPassword = document.getElementById("senhaNovaConfirmacao").value;

    if (newPassword !== confirmPassword) {
      senhaFeedback.textContent = "A confirmacao da nova senha nao confere.";
      senhaFeedback.classList.remove("hidden");
      return;
    }

    try {
      await apiFetch(`/api/users/${targetUserId}/change-password`, {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      resetSenhaForm();
      await refreshAuditLogsIfNeeded();
      senhaFeedback.textContent = isOwnUser ? "Senha atualizada com sucesso." : `Senha de ${targetUser?.name || "usuario"} atualizada com sucesso.`;
      senhaFeedback.classList.remove("hidden");
    } catch (error) {
      senhaFeedback.textContent = error.message;
      senhaFeedback.classList.remove("hidden");
    }
  });
}

if (senhaClosePanelBtn) {
  senhaClosePanelBtn.addEventListener("click", () => {
    closeSenhaPanel();
  });
}

if (logsRefreshBtn) {
  logsRefreshBtn.addEventListener("click", async () => {
    try {
      await refreshAuditLogsIfNeeded();
      renderAuditLogs();
    } catch (error) {
      alert(error.message);
    }
  });
}

aplicarRelatorioBtn.addEventListener("click", () => {
  renderRelatorios();
});

imprimirRelatorioBtn.addEventListener("click", () => {
  renderRelatorios();
  clearPrintMode();
  document.body.classList.add("printing-relatorios");
  window.print();
});

relatorioTodasComprasInput.addEventListener("change", () => {
  atualizarEstadoPeriodoRelatorio();
  renderRelatorios();
});

relatorioTipoSelect.addEventListener("change", () => {
  atualizarEstadoCurvaAbc();
  renderRelatorios();
});

relatorioObraSelect.addEventListener("change", () => {
  renderRelatorios();
});

relatorioCurvaAbcInput.addEventListener("change", () => {
  renderRelatorios();
});

relatorioCategoriasSelect.addEventListener("change", () => {
  renderRelatorios();
});

relatorioDataInicioInput.addEventListener("change", () => {
  renderRelatorios();
});

relatorioDataFimInput.addEventListener("change", () => {
  renderRelatorios();
});

[
  obraOrcamentoInput,
  finalizacaoAditivosValorInput,
  compraPrecoUnitarioInput,
  maoDeObraValorInput
].forEach(bindCurrencyInput);

bindStructuredContainer(rdoServicosContainer, RDO_STRUCTURED_FIELD_CONFIGS.servicos);
bindStructuredContainer(rdoMateriaisRecebidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais);
bindStructuredContainer(rdoMateriaisConsumidosContainer, RDO_STRUCTURED_FIELD_CONFIGS.materiais);
bindStructuredContainer(rdoMaoDeObraPresenteContainer, RDO_STRUCTURED_FIELD_CONFIGS.equipe);
renderObraLogoPreviews();
renderObraArquivoPreviews();
renderRdoFotos();
window.addEventListener("afterprint", clearPrintMode);

async function initializeApp() {
  try {
    const me = await apiFetch("/api/me");
    setSession(me.user);
  } catch (error) {
    clearSession();
    showLogin();
    return;
  }

  try {
    await refreshData();
    await refreshUsers();
    await refreshAuditLogsIfNeeded();
  } catch (error) {
    clearSession();
    showLogin();
    alert(`Falha ao carregar dados do servidor: ${error.message}`);
    return;
  }

  const sessionUser = getSessionUser();
  welcomeText.textContent = `Bem-vindo, ${sessionUser?.name || "Usuario"}`;
  showApp();

  document.getElementById("finalizacaoDataEntrega").value = getTodayIsoDate();
  setCurrencyInputValue(finalizacaoAditivosValorInput, 0);
  resetCompraForm();
  resetMaoDeObraForm();
  resetObraForm();
  resetMedicaoForm();
  resetRdoForm();
  closeObraEditor();
  closeMedicaoEditor();
  closeRdoEditor();
  closeUsuarioFormPanel();
  closeSenhaPanel();
  atualizarEstadoPeriodoRelatorio();
  atualizarEstadoCurvaAbc();
  renderAll();
  activatePage("dashboard");
}

clearLegacyBrowserData();
initializeApp();

