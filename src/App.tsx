import GraphContainer from './GraphContainer/GraphContainer';
import { QueryProvider } from './queryClient';

function App() {
  return (
    <QueryProvider>
      <div className="App">
        <GraphContainer />
      </div>
    </QueryProvider>
  );
}

export default App;
