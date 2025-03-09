# Harmony Hub

A modern music playlist sharing platform that enables users to create, share, and discover playlists with advanced social and interactive features.

## Features

- **User Authentication**: Secure login and registration with Spotify OAuth integration
- **Playlist Management**: Create, edit, and delete personal playlists
- **Social Features**: 
  - Follow other users
  - Activity feed showing recent playlist interactions
  - Comments on playlists
- **Discovery**:
  - Explore page to discover new playlists
  - Personalized playlist recommendations
  - Real-time notifications for social interactions

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **State Management**: TanStack React Query
- **Database**: In-memory storage with Drizzle ORM
- **Authentication**: Passport.js with local and Spotify strategies
- **Routing**: Wouter
- **UI Components**: shadcn/ui with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables are required:
- `SPOTIFY_CLIENT_ID`: Spotify API client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify API client secret
- `SESSION_SECRET`: Secret for session management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
