/**
 * Client-side YAML validation for real-time feedback
 */

import YAML from 'yaml';
import type { SyntaxError } from '../types';

export function validateYamlSyntax(content: string): SyntaxError[] {
  if (!content.trim()) {
    return [];
  }

  try {
    YAML.parse(content);
    return [];
  } catch (error) {
    if (error instanceof YAML.YAMLParseError) {
      const linePos = error.linePos;
      return [
        {
          line: linePos?.[0]?.line || 1,
          column: linePos?.[0]?.col || 1,
          message: error.message.split('\n')[0], // First line of error message
        },
      ];
    }
    return [
      {
        line: 1,
        column: 1,
        message: 'Invalid YAML syntax',
      },
    ];
  }
}

export function parseYaml(content: string): unknown | null {
  try {
    return YAML.parse(content);
  } catch {
    return null;
  }
}

export function formatYaml(content: string): string | null {
  try {
    const parsed = YAML.parse(content);
    return YAML.stringify(parsed, { indent: 2 });
  } catch {
    return null;
  }
}
