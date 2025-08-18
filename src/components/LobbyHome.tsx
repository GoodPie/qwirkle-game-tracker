import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useLobbyActions } from '../hooks/useLobbyActions';
import { validateAndNormalizeLobbyCode } from '../utils/lobbyCode';
import { Loader2 } from 'lucide-react';

export default function LobbyHome() {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, retry } = useFirebaseAuth();
  const { createLobby, joinLobby } = useLobbyActions();
  
  const [lobbyCode, setLobbyCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [lobbyCodeError, setLobbyCodeError] = useState('');

  const handleCreateGame = async () => {
    if (!user) {
      setError('Authentication required. Please refresh the page.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await createLobby(user.uid);
      
      if (result.success && result.lobbyCode) {
        // Navigate to the created lobby
        navigate(`/lobby/${result.lobbyCode}`);
      } else {
        setError(result.error || 'Failed to create lobby. Please try again.');
      }
    } catch (err) {
      console.error('Error creating lobby:', err);
      setError('Failed to create lobby. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!user) {
      setError('Authentication required. Please refresh the page.');
      return;
    }

    // Validate lobby code
    const { isValid, normalizedCode } = validateAndNormalizeLobbyCode(lobbyCode);
    
    if (!isValid) {
      setLobbyCodeError('Please enter a valid 6-character lobby code');
      return;
    }

    setIsJoining(true);
    setError('');
    setLobbyCodeError('');

    try {
      const result = await joinLobby(normalizedCode, user.uid);
      
      if (result.success) {
        // Navigate to the joined lobby
        navigate(`/lobby/${normalizedCode}`);
      } else {
        if (result.error === 'Lobby not found') {
          setLobbyCodeError('Lobby not found. Please check the code and try again.');
        } else {
          setError(result.error || 'Failed to join lobby. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error joining lobby:', err);
      setError('Failed to join lobby. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLobbyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setLobbyCode(value);
    
    // Clear error when user starts typing
    if (lobbyCodeError) {
      setLobbyCodeError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && lobbyCode.trim() && !isJoining) {
      handleJoinGame();
    }
  };

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Connection Error</h1>
            <p className="text-muted-foreground">{authError}</p>
          </div>
          <Button onClick={retry} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Qwirkle Score Tracker</h1>
          <p className="text-muted-foreground">Create or join a game lobby</p>
        </div>
        
        <div className="space-y-6">
          {/* Create Game Button */}
          <Button 
            onClick={handleCreateGame}
            disabled={isCreating || !user}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Game...
              </>
            ) : (
              'Create Game'
            )}
          </Button>
          
          {/* Join Game Section */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter lobby code"
                value={lobbyCode}
                onChange={handleLobbyCodeChange}
                onKeyPress={handleKeyPress}
                maxLength={6}
                className={`h-12 text-base text-center font-mono tracking-wider ${
                  lobbyCodeError ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
                disabled={isJoining}
              />
              {lobbyCodeError && (
                <p className="text-sm text-destructive text-center">{lobbyCodeError}</p>
              )}
            </div>
            
            <Button 
              onClick={handleJoinGame}
              disabled={!lobbyCode.trim() || isJoining || !user}
              variant="secondary"
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Game...
                </>
              ) : (
                'Join Game'
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}