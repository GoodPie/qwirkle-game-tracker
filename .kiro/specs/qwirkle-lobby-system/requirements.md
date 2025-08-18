# Requirements Document

## Introduction

The Qwirkle Score Tracker application needs a lobby system that allows players to create and join games using 6-digit passcodes. This system will serve as the foundation for real-time multiplayer score tracking, utilizing Firebase Realtime Database for instant synchronization across all connected devices. The lobby system is designed as a weekend MVP with mobile-first design principles.

## Requirements

### Requirement 1

**User Story:** As a player, I want to create a new game lobby, so that I can invite other players to join my Qwirkle game session.

#### Acceptance Criteria

1. WHEN a user clicks "Create Game" THEN the system SHALL generate a unique 6-character alphanumeric lobby code
2. WHEN a lobby is created THEN the system SHALL store the lobby data in Firebase Realtime Database at `/lobbies/{lobbyCode}`
3. WHEN a lobby is created THEN the system SHALL automatically make the creator the lobby leader
4. WHEN a lobby is created THEN the system SHALL display the lobby code prominently for sharing
5. IF a lobby code collision occurs THEN the system SHALL generate a new unique code

### Requirement 2

**User Story:** As a player, I want to join an existing game lobby using a 6-digit code, so that I can participate in a Qwirkle game with other players.

#### Acceptance Criteria

1. WHEN a user enters a 6-character lobby code THEN the system SHALL validate the code format
2. WHEN a valid lobby code is entered THEN the system SHALL check if the lobby exists in Firebase
3. IF the lobby exists THEN the system SHALL add the player to the lobby's player list
4. IF the lobby does not exist THEN the system SHALL display an error message "Lobby not found"
5. WHEN a player joins successfully THEN all connected players SHALL see the updated player list within 1 second

### Requirement 3

**User Story:** As a lobby leader, I want to control game flow and scoring permissions, so that I can manage the game session effectively.

#### Acceptance Criteria

1. WHEN a lobby is created THEN only the lobby leader SHALL have permission to start games
2. WHEN a lobby is created THEN only the lobby leader SHALL have permission to end games
3. WHEN a lobby is created THEN only the lobby leader SHALL have permission to edit scores
4. WHEN the lobby leader leaves THEN the system SHALL transfer leadership to the next player in the list
5. IF the lobby becomes empty THEN the system SHALL automatically delete the lobby after 5 minutes

### Requirement 4

**User Story:** As a player, I want to see real-time updates of all lobby activities, so that I stay synchronized with other players.

#### Acceptance Criteria

1. WHEN a player joins or leaves THEN all connected players SHALL see the updated player list within 1 second
2. WHEN scores are updated THEN all connected players SHALL see the changes within 1 second
3. WHEN the game state changes THEN all connected players SHALL receive the update immediately
4. WHEN a player loses connection THEN the system SHALL handle the disconnection gracefully
5. WHEN a player reconnects THEN the system SHALL restore their session and current game state

### Requirement 5

**User Story:** As a mobile user, I want a touch-friendly interface, so that I can easily interact with the app on my phone or tablet.

#### Acceptance Criteria

1. WHEN displaying interactive elements THEN all buttons SHALL be minimum 44x44px for touch accessibility
2. WHEN showing the current player's turn THEN the system SHALL highlight their name with a visible border or background color
3. WHEN displaying the lobby code THEN it SHALL be large and easily readable on mobile devices
4. WHEN showing the player list THEN it SHALL be optimized for mobile screen sizes
5. WHEN users interact with the interface THEN all touch targets SHALL provide immediate visual feedback

### Requirement 6

**User Story:** As a developer, I want to use Firebase anonymous authentication and Realtime Database, so that the system can handle real-time synchronization without complex user management.

#### Acceptance Criteria

1. WHEN a user opens the app THEN the system SHALL authenticate them anonymously with Firebase
2. WHEN storing game data THEN the system SHALL use Firebase Realtime Database (not Firestore)
3. WHEN structuring data THEN all game state SHALL be stored in a single lobby object at `/lobbies/{lobbyCode}`
4. WHEN implementing components THEN the system SHALL use React hooks and functional components throughout
5. WHEN styling the interface THEN the system SHALL use Tailwind CSS with ShadCN components

### Requirement 7

**User Story:** As a tester, I want to simulate multiple players easily, so that I can verify the real-time functionality works correctly.

#### Acceptance Criteria

1. WHEN opening multiple browser tabs THEN each tab SHALL represent a different anonymous player
2. WHEN one player makes changes THEN other tabs SHALL reflect those changes within 1 second
3. WHEN testing on mobile devices THEN the functionality SHALL work consistently across different screen sizes
4. WHEN simulating network issues THEN the app SHALL handle reconnections gracefully
5. WHEN multiple players join simultaneously THEN the system SHALL handle concurrent operations correctly