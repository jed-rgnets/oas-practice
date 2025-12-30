import { useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store';
import { validateYamlSyntax } from '../../services/yamlValidator';
import { Button } from '../common/Button';

export function EditorPanel() {
  const {
    editorContent,
    setEditorContent,
    yamlErrors,
    setYamlErrors,
    isValidating,
    submitSolution,
    resetEditor,
  } = useAppStore();

  // Debounced YAML validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const errors = validateYamlSyntax(editorContent);
      setYamlErrors(errors);
    }, 300);
    return () => clearTimeout(timer);
  }, [editorContent, setYamlErrors]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      setEditorContent(value || '');
    },
    [setEditorContent]
  );

  const handleSubmit = useCallback(() => {
    submitSolution();
  }, [submitSolution]);

  // Keyboard shortcut for submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="bg-[#1e1e2e] rounded-lg h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-400">YAML Editor</span>
          {yamlErrors.length > 0 && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Syntax error on line {yamlErrors[0].line}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetEditor}>
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isValidating}
            disabled={yamlErrors.length > 0}
          >
            Submit
            <span className="ml-1 text-xs opacity-70">⌘↵</span>
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={editorContent}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            folding: true,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Error display */}
      {yamlErrors.length > 0 && (
        <div className="p-3 bg-red-900/20 border-t border-red-700/50">
          <div className="text-sm text-red-400">
            <strong>Line {yamlErrors[0].line}:</strong> {yamlErrors[0].message}
          </div>
        </div>
      )}
    </div>
  );
}
