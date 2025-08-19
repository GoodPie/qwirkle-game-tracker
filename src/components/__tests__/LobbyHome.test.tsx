import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import {LobbyHome} from '@/components/LobbyHome';

const renderLobbyHome = () => {
  return render(
    <BrowserRouter>
      <LobbyHome />
    </BrowserRouter>
  );
};

describe('LobbyHome Component', () => {
  it('should render the main elements', () => {
    renderLobbyHome();
    
    expect(screen.getByText('Qwirkle Score Tracker')).toBeInTheDocument();
    expect(screen.getByText('Create or join a game lobby')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join game/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter lobby code')).toBeInTheDocument();
  });

  it('should have minimum touch target sizes for mobile accessibility', () => {
    renderLobbyHome();
    
    const createButton = screen.getByRole('button', { name: /create game/i });
    const joinButton = screen.getByRole('button', { name: /join game/i });
    
    // Check that buttons have the lg size class which provides h-12 (48px)
    expect(createButton).toHaveClass('h-12');
    expect(joinButton).toHaveClass('h-12');
  });
});