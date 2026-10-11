export const SAVE_KEY = 'pepe-and-co-save-v1';
export const MAX_LEVEL = 10;
export const OPEN_COST = 250;
export const MINT_COST = 300;
export const UPGRADE_COOLDOWN = 60_000;
export const BOOST_COST = 60;
export const BOOST_DURATION = 300_000;
export const OFFLINE_CAP = 8 * 60 * 60 * 1000;

export const BUILDINGS = [
  { name: 'Garage', desks: 3, base: 10, cost: 0 },
  { name: 'Small Office', desks: 6, base: 25, cost: 600 },
  { name: 'Office Floor', desks: 10, base: 60, cost: 1500 },
  { name: 'Office Tower', desks: 18, base: 140, cost: 4500 },
  { name: 'Headquarters', desks: 30, base: 300, cost: 12000 },
] as const;

export const ROLES = {
  Intern: { base: 12, rarity: 'Common', color: 'green' },
  Analyst: { base: 22, rarity: 'Uncommon', color: 'blue' },
  Developer: { base: 35, rarity: 'Rare', color: 'purple' },
  Manager: { base: 50, rarity: 'Epic', color: 'peach' },
  CEO: { base: 80, rarity: 'Legendary', color: 'gold' },
} as const;
export type Role = keyof typeof ROLES;
export type Worker = {
  id: number;
  name: string;
  role: Role;
  level: number;
  employed: boolean;
  look: number;
};
export type Listing = { worker: Worker; price: number };
export type Company = { name: string; level: number; openedAt: number };
export type Activity = { id: number; text: string; at: number };
export type GameState = {
  version: 1;
  balance: number;
  pending: number;
  collected: number;
  company: Company | null;
  workers: Worker[];
  market: Listing[];
  lastTick: number;
  playedSeconds: number;
  lastUpgradeAt: number;
  boostUntil: number;
  nextId: number;
  firstMinted: boolean;
  activity: Activity[];
  notice: string;
};

export type Action = (
  | { type: 'tick'; active?: boolean }
  | { type: 'mint'; roll: number }
  | { type: 'open'; name: string }
  | { type: 'collect' }
  | { type: 'hire' | 'release' | 'train' | 'sell' | 'buy'; id: number }
  | { type: 'upgrade' | 'boost' }
) & { now: number };
type WithoutTime<T> = T extends unknown ? Omit<T, 'now'> : never;
export type Command = WithoutTime<Action>;

export function freshGame(now: number): GameState {
  return {
    version: 1,
    balance: 1200,
    pending: 0,
    collected: 0,
    company: null,
    workers: [],
    firstMinted: false,
    lastTick: now,
    playedSeconds: 0,
    lastUpgradeAt: 0,
    boostUntil: 0,
    nextId: 1001,
    notice: '',
    activity: [],
    market: [
      {
        worker: { id: 201, name: 'Milo', role: 'Analyst', level: 2, employed: false, look: 1 },
        price: 420,
      },
      {
        worker: { id: 202, name: 'Ada', role: 'Developer', level: 3, employed: false, look: 2 },
        price: 780,
      },
      {
        worker: { id: 203, name: 'Winston', role: 'Manager', level: 4, employed: false, look: 3 },
        price: 1250,
      },
    ],
  };
}

export const workScore = (worker: Worker) =>
  Math.round(ROLES[worker.role].base * 1.15 ** (worker.level - 1) * 10) / 10;
export const trainingCost = (worker: Worker) => Math.ceil(60 * 1.65 ** (worker.level - 1));
export const sellPrice = (worker: Worker) =>
  Math.floor(
    150 + ROLES[worker.role].base * 5 + ((60 * (1.65 ** (worker.level - 1) - 1)) / 0.65) * 0.6,
  );
export const employees = (state: GameState) => state.workers.filter((worker) => worker.employed);
export const teamScore = (state: GameState) =>
  employees(state).reduce((sum, worker) => sum + workScore(worker), 0);
export const baseRate = (state: GameState) =>
  state.company ? BUILDINGS[state.company.level].base + teamScore(state) : 0;
export const earningRate = (state: GameState, now: number) =>
  baseRate(state) * (state.boostUntil > now ? 1.25 : 1);

// Settle elapsed earnings before changing anything that affects the rate.
// Split the interval at boost expiry; offline catch-up is capped at eight hours.
export function advance(state: GameState, now: number, active = false): GameState {
  if (now <= state.lastTick) return state;
  const start = Math.max(state.lastTick, now - OFFLINE_CAP);
  const elapsed = now - start;
  const boosted = Math.max(0, Math.min(now, state.boostUntil) - start);
  return {
    ...state,
    pending: state.pending + (baseRate(state) * (elapsed + boosted * 0.25)) / 60_000,
    playedSeconds: state.playedSeconds + (active ? Math.min(elapsed / 1000, 5) : 0),
    lastTick: now,
  };
}

