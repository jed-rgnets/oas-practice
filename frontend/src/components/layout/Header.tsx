import { useAppStore } from '../../store';

export function Header() {
  const { progress, viewMode, closeScenario } = useAppStore();

  return (
    <header className="bg-[#16162a] border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={viewMode === 'practice' ? closeScenario : undefined}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OAS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OAS Practice</h1>
              <p className="text-xs text-gray-400">OpenAPI 3.0 Specification</p>
            </div>
          </button>

          {viewMode === 'practice' && (
            <button
              onClick={closeScenario}
              className="ml-4 text-gray-400 hover:text-white flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Scenarios
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="text-lg font-semibold text-white">
              {progress.completedCount} completed
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Points</div>
            <div className="text-lg font-semibold text-primary-400">{progress.totalPoints}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
