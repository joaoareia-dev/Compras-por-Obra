const state = {
  user: null,
  obras: [],
  rdos: [],
  rdoCatalogos: {
    materiais: [],
    maoDeObra: []
  },
  draftPhotos: [],
  deferredInstallPrompt: null
};

const MOBILE_STRUCTURED_CONFIGS = {
  equipe: {
    rowClass: "crew",
    primaryKey: "cargo",
    datalistId: "mobileMaoDeObraCargoOptions",
    autocompleteKind: "maoDeObra",
    fields: [
      { key: "cargo", type: "text", placeholder: "Cargo" },
      { key: "quantidade", type: "number", placeholder: "Qtd.", min: "0", step: "1", inputMode: "numeric" }
    ]
  },
  servicos: {
    rowClass: "structured",
    primaryKey: "descricao",
    fields: [
      { key: "descricao", type: "text", placeholder: "Descrição do serviço" },
      { key: "unidade", type: "text", placeholder: "Unidade" },
      { key: "quantidade", type: "number", placeholder: "Qtd.", min: "0", step: "0.001", inputMode: "decimal" }
    ]
  },
  materiais: {
    rowClass: "structured",
    primaryKey: "descricao",
    datalistId: "mobileMaterialDescricaoOptions",
    autocompleteKind: "materiais",
    autoFillFieldKey: "unidade",
    fields: [
      { key: "descricao", type: "text", placeholder: "Descrição do material" },
      { key: "unidade", type: "text", placeholder: "Unidade" },
      { key: "quantidade", type: "number", placeholder: "Qtd.", min: "0", step: "0.001", inputMode: "decimal" }
    ]
  }
};

const loginView = document.getElementById("mobileLoginView");
const appView = document.getElementById("mobileAppView");
const loginForm = document.getElementById("mobileLoginForm");
const loginError = document.getElementById("mobileLoginError");
const loginEmailInput = document.getElementById("mobileLoginEmail");
const loginPasswordInput = document.getElementById("mobileLoginPassword");
const welcomeText = document.getElementById("mobileWelcome");
const logoutBtn = document.getElementById("mobileLogoutBtn");
const installBtn = document.getElementById("mobileInstallBtn");
const refreshBtn = document.getElementById("mobileRefreshBtn");
const newRdoBtn = document.getElementById("mobileNewRdoBtn");

const editorPanel = document.getElementById("mobileEditorPanel");
const editorTitle = document.getElementById("mobileEditorTitle");
const editorSubtitle = document.getElementById("mobileEditorSubtitle");
const closeEditorBtn = document.getElementById("mobileCloseEditorBtn");
const cancelEditBtn = document.getElementById("mobileCancelEditBtn");
const rdoForm = document.getElementById("mobileRdoForm");
const saveRdoBtn = document.getElementById("mobileSaveRdoBtn");
const rdoEditIdInput = document.getElementById("mobileRdoEditId");
const rdoObraSelect = document.getElementById("mobileRdoObra");
const rdoDataInput = document.getElementById("mobileRdoData");
const rdoClimaSelect = document.getElementById("mobileRdoClima");
const rdoObservacoesInput = document.getElementById("mobileRdoObservacoes");
const photoCameraInput = document.getElementById("mobilePhotoCamera");
const photoGalleryInput = document.getElementById("mobilePhotoGallery");
const photoList = document.getElementById("mobilePhotoList");
const equipeContainer = document.getElementById("mobileEquipeContainer");
const servicosContainer = document.getElementById("mobileServicosContainer");
const materiaisRecebidosContainer = document.getElementById("mobileMateriaisRecebidosContainer");
const materiaisConsumidosContainer = document.getElementById("mobileMateriaisConsumidosContainer");

const filtroObraSelect = document.getElementById("mobileFiltroObra");
const filtroDataInicioInput = document.getElementById("mobileFiltroDataInicio");
const filtroDataFimInput = document.getElementById("mobileFiltroDataFim");
const filterBtn = document.getElementById("mobileFilterBtn");
const clearFilterBtn = document.getElementById("mobileClearFilterBtn");
const rdoList = document.getElementById("mobileRdoList");

