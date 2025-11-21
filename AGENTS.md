# AGENT INSTRUCTIONS

- Scope: entire repository.
- Prefer TypeScript for server code and keep input validation with Zod when adding/updating API payloads.
- When touching admin or auth flows, ensure role/estado checks remain strict and keep seed credentials documented in README and `.env.example`.
- Favor small, composable React components and reuse existing styling utilities (Tailwind classes like `btn`, `card`, `bg-surface`).
- Update tests or add lightweight integration checks when changing Prisma queries or business rules.
