const state = {
  route: window.location.hash || "#/input",
  supplements: [createEmptySupplement(1)],
  samples: [],
  loadedSampleMeta: null,
  analysisResult: null,
};

const appRoot = document.getElementById("app");
const toast = document.getElementById("toast");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");

function createEmptyIngredient() {
  return {
    name: "",
    amount: "",
    unit: "",
  };
}

function createEmptySupplement(index) {
  return {
    id: `supplement-${Date.now()}-${index}`,
    product_name: "",
    manufacturer: "",
    ingredients: [createEmptyIngredient()],
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

function setLoading(isLoading, message = "처리 중입니다.") {
  loadingText.textContent = message;
  loadingOverlay.hidden = !isLoading;
}

function navigate(route) {
  if (window.location.hash === route) {
    state.route = route;
    render();
    return;
  }

  window.location.hash = route;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json();

  if (!payload.success) {
    throw new Error(payload.error?.message || "요청 처리에 실패했습니다.");
  }

  return payload.data;
}

async function loadSamples() {
  const data = await fetchJson("/api/samples");
  state.samples = data.samples || [];
}

function validateSupplements() {
  if (!Array.isArray(state.supplements) || state.supplements.length === 0) {
    return "최소 1개의 영양제가 필요합니다.";
  }

  for (const supplement of state.supplements) {
    if (!supplement.product_name.trim()) {
      return "영양제명을 입력해 주세요.";
    }

    if (!supplement.ingredients.length) {
      return "각 영양제에는 최소 1개의 성분이 필요합니다.";
    }

    for (const ingredient of supplement.ingredients) {
      if (!String(ingredient.name).trim()) {
        return "성분명을 입력해 주세요.";
      }

      if (ingredient.amount === "" || Number.isNaN(Number(ingredient.amount))) {
        return "성분 함량은 숫자로 입력해 주세요.";
      }

      if (!String(ingredient.unit).trim()) {
        return "성분 단위를 입력해 주세요.";
      }
    }
  }

  return null;
}

function renderRouteNav() {
  document.querySelectorAll("[data-route-button]").forEach((button) => {
    button.classList.toggle("accent-button", button.dataset.routeButton === state.route);
    button.onclick = () => navigate(button.dataset.routeButton);
  });
}

function renderInputView() {
  const template = document.getElementById("input-view-template");
  const fragment = template.content.cloneNode(true);
  const listRoot = fragment.querySelector("#manual-supplement-list");
  const supplementTemplate = document.getElementById("supplement-card-template");
  const ingredientTemplate = document.getElementById("ingredient-row-template");

  state.supplements.forEach((supplement, supplementIndex) => {
    const supplementNode = supplementTemplate.content.cloneNode(true);
    const card = supplementNode.querySelector(".supplement-card");
    const heading = supplementNode.querySelector("h3");
    const deleteSupplementButton = supplementNode.querySelector(".delete-supplement-button");
    const ingredientList = supplementNode.querySelector(".ingredient-list");

    heading.textContent = `영양제 ${supplementIndex + 1}`;

    supplementNode.querySelectorAll("[data-field='product_name']").forEach((input) => {
      input.value = supplement.product_name;
      input.addEventListener("input", (event) => {
        state.supplements[supplementIndex].product_name = event.target.value;
      });
    });

    supplementNode.querySelectorAll("[data-field='manufacturer']").forEach((input) => {
      input.value = supplement.manufacturer;
      input.addEventListener("input", (event) => {
        state.supplements[supplementIndex].manufacturer = event.target.value;
      });
    });

    supplement.ingredients.forEach((ingredient, ingredientIndex) => {
      const ingredientNode = ingredientTemplate.content.cloneNode(true);
      const row = ingredientNode.querySelector(".ingredient-row");

      row.querySelector("[data-field='name']").value = ingredient.name;
      row.querySelector("[data-field='amount']").value = ingredient.amount;
      row.querySelector("[data-field='unit']").value = ingredient.unit;

      row.querySelector("[data-field='name']").addEventListener("input", (event) => {
        state.supplements[supplementIndex].ingredients[ingredientIndex].name = event.target.value;
      });

      row.querySelector("[data-field='amount']").addEventListener("input", (event) => {
        state.supplements[supplementIndex].ingredients[ingredientIndex].amount = event.target.value;
      });

      row.querySelector("[data-field='unit']").addEventListener("input", (event) => {
        state.supplements[supplementIndex].ingredients[ingredientIndex].unit = event.target.value;
      });

      row.querySelector(".delete-ingredient-button").addEventListener("click", () => {
        state.supplements[supplementIndex].ingredients.splice(ingredientIndex, 1);

        if (state.supplements[supplementIndex].ingredients.length === 0) {
          state.supplements[supplementIndex].ingredients.push(createEmptyIngredient());
        }

        render();
      });

      ingredientList.appendChild(ingredientNode);
    });

    supplementNode.querySelector(".add-ingredient-button").addEventListener("click", () => {
      state.supplements[supplementIndex].ingredients.push(createEmptyIngredient());
      render();
    });

    deleteSupplementButton.addEventListener("click", () => {
      state.supplements.splice(supplementIndex, 1);

      if (state.supplements.length === 0) {
        state.supplements.push(createEmptySupplement(1));
      }

      render();
    });

    listRoot.appendChild(card);
  });

  fragment.querySelector("#add-supplement-button").addEventListener("click", () => {
    state.supplements.push(createEmptySupplement(state.supplements.length + 1));
    render();
  });

  fragment.querySelector("#go-upload-button").addEventListener("click", () => navigate("#/upload"));

  fragment.querySelector("#reset-manual-button").addEventListener("click", () => {
    state.supplements = [createEmptySupplement(1)];
    state.analysisResult = null;
    state.loadedSampleMeta = null;
    render();
  });

  fragment.querySelector("#analyze-manual-button").addEventListener("click", async () => {
    const validationMessage = validateSupplements();

    if (validationMessage) {
      showToast(validationMessage);
      return;
    }

    await requestAnalysis("manual");
  });

  appRoot.replaceChildren(fragment);
}

function renderUploadView() {
  const template = document.getElementById("upload-view-template");
  const fragment = template.content.cloneNode(true);
  const sampleList = fragment.querySelector("#sample-list");
  const preview = fragment.querySelector("#upload-preview");
  const fileInput = fragment.querySelector("#upload-file-input");

  state.samples.forEach((sample) => {
    const wrapper = document.createElement("div");
    wrapper.className = "sample-card";
    wrapper.innerHTML = `
      <strong>${escapeHtml(sample.label)}</strong>
      <p class="muted">${escapeHtml(sample.description)}</p>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button";
    button.textContent = "샘플 불러오기";
    button.addEventListener("click", async () => {
      setLoading(true, "샘플 데이터를 불러오는 중입니다.");

      try {
        const data = await fetchJson("/api/uploads/mock", {
          method: "POST",
          body: JSON.stringify({ sample_id: sample.sample_id }),
        });

        state.supplements = data.supplements;
        state.loadedSampleMeta = {
          sample_id: data.sample_id,
          file_name: data.file_name,
          source_type: data.source_type,
        };
        render();
        showToast("샘플 데이터를 불러왔습니다.");
      } catch (error) {
        showToast(error.message);
      } finally {
        setLoading(false);
      }
    });

    wrapper.appendChild(button);
    sampleList.appendChild(wrapper);
  });

  fragment.querySelector("#back-input-button").addEventListener("click", () => navigate("#/input"));

  fragment.querySelector("#upload-stub-button").addEventListener("click", async () => {
    const selectedFile = fileInput.files[0];

    if (!selectedFile) {
      showToast("파일을 먼저 선택해 주세요.");
      return;
    }

    setLoading(true, "업로드 stub 처리를 진행하는 중입니다.");

    try {
      const data = await fetchJson("/api/uploads/mock", {
        method: "POST",
        body: JSON.stringify({
          sample_id: "sample-evening-recovery",
          file_name: selectedFile.name,
        }),
      });

      state.supplements = data.supplements;
      state.loadedSampleMeta = {
        sample_id: data.sample_id,
        file_name: data.file_name,
        source_type: data.source_type,
      };
      render();
      showToast("업로드 흐름을 시연할 수 있는 샘플 결과를 불러왔습니다.");
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  });

  fragment.querySelector("#analyze-upload-button").addEventListener("click", async () => {
    const validationMessage = validateSupplements();

    if (validationMessage) {
      showToast("샘플 또는 업로드 데이터를 먼저 준비해 주세요.");
      return;
    }

    await requestAnalysis(state.loadedSampleMeta?.source_type || "sample");
  });

  preview.innerHTML = state.loadedSampleMeta
    ? `
      <strong>현재 준비된 입력</strong>
      <p class="muted">
        source_type: ${escapeHtml(state.loadedSampleMeta.source_type)}
        ${state.loadedSampleMeta.sample_id ? ` / sample_id: ${escapeHtml(state.loadedSampleMeta.sample_id)}` : ""}
        ${state.loadedSampleMeta.file_name ? ` / file_name: ${escapeHtml(state.loadedSampleMeta.file_name)}` : ""}
      </p>
      <p class="muted">총 ${state.supplements.length}개의 영양제가 분석 대기 중입니다.</p>
    `
    : `
      <strong>아직 준비된 업로드 데이터가 없습니다.</strong>
      <p class="muted">샘플을 선택하거나 파일을 고른 뒤 업로드 stub 버튼을 눌러 주세요.</p>
    `;

  appRoot.replaceChildren(fragment);
}

function renderSupplementSummary(supplements) {
  if (!supplements.length) {
    return `<p class="muted">입력한 영양제가 없습니다.</p>`;
  }

  return `
    <div class="supplement-summary-list">
      ${supplements
        .map(
          (supplement) => `
            <div class="list-item">
              <strong>${escapeHtml(supplement.product_name)}</strong>
              <p class="muted">${escapeHtml(supplement.manufacturer || "제조사 미입력")}</p>
              <p>${supplement.ingredients
                .map((ingredient) => `${escapeHtml(ingredient.name)} ${escapeHtml(ingredient.amount)}${escapeHtml(ingredient.unit)}`)
                .join(", ")}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderDuplicateList(items) {
  if (!items.length) {
    return `<p class="muted">겹치는 성분은 보이지 않았습니다.</p>`;
  }

  return `
    <div class="result-list">
      ${items
        .map(
          (item) => `
            <div class="list-item">
              <strong>${escapeHtml(item.ingredient_name)}</strong>
              <p>${item.supplement_names.map(escapeHtml).join(", ")}</p>
              <p class="muted">총 ${escapeHtml(item.total_amount)} ${escapeHtml(item.unit)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderRiskList(items) {
  if (!items.length) {
    return `<p class="muted">일반 가이드 기준에서 눈에 띄는 과다 가능성은 보이지 않았습니다.</p>`;
  }

  return `
    <div class="result-list">
      ${items
        .map(
          (item) => `
            <div class="list-item">
              <div class="section-heading">
                <strong>${escapeHtml(item.ingredient_name)}</strong>
                <span class="risk-pill">${escapeHtml(item.risk_level)}</span>
              </div>
              <p>총 ${escapeHtml(item.total_amount)} ${escapeHtml(item.unit)} / 일반 가이드 ${escapeHtml(item.guide_amount)} ${escapeHtml(item.unit)}</p>
              <p class="muted">${escapeHtml(item.note)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderTimingList(items) {
  if (!items.length) {
    return `<p class="muted">복용 시간 가이드를 만들 정보가 부족합니다.</p>`;
  }

  return `
    <div class="result-list">
      ${items
        .map(
          (item) => `
            <div class="list-item">
              <strong>${escapeHtml(item.supplement_name)}</strong>
              <p>${escapeHtml(item.timing)}</p>
              <p class="muted">${escapeHtml(item.reason)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderResultView() {
  const template = document.getElementById("result-view-template");
  const fragment = template.content.cloneNode(true);
  const result = state.analysisResult;

  if (!result) {
    navigate("#/input");
    showToast("먼저 입력 또는 샘플 데이터를 준비하고 분석을 실행해 주세요.");
    return;
  }

  fragment.querySelector("#summary-text").textContent = result.summary_text;
  fragment.querySelector("#supplement-summary").innerHTML = renderSupplementSummary(result.supplements);
  fragment.querySelector("#duplicate-list").innerHTML = renderDuplicateList(result.duplicated_ingredients);
  fragment.querySelector("#risk-list").innerHTML = renderRiskList(result.risk_items);
  fragment.querySelector("#timing-list").innerHTML = renderTimingList(result.timing_guides);

  fragment.querySelector("#restart-button").addEventListener("click", () => {
    state.analysisResult = null;
    navigate("#/input");
  });

  appRoot.replaceChildren(fragment);
}

async function requestAnalysis(sourceType) {
  setLoading(true, "입력한 조합을 분석하는 중입니다.");

  try {
    const data = await fetchJson("/api/analysis", {
      method: "POST",
      body: JSON.stringify({
        source_type: sourceType,
        supplements: state.supplements,
      }),
    });

    state.analysisResult = data;
    navigate("#/result");
  } catch (error) {
    showToast(error.message);
  } finally {
    setLoading(false);
  }
}

function render() {
  state.route = window.location.hash || "#/input";
  renderRouteNav();

  switch (state.route) {
    case "#/upload":
      renderUploadView();
      break;
    case "#/result":
      renderResultView();
      break;
    case "#/input":
    default:
      renderInputView();
      break;
  }
}

window.addEventListener("hashchange", render);

window.addEventListener("DOMContentLoaded", async () => {
  setLoading(true, "시연용 데이터를 불러오는 중입니다.");

  try {
    await loadSamples();
    render();
  } catch (error) {
    appRoot.innerHTML = `
      <section class="view-card">
        <h2>초기 데이터를 불러오지 못했습니다.</h2>
        <p class="muted">${escapeHtml(error.message)}</p>
      </section>
    `;
  } finally {
    setLoading(false);
  }
});
