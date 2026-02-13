import { type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from './router';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';


/**
 * Main App component
 * Sets up the application routing using RouterProvider
 * Wrapped with ThemeProvider for global theme management
 */
const App: FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RouterProvider router={routes} />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;