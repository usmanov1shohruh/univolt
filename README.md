# Welcome to your Lovable project

## UniVolt — Tashkent Explorer

Полная справка по архитектуре, API, запуску и деплою: **[docs/UNIVOLT_REFERENCE.md](docs/UNIVOLT_REFERENCE.md)**.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Telegram Mini App

This app integrates with [Telegram Web Apps](https://core.telegram.org/bots/webapps) via [`@twa-dev/sdk`](https://github.com/twa-dev/sdk). Initialization lives in [`src/telegram/webApp.ts`](src/telegram/webApp.ts) and runs from [`src/main.tsx`](src/main.tsx).

### Requirements

- **HTTPS** — Telegram only loads Mini Apps over `https://` (except some local tooling).
- **SPA fallback** — the host must serve `index.html` for client routes (same as any Vite/React Router deploy).

### Build and base path

```sh
npm run build
npm run preview   # optional local check of production build
```

If the site is not at the domain root, set the base path when building (see [`vite.config.ts`](vite.config.ts)):

```sh
BASE_PATH=/your-subpath/ npm run build
```

Vite exposes this as `import.meta.env.BASE_URL` for the router `basename`.

### BotFather

1. Create a bot with [@BotFather](https://t.me/BotFather).
2. Set a **Menu Button** or **Web App** URL to your deployed HTTPS URL (must match the path you used for `BASE_PATH`, if any).
3. Open the bot in Telegram and launch the Mini App from the menu.

### Local testing with Telegram

Telegram needs a **public HTTPS** URL. Use a tunnel (e.g. [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)) pointing at `npm run dev` (or `preview`), then temporarily set that URL in BotFather.

### Security note

`initData` is not validated on a server in this project (data is mostly static). If you add authenticated APIs later, verify `initData` with your bot token on the backend; do not trust `initDataUnsafe` alone for sensitive actions.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
