// ============================================================
// Storage Utilities — localStorage state management
// Ready to swap for Supabase/DB in v2
// ============================================================

const STORAGE_KEY = 'vios_state_v1';

const DEFAULT_STATE = {
  apiKey: '',
  businessContext: {},
  moduleData: {},
  currentModule: 0,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Module data helpers
export function getModuleData(state, moduleId) {
  return state.moduleData?.[moduleId] || {
    inputs: {},
    output: '',
    editedOutput: '',
    completed: false,
    generatedAt: null,
  };
}

export function setModuleOutput(state, moduleId, output) {
  return {
    ...state,
    moduleData: {
      ...state.moduleData,
      [moduleId]: {
        ...getModuleData(state, moduleId),
        output,
        editedOutput: output,
        completed: true,
        generatedAt: new Date().toISOString(),
      },
    },
  };
}

export function setModuleInputs(state, moduleId, inputs) {
  return {
    ...state,
    moduleData: {
      ...state.moduleData,
      [moduleId]: {
        ...getModuleData(state, moduleId),
        inputs: { ...getModuleData(state, moduleId).inputs, ...inputs },
      },
    },
  };
}

export function setModuleEditedOutput(state, moduleId, editedOutput) {
  return {
    ...state,
    moduleData: {
      ...state.moduleData,
      [moduleId]: {
        ...getModuleData(state, moduleId),
        editedOutput,
      },
    },
  };
}

export function countCompletedModules(state, modules) {
  return modules.filter(m => state.moduleData?.[m.id]?.completed).length;
}

export function getEffectiveOutput(state, moduleId) {
  const data = getModuleData(state, moduleId);
  return data.editedOutput || data.output || '';
}
