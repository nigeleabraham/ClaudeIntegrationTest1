# React App

This project is a minimal React + TypeScript starter scaffolded with Vite.

## Available scripts

- `npm install` — install dependencies
- `npm run dev` — start the local development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build locally

## Environment

To enable summarization, create a `.env` file from `.env.example` and add your API keys:

```bash
cp .env.example .env
```

Then update `.env` with your API keys and Claude version:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_NIGEL_API_KEY_CLAUDE=your_claude_api_key_here
VITE_ANTHROPIC_API_VERSION=2024-10-03
```

The app supports both ChatGPT and Claude providers.

## Project structure

- `src/main.tsx` — application entrypoint
- `src/App.tsx` — main app component
- `src/index.css` — global styles
- `vite.config.ts` — Vite configuration
