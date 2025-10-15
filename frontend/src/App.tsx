import { type FC} from 'react';
import { RouterProvider} from 'react-router-dom';
import routes from './router';
import { SocketProvider } from './context/SocketContext';
import { API_URL } from './api/api';

/**
 * Main App component
 * Sets up the application routing using RouterProvider
 */
const App: FC = () => {
  return (
    <>
      <SocketProvider serverUrl={API_URL} >
        <RouterProvider router={routes} />
      </SocketProvider>
    </>
  );
};

export default App;