const materialOptions = document.getElementById("mobileMaterialDescricaoOptions");
const maoDeObraCargoOptions = document.getElementById("mobileMaoDeObraCargoOptions");

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
    const error = new Error(data.error || "Falha na comunicação com o servidor.");
    error.code = data.code;
    error.status = response.status;
    throw error;
  }

  return data;
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

  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function formatDate(value) {
  const normalized = normalizeDateInputValue(value);
  if (!normalized) {
    return "-";
  }

  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

function compareIsoDatesDesc(left, right) {
  return String(right || "").localeCompare(String(left || ""));
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

function createClientId(prefix = "item") {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getObraById(obraId) {
  return state.obras.find((obra) => obra.id === obraId) || null;
}

function getRdoById(rdoId) {
  return state.rdos.find((rdo) => rdo.id === rdoId) || null;
}

function isObraFinalizada(obraId) {
  return Boolean(getObraById(obraId)?.finalizacao?.dataEntrega);
}

function updateDatalist(element, values) {
  element.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
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

  return Array.from(unique.values()).sort((left, right) => left.localeCompare(right, "pt-BR"));
}

function getRdoCatalogos() {
  return state.rdoCatalogos || { materiais: [], maoDeObra: [] };
}

function findRdoMaterialSuggestion(descricao) {
  const target = normalizeValue(descricao);
  return getRdoCatalogos().materiais.find((item) => normalizeValue(item.descricao) === target) || null;
}

function findRdoMaoDeObraSuggestion(cargo) {
  const target = normalizeValue(cargo);
  return getRdoCatalogos().maoDeObra.find((item) => normalizeValue(item.cargo) === target) || null;
}

function setSession(user) {
  state.user = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    : null;
}

function showLogin() {
  loginView.classList.remove("hidden");
  appView.classList.add("hidden");
}

function showApp() {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
}

function openEditor() {
  editorPanel.classList.remove("hidden");
  editorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeEditor() {
  editorPanel.classList.add("hidden");
  resetRdoForm();
}

function normalizeRdoPhoto(photo, index = 0) {
  const dataUrl = String(photo?.dataUrl || "").trim();
  if (!dataUrl.startsWith("data:image/")) {
    return null;
  }

  return {
    id: String(photo?.id || createClientId("rdo-foto")),
    name: String(photo?.name || `Foto ${index + 1}`).trim() || `Foto ${index + 1}`,
    dataUrl,
    comentario: String(photo?.comentario || "").trim()
  };
}

function getDraftPhotos() {
  return state.draftPhotos;
}

function setDraftPhotos(photos) {
  state.draftPhotos = Array.isArray(photos)
    ? photos.map((photo, index) => normalizeRdoPhoto(photo, index)).filter(Boolean)
    : [];
  renderPhotos();
}

function renderPhotos() {
  const photos = getDraftPhotos();

  if (!photos.length) {
    photoList.innerHTML = '<p class="empty-state">Nenhuma foto adicionada ainda.</p>';
    return;
  }

  photoList.innerHTML = photos
    .map(
      (photo) => `
        <article class="mobile-photo-card">
          <img src="${photo.dataUrl}" alt="${escapeHtml(photo.name)}" />
          <div class="mobile-photo-info">
            <strong>${escapeHtml(photo.name)}</strong>
            <label>
              Comentário obrigatório
              <textarea data-photo-comment="${photo.id}" rows="4" placeholder="Descreva o que está sendo mostrado na foto.">${escapeHtml(photo.comentario || "")}</textarea>
            </label>
            <button type="button" class="btn delete" data-photo-remove="${photo.id}">Remover foto</button>
          </div>
        </article>
      `
    )
    .join("");
}

function validateRdoPhotos() {
  const photos = getDraftPhotos();
  for (let index = 0; index < photos.length; index += 1) {
    if (!String(photos[index].comentario || "").trim()) {
      throw new Error(`Informe o comentário obrigatório da foto ${index + 1}.`);
    }
  }
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler a foto selecionada."));
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
          dataUrl: originalDataUrl,
          comentario: ""
        });
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve({
        id: createClientId("rdo-foto"),
        name: file.name,
        dataUrl: canvas.toDataURL("image/jpeg", 0.82),
        comentario: ""
      });
    };

    image.onerror = () =>
      resolve({
        id: createClientId("rdo-foto"),
        name: file.name,
        dataUrl: originalDataUrl,
        comentario: ""
      });

    image.src = originalDataUrl;
  });
}

