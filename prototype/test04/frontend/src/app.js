import { normalizeManualSupplements, loadSampleSupplements, runAnalysis } from "./api.js";
import { renderLayout, renderStatus } from "./components/layout.js";
import { navigate, getCurrentRoute } from "./router.js";
import {
  createEmptyIngredient,
  createEmptySupplement,
  initialState,
} from "./state.js";
import { renderInputView } from "./views/inputView.js";
import { renderResultView } from "./views/resultView.js";
import { renderSampleView } from "./views/sampleView.js";

const state = structuredClone(initialState);
const root = document.getElementById("app");

function render() {
  const route = getCurrentRoute();
  const status = state.error
    ? { type: "error", message: state.error }
    : state.uploadMessage
      ? { type: "info", message: state.uploadMessage }
      : state.loading
        ? { type: "info", message: "분석 또는 샘플 불러오기를 처리하는 중입니다." }
        : null;

  let content = "";

  if (route === "/sample") {
    content = renderSampleView();
  } else if (route === "/result") {
    content = renderResultView(state);
  } else {
    content = renderInputView(state);
  }

  root.innerHTML = renderLayout({
    route,
    status: renderStatus(status),
    content,
  });

  bindEvents();
}

function bindEvents() {
  root.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", handleAction);
  });

  root.querySelectorAll("input[data-field]").forEach((element) => {
    element.addEventListener("input", handleInputChange);
  });
}

function handleAction(event) {
  const { action, supplementIndex, ingredientIndex, sampleKey } = event.currentTarget.dataset;

  if (action === "go-sample") {
    clearStatus();
    navigate("/sample");
    return;
  }

  if (action === "go-input") {
    clearStatus();
    navigate("/");
    return;
  }

  if (action === "add-supplement") {
    state.supplements.push(createEmptySupplement());
    render();
    return;
  }

  if (action === "remove-supplement") {
    state.supplements.splice(Number(supplementIndex), 1);
    render();
    return;
  }

  if (action === "add-ingredient") {
    state.supplements[Number(supplementIndex)].ingredients.push(createEmptyIngredient());
    render();
    return;
  }

  if (action === "remove-ingredient") {
    state.supplements[Number(supplementIndex)].ingredients.splice(Number(ingredientIndex), 1);
    render();
    return;
  }

  if (action === "reset") {
    resetState();
    navigate("/");
    return;
  }

  if (action === "load-sample") {
    loadSample({ sample_key: sampleKey });
    return;
  }

  if (action === "mock-upload") {
    const input = document.getElementById("mock-file-input");
    const fileName = input?.files?.[0]?.name;

    if (!fileName) {
      state.error = "업로드할 파일을 먼저 선택해 주세요.";
      render();
      return;
    }

    loadSample({
      sample_key: "daily_stack",
      file_name: fileName,
    });
    return;
  }

  if (action === "analyze") {
    submitAnalysis();
  }
}

function handleInputChange(event) {
  const { field, supplementIndex, ingredientIndex } = event.target.dataset;
  const supplement = state.supplements[Number(supplementIndex)];

  clearStatus();

  if (field === "product_name" || field === "manufacturer") {
    supplement[field] = event.target.value;
    return;
  }

  const ingredient = supplement.ingredients[Number(ingredientIndex)];

  if (field === "ingredient-name") {
    ingredient.name = event.target.value;
  }

  if (field === "ingredient-amount") {
    ingredient.amount = event.target.value;
  }

  if (field === "ingredient-unit") {
    ingredient.unit = event.target.value;
  }
}

async function loadSample(payload) {
  clearStatus();
  state.loading = true;
  render();

  try {
    const result = await loadSampleSupplements(payload);
    state.supplements = result.supplements.map((supplement) => ({
      ...supplement,
      ingredients: supplement.ingredients.map((ingredient) => ({ ...ingredient })),
    }));
    state.uploadMessage = result.upload_message;
    navigate("/");
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function submitAnalysis() {
  clearStatus();
  state.loading = true;
  render();

  try {
    const normalized = await normalizeManualSupplements(state.supplements);
    const analysis = await runAnalysis(normalized.supplements);
    state.lastAnalysis = analysis;
    navigate("/result");
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

function resetState() {
  state.supplements = [createEmptySupplement()];
  state.lastAnalysis = null;
  state.uploadMessage = "";
  state.loading = false;
  state.error = "";
}

function clearStatus() {
  state.error = "";
  state.uploadMessage = "";
}

window.addEventListener("popstate", render);
window.addEventListener("routechange", render);

render();
