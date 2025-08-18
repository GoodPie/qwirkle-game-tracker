# Implementation Plan

- [x] 1. Set up core infrastructure and React Router

  - Install and configure React Router for client-side routing, utilising the `data` mode (https://reactrouter.com/start/modes#data)
  - Create route structure for lobby home ("/") and lobby room ("/lobby/:code")
  - Set up TypeScript interfaces for Lobby and Player data models
  - Create utility functions for lobby code generation and validation
  - _Requirements: 1.1, 6.4, 6.5_

- [ ] 2. Implement Firebase authentication and connection management

  - Update Firebase configuration to handle authentication state properly
  - Create useFirebaseAuth custom hook to manage anonymous authentication
  - Add connection status tracking and presence detection
  - Write unit tests for authentication flow
  - _Requirements: 6.1, 4.4, 4.5_

- [ ] 3. Create lobby code generation and validation system

  - Implement secure 6-character alphanumeric code generation using crypto.getRandomValues()
  - Add code validation functions with proper format checking
  - Implement collision detection and retry logic for code generation
  - Write unit tests for code generation and validation functions
  - _Requirements: 1.1, 1.5, 2.1_

- [ ] 4. Build lobby management hooks and Firebase operations

  - Create useLobby hook for real-time lobby data synchronization
  - Create useLobbyActions hook with createLobby, joinLobby, and leaveLobby functions
  - Implement Firebase Realtime Database operations for lobby CRUD
  - Add error handling for Firebase operations and network issues
  - Write unit tests for lobby management functions
  - _Requirements: 1.2, 2.2, 2.3, 4.1, 4.2_

- [ ] 5. Implement LobbyHome component with create and join functionality

  - Create LobbyHome component with "Create Game" and "Join Game" buttons
  - Add lobby code input field with validation and error display
  - Implement navigation to lobby room using React Router (useNavigate)
  - Implement mobile-friendly design with minimum 44px touch targets
  - Add loading states and error handling for user feedback
  - Style with Tailwind CSS and ShadCN components
  - _Requirements: 1.4, 2.4, 5.1, 5.3, 5.4_

- [ ] 6. Build LobbyRoom component for game lobby interface

  - Create LobbyRoom component that reads lobby code from URL parameters
  - Display lobby code prominently and add leave lobby functionality with confirmation
  - Implement navigation back to home using React Router (useNavigate)
  - Implement lobby leader identification and permissions
  - Add mobile-responsive layout optimized for touch interaction
  - Style component with proper visual hierarchy and accessibility
  - _Requirements: 3.1, 3.4, 5.2, 5.3, 5.4_

- [ ] 7. Create PlayerList component with real-time updates

  - Build PlayerList component that displays all connected players
  - Implement real-time player list updates using Firebase listeners
  - Add visual indicators for lobby leader and current player turn
  - Handle player connection status and disconnection gracefully
  - Ensure updates appear within 1 second across all connected devices
  - _Requirements: 2.5, 4.1, 4.2, 5.2, 7.2_

- [ ] 8. Implement lobby leader management and permissions

  - Add lobby leader transfer logic when current leader disconnects
  - Implement permission checks for leader-only actions
  - Create UI controls for leader actions (start/end game, manage scores)
  - Add visual feedback for leadership status and permissions
  - Handle edge cases like empty lobbies and simultaneous disconnections
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Add automatic lobby cleanup and connection handling

  - Implement automatic lobby deletion after 5 minutes of inactivity
  - Add graceful handling of player disconnections and reconnections
  - Implement session restoration for reconnecting players
  - Add network status indicators and reconnection feedback
  - Handle concurrent player operations and race conditions
  - _Requirements: 3.5, 4.4, 4.5, 7.4, 7.5_

- [ ] 10. Integrate all components with React Router navigation

  - Update main App.tsx to include React Router setup with BrowserRouter
  - Connect all components with proper state management and data flow
  - Implement navigation between routes using useNavigate and route parameters
  - Add proper cleanup of Firebase listeners on component unmount
  - Test complete user flow from creation to joining to real-time updates
  - _Requirements: 6.4, 7.1, 7.2, 7.3_

- [ ] 11. Add comprehensive error handling and user feedback

  - Implement user-friendly error messages for all failure scenarios
  - Add loading states and progress indicators for async operations
  - Create error boundaries for graceful error recovery
  - Add validation feedback for user inputs and form submissions
  - Test error scenarios including network failures and invalid inputs
  - _Requirements: 2.4, 4.4, 7.4_

- [ ] 12. Optimize mobile experience and accessibility

  - Ensure all interactive elements meet 44px minimum touch target requirement
  - Test and optimize touch interactions and gesture handling
  - Add proper ARIA labels and semantic HTML for screen readers
  - Implement responsive design that works across different screen sizes
  - Test on actual mobile devices and optimize performance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.3_

- [ ] 13. Write comprehensive tests for multi-player scenarios
  - Create integration tests that simulate multiple players using different browser tabs
  - Test real-time synchronization with concurrent player actions
  - Verify that all players see updates within the 1-second requirement
  - Test edge cases like simultaneous joins, leaves, and network issues
  - Add automated tests for lobby lifecycle and state management
  - _Requirements: 7.1, 7.2, 7.3, 7.5_
