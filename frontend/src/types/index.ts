/**
 * TypeScript type definitions for OAS Practice
 */

// Topic definitions
export type Topic =
  | 'paths'
  | 'operations'
  | 'parameters-path'
  | 'parameters-query'
  | 'parameters-header'
  | 'parameters-cookie'
  | 'request-bodies'
  | 'responses'
  | 'media-types'
  | 'schemas'
  | 'components'
  | 'references'
  | 'security'
  | 'tags'
  | 'servers'
  | 'info'
  | 'discriminator'
  | 'callbacks'
  | 'links';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// API Response Types
export interface ScenarioSummary {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  difficulty: Difficulty;
  estimatedMinutes: number;
  points: number;
}

export interface Requirement {
  id: string;
  description: string;
  hint?: string;
}

export interface Scenario extends ScenarioSummary {
  instructions: string;
  requirements: Requirement[];
  starterCode: string;
}

export interface TopicInfo {
  id: string;
  name: string;
  description: string;
  scenarioCount: number;
}

export interface SyntaxError {
  line: number;
  column: number;
  message: string;
}

export interface Warning {
  path: string;
  message: string;
}

export interface RequirementResult {
  requirementId: string;
  passed: boolean;
  message: string;
  pointsEarned: number;
  pointsPossible: number;
}

export interface ValidationResponse {
  valid: boolean;
  score: number;
  maxScore: number;
  results: RequirementResult[];
  feedback: string;
  syntaxErrors: SyntaxError[];
  warnings: Warning[];
}

// Local Storage State
export interface ScenarioProgress {
  scenarioId: string;
  completed: boolean;
  bestScore: number;
  maxScore: number;
  attempts: number;
  lastAttempt: string;
  lastSolution?: string;
}

export interface UserProgress {
  scenarios: Record<string, ScenarioProgress>;
  totalPoints: number;
  completedCount: number;
  lastActivity: string;
}

// View modes
export type ViewMode = 'browse' | 'practice';
