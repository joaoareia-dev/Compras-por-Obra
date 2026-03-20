const state = {
  obras: [],
  compras: [],
  usuarios: [],
  sessionUser: null,
  loginTakeoverEmail: null
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

const compraForm = document.getElementById("compraForm");
const comprasTableBody = document.getElementById("comprasTableBody");
const compraEditIdInput = document.getElementById("compraEditId");
const compraSubmitBtn = document.getElementById("compraSubmitBtn");
const compraCancelEditBtn = document.getElementById("compraCancelEditBtn");
const compraObraSelect = document.getElementById("compraObra");
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

const relatorioObraSelect = document.getElementById("relatorioObra");
const relatorioTipoSelect = document.getElementById("relatorioTipo");
const relatorioTodasComprasInput = document.getElementById("relatorioTodasCompras");
const relatorioCurvaAbcInput = document.getElementById("relatorioCurvaAbc");
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

const menuButtons = Array.from(document.querySelectorAll(".menu-btn"));
const pages = Array.from(document.querySelectorAll(".page"));

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
}

async function refreshUsers() {
  const payload = await apiFetch("/api/users");
  state.usuarios = payload.users || [];
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

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatDate(isoDate) {
  if (!isoDate) {
    return "-";
  }

  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("pt-BR");
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });
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
    return "Todas as compras da obra";
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

function getUltimaObraLancadaId() {
  const compras = getCompras();
  if (!compras.length) {
    return "";
  }

  return compras[compras.length - 1]?.obraId || "";
}

function getAditivosValor(obra) {
  return Number(obra?.finalizacao?.aditivosValor || 0);
}

