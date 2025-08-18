# Design Document

## Overview

The Qwirkle Lobby System is designed as a real-time multiplayer lobby management system built on top of the existing React + Vite + Firebase infrastructure. The system uses Firebase Realtime Database for instant synchronization and anonymous authentication for simplicity. The design follows a mobile-first approach with large touch targets and clear visual hierarchy.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[React App] --> B[Firebase Auth]
    A --> C[Firebase Realtime Database]
    A --> D[Lobby Management]
    A --> E[Real-time Sync]
    
    B --> F[Anonymous Authentication]
    C --> G[/lobbies/{code} Structure]
    D --> H[Create Lobby]
    D --> I[Join Lobby]
    E --> J[Player List Updates]
    E --> K[Game State Sync]
```

### Data Flow

1. **App Initialization**: Anonymous authentication happens automatically on app load
2. **Lobby Creation**: Generate 6-character code → Create Firebase entry → Navigate to lobby
3. **Lobby Joining**: Validate code → Check Firebase → Add player → Navigate to lobby
4. **Real-time Updates**: Firebase listeners update React state → UI re-renders automatically

## Components and Interfaces

### Core Components

#### 1. App Component (`src/App.tsx`)
- Main application router
- Handles authentication state
- Manages global app state

#### 2. LobbyHome Component (`src/components/LobbyHome.tsx`)
- Landing page with "Create Game" and "Join Game" options
- Input field for lobby code entry
- Large, mobile-friendly buttons

#### 3. LobbyRoom Component (`src/components/LobbyRoom.tsx`)
- Displays lobby code prominently
- Shows real-time player list
- Leader controls (start/end game, manage scores)
- Leave lobby functionality

#### 4. PlayerList Component (`src/components/PlayerList.tsx`)
- Real-time list of connected players
- Highlights current player's turn
- Shows lobby leader indicator

### Data Interfaces

#### Lobby Data Structure
```typescript
interface Lobby {
  code: string;
  leaderId: string;
  createdAt: number;
  gameState: 'waiting' | 'playing' | 'finished';
  players: Record<string, Player>;
  scores?: Record<string, number>;
  currentTurn?: string;
}

interface Player {
  id: string;
  name: string;
  joinedAt: number;
  isConnected: boolean;
}
```

#### Firebase Database Structure
```
/lobbies
  /{lobbyCode}
    /code: "ABC123"
    /leaderId: "anonymous_user_id"
    /createdAt: timestamp
    /gameState: "waiting"
    /players
      /{playerId}
        /id: "anonymous_user_id"
        /name: "Player 1"
        /joinedAt: timestamp
        /isConnected: true
    /scores (optional)
      /{playerId}: number
    /currentTurn: "player_id" (optional)
```

### Custom Hooks

#### 1. `useFirebaseAuth` Hook
```typescript
const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Handle anonymous auth state changes
}
```

#### 2. `useLobby` Hook
```typescript
const useLobby = (lobbyCode: string) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Handle real-time lobby updates
}
```

#### 3. `useLobbyActions` Hook
```typescript
const useLobbyActions = () => {
  const createLobby = async () => { /* ... */ };
  const joinLobby = async (code: string) => { /* ... */ };
  const leaveLobby = async (lobbyCode: string) => { /* ... */ };
  // Lobby management actions
}
```

## Data Models

### Lobby Code Generation
- **Format**: 6 alphanumeric characters (A-Z, 0-9)
- **Generation**: Use crypto.getRandomValues() for security
- **Collision Handling**: Retry generation if code exists
- **Exclusions**: Avoid confusing characters (0/O, 1/I/L)

### Player Management
- **Identification**: Firebase anonymous user ID
- **Naming**: Auto-generate names like "Player 1", "Player 2"
- **Connection Status**: Track via Firebase presence system
- **Leadership**: First player becomes leader, transfers on disconnect

### Game State Management
- **States**: waiting → playing → finished
- **Transitions**: Only lobby leader can change states
- **Persistence**: All state stored in single Firebase object
- **Cleanup**: Auto-delete empty lobbies after 5 minutes

## Error Handling

### Network Errors
- **Connection Loss**: Show reconnecting indicator
- **Failed Operations**: Display user-friendly error messages
- **Timeout Handling**: Retry failed operations with exponential backoff

### User Input Validation
- **Lobby Code**: Validate 6-character format before Firebase check
- **Empty States**: Handle empty player lists gracefully
- **Invalid Codes**: Clear error message for non-existent lobbies

### Firebase Errors
- **Authentication Failures**: Retry anonymous sign-in
- **Database Errors**: Log errors and show generic user message
- **Permission Errors**: Handle gracefully with user feedback

## Testing Strategy

### Unit Testing
- **Utility Functions**: Test lobby code generation, validation
- **Custom Hooks**: Test state management and Firebase interactions
- **Components**: Test rendering and user interactions

### Integration Testing
- **Firebase Integration**: Test real-time data synchronization
- **Multi-tab Testing**: Simulate multiple players in different tabs
- **Mobile Testing**: Test touch interactions and responsive design

### Manual Testing Scenarios
1. **Basic Flow**: Create lobby → Join with code → See player list
2. **Real-time Sync**: Update in one tab → Verify in other tabs
3. **Error Cases**: Invalid codes, network issues, empty lobbies
4. **Mobile Experience**: Touch targets, screen sizes, orientation changes

### Performance Considerations
- **Firebase Listeners**: Clean up listeners on component unmount
- **Re-renders**: Optimize with React.memo and useMemo where needed
- **Bundle Size**: Code splitting for lobby components
- **Mobile Performance**: Minimize DOM updates, optimize touch events

## UI/UX Design Principles

### Mobile-First Design
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Typography**: Large, readable text (minimum 16px)
- **Spacing**: Generous padding and margins for touch interaction
- **Navigation**: Simple, clear navigation patterns

### Visual Hierarchy
- **Lobby Code**: Prominently displayed, easy to share
- **Player Status**: Clear indication of current turn and leader
- **Actions**: Primary actions (Create/Join) visually prominent
- **Feedback**: Immediate visual feedback for all interactions

### Accessibility
- **Color Contrast**: Meet WCAG AA standards
- **Focus Management**: Clear focus indicators for keyboard navigation
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Touch Accessibility**: Large touch targets, proper spacing

## Security Considerations

### Data Privacy
- **Anonymous Auth**: No personal data collection
- **Lobby Codes**: Sufficiently random to prevent guessing
- **Data Cleanup**: Auto-delete inactive lobbies

### Firebase Security Rules
```javascript
{
  "rules": {
    "lobbies": {
      "$lobbyCode": {
        ".read": true,
        ".write": "auth != null",
        "players": {
          "$playerId": {
            ".write": "$playerId == auth.uid || root.child('lobbies').child($lobbyCode).child('leaderId').val() == auth.uid"
          }
        }
      }
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Infrastructure
- Set up routing and basic components
- Implement Firebase authentication flow
- Create lobby data structure and basic CRUD operations

### Phase 2: Lobby Management
- Implement lobby creation with code generation
- Add lobby joining with validation
- Build real-time player list with Firebase listeners

### Phase 3: Real-time Features
- Add player connection status tracking
- Implement lobby leader management
- Add game state synchronization

### Phase 4: UI Polish
- Implement mobile-responsive design
- Add ShadCN components for consistent styling
- Optimize touch interactions and accessibility