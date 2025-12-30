import type { ValidationResponse } from '../../types';
import { useAppStore } from '../../store';
import { Button } from '../common/Button';

interface ResultsPanelProps {
  result: ValidationResponse;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const { clearValidation } = useAppStore();

  const percentage = Math.round((result.score / result.maxScore) * 100);

  return (
    <div className="bg-[#1e1e2e] rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Results</h3>
          <button onClick={clearValidation} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Score */}
        <div
          className={`text-center py-4 rounded-lg ${result.valid ? 'bg-green-900/30' : 'bg-gray-800'}`}
        >
          <div
            className={`text-3xl font-bold ${result.valid ? 'text-green-400' : 'text-gray-200'}`}
          >
            {result.score}/{result.maxScore}
          </div>
          <div className="text-sm text-gray-400">{percentage}% complete</div>
        </div>
      </div>

      {/* Feedback */}
      <div className="p-4 border-b border-gray-700">
        <p className={`text-sm ${result.valid ? 'text-green-300' : 'text-gray-300'}`}>
          {result.feedback}
        </p>
      </div>

      {/* Requirement results */}
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Requirements</h4>
        <ul className="space-y-3">
          {result.results.map((req) => (
            <li key={req.requirementId} className="flex items-start gap-2">
              {req.passed ? (
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div>
                <p className={`text-sm ${req.passed ? 'text-gray-300' : 'text-gray-400'}`}>
                  {req.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {req.pointsEarned}/{req.pointsPossible} pts
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-yellow-400 mb-2">Warnings</h4>
          <ul className="space-y-1">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-xs text-gray-400">
                {warning.path && <span className="text-yellow-500">{warning.path}: </span>}
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-700">
        {result.valid ? (
          <Button variant="primary" className="w-full" onClick={() => useAppStore.getState().closeScenario()}>
            Complete & Return
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" onClick={clearValidation}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