function getOrcamentoComAditivos(obra) {
  return Number(obra.orcamento || 0) + getAditivosValor(obra);
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

function refreshCompraAutocomplete() {
  const compras = getCompras();
  updateDatalist(descricaoOptions, buildUniqueValues(compras.map((compra) => compra.descricao)));
  updateDatalist(categoriaOptions, buildUniqueValues(compras.map((compra) => compra.categoria)));
  updateDatalist(fornecedorOptions, buildUniqueValues(compras.map((compra) => compra.fornecedor)));
  updateDatalist(unidadeOptions, buildUniqueValues(compras.map((compra) => compra.unidade)));
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
  document.getElementById("obraDataInicio").value = new Date().toISOString().slice(0, 10);
}

function resetFinalizacaoForm() {
  finalizacaoForm.reset();
  document.getElementById("finalizacaoDataEntrega").value = new Date().toISOString().slice(0, 10);
  document.getElementById("finalizacaoAditivosValor").value = "0";
}

function openObraEditor(obra = null) {
  obraEditorPanel.classList.remove("hidden");

  if (obra) {
    obraEditorTitle.textContent = "Editar Obra";
    obraEditorSubtitle.textContent = "Atualize os dados da obra e, se necessário, finalize a entrega.";
    preencherFormularioObra(obra);
    finalizacaoPanel.classList.remove("hidden");
    finalizacaoObraSelect.value = obra.id;
    document.getElementById("finalizacaoDataEntrega").value = obra.finalizacao?.dataEntrega || new Date().toISOString().slice(0, 10);
    document.getElementById("finalizacaoAditivosInfo").value = obra.finalizacao?.aditivosInfo || "";
    document.getElementById("finalizacaoAditivosValor").value = Number(obra.finalizacao?.aditivosValor || 0);
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
  document.getElementById("compraData").value = new Date().toISOString().slice(0, 10);
  const ultimaObra = getUltimaObraLancadaId();
  if (ultimaObra) {
    compraObraSelect.value = ultimaObra;
  }
  atualizarPrecoTotalCompraForm();
}

function preencherFormularioCompra(compra) {
  compraEditIdInput.value = compra.id;
  compraObraSelect.value = compra.obraId;
  document.getElementById("compraData").value = compra.data || "";
  compraDescricaoInput.value = compra.descricao || "";
  compraCategoriaInput.value = compra.categoria || "";
  compraFornecedorInput.value = compra.fornecedor || "";
  compraUnidadeInput.value = compra.unidade || "";
  compraQuantidadeInput.value = Number(compra.quantidade || 0);
  compraPrecoUnitarioInput.value = Number(compra.precoUnitario || 0);
  document.getElementById("compraPago").checked = Boolean(compra.pago);
  compraSubmitBtn.textContent = "Atualizar Compra";
  compraCancelEditBtn.classList.remove("hidden");
  atualizarPrecoTotalCompraForm();
}

function preencherFormularioObra(obra) {
  obraEditIdInput.value = obra.id;
  document.getElementById("obraNome").value = obra.nome || "";
  document.getElementById("obraLocal").value = obra.local || "";
  document.getElementById("obraResponsavel").value = obra.responsavel || "";
  document.getElementById("obraDataInicio").value = obra.dataInicio || "";
  document.getElementById("obraOrcamento").value = Number(obra.orcamento || 0);
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
    ? "Confirme a senha atual para concluir a alteração."
    : "Como gerente, você pode definir uma nova senha para este usuário.";
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

  if (!isAdmin() && ["obras"].includes(document.querySelector(".menu-btn.active")?.dataset.section)) {
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
}

function renderDashboard() {
  const obras = getObras();
  const compras = getCompras();
  const obrasFinalizadas = obras.filter((obra) => obra.finalizacao?.dataEntrega).length;
  const totalGasto = compras.reduce((sum, compra) => sum + getCompraTotal(compra), 0);
  const totalPago = compras.filter((compra) => compra.pago).reduce((sum, compra) => sum + getCompraTotal(compra), 0);
  const totalAberto = totalGasto - totalPago;
  const resumoObras = obras
    .map((obra) => {
      const totalObra = compras
        .filter((compra) => compra.obraId === obra.id)
        .reduce((sum, compra) => sum + getCompraTotal(compra), 0);
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
        <p class="metric-title">Obras finalizadas</p>
        <p class="metric-value">${obrasFinalizadas}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">Total gasto</p>
        <p class="metric-value">${formatCurrency(totalGasto)}</p>
      </article>
      <article class="metric-card">
        <p class="metric-title">Total em aberto</p>
        <p class="metric-value">${formatCurrency(totalAberto)}</p>
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

  if (!obras.length) {
    compraObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    finalizacaoObraSelect.innerHTML = `<option value="">Cadastre uma obra antes</option>`;
    relatorioObraSelect.innerHTML = `<option value="">Todas as obras</option>`;
    return;
  }

  compraObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");
  if (ultimaObraLancadaId && obras.some((obra) => obra.id === ultimaObraLancadaId)) {
    compraObraSelect.value = ultimaObraLancadaId;
  }

  finalizacaoObraSelect.innerHTML = obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("");

  relatorioObraSelect.innerHTML = `
    <option value="">Todas as obras</option>
    ${obras.map((obra) => `<option value="${obra.id}">${obra.nome}</option>`).join("")}
  `;
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
  const obraMap = new Map(obras.map((obra) => [obra.id, obra.nome]));

  if (!compras.length) {
    comprasTableBody.innerHTML = `<tr><td colspan="11" class="empty">Nenhuma compra lancada.</td></tr>`;
    return;
  }

  const sorted = [...compras].sort((a, b) => new Date(b.data) - new Date(a.data));

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
        <td>${Number(compra.quantidade || 0).toLocaleString("pt-BR")}</td>
        <td>${formatCurrency(compra.precoUnitario || 0)}</td>
        <td>${formatCurrency(getCompraTotal(compra))}</td>
        <td class="${compra.pago ? "status-pago" : "status-aberto"}">${compra.pago ? "Pago" : "Em aberto"}</td>
        <td>
          <button class="btn ghost" data-compra-edit="${compra.id}">Editar</button>
          <button class="btn delete" data-compra-delete="${compra.id}">Excluir</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function filtrarComprasParaRelatorio() {
  const obraId = relatorioObraSelect.value;
  const dataInicio = document.getElementById("relatorioDataInicio").value;
  const dataFim = document.getElementById("relatorioDataFim").value;
  const todasComprasDaObra = relatorioTodasComprasInput.checked;

  return getCompras().filter((compra) => {
    const matchObra = !obraId || compra.obraId === obraId;
    const matchInicio = todasComprasDaObra || !dataInicio || compra.data >= dataInicio;
    const matchFim = todasComprasDaObra || !dataFim || compra.data <= dataFim;
    return matchObra && matchInicio && matchFim;
  });
}

function montarCabecalhoRelatorio(comprasFiltradas) {
  const obras = getObras();
  const obraSelecionada = obras.find((obra) => obra.id === relatorioObraSelect.value) || null;
  const tipo = relatorioTipoSelect.value === "mensal" ? "Totais em intervalos mensais" : "Por descricao de material";
  const meta = [
    `<span><strong>Tipo:</strong> ${tipo}</span>`,
    obraSelecionada ? `<span><strong>Obra:</strong> ${obraSelecionada.nome}</span>` : "",
    getPeriodoRelatorioTexto() !== "Sem periodo informado"
      ? `<span><strong>Periodo:</strong> ${getPeriodoRelatorioTexto()}</span>`
      : "",
    comprasFiltradas.length ? `<span><strong>Registros:</strong> ${comprasFiltradas.length}</span>` : ""
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

function renderRelatorioPorDescricao(comprasFiltradas) {
  const obras = getObras();
  const obraMap = new Map(obras.map((obra) => [obra.id, obra.nome]));
  const grupos = new Map();

  comprasFiltradas.forEach((compra) => {
    const chave = normalizeValue(compra.descricao);
    if (!chave) {
      return;
    }

    if (!grupos.has(chave)) {
      grupos.set(chave, {
        descricao: compra.descricao,
        obraNome: obraMap.get(compra.obraId) || "Obra removida",
        unidade: compra.unidade || "-",
        quantidade: 0,
        total: 0
      });
    }

    const grupo = grupos.get(chave);
    grupo.quantidade += Number(compra.quantidade || 0);
    grupo.total += getCompraTotal(compra);
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
          ${relatorioObraSelect.value ? "" : `<td>${linha.obraNome}</td>`}
          <td>${linha.unidade}</td>
          <td>${linha.quantidade.toLocaleString("pt-BR")}</td>
          <td>${formatCurrency(linha.total)}</td>
          ${usarCurvaAbc ? `<td>${linha.participacao.toFixed(1)}%</td><td>${linha.curvaAbc}</td>` : ""}
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="${relatorioObraSelect.value ? (usarCurvaAbc ? 6 : 4) : (usarCurvaAbc ? 7 : 5)}" class="empty">Nenhuma compra encontrada para os filtros selecionados.</td></tr>`;
}

function renderRelatorioMensal(comprasFiltradas) {
  const grupos = new Map();

  comprasFiltradas.forEach((compra) => {
    const monthKey = String(compra.data || "").slice(0, 7);
    if (!monthKey) {
      return;
    }

    if (!grupos.has(monthKey)) {
      grupos.set(monthKey, {
        mes: monthKey,
        quantidadeCompras: 0,
        total: 0,
        pago: 0
      });
    }

    const grupo = grupos.get(monthKey);
    const totalCompra = getCompraTotal(compra);
    grupo.quantidadeCompras += 1;
    grupo.total += totalCompra;
    grupo.pago += compra.pago ? totalCompra : 0;
  });

  const linhas = Array.from(grupos.values()).sort((a, b) => a.mes.localeCompare(b.mes));

  relatorioTableHead.innerHTML = `
    <tr>
      <th>Mes</th>
      <th>Quantidade de compras</th>
      <th>Total do mes</th>
      <th>Total pago</th>
      <th>Total em aberto</th>
    </tr>
  `;

  relatorioTableBody.innerHTML = linhas.length
    ? linhas
        .map(
          (linha) => `
        <tr>
          <td>${formatMonthLabel(linha.mes)}</td>
          <td>${linha.quantidadeCompras}</td>
          <td>${formatCurrency(linha.total)}</td>
          <td>${formatCurrency(linha.pago)}</td>
          <td>${formatCurrency(linha.total - linha.pago)}</td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="5" class="empty">Nenhuma compra encontrada para os filtros selecionados.</td></tr>`;
}

function renderRelatorios() {
  const comprasFiltradas = filtrarComprasParaRelatorio();
  const tipo = relatorioTipoSelect.value;
  const totalCompras = comprasFiltradas.reduce((sum, compra) => sum + getCompraTotal(compra), 0);
  const totalPago = comprasFiltradas.filter((compra) => compra.pago).reduce((sum, compra) => sum + getCompraTotal(compra), 0);
  const ticketMedio = comprasFiltradas.length ? totalCompras / comprasFiltradas.length : 0;
  const resumoItems = [
    { titulo: "Total", valor: totalCompras, mostrar: totalCompras > 0 || comprasFiltradas.length > 0 },
    { titulo: "Pago", valor: totalPago, mostrar: totalPago > 0 },
    { titulo: "Em aberto", valor: totalCompras - totalPago, mostrar: totalCompras - totalPago > 0 },
    { titulo: "Ticket medio", valor: ticketMedio, mostrar: ticketMedio > 0 && comprasFiltradas.length > 1 }
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

  montarCabecalhoRelatorio(comprasFiltradas);

  if (tipo === "mensal") {
    renderRelatorioMensal(comprasFiltradas);
    return;
  }

  renderRelatorioPorDescricao(comprasFiltradas);
}

function renderAll() {
  syncPermissionsUI();
  renderDashboard();
  populateObraSelects();
  refreshCompraAutocomplete();
  renderObras();
  renderCompras();
  renderUsuarios();
  renderRelatorios();
}

function atualizarPrecoTotalCompraForm() {
  const quantidade = Number(compraQuantidadeInput.value || 0);
  const precoUnitario = Number(compraPrecoUnitarioInput.value || 0);
  compraPrecoTotalInput.value = (quantidade * precoUnitario).toFixed(2);
}

function atualizarEstadoPeriodoRelatorio() {
  const disabled = relatorioTodasComprasInput.checked;
  document.getElementById("relatorioDataInicio").disabled = disabled;
  document.getElementById("relatorioDataFim").disabled = disabled;
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
      orcamento: Number(document.getElementById("obraOrcamento").value)
    };

    await apiFetch(obraId ? `/api/obras/${obraId}` : "/api/obras", {
      method: obraId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    await refreshData();
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
        aditivosValor: Number(document.getElementById("finalizacaoAditivosValor").value || 0)
      })
    });

    await refreshData();
    renderAll();
    openObraEditor(getObraById(obraId));
    activatePage("obras");
  } catch (error) {
    alert(error.message);
  }
});

compraForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const obraId = compraObraSelect.value;
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
    const precoUnitario = Number(compraPrecoUnitarioInput.value);
    const precoTotal = quantidade * precoUnitario;

    await apiFetch(compraId ? `/api/compras/${compraId}` : "/api/compras", {
      method: compraId ? "PUT" : "POST",
      body: JSON.stringify({
        obraId,
        data: document.getElementById("compraData").value,
        descricao: compraDescricaoInput.value.trim(),
        categoria: compraCategoriaInput.value.trim(),
        fornecedor: compraFornecedorInput.value.trim(),
        unidade: compraUnidadeInput.value.trim(),
        quantidade,
        precoUnitario,
        precoTotal,
        pago: document.getElementById("compraPago").checked
      })
    });

    await refreshData();
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

aplicarRelatorioBtn.addEventListener("click", () => {
  renderRelatorios();
});

imprimirRelatorioBtn.addEventListener("click", () => {
  renderRelatorios();
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

document.getElementById("relatorioDataInicio").addEventListener("change", () => {
  renderRelatorios();
});

document.getElementById("relatorioDataFim").addEventListener("change", () => {
  renderRelatorios();
});

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
  } catch (error) {
    clearSession();
    showLogin();
    alert(`Falha ao carregar dados do servidor: ${error.message}`);
    return;
  }

  const sessionUser = getSessionUser();
  welcomeText.textContent = `Bem-vindo, ${sessionUser?.name || "Usuario"}`;
  showApp();

  document.getElementById("finalizacaoDataEntrega").value = new Date().toISOString().slice(0, 10);
  document.getElementById("finalizacaoAditivosValor").value = "0";
  resetCompraForm();
  resetObraForm();
  closeObraEditor();
  closeUsuarioFormPanel();
  closeSenhaPanel();
  atualizarEstadoPeriodoRelatorio();
  atualizarEstadoCurvaAbc();
  renderAll();
  activatePage("dashboard");
}

clearLegacyBrowserData();
initializeApp();
