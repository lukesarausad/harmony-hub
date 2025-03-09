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

### Prerequisites

- Node.js (v18 or later)
- npm (comes with Node.js)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lukesarausad/harmony-hub.git
   cd harmony-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SESSION_SECRET=your_session_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## Environment Variables

The following environment variables are required:
- `SPOTIFY_CLIENT_ID`: Spotify API client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify API client secret
- `SESSION_SECRET`: Secret for session management

To obtain Spotify credentials:
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Set the redirect URI to `http://localhost:5000/api/auth/spotify/callback`
4. Copy the Client ID and Client Secret to your `.env` file

## Project Structure

```
harmony-hub/
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and schemas
└── ...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.