function getStructuredRowValues(row, config) {
  const values = {};

  config.fields.forEach((field) => {
    const input = row.querySelector(`[data-field-key="${field.key}"]`);
    values[field.key] = input?.value || "";
  });

  return values;
}

function isStructuredRowEmpty(values) {
  return Object.values(values).every((value) => String(value || "").trim() === "");
}

function createStructuredRow(config, value = {}) {
  const row = document.createElement("div");
  row.className = `mobile-dynamic-row ${config.rowClass || ""}`.trim();

  config.fields.forEach((field) => {
    const input = document.createElement("input");
    input.type = field.type || "text";
    input.className = "mobile-structured-input";
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

    const currentValue = value?.[field.key];
    input.value = currentValue === null || currentValue === undefined ? "" : String(currentValue);
    row.appendChild(input);
  });

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn ghost mobile-remove-btn";
  removeButton.dataset.dynamicRemove = "true";
  removeButton.textContent = "Remover";
  row.appendChild(removeButton);
  return row;
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
    if (!suggestion || !config.autoFillFieldKey) {
      return;
    }

    const unitInput = row.querySelector(`[data-field-key="${config.autoFillFieldKey}"]`);
    if (unitInput && !unitInput.value.trim()) {
      unitInput.value = suggestion.unidade || "";
    }
    return;
  }

  if (config.autocompleteKind === "maoDeObra") {
    findRdoMaoDeObraSuggestion(primaryValue);
  }
}

function syncStructuredContainer(container, config) {
  const rows = Array.from(container.querySelectorAll(".mobile-dynamic-row"));

  rows.forEach((row, index) => {
    const values = getStructuredRowValues(row, config);
    if (isStructuredRowEmpty(values) && index < rows.length - 1) {
      row.remove();
    }
  });

  const currentRows = Array.from(container.querySelectorAll(".mobile-dynamic-row"));
  const lastRow = currentRows[currentRows.length - 1];
  const lastValues = lastRow ? getStructuredRowValues(lastRow, config) : null;
  if (!lastRow || !isStructuredRowEmpty(lastValues)) {
    container.appendChild(createStructuredRow(config));
  }

  Array.from(container.querySelectorAll(".mobile-dynamic-row")).forEach((row, index, allRows) => {
    const values = getStructuredRowValues(row, config);
    const removeButton = row.querySelector("[data-dynamic-remove]");
    const isOnlyEmptyRow = allRows.length === 1 && isStructuredRowEmpty(values);
    removeButton?.classList.toggle("hidden", isOnlyEmptyRow);
  });
}

function hydrateStructuredContainer(container, config, values = []) {
  container.innerHTML = "";
  values.forEach((value) => {
    container.appendChild(createStructuredRow(config, value));
  });
  container.appendChild(createStructuredRow(config));
  syncStructuredContainer(container, config);
}

function getStructuredContainerValues(container, config) {
  return Array.from(container.querySelectorAll(".mobile-dynamic-row"))
    .map((row) => getStructuredRowValues(row, config))
    .filter((values) => !isStructuredRowEmpty(values))
    .map((values) => {
      const normalized = {};

      config.fields.forEach((field) => {
        const rawValue = String(values[field.key] || "").trim();
        normalized[field.key] = field.type === "number"
          ? (rawValue ? Number(rawValue) : null)
          : rawValue;
      });

      return normalized;
    });
}

function bindStructuredContainer(container, config) {
  hydrateStructuredContainer(container, config, []);

  container.addEventListener("input", (event) => {
    const input = event.target.closest(".mobile-structured-input");
    if (!input) {
      return;
    }

    const row = input.closest(".mobile-dynamic-row");
    if (input.dataset.fieldKey === config.primaryKey) {
      applyStructuredAutocomplete(row, config);
    }

    syncStructuredContainer(container, config);
  });

  container.addEventListener("change", (event) => {
    const input = event.target.closest(".mobile-structured-input");
    if (!input || input.dataset.fieldKey !== config.primaryKey) {
      return;
    }

    applyStructuredAutocomplete(input.closest(".mobile-dynamic-row"), config);
  });

  container.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-dynamic-remove]");
    if (!removeButton) {
      return;
    }

    removeButton.closest(".mobile-dynamic-row")?.remove();
    syncStructuredContainer(container, config);
  });
}

