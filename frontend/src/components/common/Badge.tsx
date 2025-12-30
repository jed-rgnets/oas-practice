import type { Difficulty, Topic } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const classes = {
    beginner: 'badge-beginner',
    intermediate: 'badge-intermediate',
    advanced: 'badge-advanced',
  };

  const labels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}

interface TopicBadgeProps {
  topic: Topic;
  selected?: boolean;
  onClick?: () => void;
}

const topicLabels: Record<Topic, string> = {
  paths: 'Paths',
  operations: 'Operations',
  'parameters-path': 'Path Params',
  'parameters-query': 'Query Params',
  'parameters-header': 'Header Params',
  'parameters-cookie': 'Cookie Params',
  'request-bodies': 'Request Bodies',
  responses: 'Responses',
  'media-types': 'Media Types',
  schemas: 'Schemas',
  components: 'Components',
  references: 'References',
  security: 'Security',
  tags: 'Tags',
  servers: 'Servers',
  info: 'Info',
  discriminator: 'Discriminator',
  callbacks: 'Callbacks',
  links: 'Links',
};

export function TopicBadge({ topic, selected, onClick }: TopicBadgeProps) {
  const baseClasses =
    'px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer';
  const stateClasses = selected
    ? 'bg-primary-600 text-white'
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600';

  return (
    <button className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      {topicLabels[topic] || topic}
    </button>
  );
}
