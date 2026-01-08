# Bread 🍞

A beautiful, distraction-free environment for novel writers.

## Features

- **Distraction-Free Writing**: A minimal interface that puts your words first.
- **Story Graph**: A powerful node-based tool for planning characters, plots, and locations.
    - **Multi-Page Support**: Create separate graphs for different aspects of your story (e.g., "Family Tree", "Timeline").
    - **Persistent**: Automatically saves your work.
    - **Infinite Canvas**: Drag, zoom, and explore your ideas.
- **Project Management**: Organize multiple novel projects.
- **Auto-Save**: Never lose a word.

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Running the App

1.  Clone the repository.
2.  Start the application:
    ```bash
    docker-compose up --build
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technologies

- **Next.js 15**: For modern, server-rendered React.
- **Tailwind CSS**: For beautiful, maintainable styling.
- **React Flow**: For the interactive Story Graph.
- **Zustand**: For simple, robust state management.
- **PostgreSQL**: For reliable data persistence.
- **Framer Motion**: For smooth, premium animations.

## Development

The application is containerized for easy development.
- `app/`: Source code.
- `scripts/`: Database migrations.