function populateAutocomplete() {
  updateDatalist(
    materialOptions,
    buildUniqueValues(getRdoCatalogos().materiais.map((item) => item.descricao))
  );
  updateDatalist(
    maoDeObraCargoOptions,
    buildUniqueValues(getRdoCatalogos().maoDeObra.map((item) => item.cargo))
  );
}

function populateObraSelects() {
  const obraOptions = state.obras.map((obra) => `<option value="${obra.id}">${escapeHtml(obra.nome)}</option>`).join("");

  rdoObraSelect.innerHTML = obraOptions || `<option value="">Cadastre uma obra antes</option>`;
  filtroObraSelect.innerHTML = `<option value="">Todas as obras</option>${obraOptions}`;

  if (state.obras.length && !rdoObraSelect.value) {
    rdoObraSelect.value = state.obras[0].id;
  }
}

function getFilteredRdos() {
  const obraId = filtroObraSelect.value;
  const dataInicio = filtroDataInicioInput.value;
  const dataFim = filtroDataFimInput.value;

  return [...state.rdos]
    .filter((rdo) => {
      const matchObra = !obraId || rdo.obraId === obraId;
      const matchInicio = !dataInicio || rdo.data >= dataInicio;
      const matchFim = !dataFim || rdo.data <= dataFim;
      return matchObra && matchInicio && matchFim;
    })
    .sort((left, right) => compareIsoDatesDesc(left.data, right.data));
}

