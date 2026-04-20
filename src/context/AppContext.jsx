import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  loadState,
  saveState,
  setModuleOutput,
  setModuleInputs,
  setModuleEditedOutput,
} from '../utils/storage.js';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_CURRENT_MODULE':
      return { ...state, currentModule: action.payload };
    case 'SET_BUSINESS_CONTEXT':
      return { ...state, businessContext: { ...state.businessContext, ...action.payload } };
    case 'SET_MODULE_OUTPUT':
      return setModuleOutput(state, action.moduleId, action.output);
    case 'SET_MODULE_INPUTS':
      return setModuleInputs(state, action.moduleId, action.inputs);
    case 'SET_MODULE_EDITED_OUTPUT':
      return setModuleEditedOutput(state, action.moduleId, action.editedOutput);
    case 'RESET':
      return { ...loadState(), view: 'landing', currentModule: 0 };
    default:
      return state;
  }
}

function getInitialState() {
  const persisted = loadState();
  return {
    view: 'landing',
    currentModule: persisted.currentModule || 0,
    businessContext: persisted.businessContext || {},
    moduleData: persisted.moduleData || {},
  };
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    const { view, ...persistable } = state;
    saveState(persistable);
  }, [state]);

  const setView = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), []);
  const setCurrentModule = useCallback((idx) => dispatch({ type: 'SET_CURRENT_MODULE', payload: idx }), []);
  const setBusinessContext = useCallback((ctx) => dispatch({ type: 'SET_BUSINESS_CONTEXT', payload: ctx }), []);
  const saveModuleOutput = useCallback((moduleId, output) => dispatch({ type: 'SET_MODULE_OUTPUT', moduleId, output }), []);
  const saveModuleInputs = useCallback((moduleId, inputs) => dispatch({ type: 'SET_MODULE_INPUTS', moduleId, inputs }), []);
  const saveEditedOutput = useCallback((moduleId, editedOutput) => dispatch({ type: 'SET_MODULE_EDITED_OUTPUT', moduleId, editedOutput }), []);
  const resetAll = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <AppContext.Provider value={{
      state,
      setView,
      setCurrentModule,
      setBusinessContext,
      saveModuleOutput,
      saveModuleInputs,
      saveEditedOutput,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
