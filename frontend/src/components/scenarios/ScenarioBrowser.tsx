import { useAppStore } from '../../store';
import { TopicFilter } from './TopicFilter';
import { DifficultyFilter } from './DifficultyFilter';
import { ScenarioCard } from './ScenarioCard';
import { Spinner } from '../common/Spinner';

export function ScenarioBrowser() {
  const { isLoadingScenarios, getFilteredScenarios, showCompleted, toggleShowCompleted } =
    useAppStore();
  const scenarios = getFilteredScenarios();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Practice Scenarios</h2>
        <p className="text-gray-400">
          Select a scenario to practice writing OpenAPI specifications. Filter by topic or
          difficulty.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-64 space-y-6">
          <TopicFilter />
          <DifficultyFilter />

          <div className="bg-[#1e1e2e] rounded-lg p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={toggleShowCompleted}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300">Show completed</span>
            </label>
          </div>
        </aside>

        {/* Scenarios grid */}
        <div className="flex-1">
          {isLoadingScenarios ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : scenarios.length === 0 ? (
            <div className="bg-[#1e1e2e] rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-2">No scenarios found matching your filters.</p>
              <p className="text-gray-500 text-sm">Try adjusting your filter criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
