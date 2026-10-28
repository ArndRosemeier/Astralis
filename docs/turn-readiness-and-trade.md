# Turn readiness and trade goods (0.016)

End turn checks the player's editable draft, including undo, cancelled orders and delegation changes. An eligible research project is mandatory while research remains available. Completed, locked and inaccessible entries do not count; repeatable advances do. An enabled research advisor supplies the selection during resolution. When no eligible project exists, research cannot block the turn.

The single-player worker and multiplayer host validate submissions independently of the UI. An expired multiplayer timer cannot bypass missing research: it pauses until affected commanders select or delegate research and submit. Submitted commanders continue waiting. The next resolved turn starts a fresh timer. The deterministic simulation entry point remains usable by replay, balance and headless simulation callers; player submission validation lives at the worker/host boundary.

## Production and revenue

Before submission, manually managed colonies with empty construction queues appear in a review. Each colony links directly to its production controls. The player may schedule construction, review the empire or choose **Produce trade goods & end turn**. Delegated colonies are managed by the advisor and do not require this manual review.

An empty queue at the production phase converts unused industry into credits at **2 industry = 1 credit**. This deliberately makes trade goods a fallback with a lower conversion efficiency than ordinary commerce work. Synthetic population assembly takes its allocation first, including capacity limits. Trade goods require stability of at least 25; outposts cannot manufacture them. They add to net colony income, but not commerce income used by trade treaties. They neither consume nor add stored construction overflow. A queue that finishes during this turn switches to trade goods on the next turn if left empty. Queuing a new project immediately changes the preview back to construction.

The shared output calculation supplies both actual turn income and UI estimates, including the colony panel and empire comparison. Estimates can change during resolution because of combat, settlement and other orders. Existing 0.015 saves remain supported.

## UI flow review

The review covers new-game setup, mandatory research, colony construction/cancellation, idle-production confirmation, invalid draft orders, undo/redo, fleet navigation, ship design, battle replay, field-manual navigation, manual/autosave resume, phone layouts, campaign completion and multiplayer turn submission/host migration.

Additional gaps addressed:

- Research now opens on the current eligible project's tier or the first eligible tier, avoiding a screen full of completed/locked projects when a choice is required.
- Conflicting draft orders are called out on the Turn orders button, with the existing repair/cancel workflow one click away.
- The new review dialog's decorative frame matches its content width, and research guidance stays in its panel rather than persisting as an obsolete toast over later steps.
- Multiplayer timer text explains the research hold and how to continue.

Focused simulation tests cover submission drafts, delegation, locked/completed research, repeatables, an empty research catalog, credit conversion, synthetic assembly, unrest, outposts and the host's deadline behavior. Browser checks exercise the player-facing paths with browser audio muted.

Validation completed: all 128 unit tests, TypeScript, the version check and production build pass. Nineteen distinct browser scenarios passed, including a complete 60-turn campaign, two connected commanders with host migration, the new conflicting-order repair path, and desktop/mobile visual review of the production warning. No claim is made that every possible campaign state has been exhaustively tested.
