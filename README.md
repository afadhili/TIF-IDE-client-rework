# TIF-IDE: Client Application

![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

The frontend client for the TIF-IDE collaborative coding platform. Built with React, Vite, and TypeScript, it provides a rich user interface for real-time coding collaboration, featuring a Monaco Editor and a fully functional web-based terminal.

## Features

- **Code Editor**: Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/), supporting syntax highlighting and intellisense.
- **Web Terminal**: Integrated [xterm.js](https://xtermjs.org/) terminal for executing code and running commands.
- **Real-time Collaboration**: Collaborative editing using [Yjs](https://github.com/yjs/yjs) and WebSockets.
- **Modern UI**: Clean and responsive interface built with [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/).
- **File Explorer**: Tree-view file explorer for managing project files.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (icons)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`)
- **Terminal**: [Xterm.js](https://xtermjs.org/) (`@xterm/xterm`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Collaboration**: [Yjs](https://github.com/yjs/yjs), [Socket.io Client](https://socket.io/)

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn package manager

## Installation

1.  Navigate to the client directory:

    ```bash
    cd client
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

## Development

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Production Build

1.  Type-check and build the application:

    ```bash
    npm run build
    ```

    This will generate the production assets in the `dist` directory.

2.  Preview the production build locally:

    ```bash
    npm run preview
    ```

## Project Structure

```
client/
├── src/
│   ├── components/   # Reusable UI components
│   ├── context/      # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and helpers
│   ├── pages/        # Page components (routes)
│   ├── store/        # Zustand state stores
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx       # Main application component
│   ├── main.tsx      # Entry point
│   └── router.tsx    # Route definitions
├── public/           # Static assets
├── index.html        # HTML entry point
├── package.json      # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite configuration
```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Compile TypeScript and build for production.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run preview`: Preview the production build locally.
- `npm start`: Alias for `preview` (runs on port 3001).
