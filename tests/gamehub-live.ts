/** Isolated live protocol verification. Never joins or alters another user's room.
 * Run: pnpm exec tsx tests/gamehub-live.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { connect, type GameHub, type HubEvents } from '../apps/web/src/net/gamehub.ts';

type State = { protocol: string; turn: number; nonce: string; counter: number };
type Delta = { turn: number; counter: number; padding?: string };
type Intent = { type: 'orders'; nonce: string; orders: string[] };
type Hub = GameHub<State, Delta, Intent>;
const dotenv = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const match = dotenv.match(/^\s*VITE_GAMEHUB_APP_KEY\s*=\s*(.*?)\s*$/m);
const key = process.env.VITE_GAMEHUB_APP_KEY || match?.[1].replace(/^(['"])(.*)\1$/, '$2');
assert(key, 'VITE_GAMEHUB_APP_KEY must be configured locally');
process.env.NO_PROXY = [process.env.NO_PROXY, 'games.futuremagic.de', '127.0.0.1'].filter(Boolean).join(',');
const nonce = `verify-${Date.now().toString(36)}`;
const sockets: Hub[] = [];
const checks: { name: string; milliseconds: number; detail: unknown }[] = [];
let latest: State = { protocol: 'astralis-live-test-1', turn: 3, nonce, counter: 6 };
let roomCode: string | undefined;

function bounded<T>(promise: Promise<T>, description: string, milliseconds = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out: ${description}`)), milliseconds);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

function next<E extends keyof HubEvents<State, Delta, Intent>>(
  hub: Hub, event: E,
  predicate: (...args: Parameters<HubEvents<State, Delta, Intent>[E]>) => boolean = () => true,
): Promise<Parameters<HubEvents<State, Delta, Intent>[E]>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { stop(); reject(new Error(`Timed out waiting for ${String(event)}`)); }, 8000);
    const callback = (...args: Parameters<HubEvents<State, Delta, Intent>[E]>) => {
      if (!predicate(...args)) return;
      clearTimeout(timer);
      stop();
      resolve(args);
    };
    const stop = hub.on(event, callback as HubEvents<State, Delta, Intent>[E]);
  });
}

async function open(name: string): Promise<Hub> {
  const hub = connect<State, Delta, Intent>({ app: 'astralis', appKey: key, name: `QA ${name} ${nonce}` });
  sockets.push(hub);
  await bounded(hub.ready, 'authorised WebSocket connection');
  return hub;
}

async function check(name: string, operation: () => Promise<unknown>): Promise<void> {
  const start = performance.now();
  const detail = await operation();
  checks.push({ name, milliseconds: Math.round(performance.now() - start), detail: detail ?? true });
  console.log(`PASS ${name}`);
}

async function main(): Promise<void> {
  const [a, b] = await Promise.all([open('host'), open('peer')]);
  await check('private room create and second client join', async () => {
    const room = await bounded(a.create({ name: `Astralis QA ${nonce}`, public: false, maxPlayers: 4, meta: { protocol: 'astralis-live-test-1' } }), 'private room creation');
    roomCode = room.id;
    assert.equal(room.public, false);
    await bounded(b.join(room.id), 'second client join');
    assert.equal(a.isHost, true);
    assert.equal(b.isHost, false);
    assert.equal(b.host, a.you);
    assert.equal(b.players.length, 2);
    return { private: true, players: b.players.length };
  });

  await check('snapshot replication', async () => {
    const received = next(b, 'state', state => state.nonce === nonce && state.turn === 3);
    a.setState(latest);
    const [state, seq] = await received;
    assert.deepEqual(state, latest);
    assert(seq >= 1);
    return { turn: state.turn, sequence: seq };
  });

  await check('ordered absolute delta replication', async () => {
    const received = next(b, 'delta', delta => delta.turn === 4 && !delta.padding);
    a.sendDelta({ turn: 4, counter: 7 });
    const [delta, seq] = await received;
    assert.equal(delta.counter, 7);
    assert(seq >= 2);
    return { turn: delta.turn, sequence: seq };
  });

  await check('directed player intent reaches host with sender identity', async () => {
    const received = next(a, 'msg', intent => intent.nonce === nonce);
    b.send({ type: 'orders', nonce, orders: ['probe-to-alpha-centauri'] }, a.you!);
    const [intent, from] = await received;
    assert.equal(from, b.you);
    assert.equal(intent.orders[0], 'probe-to-alpha-centauri');
    return { senderIdentityPreserved: true };
  });

  const c = await open('late');
  await check('late join replays snapshot then delta before join resolves', async () => {
    const history: string[] = [];
    const offState = c.on('state', state => { if (state.nonce === nonce) history.push(`state:${state.turn}`); });
    const offDelta = c.on('delta', delta => { if (!delta.padding) history.push(`delta:${delta.turn}`); });
    await bounded(c.join(roomCode!), 'late join');
    offState(); offDelta();
    assert.deepEqual(history, ['state:3', 'delta:4']);
    return { history, handlersMustPrecedeAwaitJoin: true };
  });

  await check('history pressure triggers need-snapshot and host repairs it', async () => {
    latest = { ...latest, turn: 5, counter: 8 };
    const requested = next(a, 'need-snapshot');
    const repaired = next(b, 'state', state => state.nonce === nonce && state.turn === 5);
    const repair = a.on('need-snapshot', () => a.setState(latest));
    // Seven <1MiB frames exceed the server's4MiB retained-history cap. This
    // stays far below the120-message burst limit and only touches our room.
    const padding = 'x'.repeat(700_000);
    for (let i = 0; i < 7; i++) a.sendDelta({ turn: 5, counter: i, padding });
    await requested;
    await repaired;
    repair();
    return { frames: 7, payloadBytesPerFrame: 700_000, snapshotRepaired: true };
  });

  await check('host migration promotes surviving peer', async () => {
    const promotion = next(b, 'host', id => id === b.you);
    a.close();
    await promotion;
    assert.equal(b.isHost, true);
    latest = { ...latest, turn: 6, counter: 9 };
    const received = next(c, 'state', state => state.nonce === nonce && state.turn === 6);
    b.setState(latest);
    await received;
    return { newHostPublishes: true };
  });

  const oldIdentity = c.you;
  await check('disconnect removes transport identity', async () => {
    const departed = next(b, 'player-', id => id === oldIdentity);
    c.close();
    await departed;
    assert.equal(b.players.some(player => player.id === oldIdentity), false);
    return { oldIdentityRemoved: true };
  });

  const reconnected = await open('late');
  await check('reconnect gets new identity and explicit rejoin restores state', async () => {
    assert.notEqual(reconnected.you, oldIdentity);
    assert.equal(reconnected.room, null);
    const received = next(reconnected, 'state', state => state.nonce === nonce && state.turn === 6);
    await bounded(reconnected.join(roomCode!), 'explicit rejoin');
    const [state] = await received;
    assert.deepEqual(state, latest);
    return { newIdentity: true, roomRejoinRequired: true, transportDoesNotRestoreEmpireSeat: true };
  });

  await check('non-host state publication is rejected', async () => {
    const rejected = next(reconnected, 'error', error => error.code === 'not_host');
    reconnected.setState({ ...latest, counter: 999 });
    const [error] = await rejected;
    assert.equal(error.code, 'not_host');
    return { rejected: 'not_host' };
  });

  console.log(JSON.stringify({ passed: checks.length, verifiedAt: new Date().toISOString(), checks }, null, 2));
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`FAIL ${message.replaceAll(key!, '[redacted]')}`);
  console.error(JSON.stringify({ completedChecks: checks }, null, 2));
  process.exitCode = 1;
} finally {
  // No room-delete API exists: empty private rooms expire server-side after60s.
  await Promise.all(sockets.map(async hub => {
    if (hub.room) {
      try { await bounded(hub.leave(), 'leave owned private room', 1200); } catch { /* already closed */ }
    }
    try { hub.close(); } catch { /* already closed */ }
  }));
}
