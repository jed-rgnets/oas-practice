/**
 * Zustand store for application state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Topic,
  Difficulty,
  Scenario,
  ScenarioSummary,
  ValidationResponse,
  UserProgress,
  SyntaxError,
  TopicInfo,
  ViewMode,
} from '../types';
import { api } from '../services/api';

interface AppState {
  // View
  viewMode: ViewMode;

  // Scenarios
  scenarios: ScenarioSummary[];
  topics: TopicInfo[];
  currentScenario: Scenario | null;
  isLoadingScenarios: boolean;
  isLoadingScenario: boolean;

  // Filters
  selectedTopics: Topic[];
  selectedDifficulty: Difficulty | null;
  showCompleted: boolean;

  // Editor
  editorContent: string;
  yamlErrors: SyntaxError[];

  // Validation
  isValidating: boolean;
  validationResult: ValidationResponse | null;

  // Progress (persisted)
  progress: UserProgress;
}

interface AppActions {
  // View
  setViewMode: (mode: ViewMode) => void;

  // Data fetching
  fetchScenarios: () => Promise<void>;
  fetchTopics: () => Promise<void>;
  selectScenario: (id: string) => Promise<void>;
  closeScenario: () => void;

  // Filters
  toggleTopic: (topic: Topic) => void;
  setDifficulty: (difficulty: Difficulty | null) => void;
  toggleShowCompleted: () => void;
  clearFilters: () => void;

  // Editor
  setEditorContent: (content: string) => void;
  setYamlErrors: (errors: SyntaxError[]) => void;
  resetEditor: () => void;

  // Validation
  submitSolution: () => Promise<void>;
  clearValidation: () => void;

  // Progress
  updateProgress: (scenarioId: string, score: number, maxScore: number) => void;
  saveDraft: (scenarioId: string, content: string) => void;
  loadDraft: (scenarioId: string) => string | undefined;

  // Filtered scenarios
  getFilteredScenarios: () => ScenarioSummary[];
}

const initialProgress: UserProgress = {
  scenarios: {},
  totalPoints: 0,
  completedCount: 0,
  lastActivity: new Date().toISOString(),
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'browse',
      scenarios: [],
      topics: [],
      currentScenario: null,
      isLoadingScenarios: false,
      isLoadingScenario: false,
      selectedTopics: [],
      selectedDifficulty: null,
      showCompleted: true,
      editorContent: '',
      yamlErrors: [],
      isValidating: false,
      validationResult: null,
      progress: initialProgress,

      // View actions
      setViewMode: (mode) => set({ viewMode: mode }),

      // Data fetching
      fetchScenarios: async () => {
        set({ isLoadingScenarios: true });
        try {
          const { selectedTopics, selectedDifficulty } = get();
          const data = await api.getScenarios({
            topics: selectedTopics.length > 0 ? selectedTopics : undefined,
            difficulty: selectedDifficulty || undefined,
          });
          set({ scenarios: data.scenarios, isLoadingScenarios: false });
        } catch (error) {
          console.error('Failed to fetch scenarios:', error);
          set({ isLoadingScenarios: false });
        }
      },

      fetchTopics: async () => {
        try {
          const data = await api.getTopics();
          set({ topics: data.topics });
        } catch (error) {
          console.error('Failed to fetch topics:', error);
        }
      },

      selectScenario: async (id: string) => {
        set({ isLoadingScenario: true, validationResult: null });
        try {
          const scenario = await api.getScenario(id);
          const draft = get().loadDraft(id);
          set({
            currentScenario: scenario,
            editorContent: draft || scenario.starterCode,
            isLoadingScenario: false,
            viewMode: 'practice',
            yamlErrors: [],
          });
        } catch (error) {
          console.error('Failed to fetch scenario:', error);
          set({ isLoadingScenario: false });
        }
      },

      closeScenario: () => {
        set({
          currentScenario: null,
          editorContent: '',
          validationResult: null,
          yamlErrors: [],
          viewMode: 'browse',
        });
      },

      // Filter actions
      toggleTopic: (topic) => {
        const { selectedTopics } = get();
        const newTopics = selectedTopics.includes(topic)
          ? selectedTopics.filter((t) => t !== topic)
          : [...selectedTopics, topic];
        set({ selectedTopics: newTopics });
        get().fetchScenarios();
      },

      setDifficulty: (difficulty) => {
        set({ selectedDifficulty: difficulty });
        get().fetchScenarios();
      },

      toggleShowCompleted: () => set((state) => ({ showCompleted: !state.showCompleted })),

      clearFilters: () => {
        set({ selectedTopics: [], selectedDifficulty: null });
        get().fetchScenarios();
      },

      // Editor actions
      setEditorContent: (content) => {
        set({ editorContent: content });
        const { currentScenario } = get();
        if (currentScenario) {
          get().saveDraft(currentScenario.id, content);
        }
      },

      setYamlErrors: (errors) => set({ yamlErrors: errors }),

      resetEditor: () => {
        const { currentScenario } = get();
        set({
          editorContent: currentScenario?.starterCode || '',
          yamlErrors: [],
          validationResult: null,
        });
      },

      // Validation actions
      submitSolution: async () => {
        const { currentScenario, editorContent } = get();
        if (!currentScenario) return;

        set({ isValidating: true });
        try {
          const result = await api.validateSolution(currentScenario.id, editorContent);
          set({ validationResult: result, isValidating: false });

          // Update progress
          get().updateProgress(currentScenario.id, result.score, result.maxScore);
        } catch (error) {
          console.error('Validation failed:', error);
          set({ isValidating: false });
        }
      },

      clearValidation: () => set({ validationResult: null }),

      // Progress actions
      updateProgress: (scenarioId, score, maxScore) =>
        set((state) => {
          const existing = state.progress.scenarios[scenarioId];
          const isNewCompletion = score === maxScore && (!existing || !existing.completed);
          const isBetterScore = !existing || score > existing.bestScore;

          return {
            progress: {
              ...state.progress,
              scenarios: {
                ...state.progress.scenarios,
                [scenarioId]: {
                  scenarioId,
                  completed: score === maxScore || existing?.completed || false,
                  bestScore: isBetterScore ? score : existing?.bestScore || 0,
                  maxScore,
                  attempts: (existing?.attempts || 0) + 1,
                  lastAttempt: new Date().toISOString(),
                  lastSolution: state.editorContent,
                },
              },
              totalPoints: isNewCompletion
                ? state.progress.totalPoints + score
                : isBetterScore && existing
                  ? state.progress.totalPoints + (score - existing.bestScore)
                  : state.progress.totalPoints,
              completedCount: isNewCompletion
                ? state.progress.completedCount + 1
                : state.progress.completedCount,
              lastActivity: new Date().toISOString(),
            },
          };
        }),

      saveDraft: (scenarioId, content) =>
        set((state) => {
          const existing = state.progress.scenarios[scenarioId];
          return {
            progress: {
              ...state.progress,
              scenarios: {
                ...state.progress.scenarios,
                [scenarioId]: {
                  scenarioId,
                  lastSolution: content,
                  completed: existing?.completed || false,
                  bestScore: existing?.bestScore || 0,
                  maxScore: existing?.maxScore || 0,
                  attempts: existing?.attempts || 0,
                  lastAttempt: existing?.lastAttempt || new Date().toISOString(),
                },
              },
            },
          };
        }),

      loadDraft: (scenarioId) => get().progress.scenarios[scenarioId]?.lastSolution,

      // Computed
      getFilteredScenarios: () => {
        const { scenarios, progress, showCompleted } = get();
        if (showCompleted) return scenarios;
        return scenarios.filter((s) => !progress.scenarios[s.id]?.completed);
      },
    }),
    {
      name: 'oas-practice-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
