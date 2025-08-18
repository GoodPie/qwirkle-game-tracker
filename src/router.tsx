import { createBrowserRouter } from 'react-router-dom';
import {LobbyHome} from './components/LobbyHome';
import LobbyRoom from './components/LobbyRoom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LobbyHome />,
  },
  {
    path: '/lobby/:code',
    element: <LobbyRoom />,
  },
]);