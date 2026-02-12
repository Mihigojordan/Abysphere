import { type FC} from 'react';
import { RouterProvider} from 'react-router-dom';
import routes from './router';
import { ThemeProvider } from './context/ThemeContext';


/**
 * Main App component
 * Sets up the application routing using RouterProvider
 * Wrapped with ThemeProvider for global theme management
 */
const App: FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={routes} />
    </ThemeProvider>
  );
};

export default App;