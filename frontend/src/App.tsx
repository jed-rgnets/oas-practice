import { useEffect } from 'react';
import { useAppStore } from './store';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScenarioBrowser } from './components/scenarios/ScenarioBrowser';
import { PracticeView } from './components/practice/PracticeView';

function App() {
  const { viewMode, fetchScenarios, fetchTopics } = useAppStore();

  useEffect(() => {
    fetchScenarios();
    fetchTopics();
  }, [fetchScenarios, fetchTopics]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {viewMode === 'browse' ? <ScenarioBrowser /> : <PracticeView />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
