<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Frontend-only mockup: all document state lives in `src/lib/dts-store.tsx` (React context, resets on reload); business rules are pure functions in `src/lib/dts-data.ts` so they stay testable.
- Document-specific tracking uses the typed `doc` search parameter on `/track`; PIN unlocks the in-memory document view, not a production security boundary.
- Receipt updates append immutable records with ISO timestamps; signer-list edits retain existing signer IDs and status and add before/after audit entries.
