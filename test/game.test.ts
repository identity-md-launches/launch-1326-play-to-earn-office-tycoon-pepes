import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOST_DURATION,
  BUILDINGS,
  MAX_LEVEL,
  OFFLINE_CAP,
  UPGRADE_COOLDOWN,
  advance,
  baseRate,
  employees,
  freshGame,
  gameReducer,
  parseSave,
  sellPrice,
  trainingCost,
  workScore,
  type Command,
  type GameState,
} from '../src/game.ts';

const START = 1_800_000_000_000;
const run = (s: GameState, command: Command, elapsed = 0) =>
  gameReducer(s, { ...command, now: s.lastTick + elapsed });
function opened() {
  let s = run(freshGame(START), { type: 'mint', roll: 0 });
  s = run(s, { type: 'open', name: 'Little Green Ideas' });
  return run(s, { type: 'hire', id: 1001 });
}

test('entry requires a Pepe; first mint is free and opening charges once', () => {
  let s = freshGame(START);
  s = run(s, { type: 'open', name: 'No ticket' });
  assert.equal(s.company, null);
  assert.equal(s.balance, 1200);
  s = run(s, { type: 'mint', roll: 0.999 });
  assert.equal(s.workers[0].role, 'Intern');
  assert.equal(s.balance, 1200);
  s = run(s, { type: 'open', name: '   ' });
  assert.equal(s.company, null);
  s = run(s, { type: 'open', name: '  Little Green Ideas  ' });
  assert.equal(s.company?.name, 'Little Green Ideas');
  assert.equal(s.balance, 950);
  s = run(s, { type: 'open', name: 'Second company' });
  assert.equal(s.balance, 950);
});

test('earnings accrue per second and collection preserves fractions of a cent', () => {
  let s = opened();
  assert.equal(baseRate(s), 22);
  s = run(s, { type: 'tick' }, 60_000);
  assert.equal(s.pending, 22);
  s = run(s, { type: 'collect' });
  assert.equal(s.balance, 972);
  assert.equal(s.collected, 22);
  assert.equal(s.pending, 0);
  s = run(s, { type: 'collect' }, 10);
  assert.equal(s.balance, 972);
  assert.ok(s.pending > 0 && s.pending < 0.01);
  const value = s.pending + s.balance;
  s = run(s, { type: 'collect' }, 50);
  assert.ok(Math.abs(s.pending + s.balance - (value + (22 * 50) / 60_000)) < 1e-8);
  s = run(s, { type: 'collect' });
  assert.equal(s.collected, 22.02);
});

test('training settles old earnings first and compounds exactly 15%, with increasing costs', () => {
  let s = opened();
  const first = trainingCost(s.workers[0]);
  assert.equal(first, 60);
  s = run(s, { type: 'train', id: 1001 }, 60_000);
  assert.equal(s.pending, 22);
  assert.equal(s.workers[0].level, 2);
  assert.equal(workScore(s.workers[0]), 13.8);
  assert.equal(s.balance, 890);
  assert.equal(trainingCost(s.workers[0]), 99);
  s = run(s, { type: 'tick' }, 60_000);
  assert.equal(s.pending, 45.8);
});

test('a Pepe can occupy only one desk and full offices reject hires', () => {
  let s = opened();
  s = run(s, { type: 'hire', id: 1001 });
  assert.equal(employees(s).length, 1);
  s = { ...s, balance: 10000 };
  for (let i = 0; i < 3; i++) {
    s = run(s, { type: 'mint', roll: 0 });
    s = run(s, { type: 'hire', id: s.nextId - 1 });
  }
  assert.equal(s.workers.length, 4);
  assert.equal(employees(s).length, 3);
  assert.match(s.notice, /Every desk is taken/);
  s = run(s, { type: 'release', id: 1001 });
  s = run(s, { type: 'hire', id: 1004 });
  assert.equal(employees(s).length, 3);
});

test('releasing a trained Pepe frees the desk without resetting their level', () => {
  let s = opened();
  s = run(s, { type: 'train', id: 1001 });
  s = run(s, { type: 'release', id: 1001 });
  assert.equal(s.workers[0].level, 2);
  assert.equal(baseRate(s), 10);
  s = run(s, { type: 'hire', id: 1001 });
  assert.equal(baseRate(s), 23.8);
});

test('upgrades add capacity and base income, enforce a cooldown and stop at headquarters', () => {
  let s = { ...opened(), balance: 100000 };
  s = run(s, { type: 'upgrade' });
  assert.equal(s.company?.level, 1);
  assert.equal(s.balance, 99400);
  const balance = s.balance;
  s = run(s, { type: 'upgrade' }, UPGRADE_COOLDOWN - 1);
  assert.equal(s.company?.level, 1);
  assert.equal(s.balance, balance);
  s = run(s, { type: 'upgrade' }, 1);
  assert.equal(s.company?.level, 2);
  s = run(s, { type: 'upgrade' }, UPGRADE_COOLDOWN);
  s = run(s, { type: 'upgrade' }, UPGRADE_COOLDOWN);
  assert.equal(s.company?.level, 4);
  assert.equal(BUILDINGS[4].desks, 30);
  const atMax = s.balance;
  s = run(s, { type: 'upgrade' }, UPGRADE_COOLDOWN);
  assert.equal(s.company?.level, 4);
  assert.equal(s.balance, atMax);
});

test('unaffordable purchases do not alter balance or ownership', () => {
  let s = { ...opened(), balance: 0 };
  const original = s.workers;
  for (const command of [
    { type: 'mint', roll: 0.9 },
    { type: 'buy', id: 201 },
    { type: 'train', id: 1001 },
    { type: 'upgrade' },
    { type: 'boost' },
  ] as Command[]) {
    s = run(s, command);
    assert.equal(s.balance, 0);
    assert.deepEqual(s.workers, original);
    assert.equal(s.company?.level, 0);
  }
});

