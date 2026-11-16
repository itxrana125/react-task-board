# React Task Board

A simple Kanban-style task board. You can add tasks, move them between three columns (To Do / Doing / Done), edit them, and delete them. Your board is saved in the browser, so your tasks are still there when you come back.

## What It Does

- Add a task to any column
- Drag and drop tasks between columns (or tap the column name buttons on a card — good for mobile)
- Double-click a card to edit its text
- Delete tasks with the trash button
- "Clear Done" removes all finished tasks
- Tasks are saved in your browser's local storage — no server, no account

## Tech Stack

- React 19 (with Vite)
- Tailwind CSS 4
- No other libraries

## How to Run

You need Node.js installed.

```bash
npm install
npm run dev
```

Then open the address shown in the terminal (usually http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

Built with AI assistance (OpenCode).