const message = (state: GameState, text: string, now: number, record = false): GameState => ({
  ...state,
  notice: text,
  activity: record ? [{ id: now, text, at: now }, ...state.activity].slice(0, 12) : state.activity,
});

export function gameReducer(previous: GameState, action: Action): GameState {
  const state = advance(previous, action.now, action.type === 'tick' && action.active === true);
  const inform = (text: string) => message(state, text, action.now);
  const done = (next: GameState, text: string) => message(next, text, action.now, true);
  if (action.type === 'tick') return state;

  if (action.type === 'mint') {
    const cost = state.firstMinted ? MINT_COST : 0;
    if (state.balance < cost) return inform('Collect more earnings to mint another Pepe.');
    const role: Role =
      !state.firstMinted || action.roll < 0.45
        ? 'Intern'
        : action.roll < 0.75
          ? 'Analyst'
          : action.roll < 0.9
            ? 'Developer'
            : action.roll < 0.98
              ? 'Manager'
              : 'CEO';
    const names = ['Pip', 'Fern', 'Bean', 'Olive', 'Basil', 'Clover', 'Moss', 'Sprout'];
    const worker: Worker = {
      id: state.nextId,
      name: names[(state.nextId - 1001) % names.length],
      role,
      level: 1,
      employed: false,
      look: (state.nextId - 1001) % 5,
    };
    return done(
      {
        ...state,
        workers: [...state.workers, worker],
        balance: state.balance - cost,
        nextId: state.nextId + 1,
        firstMinted: true,
      },
      `${worker.name} joined your Pepes. Your new ${role.toLowerCase()} is ready to hire.`,
    );
  }

  if (action.type === 'open') {
    if (state.company) return inform('You already have a company. Keep growing it.');
    if (!state.workers.length) return inform('Mint your first Pepe before opening a company.');
    if (!action.name.trim() || action.name.trim().length > 32)
      return inform('Enter a company name between 1 and 32 characters.');
    if (state.balance < OPEN_COST) return inform('You need 250 $ImdUSD to open a company.');
    return done(
      {
        ...state,
        company: { name: action.name.trim(), level: 0, openedAt: action.now },
        balance: state.balance - OPEN_COST,
      },
      `${action.name.trim()} is open for business. Hire a Pepe to your first desk.`,
    );
  }

  if (action.type === 'collect') {
    // Retain fractions of a cent rather than rounding value into existence.
    const amount = Math.floor(state.pending * 100) / 100;
    if (amount < 0.01) return inform('Earnings are on their way. Check back in a moment.');
    return done(
      {
        ...state,
        pending: state.pending - amount,
        balance: state.balance + amount,
        collected: state.collected + amount,
      },
      `Collected ${formatMoney(amount)} $ImdUSD. A little work pays off.`,
    );
  }

  if (action.type === 'upgrade') {
    if (!state.company) return inform('Open your company before upgrading.');
    const next = BUILDINGS[state.company.level + 1];
    if (!next) return inform('Your headquarters is fully upgraded.');
    if (state.lastUpgradeAt && action.now < state.lastUpgradeAt + UPGRADE_COOLDOWN)
      return inform('Your builders are taking a break. Wait for the upgrade cooldown.');
    if (state.balance < next.cost)
      return inform(`Collect ${formatMoney(next.cost - state.balance)} more $ImdUSD to upgrade.`);
    return done(
      {
        ...state,
        company: { ...state.company, level: state.company.level + 1 },
        balance: state.balance - next.cost,
        lastUpgradeAt: action.now,
      },
      `Welcome to your ${next.name.toLowerCase()}. You now have ${next.desks} desks.`,
    );
  }

  if (action.type === 'boost') {
    if (!state.company || !employees(state).length)
      return inform('Hire a Pepe before buying coffee for the team.');
    if (state.boostUntil > action.now)
      return inform('The team is still enjoying their coffee boost.');
    if (state.balance < BOOST_COST)
      return inform('Collect more earnings. Team coffee costs 60 $ImdUSD.');
    return done(
      { ...state, balance: state.balance - BOOST_COST, boostUntil: action.now + BOOST_DURATION },
      'Coffee is on you. Earnings are boosted by 25% for five minutes.',
    );
  }

  if (action.type === 'buy') {
    const listing = state.market.find((item) => item.worker.id === action.id);
    if (!listing) return inform('This Pepe is no longer on the market.');
    if (state.balance < listing.price) return inform('Collect more earnings to buy this Pepe.');
    return done(
      {
        ...state,
        balance: state.balance - listing.price,
        workers: [...state.workers, { ...listing.worker, employed: false }],
        market: state.market.filter((item) => item.worker.id !== action.id),
        firstMinted: true,
      },
      `${listing.worker.name} joined your Pepes at level ${listing.worker.level}. Their training stays with them.`,
    );
  }

  if (!('id' in action)) return state;
  const worker = state.workers.find((item) => item.id === action.id);
  if (!worker) return inform('That Pepe is no longer in your collection.');
  const update = (changes: Partial<Worker>) =>
    state.workers.map((item) => (item.id === worker.id ? { ...item, ...changes } : item));
  if (action.type === 'hire') {
    if (!state.company) return inform('Open a company to hire your Pepes.');
    if (worker.employed) return inform(`${worker.name} already has a desk.`);
    if (employees(state).length >= BUILDINGS[state.company.level].desks)
      return inform('Every desk is taken. Upgrade your building or free a desk.');
    return done(
      { ...state, workers: update({ employed: true }) },
      `${worker.name} is clocked in. Your company earns ${formatMoney(baseRate({ ...state, workers: update({ employed: true }) }))} $ImdUSD per minute before boosts.`,
    );
  }
  if (action.type === 'release') {
    if (!worker.employed) return inform(`${worker.name} is already available.`);
    return done(
      { ...state, workers: update({ employed: false }) },
      `${worker.name} is off duty. Their level and training are saved.`,
    );
  }
  if (action.type === 'train') {
    if (!state.company) return inform('Open a company to train your Pepes.');
    if (worker.level >= MAX_LEVEL) return inform(`${worker.name} has reached the maximum level.`);
    const cost = trainingCost(worker);
    if (state.balance < cost)
      return inform(
        `Collect ${formatMoney(cost - state.balance)} more $ImdUSD to train ${worker.name}.`,
      );
    return done(
      { ...state, workers: update({ level: worker.level + 1 }), balance: state.balance - cost },
      `${worker.name} reached level ${worker.level + 1}. Their work score is now ${workScore({ ...worker, level: worker.level + 1 })}.`,
    );
  }
  if (action.type === 'sell') {
    if (state.workers.length <= 1)
      return inform('Keep at least one Pepe. It is your ticket to the city.');
    if (worker.employed) return inform('Free this Pepe’s desk before selling them.');
    const price = sellPrice(worker);
    return done(
      {
        ...state,
        balance: state.balance + price,
        workers: state.workers.filter((item) => item.id !== worker.id),
        market: [...state.market, { worker, price: Math.ceil(price * 1.1) }],
      },
      `${worker.name} was sold for ${price} $ImdUSD. Their level ${worker.level} progress stays with them on the market.`,
    );
  }
  return state;
}

