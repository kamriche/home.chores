# home.chores

An interactive Next.js demo for managing household chores with family members or roommates.

**Live preview:** [https://kamriche.github.io/home.chores/](https://kamriche.github.io/home.chores/)

The demo includes:

- Multiple houses, apartments, and shared spaces
- A responsible person for each shared space
- Tenant and family-member management across properties
- Chore assignment by person and room
- Tools and supplies for each chore
- Daily, weekly, and monthly recurrence
- Weekly planning and completion history
- Notification preferences
- Light beige/amber and dark themes

## Technology

- **Frontend:** Next.js App Router
- **Language:** TypeScript
- **UI:** React and Lucide icons
- **Styling:** External CSS in `app/globals.css`

## Run locally

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

The current prototype stores changes in memory, so refreshing the page resets the demo data.

- `app/page.tsx` contains the typed React application.
- `app/globals.css` contains the responsive layout and theme styles.

See [BACKLOG.md](BACKLOG.md) for the implementation roadmap.
