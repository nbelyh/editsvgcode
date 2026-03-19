# Development Environment Setup

This project automatically detects whether you're running locally or in production:

- **localhost** → Firebase Emulators
- **production domain** → Real Firebase

## Prerequisites

- Node.js and npm
- Firebase CLI: `npm install -g firebase-tools`
- .NET SDK 3.1+ (for the schema converter tool)

## Initial Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Login to Firebase (required for emulators):**

   ```bash
   firebase login
   ```

## Local Development with Firebase Emulators

1. **Start Firebase emulators** (in one terminal):

   ```bash
   npm run emulators
   ```

   This starts:
   - Firestore emulator on port 8080
   - Auth emulator on port 9099
   - Hosting emulator on port 5000
   - Emulator UI on port 4000

2. **Build and watch** (in another terminal):

   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Main app: <http://localhost:5000> (automatically uses emulators)
   - Emulator UI: <http://localhost:4000>

## Deploy to Production

```bash
npm run ship
```

This builds the production bundle and deploys to Firebase hosting.

## How Environment Detection Works

The app checks `window.location.hostname`:

- If `localhost` or `127.0.0.1` → connects to emulators
- Otherwise → connects to production Firebase

No build-time configuration needed - one bundle works everywhere!

## C# Schema Converter

The `convert_schema` project converts SVG XSD schema to JSON for autocomplete.

**Build:**

```bash
cd convert_schema
dotnet build
```

**Run:**

```bash
dotnet run
```

## Notes

- Local emulator data is ephemeral and resets between sessions
- The emulator UI (port 4000) lets you view and manage emulator data
- No environment-specific builds needed
