import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useLobby } from '../hooks/useLobby';
import { useLobbyActions } from '../hooks/useLobbyActions';
import PlayerList from './PlayerList';
import { Loader2, ArrowLeft, Copy, Check } from 'lucide-react';

export default function LobbyRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { lobby, loading: lobbyLoading, error: lobbyError } = useLobby(code || null);
  const { leaveLobby } = useLobbyActions();

  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Auto-join lobby if user is authenticated and lobby exists but user is not in it
  useEffect(() => {
    if (user && lobby && !lobby.players[user.uid] && !lobbyLoading) {
      // User is not in the lobby, redirect to home
      navigate('/', { replace: true });
    }
  }, [user, lobby, lobbyLoading, navigate]);

  const handleCopyCode = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleLeaveLobby = async () => {
    if (!user || !code) return;

    setIsLeaving(true);
    setError('');

    try {
      const result = await leaveLobby(code, user.uid);

      if (result.success) {
        // Navigate back to home
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Failed to leave lobby. Please try again.');
      }
    } catch (err) {
      console.error('Error leaving lobby:', err);
      setError('Failed to leave lobby. Please try again.');
    } finally {
      setIsLeaving(false);
      setShowLeaveConfirmation(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  const isUserLobbyLeader = user && lobby && lobby.leaderId === user.uid;

  // Show loading state while authenticating or loading lobby
  if (authLoading || lobbyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading lobby...</p>
        </div>
      </div>
    );
  }

  // Show error if lobby not found or other errors
  if (lobbyError || !lobby) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Lobby Not Found</h1>
            <p className="text-muted-foreground">
              {lobbyError || 'The lobby you\'re looking for doesn\'t exist or has been deleted.'}
            </p>
          </div>
          <Button onClick={handleBackToHome} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Show confirmation dialog
  if (showLeaveConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Leave Lobby?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to leave this lobby?
              {isUserLobbyLeader && ' As the lobby leader, leadership will be transferred to another player.'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowLeaveConfirmation(false)}
              className="flex-1 h-12"
              disabled={isLeaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveLobby}
              className="flex-1 h-12"
              disabled={isLeaving}
            >
              {isLeaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Leaving...
                </>
              ) : (
                'Leave Lobby'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="h-10 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Lobby Code Display */}
        <div className="bg-card rounded-lg border p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Game Lobby</h1>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lobby Code</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-4xl font-mono font-bold text-primary tracking-wider">
                {code}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCode}
                className="h-10 w-10"
                aria-label="Copy lobby code"
              >
                {codeCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this code with other players to join
            </p>
          </div>
        </div>

        {/* Players List */}
        <PlayerList 
          lobby={lobby} 
          currentUserId={user?.uid}
        />

        {/* Game Status */}
        <div className="bg-card rounded-lg border p-6 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Game Status</p>
            <p className="text-lg font-medium text-foreground capitalize">
              {lobby.gameState === 'waiting' && 'Waiting for players'}
              {lobby.gameState === 'playing' && 'Game in progress'}
              {lobby.gameState === 'finished' && 'Game finished'}
            </p>
          </div>

          {isUserLobbyLeader && lobby.gameState === 'waiting' && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                You are the lobby leader
              </p>
              <Button className="w-full h-12" disabled>
                Start Game (Coming Soon)
              </Button>
            </div>
          )}
        </div>

        {/* Leave Lobby Button */}
        <div className="space-y-3">
          <Button
            variant="destructive"
            onClick={() => setShowLeaveConfirmation(true)}
            className="w-full h-12 text-base font-medium"
            disabled={isLeaving}
          >
            Leave Lobby
          </Button>

          {error && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}