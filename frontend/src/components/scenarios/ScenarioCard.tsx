import { useAppStore } from '../../store';
import type { ScenarioSummary } from '../../types';
import { DifficultyBadge, TopicBadge } from '../common/Badge';

interface ScenarioCardProps {
  scenario: ScenarioSummary;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const { selectScenario, progress } = useAppStore();
  const scenarioProgress = progress.scenarios[scenario.id];
  const isCompleted = scenarioProgress?.completed;

  return (
    <button
      onClick={() => selectScenario(scenario.id)}
      className="bg-[#1e1e2e] rounded-lg p-4 text-left hover:bg-[#252540] transition-colors border border-transparent hover:border-primary-600/50 group"
    >
      <div className="flex items-start justify-between mb-2">
        <DifficultyBadge difficulty={scenario.difficulty} />
        {isCompleted && (
          <span className="text-green-400" title="Completed">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      <h3 className="font-semibold text-white mb-1 group-hover:text-primary-300 transition-colors">
        {scenario.title}
      </h3>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{scenario.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {scenario.topics.slice(0, 3).map((topic) => (
          <TopicBadge key={topic} topic={topic} />
        ))}
        {scenario.topics.length > 3 && (
          <span className="px-2 py-1 text-xs text-gray-500">
            +{scenario.topics.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>~{scenario.estimatedMinutes} min</span>
        <span className="text-primary-400 font-medium">
          {scenarioProgress ? `${scenarioProgress.bestScore}/` : ''}
          {scenario.points} pts
        </span>
      </div>
    </button>
  );
}
