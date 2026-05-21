import { useApp } from '../context/AppContext.jsx';
import { MODULES } from '../data/modules.js';
import Sidebar from '../components/Sidebar.jsx';
import ModuleShell from '../components/ModuleShell.jsx';
import ExportBar from '../components/ExportBar.jsx';
import CompletionPage from './CompletionPage.jsx';

export default function Workspace() {
  const { state } = useApp();
  // Index 10 (one past the last module) = completion page
  const showCompletion = (state.currentModule || 0) >= MODULES.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <ExportBar />
        {showCompletion
          ? <CompletionPage />
          : <ModuleShell moduleIndex={state.currentModule || 0} />
        }
      </div>
    </div>
  );
}
