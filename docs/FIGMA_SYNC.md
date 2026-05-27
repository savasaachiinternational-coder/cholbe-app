# Syncing onboarding from Figma

Design file: [Cholbe-Pharmacy](https://www.figma.com/design/pwnGPAPU9rTnClzV6Edbgv/Cholbe-Pharmacy?node-id=8577-3024)

## Figma MCP access (required for pixel-perfect build)

The Figma MCP tools could not read this file while implementing onboarding. Authenticated user: `mahamudpino24678@gmail.com` (Starter plan).

To fix:

1. In Figma, open **Cholbe-Pharmacy** → Share → invite `mahamudpino24678@gmail.com` with at least **can view** (edit preferred).
2. In Cursor, ensure the Figma MCP plugin is connected to the same account (Settings → MCP → Figma).
3. Ask the agent to re-run `get_design_context` on node `8577:3024` and child frame IDs from `get_metadata`.

See [Figma rate limits & access](https://www.figma.com/developers/docs/figma-mcp-server-rate-limits-access/) if you hit plan limits (Starter: 6 MCP reads/month).

## Code locations

| Area | Path |
|------|------|
| Slide copy & images | `src/screens/onboarding/onboardingData.ts` |
| Colors / type / spacing | `src/theme/` |
| Pager UI | `src/screens/onboarding/OnboardingScreen.tsx` |
| Components | `src/components/onboarding/` |

## Exporting assets from Figma

1. Select each onboarding illustration frame.
2. Export @2x / @3x PNG (or SVG where appropriate).
3. Place under `src/assets/onboarding/` and reference in `onboardingData.ts`.

## After MCP access works

Update in order:

1. `get_variable_defs` → map to `src/theme/colors.ts`
2. `get_metadata` on `8577:3024` → list every onboarding frame; one `get_design_context` per screen
3. Replace placeholder copy, colors, and illustrations to match Figma
