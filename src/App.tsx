import { useGameStore } from './stores/gameStore';
import { Lobby } from './components/lobby/Lobby';
import { Form } from './components/form/Form';
import { RaceView } from './components/race/RaceView';

function App() {
  const { currentScreen, currentRace } = useGameStore();
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-turf-400">
              TURF SPRINT
            </h1>
            <div className="flex items-center gap-4">
              {/* Wallet balance will be added here */}
              <div className="text-sm text-slate-400">
                Balance: <span className="text-gold-400 font-mono">1,000</span> credits
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {currentScreen === 'lobby' && <Lobby />}
          
          {currentScreen === 'form' && (
            <Form race={currentRace!} />
          )}
          
          {currentScreen === 'race' && currentRace && (
            <RaceView race={currentRace} />
          )}
          
          {currentScreen === 'results' && (
            <div className="text-center py-20">
              <h2 className="font-display text-4xl font-bold mb-4">
                Results
              </h2>
              <p className="text-slate-400 text-lg">
                Coming soon...
              </p>
            </div>
          )}
          
          {currentScreen === 'photo-finish' && (
            <div className="text-center py-20">
              <h2 className="font-display text-4xl font-bold mb-4">
                Photo Finish
              </h2>
              <p className="text-slate-400 text-lg">
                Coming soon...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>© 2025 Turf Sprint</span>
            <span>Virtual currency only • No real money gambling</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