function renderRdoList() {
  const filtered = getFilteredRdos();

  if (!filtered.length) {
    rdoList.innerHTML = '<p class="empty-state">Nenhum RDO encontrado para os filtros atuais.</p>';
    return;
  }

  rdoList.innerHTML = filtered
    .map((rdo) => {
      const obra = getObraById(rdo.obraId);
      return `
        <article class="mobile-rdo-card">
          <div class="mobile-rdo-head">
            <div>
              <h4>${escapeHtml(obra?.nome || "Obra removida")}</h4>
              <p class="subtitle">${formatDate(rdo.data)}</p>
            </div>
            <button type="button" class="btn ghost" data-rdo-edit="${rdo.id}">Editar</button>
          </div>
          <div class="mobile-rdo-meta">
            <p><strong>Fotos:</strong> ${rdo.fotosCount}</p>
            <p><strong>Serviços:</strong> ${rdo.servicosCount}</p>
            <p><strong>Recebidos:</strong> ${rdo.materiaisRecebidosCount}</p>
            <p><strong>Consumidos:</strong> ${rdo.materiaisConsumidosCount}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

async function confirmAdminAuthorization(actionLabel) {
  if (state.user?.role !== "administrador") {
    alert("Esta obra está finalizada. Apenas um administrador pode autorizar esta ação.");
    return false;
  }

  const password = window.prompt(`A obra está finalizada. Informe a senha de administrador para liberar ${actionLabel}:`);
  if (password === null) {
    return false;
  }

  const result = await apiFetch("/api/authorize-manager", {
    method: "POST",
    body: JSON.stringify({
      userId: state.user.id,
      password
    })
  });

  if (!result.authorized) {
    alert("Senha de administrador inválida.");
    return false;
  }

  return true;
}

async function refreshData() {
  const payload = await apiFetch("/api/bootstrap");
  state.obras = payload.obras || [];
  state.rdos = payload.rdos || [];
  state.rdoCatalogos = payload.rdoCatalogos || { materiais: [], maoDeObra: [] };
  populateObraSelects();
  populateAutocomplete();
  renderRdoList();
}

function resetRdoForm() {
  rdoForm.reset();
  rdoEditIdInput.value = "";
  rdoDataInput.value = getTodayIsoDate();
  rdoClimaSelect.value = "";
  rdoObservacoesInput.value = "";
  saveRdoBtn.textContent = "Salvar RDO";
  cancelEditBtn.classList.add("hidden");
  setDraftPhotos([]);

  hydrateStructuredContainer(equipeContainer, MOBILE_STRUCTURED_CONFIGS.equipe, []);
  hydrateStructuredContainer(servicosContainer, MOBILE_STRUCTURED_CONFIGS.servicos, []);
  hydrateStructuredContainer(materiaisRecebidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais, []);
  hydrateStructuredContainer(materiaisConsumidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais, []);

  if (state.obras.length) {
    rdoObraSelect.value = state.obras[0].id;
  }
}

function fillRdoForm(rdo) {
  rdoEditIdInput.value = rdo.id;
  rdoObraSelect.value = rdo.obraId;
  rdoDataInput.value = normalizeDateInputValue(rdo.data);
  rdoClimaSelect.value = rdo.clima || "";
  rdoObservacoesInput.value = rdo.observacoesAdicionais || "";
  setDraftPhotos(rdo.fotos || []);

  hydrateStructuredContainer(equipeContainer, MOBILE_STRUCTURED_CONFIGS.equipe, rdo.maoDeObraPresente || []);
  hydrateStructuredContainer(servicosContainer, MOBILE_STRUCTURED_CONFIGS.servicos, rdo.servicosExecutados || []);
  hydrateStructuredContainer(materiaisRecebidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais, rdo.materiaisRecebidos || []);
  hydrateStructuredContainer(materiaisConsumidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais, rdo.materiaisConsumidos || []);

  editorTitle.textContent = "Editar RDO";
  editorSubtitle.textContent = "Atualize o diário de obra já cadastrado.";
  saveRdoBtn.textContent = "Atualizar RDO";
  cancelEditBtn.classList.remove("hidden");
}

async function fetchRdoDetail(rdoId) {
  const result = await apiFetch(`/api/rdos/${rdoId}`);
  return result.rdo;
}

async function handlePhotoFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) {
    return;
  }

  const compressedPhotos = [];
  for (const file of files) {
    compressedPhotos.push(await compressImageFile(file));
  }

  setDraftPhotos([...getDraftPhotos(), ...compressedPhotos]);
}

async function initializeApp() {
  try {
    const me = await apiFetch("/api/me");
    setSession(me.user);
  } catch (error) {
    setSession(null);
    showLogin();
    return;
  }

  welcomeText.textContent = `Conectado como ${state.user?.name || "Usuário"}`;
  showApp();
  await refreshData();
  resetRdoForm();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const email = loginEmailInput.value.trim().toLowerCase();
  const password = loginPasswordInput.value;

  try {
    const result = await apiFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    setSession(result.user);
    await initializeApp();
  } catch (error) {
    if (error.code === "SESSION_ACTIVE") {
      if (!confirm("Este usuário já está logado em outro aparelho. Deseja encerrar a outra sessão e entrar neste celular?")) {
        return;
      }

      try {
        const result = await apiFetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ email, password, force: true })
        });

        setSession(result.user);
        await initializeApp();
        return;
      } catch (forceError) {
        loginError.textContent = forceError.message;
      }
    } else {
      loginError.textContent = error.message;
    }

    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  apiFetch("/api/logout", { method: "POST" })
    .catch(() => null)
    .finally(() => {
      setSession(null);
      showLogin();
    });
});

newRdoBtn.addEventListener("click", () => {
  editorTitle.textContent = "Cadastrar RDO";
  editorSubtitle.textContent = "Registre o andamento diário da obra direto do celular.";
  resetRdoForm();
  openEditor();
});

refreshBtn.addEventListener("click", async () => {
  refreshBtn.disabled = true;
  refreshBtn.textContent = "Sincronizando...";

  try {
    await refreshData();
  } catch (error) {
    alert(error.message);
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "Sincronizar";
  }
});

closeEditorBtn.addEventListener("click", closeEditor);
cancelEditBtn.addEventListener("click", closeEditor);

filterBtn.addEventListener("click", () => {
  if (filtroDataInicioInput.value && filtroDataFimInput.value && filtroDataFimInput.value < filtroDataInicioInput.value) {
    alert("A data final da busca não pode ser anterior à data inicial.");
    return;
  }

  renderRdoList();
});

clearFilterBtn.addEventListener("click", () => {
  filtroObraSelect.value = "";
  filtroDataInicioInput.value = "";
  filtroDataFimInput.value = "";
  renderRdoList();
});

photoCameraInput.addEventListener("change", async () => {
  try {
    await handlePhotoFiles(photoCameraInput.files);
  } catch (error) {
    alert(error.message);
  } finally {
    photoCameraInput.value = "";
  }
});

photoGalleryInput.addEventListener("change", async () => {
  try {
    await handlePhotoFiles(photoGalleryInput.files);
  } catch (error) {
    alert(error.message);
  } finally {
    photoGalleryInput.value = "";
  }
});

photoList.addEventListener("input", (event) => {
  const commentField = event.target.closest("[data-photo-comment]");
  if (!commentField) {
    return;
  }

  const photoId = commentField.getAttribute("data-photo-comment");
  state.draftPhotos = getDraftPhotos().map((photo) => (
    photo.id === photoId ? { ...photo, comentario: commentField.value.trimStart() } : photo
  ));
});

photoList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-photo-remove]");
  if (!removeButton) {
    return;
  }

  const photoId = removeButton.getAttribute("data-photo-remove");
  setDraftPhotos(getDraftPhotos().filter((photo) => photo.id !== photoId));
});

rdoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!rdoObraSelect.value) {
    alert("Selecione uma obra para registrar o RDO.");
    return;
  }

  try {
    const actionLabel = rdoEditIdInput.value ? "a edição do RDO" : "o lançamento do RDO";
    if (isObraFinalizada(rdoObraSelect.value) && !(await confirmAdminAuthorization(actionLabel))) {
      return;
    }

    validateRdoPhotos();

    const payload = {
      obraId: rdoObraSelect.value,
      data: rdoDataInput.value,
      clima: rdoClimaSelect.value,
      fotos: getDraftPhotos(),
      maoDeObraPresente: getStructuredContainerValues(equipeContainer, MOBILE_STRUCTURED_CONFIGS.equipe),
      servicosExecutados: getStructuredContainerValues(servicosContainer, MOBILE_STRUCTURED_CONFIGS.servicos),
      materiaisRecebidos: getStructuredContainerValues(materiaisRecebidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais),
      materiaisConsumidos: getStructuredContainerValues(materiaisConsumidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais),
      observacoesAdicionais: rdoObservacoesInput.value.trim()
    };

    const rdoId = rdoEditIdInput.value;
    await apiFetch(rdoId ? `/api/rdos/${rdoId}` : "/api/rdos", {
      method: rdoId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    await refreshData();
    closeEditor();
  } catch (error) {
    alert(error.message);
  }
});

rdoList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-rdo-edit]");
  if (!editButton) {
    return;
  }

  try {
    const rdoSummary = getRdoById(editButton.getAttribute("data-rdo-edit"));
    if (rdoSummary && isObraFinalizada(rdoSummary.obraId) && !(await confirmAdminAuthorization("a edição do RDO"))) {
      return;
    }

    const rdo = await fetchRdoDetail(editButton.getAttribute("data-rdo-edit"));
    fillRdoForm(rdo);
    openEditor();
  } catch (error) {
    alert(error.message);
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!state.deferredInstallPrompt) {
    return;
  }

  state.deferredInstallPrompt.prompt();
  await state.deferredInstallPrompt.userChoice.catch(() => null);
  state.deferredInstallPrompt = null;
  installBtn.classList.add("hidden");
});

bindStructuredContainer(equipeContainer, MOBILE_STRUCTURED_CONFIGS.equipe);
bindStructuredContainer(servicosContainer, MOBILE_STRUCTURED_CONFIGS.servicos);
bindStructuredContainer(materiaisRecebidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais);
bindStructuredContainer(materiaisConsumidosContainer, MOBILE_STRUCTURED_CONFIGS.materiais);
renderPhotos();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/rdo-mobile-sw.js").catch(() => null);
  });
}

initializeApp();