test('training cannot exceed level 10 or charge at the cap', () => {
  let s = { ...opened(), balance: 100000 };
  for (let i = 0; i < 12; i++) s = run(s, { type: 'train', id: 1001 });
  assert.equal(s.workers[0].level, MAX_LEVEL);
  const before = s.balance;
  s = run(s, { type: 'train', id: 1001 });
  assert.equal(s.balance, before);
});

test('the last Pepe and employed Pepes cannot be sold', () => {
  let s = opened();
  const before = s.balance;
  s = run(s, { type: 'sell', id: 1001 });
  assert.equal(s.workers.length, 1);
  assert.equal(s.balance, before);
  s = run(s, { type: 'mint', roll: 0.5 });
  const after = s.balance;
  s = run(s, { type: 'sell', id: 1001 });
  assert.equal(s.workers.length, 2);
  assert.equal(s.balance, after);
});

test('selling and buying back retains identity, role, appearance, and training with no duplicate ownership', () => {
  let s = { ...opened(), balance: 10000 };
  s = run(s, { type: 'mint', roll: 0.87 });
  const id = s.nextId - 1;
  s = run(s, { type: 'train', id });
  s = run(s, { type: 'train', id });
  const worker = { ...s.workers.find((w) => w.id === id)! };
  const value = sellPrice(worker);
  const balance = s.balance;
  s = run(s, { type: 'sell', id });
  assert.equal(s.balance, balance + value);
  assert.equal(
    s.workers.some((w) => w.id === id),
    false,
  );
  assert.deepEqual(s.market.find((l) => l.worker.id === id)?.worker, worker);
  s = run(s, { type: 'buy', id });
  assert.deepEqual(
    s.workers.find((w) => w.id === id),
    worker,
  );
  assert.equal(
    s.market.some((l) => l.worker.id === id),
    false,
  );
  const purchasedBalance = s.balance;
  s = run(s, { type: 'buy', id });
  assert.equal(s.balance, purchasedBalance);
});

test('coffee applies a timed 25% boost and expiry splits the earnings interval', () => {
  let s = opened();
  s = run(s, { type: 'boost' });
  assert.equal(s.balance, 890);
  s = run(s, { type: 'boost' });
  assert.equal(s.balance, 890);
  s = run(s, { type: 'tick' }, BOOST_DURATION + 60_000);
  assert.equal(s.pending, 22 * 1.25 * 5 + 22);
  s = run(s, { type: 'boost' });
  assert.equal(s.balance, 830);
});

test('offline accrual is capped at eight hours, does not add play time, and cannot resurrect expired boosts', () => {
  const initial = run(opened(), { type: 'boost' });
  const s = advance(initial, START + OFFLINE_CAP * 2);
  assert.equal(s.pending, 22 * 8 * 60);
  assert.equal(s.playedSeconds, 0);
  const active = run(s, { type: 'tick', active: true }, 1000);
  assert.equal(active.playedSeconds, 1);
});

test('backward clock changes cannot grant negative earnings', () => {
  const s = opened();
  assert.deepEqual(advance(s, START - 10000), s);
});

test('mint odds map all five role boundaries and charge 300 after the free mint', () => {
  let s = { ...opened(), balance: 10000 };
  for (const [roll, role] of [
    [0, 'Intern'],
    [0.45, 'Analyst'],
    [0.75, 'Developer'],
    [0.9, 'Manager'],
    [0.98, 'CEO'],
  ] as const) {
    const balance = s.balance;
    s = run(s, { type: 'mint', roll });
    assert.equal(s.workers.at(-1)?.role, role);
    assert.equal(s.balance, balance - 300);
  }
});

test('save round-trip preserves progression and adds only legitimate offline earnings', () => {
  let s = opened();
  s = run(s, { type: 'train', id: 1001 });
  s = run(s, { type: 'upgrade' });
  const loaded = parseSave(JSON.stringify(s), s.lastTick + 60000)!;
  assert.equal(loaded.company?.name, s.company?.name);
  assert.deepEqual(loaded.workers, s.workers);
  assert.equal(loaded.pending, 38.8);
  assert.equal(loaded.balance, s.balance);
});

test('malformed saves, duplicate IDs, excess desks, unknown roles and invalid currency are rejected', () => {
  assert.equal(parseSave('{broken', START), null);
  const s = opened();
  const invalid = [
    { ...s, balance: -1 },
    { ...s, version: 42 },
    { ...s, nextId: 1001 },
    { ...s, workers: [...s.workers, ...s.workers] },
    { ...s, company: { ...s.company, level: 8 } },
    { ...s, workers: [{ ...s.workers[0], role: 'Wizard' }] },
    { ...s, workers: [{ ...s.workers[0], level: 11 }] },
    { ...s, company: null },
  ];
  for (const value of invalid) assert.equal(parseSave(JSON.stringify(value), START), null);
});

test('multiple same-time actions cannot duplicate collection or purchases', () => {
  let s = run(opened(), { type: 'tick' }, 60000);
  s = run(s, { type: 'collect' });
  const balance = s.balance;
  for (let i = 0; i < 10; i++) s = run(s, { type: 'collect' });
  assert.equal(s.balance, balance);
  assert.equal(s.collected, 22);
  s = run(s, { type: 'buy', id: 201 });
  const paid = s.balance;
  for (let i = 0; i < 10; i++) s = run(s, { type: 'buy', id: 201 });
  assert.equal(s.balance, paid);
  assert.equal(s.workers.filter((w) => w.id === 201).length, 1);
});
