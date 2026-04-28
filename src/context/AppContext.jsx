import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  loadState,
  saveState,
  setModuleOutput,
  setModuleInputs,
  setModuleEditedOutput,
} from '../utils/storage.js';
import { useAuth } from './AuthContext.jsx';
import { fetchUserOutputs, upsertUserOutput } from '../utils/supabase.js';

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
    case 'MERGE_SUPABASE_OUTPUTS': {
      const merged = { ...(state.moduleData || {}) };
      for (const [moduleId, outputText] of Object.entries(action.outputs)) {
        if (!merged[moduleId]?.output && outputText) {
          merged[moduleId] = {
            inputs: merged[moduleId]?.inputs || {},
            output: outputText,
            editedOutput: outputText,
            completed: true,
            generatedAt: merged[moduleId]?.generatedAt || new Date().toISOString(),
          };
        }
      }
      return { ...state, moduleData: merged };
    }
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
  const { user } = useAuth();
  const userRef = useRef(user);
  const hasLoadedFromSupabase = useRef(false);

  // Keep userRef current without making callbacks depend on user
  useEffect(() => { userRef.current = user; }, [user]);

  // Persist all state to localStorage on every change (view excluded)
  useEffect(() => {
    const { view, ...persistable } = state;
    saveState(persistable);
  }, [state]);

  // On login, fetch outputs from Supabase and merge (only fills modules missing locally)
  useEffect(() => {
    if (!user) {
      hasLoadedFromSupabase.current = false;
      return;
    }
    if (hasLoadedFromSupabase.current) return;
    hasLoadedFromSupabase.current = true;
    fetchUserOutputs(user.id).then(outputs => {
      if (Object.keys(outputs).length > 0) {
        dispatch({ type: 'MERGE_SUPABASE_OUTPUTS', outputs });
      }
    });
  }, [user]);

  const setView = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), []);
  const setCurrentModule = useCallback((idx) => dispatch({ type: 'SET_CURRENT_MODULE', payload: idx }), []);
  const setBusinessContext = useCallback((ctx) => dispatch({ type: 'SET_BUSINESS_CONTEXT', payload: ctx }), []);

  // Save to both localStorage (via state) and Supabase when a module is generated
  const saveModuleOutput = useCallback((moduleId, output) => {
    dispatch({ type: 'SET_MODULE_OUTPUT', moduleId, output });
    if (userRef.current) {
      upsertUserOutput(userRef.current.id, moduleId, output).catch(console.error);
    }
  }, []);

  const saveModuleInputs = useCallback((moduleId, inputs) => dispatch({ type: 'SET_MODULE_INPUTS', moduleId, inputs }), []);

  // Save edited output to both localStorage and Supabase
  const saveEditedOutput = useCallback((moduleId, editedOutput) => {
    dispatch({ type: 'SET_MODULE_EDITED_OUTPUT', moduleId, editedOutput });
    if (userRef.current) {
      upsertUserOutput(userRef.current.id, moduleId, editedOutput).catch(console.error);
    }
  }, []);

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
