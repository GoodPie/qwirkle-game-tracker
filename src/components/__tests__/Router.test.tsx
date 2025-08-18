import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import LobbyHome from '../LobbyHome';
import LobbyRoom from '../LobbyRoom';
import { expect, describe, it } from 'vitest';

describe('Router Integration', () => {
  it('should render LobbyHome at root path', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LobbyHome />,
      },
    ], {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);
    
    expect(screen.getByText('Qwirkle Score Tracker')).toBeInTheDocument();
    expect(screen.getByText('Create or join a game lobby')).toBeInTheDocument();
  });

  it('should render LobbyRoom at lobby path with code', () => {
    const testCode = 'ABC123';
    const router = createMemoryRouter([
      {
        path: '/lobby/:code',
        element: <LobbyRoom />,
      },
    ], {
      initialEntries: [`/lobby/${testCode}`],
    });

    render(<RouterProvider router={router} />);
    
    expect(screen.getByText('Game Lobby')).toBeInTheDocument();
    expect(screen.getByText(testCode)).toBeInTheDocument();
  });
});