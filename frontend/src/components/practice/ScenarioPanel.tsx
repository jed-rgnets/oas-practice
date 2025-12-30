import ReactMarkdown from 'react-markdown';
import type { Scenario } from '../../types';
import { DifficultyBadge, TopicBadge } from '../common/Badge';

interface ScenarioPanelProps {
  scenario: Scenario;
}

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
  return (
    <div className="bg-[#1e1e2e] rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <DifficultyBadge difficulty={scenario.difficulty} />
          <span className="text-sm text-gray-400">~{scenario.estimatedMinutes} min</span>
          <span className="text-sm text-primary-400 font-medium ml-auto">
            {scenario.points} pts
          </span>
        </div>
        <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
        <div className="flex flex-wrap gap-1 mt-2">
          {scenario.topics.map((topic) => (
            <TopicBadge key={topic} topic={topic} />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="flex-1 overflow-auto p-4">
        <div className="markdown-content">
          <ReactMarkdown>{scenario.instructions}</ReactMarkdown>
        </div>
      </div>

      {/* Requirements */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="font-semibold text-white mb-3">Requirements</h3>
        <ul className="space-y-2">
          {scenario.requirements.map((req, index) => (
            <li key={req.id} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <span className="text-gray-300">{req.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
