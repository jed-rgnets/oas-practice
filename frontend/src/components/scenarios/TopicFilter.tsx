import { useAppStore } from '../../store';
import type { Topic } from '../../types';

export function TopicFilter() {
  const { topics, selectedTopics, toggleTopic, clearFilters } = useAppStore();

  return (
    <div className="bg-[#1e1e2e] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Topics</h3>
        {selectedTopics.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => toggleTopic(topic.id as Topic)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              selectedTopics.includes(topic.id as Topic)
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={topic.description}
          >
            {topic.name}
            {topic.scenarioCount > 0 && (
              <span className="ml-1 opacity-60">({topic.scenarioCount})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
