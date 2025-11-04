import { type FC} from 'react';
import { RouterProvider} from 'react-router-dom';
import routes from './router';


/**
 * Main App component
 * Sets up the application routing using RouterProvider
 */
const App: FC = () => {
  return (
    <>
      
        <RouterProvider router={routes} />
     
    </>
  );
};

export default App;