export const formatMoney = (amount: number) =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatTime = (seconds: number) =>
  seconds >= 3600
    ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    : `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;

function isWorker(value: unknown): value is Worker {
  if (!value || typeof value !== 'object') return false;
  const w = value as Worker;
  return (
    Number.isSafeInteger(w.id) &&
    w.id > 0 &&
    typeof w.name === 'string' &&
    w.name.length <= 32 &&
    Object.hasOwn(ROLES, w.role) &&
    Number.isInteger(w.level) &&
    w.level >= 1 &&
    w.level <= MAX_LEVEL &&
    typeof w.employed === 'boolean' &&
    Number.isInteger(w.look) &&
    w.look >= 0 &&
    w.look <= 4
  );
}

export function parseSave(raw: string, now: number): GameState | null {
  try {
    const s = JSON.parse(raw) as GameState;
    if (
      !s ||
      s.version !== 1 ||
      !Array.isArray(s.workers) ||
      !s.workers.every(isWorker) ||
      !Array.isArray(s.market)
    )
      return null;
    if (
      !s.market.every(
        (item) =>
          item &&
          isWorker(item.worker) &&
          !item.worker.employed &&
          Number.isFinite(item.price) &&
          item.price > 0,
      )
    )
      return null;
    const ids = [...s.workers.map((w) => w.id), ...s.market.map((l) => l.worker.id)];
    if (new Set(ids).size !== ids.length) return null;
    if (
      ![
        s.balance,
        s.pending,
        s.collected,
        s.lastTick,
        s.playedSeconds,
        s.lastUpgradeAt,
        s.boostUntil,
      ].every((n) => Number.isFinite(n) && n >= 0)
    )
      return null;
    if (
      !Number.isSafeInteger(s.nextId) ||
      s.nextId < 1001 ||
      ids.some((id) => id >= s.nextId) ||
      typeof s.firstMinted !== 'boolean'
    )
      return null;
    if (
      s.company !== null &&
      (!s.company ||
        typeof s.company.name !== 'string' ||
        s.company.name.trim().length < 1 ||
        s.company.name.length > 32 ||
        !Number.isInteger(s.company.level) ||
        s.company.level < 0 ||
        s.company.level >= BUILDINGS.length ||
        !Number.isFinite(s.company.openedAt) ||
        !s.workers.length)
    )
      return null;
    if (employees(s).length > (s.company ? BUILDINGS[s.company.level].desks : 0)) return null;
    if (
      !Array.isArray(s.activity) ||
      !s.activity.every(
        (a) => a && typeof a.text === 'string' && Number.isFinite(a.at) && Number.isFinite(a.id),
      )
    )
      return null;
    return advance(
      { ...s, lastTick: Math.min(s.lastTick, now), activity: s.activity.slice(0, 12), notice: '' },
      now,
    );
  } catch {
    return null;
  }
}
