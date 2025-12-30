import { useAppStore } from '../../store';
import { ScenarioPanel } from './ScenarioPanel';
import { EditorPanel } from './EditorPanel';
import { ResultsPanel } from './ResultsPanel';
import { Spinner } from '../common/Spinner';

export function PracticeView() {
  const { currentScenario, isLoadingScenario, validationResult } = useAppStore();

  if (isLoadingScenario) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="bg-[#1e1e2e] rounded-lg p-8 text-center">
        <p className="text-gray-400">No scenario selected.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-4">
      {/* Left panel: Scenario instructions */}
      <div className="lg:w-1/3 min-w-0 overflow-auto">
        <ScenarioPanel scenario={currentScenario} />
      </div>

      {/* Center panel: Editor */}
      <div className="lg:flex-1 min-w-0 flex flex-col">
        <EditorPanel />
      </div>

      {/* Right panel: Results (shown after validation) */}
      {validationResult && (
        <div className="lg:w-1/4 min-w-0 overflow-auto">
          <ResultsPanel result={validationResult} />
        </div>
      )}
    </div>
  );
}
