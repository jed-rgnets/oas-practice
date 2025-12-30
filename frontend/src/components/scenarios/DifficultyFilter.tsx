import { useAppStore } from '../../store';
import type { Difficulty } from '../../types';

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-400' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-400' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-400' },
];

export function DifficultyFilter() {
  const { selectedDifficulty, setDifficulty } = useAppStore();

  return (
    <div className="bg-[#1e1e2e] rounded-lg p-4">
      <h3 className="font-semibold text-white mb-3">Difficulty</h3>
      <div className="space-y-2">
        <button
          onClick={() => setDifficulty(null)}
          className={`w-full px-3 py-2 rounded text-left text-sm transition-colors ${
            selectedDifficulty === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Difficulties
        </button>
        {difficulties.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => setDifficulty(value)}
            className={`w-full px-3 py-2 rounded text-left text-sm transition-colors ${
              selectedDifficulty === value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className={selectedDifficulty === value ? '' : color}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
