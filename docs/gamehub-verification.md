# Live GameHub transport verification

Verified **2026-10-28 at 00:02:03 UTC** against `https://games.futuremagic.de`, app `astralis`, using the supplied unmodified typed client in `apps/web/src/net/gamehub.ts`.

The app identifier was loaded from local `VITE_GAMEHUB_APP_KEY` and never printed. The test created its own **private** room, used up to three concurrent clients, and did not list, join or mutate any other room. All owned clients leave/close in `finally`; the server's documented empty-room expiry handles removal because the SDK exposes no delete-room method.

## Reproduction

```powershell
pnpm exec tsx tests/gamehub-live.ts
```

The opt-in live test requires a configured local `.env` and network access. It is deliberately separate from the default offline unit-test command. Node 24's native `WebSocket` is used. The script includes `games.futuremagic.de` in `NO_PROXY` for environments with a WebSocket-intercepting proxy. Each operation/event has a timeout of 8 seconds or less; cleanup leave requests have a 1.2-second limit.

Standalone typecheck also passed:

```powershell
pnpm exec tsc --ignoreConfig tests/gamehub-live.ts --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --allowImportingTsExtensions --skipLibCheck --types node
```

## Observed results

**10 of 10 checks passed; process exit code 0.** The complete run took about 4 seconds including connection setup and cleanup.

| Check | Outcome | Check duration |
| --- | --- | ---: |
| Private-room creation and second client join | Host recognised, peer recognised, two players, private flag retained | 58 ms |
| Full snapshot replication | Peer received exact turn-3 state, sequence 1 | 36 ms |
| Absolute delta replication | Peer received turn-4 delta, sequence 2 | 24 ms |
| Player intent directed to host | Intent body and originating player identity preserved | 28 ms |
| Late join with retained history | Snapshot turn 3 followed by delta turn 4, in order | 56 ms |
| History pressure and snapshot repair | Seven approximately 700 KB delta payloads triggered `need-snapshot`; host published fresh turn-5 snapshot successfully | 994 ms |
| Host migration | Closing the original host promoted the surviving lowest-id peer; the new host published turn-6 state | 299 ms |
| Disconnected peer removal | Surviving host received `player-`; old transport identity removed | 27 ms |
| Reconnect and explicit rejoin | New connection had a new identity and no room; joining by retained room code restored turn-6 state | 44 ms |
| Non-host publication rejection | Peer attempting `setState` received `not_host` | 28 ms |

The history-pressure test used less than the 1 MiB per-message maximum and only seven frames, well below the documented 120-message burst threshold. Its padding is test-only and is not part of the game protocol.

## Integration requirements and race hazards

1. **Install state/delta handlers before awaiting `join()`.** Confirmed live: `joined` synchronously emits the retained snapshot and deltas inside the SDK message handler, then resolves the request promise. Registering handlers after `await hub.join(...)` loses the initial state.
2. **Await `hub.ready` before `create`, `join`, `watchLobby` or sending.** The SDK's `raw()` silently drops sends while the WebSocket is not open. A pre-ready request can remain pending indefinitely because the SDK does not queue/resend it or provide a request timeout. This follows directly from the supplied client implementation; the live happy-path test waits correctly.
3. **Add bounded request timeouts at the application layer.** The SDK's `create`, `join` and `leave` promises otherwise wait until a reply or socket closure. Treat a timeout as an uncertain transport outcome; do not create duplicate rooms blindly.
4. **Respond to every `need-snapshot`.** This event was triggered and repaired live. A fresh serialisable authoritative snapshot must be available even when no turn is currently processing.
5. **Reconnection is application-level.** A new WebSocket gets a new player id; display-name equality is not seat ownership. Persist room code plus an application-level resumable seat token, then explicitly rejoin and reauthenticate the seat. The test confirms transport state restoration; seat-token verification belongs to the Astralis wrapper and needs its own tests.
6. **Host migration needs ready state.** Every eligible host must retain the authoritative current simulation, seat mapping, submitted orders and version. On promotion, reconcile connected transport identities and publish the current snapshot before advancing a turn. A new host publishing state was verified; an entire migrated Astralis game is outside this transport test's scope.
7. **Preserve application sequencing during asynchronous compression/decompression.** The transport provides sequence numbers, but an async decoder can finish old snapshots after newer ones. Serialise incoming snapshot application or reject stale application revisions. Only one host may process a given turn.
8. **Keep snapshots below the relay limit.** The test verifies near-limit deltas and history recovery, not the largest full Astralis game. Compressing snapshots and checking encoded byte length must be tested at the largest map size.

## Explicit verification limits

This is a live **transport** test. It does not claim full gameplay, simulation determinism, fog-of-war fairness, seat-token secrecy, browser reconnect UI, cloud save durability, multiplayer version rejection or successful completion of a 120-turn human game. Those require separate wrapper, simulation and browser checks. Empty-room expiry after 60 seconds and data loss on server restart are documented server behaviour, not re-tested by this short run.

Protocol source: [GameHub README](https://github.com/ArndRosemeier/gameserver/blob/main/README.md), [patterns](https://github.com/ArndRosemeier/gameserver/blob/main/docs/PATTERNS.md), and [wire protocol](https://github.com/ArndRosemeier/gameserver/blob/main/docs/PROTOCOL.md).
