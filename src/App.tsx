import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coffee,
  Coins,
  GraduationCap,
  Leaf,
  Map,
  Menu,
  Plus,
  Settings2,
  ShoppingBag,
  Sparkles,
  Sprout,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { City, BuildingPreview, type Place } from './components/City';
import { Pepe, FrogMark } from './components/Pepe';
import {
  BOOST_COST,
  BUILDINGS,
  MAX_LEVEL,
  MINT_COST,
  OPEN_COST,
  ROLES,
  SAVE_KEY,
  UPGRADE_COOLDOWN,
  employees,
  earningRate,
  formatMoney,
  formatTime,
  freshGame,
  gameReducer,
  parseSave,
  sellPrice,
  teamScore,
  trainingCost,
  workScore,
  type Action,
  type Command,
  type GameState,
  type Worker,
} from './game';

type Route = 'city' | 'company' | 'pepes' | 'market';
type Modal =
  | 'start'
  | 'mint'
  | 'upgrade'
  | 'help'
  | 'settings'
  | 'reset'
  | Place
  | { train: number }
  | { sell: number }
  | null;
const routeFromHash = (): Route =>
  ['company', 'pepes', 'market'].includes(location.hash.slice(1))
    ? (location.hash.slice(1) as Route)
    : 'city';
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? parseSave(raw, Date.now()) : null;
    return {
      game: parsed || freshGame(Date.now()),
      warning:
        raw && !parsed ? 'Your saved game could not be read. A fresh local game is ready.' : '',
    };
  } catch {
    return {
      game: freshGame(Date.now()),
      warning:
        'Browser storage is unavailable. Keep this tab open and download your save before leaving.',
    };
  }
}
const randomRoll = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
const money = (value: number) => (
  <>
    {formatMoney(value)} <span className="currency">$ImdUSD</span>
  </>
);

function ModalShell({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => {
      trigger?.focus();
    };
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    // A completed onboarding step can remove the focused control.
    if (dialog?.open && document.hasFocus() && !dialog.contains(document.activeElement)) {
      dialog.querySelector<HTMLElement>('button:not(:disabled), input, select, summary')?.focus();
    }
  });
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? 'dialog-wide' : ''}`}
      aria-labelledby="dialog-title"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), summary, [tabindex="0"]',
          ) || [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" onClick={close} aria-label="Close dialog">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function Coin({ small = false }: { small?: boolean }) {
  return (
    <span className={`coin ${small ? 'coin-small' : ''}`} aria-hidden="true">
      <Coins size={small ? 14 : 20} />
    </span>
  );
}

function WorkerCard({
  worker,
  game,
  act,
  open,
  marketPrice,
}: {
  worker: Worker;
  game: GameState;
  act: (action: Command) => void;
  open: (modal: Modal) => void;
  marketPrice?: number;
}) {
  const employed = employees(game).length;
  const full = game.company ? employed >= BUILDINGS[game.company.level].desks : false;
  return (
    <article className={`worker-card worker-${ROLES[worker.role].color}`}>
      <div className="worker-art">
        <span className="worker-rarity">{ROLES[worker.role].rarity}</span>
        <span className="worker-number">#{worker.id}</span>
        <Pepe look={worker.look} />
        <span className="worker-level">Level {worker.level}</span>
      </div>
      <div className="worker-body">
        <div className="worker-name-row">
          <h2>{worker.name}</h2>
          {marketPrice === undefined && (
            <span className={`worker-status ${worker.employed ? 'working' : ''}`}>
              <span className="tiny-dot" />
              {worker.employed ? 'At work' : 'Available'}
            </span>
          )}
        </div>
        <p className="worker-role">
          {worker.role} <span>·</span> <Zap size={13} /> {workScore(worker)} work score
        </p>
        {marketPrice !== undefined ? (
          <>
            <div className="market-price">{money(marketPrice)}</div>
            <button
              className="button secondary full-width"
              disabled={game.balance < marketPrice}
              onClick={() => act({ type: 'buy', id: worker.id })}
            >
              <ShoppingBag size={16} />
              Buy {worker.name}
            </button>
            {game.balance < marketPrice && (
              <p className="action-hint">
                Collect {formatMoney(marketPrice - game.balance)} more to buy.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="worker-actions">
              {worker.employed ? (
                <button className="button secondary" onClick={() => open({ train: worker.id })}>
                  <GraduationCap size={16} />
                  Train
                </button>
              ) : (
                <button
                  className="button secondary"
                  disabled={!game.company || full}
                  onClick={() => act({ type: 'hire', id: worker.id })}
                >
                  <BriefcaseBusiness size={15} />
                  {full ? 'Desks full' : 'Hire Pepe'}
                </button>
              )}
              {worker.employed ? (
                <button
                  className="text-button subdued"
                  onClick={() => act({ type: 'release', id: worker.id })}
                >
                  Free desk
                </button>
              ) : (
                <button
                  className="text-button subdued"
                  disabled={game.workers.length <= 1}
                  onClick={() => open({ sell: worker.id })}
                >
                  Sell
                </button>
              )}
            </div>
            {!game.company && <p className="action-hint">Open your company to hire this Pepe.</p>}
          </>
        )}
      </div>
    </article>
  );
}

function GettingStarted({ game, open }: { game: GameState; open: (modal: Modal) => void }) {
  const steps = [game.workers.length > 0, !!game.company, employees(game).length > 0];
  return (
    <div className="getting-started">
      <div className="section-title">
        <h2>A company of your own</h2>
        <span className="soft-label">Your first steps</span>
      </div>
      <div className="start-steps">
        {['Meet your first Pepe', 'Open your little office', 'Put your Pepe to work'].map(
          (label, i) => (
            <button
              key={label}
              onClick={() => open('start')}
              className={`start-step ${steps[i] ? 'complete' : ''}`}
            >
              <span className="step-number">{steps[i] ? <Check size={15} /> : `0${i + 1}`}</span>
              <span>
                {label}
                <small>
                  {['Your first mint is on us', 'A home for big ideas', 'Every second adds up'][i]}
                </small>
              </span>
              <ChevronRight size={17} />
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function App() {
  const [initial] = useState(loadGame);
  const [game, setGame] = useState<GameState>(initial.game);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [modal, setModal] = useState<Modal>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState('Pepe & Co.');
  const [nameError, setNameError] = useState('');
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dismissedNotice, setDismissedNotice] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRoute = useRef(true);
  const now = game.lastTick;
  const team = employees(game);
  const building = BUILDINGS[game.company?.level || 0];
  const nextBuilding = game.company ? BUILDINGS[game.company.level + 1] : undefined;
  const cooling = !!game.lastUpgradeAt && now < game.lastUpgradeAt + UPGRADE_COOLDOWN;
  const boostActive = game.boostUntil > now;
  const close = () => setModal(null);
  const act = (action: Command) => {
    setDismissedNotice('');
    setGame((current) => gameReducer(current, { ...action, now: Date.now() } as Action));
  };

  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setGame((current) =>
          gameReducer(current, {
            type: 'tick',
            now: Date.now(),
            active: document.visibilityState === 'visible',
          }),
        ),
      1000,
    );
    const onVisible = () =>
      setGame((current) => gameReducer(current, { type: 'tick', now: Date.now() }));
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    } catch {
      setStorageWarning(
        'Progress could not be saved. Download your save in settings before leaving.',
      );
    }
  }, [game]);
  useEffect(() => {
    const sync = () => {
      setRoute(routeFromHash());
      setMenuOpen(false);
      setFilter('all');
    };
    const external = (event: StorageEvent) => {
      if (event.key === SAVE_KEY && event.newValue) {
        try {
          const saved = parseSave(event.newValue, JSON.parse(event.newValue).lastTick);
          if (saved)
            setGame((current) =>
              saved.lastTick > current.lastTick ? { ...saved, notice: current.notice } : current,
            );
        } catch {
          /* Ignore malformed writes from another tab. */
        }
      }
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('storage', external);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('storage', external);
    };
  }, []);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    if (!menuOpen) return;
    const trigger = document.getElementById('mobile-menu');
    const drawer = document.querySelector<HTMLElement>('.sidebar');
    const controls = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>('a, button') || []).filter(
        (el) => el.getClientRects().length > 0,
      );
    controls()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
      }
      if (event.key === 'Tab') {
        const items = controls();
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const resized = () => {
      if (window.innerWidth > 800) setMenuOpen(false);
    };
    window.addEventListener('keydown', keyboard);
    window.addEventListener('resize', resized);
    return () => {
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', resized);
      trigger?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (modal) setDismissedNotice(game.notice);
  }, [modal]);
  useEffect(() => {
    // The floating toast clears itself; a notice shown inside a dialog stays until the dialog closes.
    if (modal || !game.notice || game.notice === dismissedNotice) return;
    const timer = window.setTimeout(() => setDismissedNotice(game.notice), 6000);
    return () => window.clearTimeout(timer);
  }, [modal, game.notice, dismissedNotice]);
  useEffect(() => {
    const titles = {
      city: 'Small office. Big dreams.',
      company: 'My company',
      pepes: 'My Pepes',
      market: 'Marketplace',
    };
    document.title = `Pepe & Co. — ${titles[route]}`;
  }, [route]);

  const nav = [
    { id: 'city', label: 'City overview', icon: Map },
    { id: 'company', label: 'My company', icon: Building2 },
    { id: 'pepes', label: 'My Pepes', icon: Users },
    { id: 'market', label: 'Marketplace', icon: ShoppingBag },
  ];
  const openPlace = (place: Place) =>
    setModal(place === 'office' ? (game.company ? 'office' : 'start') : place);
  const openCompany = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setNameError('Give your company a name to continue.');
      document.getElementById('company-name')?.focus();
      return;
    }
    setNameError('');
    act({ type: 'open', name });
  };
  const downloadSave = () => {
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pepe-and-co-save.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const companyCard = (
    <section className="company-card">
      <div className="company-card-heading">
        <span className="icon-tile">
          <Building2 size={19} />
        </span>
        <h2>Your company</h2>
        <span className="level-badge">Lv. {game.company ? game.company.level + 1 : 1}</span>
      </div>
      <div className="office-preview">
        <BuildingPreview level={game.company?.level || 0} staff={team.length} />
        <span className="plot-label">Plot 08 · Clover Street</span>
      </div>
      <div className="company-card-content">
        <h3>{game.company?.name || 'No company yet'}</h3>
        <p>
          {game.company
            ? `${building.name} · ${building.desks} desks`
            : 'Mint a Pepe, then open a garage with three desks for 250 $ImdUSD.'}
        </p>
        {game.company ? (
          <>
            <div className="office-capacity">
              <span>
                <Users size={14} /> Desks occupied
              </span>
              <strong>
                {team.length} / {building.desks}
              </strong>
            </div>
            <div
              className="desk-meter"
              role="img"
              aria-label={`${team.length} of ${building.desks} desks occupied`}
            >
              {Array.from({ length: building.desks }, (_, i) => (
                <span key={i} className={i < team.length ? 'filled' : ''} />
              ))}
            </div>
            {nextBuilding ? (
              <button className="button secondary full-width" onClick={() => setModal('upgrade')}>
                <Building2 size={17} />
                Upgrade building
                <ArrowUpRight size={16} />
              </button>
            ) : (
              <div className="max-level">
                <BadgeCheck size={18} />
                You made it to headquarters.
              </div>
            )}
            <p className="card-footnote">
              {cooling
                ? `Builders back in ${Math.ceil((game.lastUpgradeAt + UPGRADE_COOLDOWN - now) / 1000)}s`
                : nextBuilding
                  ? `Next up: ${nextBuilding.name} · ${nextBuilding.desks} desks`
                  : 'Headquarters · 30 desks'}
            </p>
          </>
        ) : (
          <>
            <button className="button primary full-width" onClick={() => setModal('start')}>
              {game.workers.length ? 'Open your company' : 'Mint your first Pepe'}
              <ArrowRight size={17} />
            </button>
            <p className="card-footnote">Your first Pepe is free.</p>
          </>
        )}
      </div>
    </section>
  );

  const earnings = (
    <section className="earnings-card">
      <div className="earnings-label">
        <span>
          <Coins size={17} /> Ready to collect
        </span>
        <span className="earning-live">
          <span className="tiny-dot" />
          {game.company ? 'Earning live' : 'Your next chapter'}
        </span>
      </div>
      <div className="earnings-main">
        <div>
          <strong className="earnings-value">{formatMoney(game.pending)}</strong>
          <span className="earnings-currency">$ImdUSD</span>
        </div>
        <button
          className="button primary collect-button"
          disabled={!game.company || game.pending < 0.01}
          onClick={() => act({ type: 'collect' })}
        >
          <ArrowDownToLine size={17} />
          Collect
        </button>
      </div>
      <div className="earnings-footer">
        <span>
          <TrendingUp size={15} />
          <b>{formatMoney(earningRate(game, now))}</b> / min
        </span>
        {boostActive && <span>1.25× coffee boost</span>}
      </div>
    </section>
  );

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <aside
        className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}
        aria-label={menuOpen ? 'Main navigation' : 'Main sidebar'}
        role={menuOpen ? 'dialog' : undefined}
        aria-modal={menuOpen ? true : undefined}
      >
        <a href="#city" className="brand" aria-label="Pepe and Co. home">
          <FrogMark />
          <span>
            pepe<span className="brand-amp"> & </span>co.<small>A little office tycoon</small>
          </span>
        </a>
        <div className="sidebar-nav-wrap">
          <div className="sidebar-neighbourhood">
            <span className="tiny-dot" /> Lilypad Valley
          </div>
          <nav aria-label="Main navigation">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className={`nav-item ${route === item.id ? 'active' : ''}`}
                aria-current={route === item.id ? 'page' : undefined}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.id === 'pepes' && game.workers.length > 0 && (
                  <span className="nav-count">{game.workers.length}</span>
                )}
                {route === item.id && <span className="nav-active-dot" />}
              </a>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="sidebar-help" onClick={() => setModal('help')}>
            <CircleHelp size={18} />
            How to play
          </button>
          <div className="sidebar-family">
            <FrogMark />
            <span>
              Part of the Pepe family<small>Simulated play, no wallet</small>
            </span>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="app-body" inert={menuOpen}>
        <header className="topbar">
          <div className="topbar-greeting">
            <button
              id="mobile-menu"
              className="icon-button mobile-menu"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="mobile-brand">pepe & co.</span>
          </div>
          <button className="local-badge" onClick={() => setModal('help')}>
            <span className="tiny-dot" />
            Simulated play<span className="local-badge-detail"> · No wallet or real money</span>
          </button>
          <div className="topbar-actions">
            <div className="wallet" role="group" aria-label="Balance in simulated ImdUSD">
              <Coin small />
              <strong data-testid="balance">{formatMoney(game.balance)}</strong>
              <span>$ImdUSD</span>
            </div>
            <button
              className="icon-button settings-button"
              onClick={() => setModal('settings')}
              aria-label="Game settings"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          {storageWarning && (
            <div className="storage-warning" role="alert">
              {storageWarning}
              <button className="text-button" onClick={downloadSave}>
                Download save
              </button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <h1 ref={headingRef} tabIndex={-1}>
                {route === 'city'
                  ? 'Small office. Big dreams.'
                  : route === 'company'
                    ? game.company?.name || 'My company'
                    : route === 'pepes'
                      ? 'My Pepes'
                      : 'Marketplace'}
              </h1>
              <p>
                {route === 'city'
                  ? 'A cosy office tycoon, built for the Pepe family.'
                  : route === 'company'
                    ? 'Earnings, building progress and the company journal.'
                    : route === 'pepes'
                      ? 'Hire, train and sell the Pepes you own.'
                      : 'Trained Pepes for sale. Prices in simulated $ImdUSD.'}
              </p>
            </div>
            <div className="page-heading-action">
              {route === 'city' ? null : route === 'pepes' || route === 'market' ? (
                <button className="button primary" onClick={() => setModal('mint')}>
                  <Plus size={17} />
                  Mint a Pepe
                </button>
              ) : (
                game.company && (
                  <button className="button secondary" onClick={() => setModal('upgrade')}>
                    <Building2 size={17} />
                    View building
                  </button>
                )
              )}
            </div>
          </div>
          {route === 'city' && (
            <>
              {!game.company && (
                <div className="mobile-start">
                  <div>
                    <Sprout size={23} />
                    <span>
                      Your first Pepe is on us.<small>Start your own office tycoon.</small>
                    </span>
                  </div>
                  <button className="button primary" onClick={() => setModal('start')}>
                    {game.workers.length ? 'Open company' : 'Start playing'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
              <div className="overview-stats">
                {earnings}
                <section className="stat-card">
                  <div className="stat-label">
                    <span className="stat-icon">
                      <Zap size={17} />
                    </span>{' '}
                    Team work score
                  </div>
                  <strong>
                    {teamScore(game).toLocaleString('en-US', { maximumFractionDigits: 1 })}
                    <span>pts</span>
                  </strong>
                </section>
                <section className="stat-card">
                  <div className="stat-label">
                    <span className="stat-icon peach">
                      <Users size={18} />
                    </span>{' '}
                    Happy at work
                  </div>
                  <strong>
                    {team.length}
                    <span>/ {game.company ? building.desks : 3} desks</span>
                  </strong>
                </section>
              </div>
              <div className="city-layout">
                <div className="city-main">
                  <City
                    level={game.company?.level || 0}
                    staff={team.length}
                    looks={team.map((worker) => worker.look)}
                    companyName={game.company?.name}
                    cityTime={game.playedSeconds}
                    onPlace={openPlace}
                  />
                </div>
                <aside className="city-side">
                  {companyCard}
                  <button className="coffee-card" onClick={() => setModal('cafe')}>
                    <span className="coffee-illustration">
                      <Coffee size={28} />
                    </span>
                    <span>
                      <strong>
                        {boostActive ? 'Coffee boost active' : `Team coffee · ${BOOST_COST} $ImdUSD`}
                      </strong>
                      <small>
                        {boostActive
                          ? `${formatTime((game.boostUntil - now) / 1000)} of +25% earnings left`
                          : '+25% earnings for 5 minutes'}
                      </small>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                </aside>
              </div>
              {!game.company || !team.length ? (
                <GettingStarted game={game} open={setModal} />
              ) : (
                <section className="team-preview">
                  <div className="section-title">
                    <div>
                      <h2>The dream team</h2>
                      <span className="section-subtitle">
                        Good company makes all the difference.
                      </span>
                    </div>
                    <a className="text-link" href="#pepes">
                      Manage Pepes
                      <ArrowRight size={16} />
                    </a>
                  </div>
                  <div className="team-preview-grid">
                    {team.slice(0, 3).map((worker) => (
                      <button
                        className="employee-row"
                        key={worker.id}
                        onClick={() => setModal({ train: worker.id })}
                      >
                        <span className={`employee-portrait worker-${ROLES[worker.role].color}`}>
                          <Pepe look={worker.look} />
                        </span>
                        <span className="employee-name">
                          <strong>{worker.name}</strong>
                          <small>
                            {worker.role} · Level {worker.level}
                          </small>
                        </span>
                        <span className="employee-score">
                          <Zap size={13} />
                          {workScore(worker)}
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    ))}
                    {team.length < building.desks && (
                      <a className="empty-desk" href="#pepes">
                        <span>
                          <Plus size={19} />
                        </span>
                        <strong>
                          A desk with your name on it<small>Hire your next Pepe</small>
                        </strong>
                        <ArrowRight size={17} />
                      </a>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
          {route === 'company' && (
            <div className="company-page">
              <div className="company-page-main">
                {earnings}
                <section className="content-card">
                  <div className="section-title">
                    <h2>A little work adds up</h2>
                    <span className="soft-label">Earnings breakdown</span>
                  </div>
                  <p className="formula-description">(Building base + team score) × boosts</p>
                  <div className="formula">
                    <div>
                      <span>Building base</span>
                      <strong>
                        {game.company ? building.base : 0}
                        <small>/ min</small>
                      </strong>
                    </div>
                    <div>
                      <span>Team score</span>
                      <strong>
                        {teamScore(game).toFixed(1)}
                        <small>pts</small>
                      </strong>
                    </div>
                    <div>
                      <span>Boosts</span>
                      <strong>
                        {boostActive ? '1.25' : '1'}
                        <small>×</small>
                      </strong>
                    </div>
                  </div>
                  <div className="formula-result">
                    <span>Your company earns</span>
                    <strong>{money(earningRate(game, now))} / min</strong>
                  </div>
                  <p className="muted small-text">
                    Earnings grow every second. Collect them to spend on your team and office. Away
                    from the city? Your company keeps earning for up to 8 hours.
                  </p>
                </section>
                <section className="content-card">
                  <div className="section-title">
                    <h2>Room to grow</h2>
                    <span className="soft-label">Your building journey</span>
                  </div>
                  <div className="building-journey">
                    {BUILDINGS.map((item, i) => (
                      <div
                        className={`journey-stop ${game.company && i <= game.company.level ? 'reached' : ''}`}
                        key={item.name}
                      >
                        <span>
                          {game.company && i < game.company.level ? (
                            <Check size={16} />
                          ) : (
                            <Building2 size={18} />
                          )}
                        </span>
                        <strong>{item.name}</strong>
                        <small>
                          {item.desks} desks · +{item.base}/min
                        </small>
                      </div>
                    ))}
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => setModal(game.company ? 'upgrade' : 'start')}
                  >
                    {game.company ? 'Plan your next upgrade' : 'Open your company'}
                    <ArrowRight size={16} />
                  </button>
                </section>
                <section className="content-card">
                  <div className="section-title">
                    <h2>Company journal</h2>
                    <Clock3 size={19} />
                  </div>
                  {game.activity.length ? (
                    <ol className="activity-list">
                      {game.activity.slice(0, 6).map((entry, i) => (
                        <li key={`${entry.id}-${i}`}>
                          <span className="activity-dot" />
                          <span>{entry.text}</span>
                          <time>
                            {new Date(entry.at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </time>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="empty-inline">
                      <Sprout size={25} />
                      <p>Every company has a first chapter. Mint a Pepe to begin yours.</p>
                      <button className="text-button" onClick={() => setModal('start')}>
                        Start your story
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </section>
              </div>
              <aside className="company-page-side">
                {companyCard}
                <section className="content-card lifetime-stats">
                  <h2>Your time well spent</h2>
                  <div>
                    <span>Total collected</span>
                    <strong>{money(game.collected)}</strong>
                  </div>
                  <div>
                    <span>Time in the city</span>
                    <strong>{formatTime(game.playedSeconds)}</strong>
                  </div>
                  <div>
                    <span>Pepe collection</span>
                    <strong>
                      {game.workers.length} {game.workers.length === 1 ? 'Pepe' : 'Pepes'}
                    </strong>
                  </div>
                </section>
              </aside>
            </div>
          )}
          {route === 'pepes' && (
            <>
              <div className="collection-toolbar">
                <div className="filter-buttons" role="group" aria-label="Filter your Pepes">
                  {[
                    { id: 'all', label: 'All Pepes', count: game.workers.length },
                    { id: 'working', label: 'At work', count: team.length },
                    {
                      id: 'available',
                      label: 'Available',
                      count: game.workers.length - team.length,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={filter === item.id ? 'selected' : ''}
                      aria-pressed={filter === item.id}
                      onClick={() => setFilter(item.id)}
                    >
                      {item.label}
                      <span>{item.count}</span>
                    </button>
                  ))}
                </div>
                <span className="collection-note">
                  <BadgeCheck size={16} />
                  Training stays with your Pepe
                </span>
              </div>
              {game.workers.filter(
                (w) => filter === 'all' || (filter === 'working' ? w.employed : !w.employed),
              ).length ? (
                <div className="worker-grid">
                  {game.workers
                    .filter(
                      (w) => filter === 'all' || (filter === 'working' ? w.employed : !w.employed),
                    )
                    .map((worker) => (
                      <WorkerCard
                        key={worker.id}
                        worker={worker}
                        game={game}
                        act={act}
                        open={setModal}
                      />
                    ))}
                  <button className="mint-card" onClick={() => setModal('mint')}>
                    <span className="mint-plus">
                      <Plus size={27} />
                    </span>
                    <strong>Room for one more?</strong>
                    <span>Meet your next favourite coworker.</span>
                    <span className="mint-cost">Mint a Pepe · {MINT_COST} $ImdUSD</span>
                  </button>
                </div>
              ) : (
                <section className="empty-collection">
                  <div className="empty-pepe">
                    <Pepe />
                  </div>
                  <h2>
                    {game.workers.length
                      ? filter === 'working'
                        ? 'A quiet day at the office.'
                        : 'Everyone is hard at work.'
                      : 'Your dream team starts with one.'}
                  </h2>
                  <p>
                    {game.workers.length
                      ? filter === 'working'
                        ? 'Give an available Pepe a desk to start growing your team.'
                        : 'Mint another Pepe, or free a desk to make a worker available.'
                      : 'Mint your first Pepe for free. A new career, a new company, a little possibility.'}
                  </p>
                  <button
                    className="button secondary"
                    onClick={() =>
                      game.workers.length && filter === 'working'
                        ? setFilter('all')
                        : setModal('mint')
                    }
                  >
                    {game.workers.length && filter === 'working' ? 'Show all Pepes' : 'Mint a Pepe'}
                    <ArrowRight size={16} />
                  </button>
                </section>
              )}
              <p className="collection-footnote">
                <CircleHelp size={15} />
                One Pepe, one desk. Free their desk before selling. Keep one Pepe as your ticket to
                the city.
              </p>
            </>
          )}
          {route === 'market' && (
            <>
              <div className="collection-toolbar">
                <h2>
                  Meet the talent{' '}
                  <span className="soft-label">
                    {
                      game.market.filter(
                        (l) => roleFilter === 'all' || l.worker.role === roleFilter,
                      ).length
                    }{' '}
                    available
                  </span>
                </h2>
                <label className="role-filter">
                  Role
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All roles</option>
                    {Object.keys(ROLES).map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="worker-grid">
                {game.market
                  .filter((l) => roleFilter === 'all' || l.worker.role === roleFilter)
                  .map((listing) => (
                    <WorkerCard
                      key={listing.worker.id}
                      worker={listing.worker}
                      marketPrice={listing.price}
                      game={game}
                      act={act}
                      open={setModal}
                    />
                  ))}
              </div>
              {!game.market.filter((l) => roleFilter === 'all' || l.worker.role === roleFilter)
                .length && (
                <div className="empty-collection">
                  <ShoppingBag size={38} />
                  <h2>
                    {roleFilter === 'all'
                      ? 'You know all the talent.'
                      : `No ${roleFilter.toLowerCase()}s here just yet.`}
                  </h2>
                  <p>
                    {roleFilter === 'all'
                      ? 'Mint a new Pepe to keep growing your collection.'
                      : 'Try another role or mint a Pepe to discover someone new.'}
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => (roleFilter === 'all' ? setModal('mint') : setRoleFilter('all'))}
                  >
                    {roleFilter === 'all' ? 'Mint a Pepe' : 'Show all roles'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <span className="save-dot" />
              {storageWarning ? 'Save needs attention' : 'Saved on this device'}
            </span>
            <span>
              <Clock3 size={13} />
              {formatTime(game.playedSeconds)} in the city
            </span>
          </footer>
        </main>
      </div>
      <div
        className={`toast ${!modal && game.notice && game.notice !== dismissedNotice ? 'toast-visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {!modal && game.notice && game.notice !== dismissedNotice && (
          <>
            <span className="toast-icon">
              <Leaf size={19} />
            </span>
            <span>{game.notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setDismissedNotice(game.notice)}
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>

      {modal && (
        <ModalShell
          title={
            typeof modal === 'object'
              ? `${'train' in modal ? 'Train' : 'Sell'} ${
                  game.workers.find((w) => w.id === ('train' in modal ? modal.train : modal.sell))
                    ?.name || 'Pepe'
                }`
              : modal === 'start'
                ? !game.workers.length
                  ? 'Mint your first Pepe'
                  : !game.company
                    ? 'Open your company'
                    : !team.length
                      ? 'Hire your first Pepe'
                      : 'You are open for business'
                : modal === 'mint'
                  ? 'Mint a Pepe'
                  : modal === 'upgrade'
                    ? 'Upgrade your building'
                    : modal === 'help'
                      ? 'How to play'
                      : modal === 'settings'
                        ? 'Settings'
                        : modal === 'reset'
                          ? 'Reset your local game?'
                          : modal === 'cafe'
                            ? 'Lily’s café'
                            : modal === 'labs'
                              ? 'Lilypad Labs'
                              : modal === 'plaza'
                                ? 'The little plaza'
                                : game.company?.name || 'Your company'
          }
          close={close}
          wide={modal === 'help'}
        >
          <div className="dialog-status" role="status" aria-live="polite">
            {game.notice && game.notice !== dismissedNotice ? game.notice : ''}
          </div>
          {modal === 'start' && (
            <>
              <div
                className="onboarding-progress"
                role="group"
                aria-label={`Step ${!game.workers.length ? 1 : !game.company ? 2 : !team.length ? 3 : 3} of 3`}
              >
                {['Mint', 'Open', 'Hire'].map((text, i) => (
                  <span
                    key={text}
                    className={
                      (i === 0 ? game.workers.length > 0 : i === 1 ? !!game.company : !!team.length)
                        ? 'done'
                        : ''
                    }
                  >
                    <span>{i + 1}</span>
                    {text}
                  </span>
                ))}
              </div>
              {!game.workers.length ? (
                <>
                  <div className="mint-reveal">
                    <Pepe />
                    <span className="reveal-badge">Your first Pepe is free</span>
                  </div>
                  <p className="dialog-description">
                    Meet Pip. A hopeful intern with 12 work score and a whole career ahead. Your
                    Pepe is your ticket to the city.
                  </p>
                  <div className="local-note">
                    <Sparkles size={16} />
                    <span>
                      Local play · Simulated NFTs and $ImdUSD. No wallet or real money needed.
                    </span>
                  </div>
                  <button
                    className="button primary full-width"
                    onClick={() => act({ type: 'mint', roll: 0 })}
                  >
                    Mint my first Pepe
                    <ArrowRight size={17} />
                  </button>
                </>
              ) : !game.company ? (
                <>
                  <div className="onboarding-office">
                    <BuildingPreview />
                  </div>
                  <p className="dialog-description">
                    A garage, three desks, and all the potential in the world. Opening your company
                    costs a one-time 250 $ImdUSD.
                  </p>
                  <form onSubmit={openCompany} noValidate>
                    <label className="field-label" htmlFor="company-name">
                      Company name
                    </label>
                    <input
                      id="company-name"
                      name="companyName"
                      maxLength={32}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      aria-invalid={!!nameError}
                      aria-describedby={nameError ? 'name-error' : 'name-hint'}
                      autoComplete="organization"
                      autoFocus
                    />
                    <p
                      className={nameError ? 'field-error' : 'field-hint'}
                      id={nameError ? 'name-error' : 'name-hint'}
                    >
                      {nameError || 'Make it yours. Up to 32 characters.'}
                    </p>
                    <div className="cost-row">
                      <span>Your balance</span>
                      <strong>{money(game.balance)}</strong>
                    </div>
                    <button className="button primary full-width" type="submit">
                      Open company · {OPEN_COST} $ImdUSD
                      <ArrowRight size={17} />
                    </button>
                  </form>
                </>
              ) : !team.length ? (
                <>
                  <p className="dialog-description">
                    Your office is ready. Give a Pepe a desk and turn their work score into a little
                    extra income.
                  </p>
                  {game.workers.map((worker) => (
                    <div className="hire-row" key={worker.id}>
                      <span className="hire-portrait">
                        <Pepe look={worker.look} />
                      </span>
                      <span>
                        <strong>{worker.name}</strong>
                        <small>
                          {worker.role} · {workScore(worker)} work score
                        </small>
                      </span>
                      <button
                        className="button secondary"
                        onClick={() => act({ type: 'hire', id: worker.id })}
                      >
                        Hire Pepe
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="success-illustration">
                    <BadgeCheck size={49} />
                  </div>
                  <p className="dialog-description">
                    {game.company.name} is earning {formatMoney(earningRate(game, now))} $ImdUSD per
                    minute. Collect your earnings, train your team, and grow at your own pace.
                  </p>
                  <button
                    className="button primary full-width"
                    onClick={() => {
                      close();
                      location.hash = 'city';
                    }}
                  >
                    Explore your city
                    <ArrowRight size={17} />
                  </button>
                </>
              )}
            </>
          )}
          {modal === 'mint' && (
            <>
              <div className="mint-reveal">
                <Pepe look={(game.nextId - 1001) % 5} />
                <span className="reveal-badge">
                  {game.firstMinted ? `${MINT_COST} $ImdUSD` : 'Your first Pepe is free'}
                </span>
              </div>
              <p className="dialog-description">
                Every Pepe has a role, a work score, and their own kind of charm. Train them to help
                your company grow.
              </p>
              <details className="mint-odds">
                <summary>See role chances and starting scores</summary>
                <ul>
                  {Object.entries(ROLES).map(([role, data], i) => (
                    <li key={role}>
                      <span>
                        {role} · {data.base} score
                      </span>
                      <strong>{[45, 30, 15, 8, 2][i]}%</strong>
                    </li>
                  ))}
                </ul>
                <p>Your free first Pepe is always an Intern.</p>
              </details>
              <div className="cost-row">
                <span>Your balance</span>
                <strong>{money(game.balance)}</strong>
              </div>
              <button
                className="button primary full-width"
                disabled={game.firstMinted && game.balance < MINT_COST}
                onClick={() => {
                  act({ type: 'mint', roll: randomRoll() });
                  close();
                  location.hash = 'pepes';
                }}
              >
                Mint a Pepe · {game.firstMinted ? `${MINT_COST} $ImdUSD` : 'Free'}
                <Sparkles size={17} />
              </button>
              {game.firstMinted && game.balance < MINT_COST && (
                <p className="action-hint">
                  Collect {formatMoney(MINT_COST - game.balance)} more $ImdUSD to mint.
                </p>
              )}
              <p className="dialog-footnote">A simulated NFT, saved to this browser.</p>
            </>
          )}
          {(modal === 'upgrade' || modal === 'office') && (
            <>
              <div className="onboarding-office">
                <BuildingPreview level={game.company?.level || 0} staff={team.length} />
              </div>
              <div className="office-dialog-name">
                <h3>{building.name}</h3>
                <span className="soft-label">Level {(game.company?.level || 0) + 1} of 5</span>
              </div>
              <p className="dialog-description">
                {building.desks} desks. {building.base} $ImdUSD base earnings per minute. A little
                more room for your ambitions.
              </p>
              {nextBuilding ? (
                <>
                  <div className="upgrade-comparison">
                    <span>
                      Next chapter<strong>{nextBuilding.name}</strong>
                    </span>
                    <span>
                      Desks
                      <strong>
                        {building.desks} → {nextBuilding.desks}
                      </strong>
                    </span>
                    <span>
                      Base / min
                      <strong>
                        {building.base} → {nextBuilding.base}
                      </strong>
                    </span>
                  </div>
                  <div className="cost-row">
                    <span>One-time upgrade</span>
                    <strong>{money(nextBuilding.cost)}</strong>
                  </div>
                  <button
                    className="button primary full-width"
                    disabled={cooling || game.balance < nextBuilding.cost}
                    onClick={() => {
                      act({ type: 'upgrade' });
                      close();
                    }}
                  >
                    Upgrade to {nextBuilding.name}
                    <ArrowUpRight size={17} />
                  </button>
                  <p className="action-hint">
                    {cooling
                      ? `Your builders need ${Math.ceil((game.lastUpgradeAt + UPGRADE_COOLDOWN - now) / 1000)} more seconds before the next upgrade.`
                      : game.balance < nextBuilding.cost
                        ? `Collect ${formatMoney(nextBuilding.cost - game.balance)} more $ImdUSD to upgrade.`
                        : 'Your new office is ready instantly. A 60-second cooldown follows each upgrade.'}
                  </p>
                </>
              ) : (
                <div className="max-level">
                  <BadgeCheck size={20} />
                  You’ve built your very own headquarters.
                </div>
              )}
            </>
          )}
          {typeof modal === 'object' &&
            'train' in modal &&
            (() => {
              const worker = game.workers.find((w) => w.id === modal.train);
              if (!worker) return <p>This Pepe is no longer in your collection.</p>;
              const max = worker.level >= MAX_LEVEL;
              return (
                <>
                  <div className="training-profile">
                    <span className={`training-portrait worker-${ROLES[worker.role].color}`}>
                      <Pepe look={worker.look} />
                    </span>
                    <div>
                      <h3>{worker.name}</h3>
                      <p>
                        {worker.role} · Level {worker.level} of {MAX_LEVEL}
                      </p>
                      <span className="soft-label">
                        <Zap size={13} />
                        {workScore(worker)} work score
                      </span>
                    </div>
                  </div>
                  <p className="dialog-description">
                    A little learning goes a long way. Each level adds 15% to {worker.name}’s base
                    work score, compounded. Progress stays with this Pepe, even when sold.
                  </p>
                  <div className="training-track">
                    {Array.from({ length: MAX_LEVEL }, (_, i) => (
                      <span key={i} className={i < worker.level ? 'filled' : ''} />
                    ))}
                  </div>
                  {max ? (
                    <div className="max-level">
                      <GraduationCap size={20} />
                      {worker.name} has reached maximum level.
                    </div>
                  ) : (
                    <>
                      <div className="upgrade-comparison">
                        <span>
                          Next level
                          <strong>
                            {worker.level} → {worker.level + 1}
                          </strong>
                        </span>
                        <span>
                          Work score
                          <strong>
                            {workScore(worker)} →{' '}
                            {workScore({ ...worker, level: worker.level + 1 })}
                          </strong>
                        </span>
                        <span>
                          Training cost
                          <strong>
                            {trainingCost(worker)}
                            <small> $ImdUSD</small>
                          </strong>
                        </span>
                      </div>
                      <button
                        className="button primary full-width"
                        disabled={game.balance < trainingCost(worker)}
                        onClick={() => act({ type: 'train', id: worker.id })}
                      >
                        <GraduationCap size={17} />
                        Train {worker.name} · {trainingCost(worker)} $ImdUSD
                      </button>
                      {game.balance < trainingCost(worker) && (
                        <p className="action-hint">
                          Collect {formatMoney(trainingCost(worker) - game.balance)} more to train.
                        </p>
                      )}
                    </>
                  )}
                </>
              );
            })()}
          {typeof modal === 'object' &&
            'sell' in modal &&
            (() => {
              const worker = game.workers.find((w) => w.id === modal.sell);
              if (!worker) return null;
              return (
                <>
                  <div className="training-profile">
                    <span className="training-portrait">
                      <Pepe look={worker.look} />
                    </span>
                    <div>
                      <h3>{worker.name}</h3>
                      <p>
                        {worker.role} · Level {worker.level}
                      </p>
                    </div>
                  </div>
                  <p className="dialog-description">
                    Sell {worker.name} for {sellPrice(worker)} $ImdUSD. Their level {worker.level}{' '}
                    and {workScore(worker)} work score stay with them. You can buy them back in the
                    local market at a 10% markup.
                  </p>
                  <div className="dialog-actions">
                    <button className="button secondary" onClick={close}>
                      Keep {worker.name}
                    </button>
                    <button
                      className="button primary"
                      onClick={() => {
                        act({ type: 'sell', id: worker.id });
                        close();
                      }}
                    >
                      Sell for {sellPrice(worker)} $ImdUSD
                    </button>
                  </div>
                </>
              );
            })()}
          {modal === 'cafe' && (
            <>
              <div className="cafe-hero">
                <Coffee size={65} />
                <span>+25% earnings for 5 minutes</span>
              </div>
              <p className="dialog-description">
                Lily knows the secret to a happy office. Treat the team to coffee for 25% extra
                earnings for five minutes.
              </p>
              <div className="upgrade-comparison">
                <span>
                  Team boost<strong>1.25×</strong>
                </span>
                <span>
                  Lasts for<strong>5 minutes</strong>
                </span>
                <span>
                  Coffee round
                  <strong>
                    {BOOST_COST}
                    <small> $ImdUSD</small>
                  </strong>
                </span>
              </div>
              <button
                className="button primary full-width"
                disabled={!team.length || boostActive || game.balance < BOOST_COST}
                onClick={() => {
                  act({ type: 'boost' });
                  close();
                }}
              >
                <Coffee size={17} />
                {boostActive
                  ? `Coffee boost · ${formatTime((game.boostUntil - now) / 1000)} left`
                  : `Buy team coffee · ${BOOST_COST} $ImdUSD`}
              </button>
              <p className="action-hint">
                {!team.length
                  ? 'Open your company and hire a Pepe first.'
                  : boostActive
                    ? 'The team is still sipping. Come back when this boost ends.'
                    : game.balance < BOOST_COST
                      ? 'Collect more earnings to buy the team coffee.'
                      : 'The boost starts right away and continues if you leave the city.'}
              </p>
            </>
          )}
          {modal === 'labs' && (
            <>
              <div className="neighbour-art">
                <BuildingPreview level={2} staff={6} />
              </div>
              <p className="dialog-description">
                <strong>Lilypad Labs</strong> is the neighbourhood’s resident idea factory. Their
                six busy Pepes are dreaming up the next big thing.
              </p>
              <div className="upgrade-comparison">
                <span>
                  Building<strong>Office Floor</strong>
                </span>
                <span>
                  Team<strong>6 Pepes</strong>
                </span>
                <span>
                  Street<strong>Clover Street</strong>
                </span>
              </div>
              <p className="local-note">
                This is a scenery company in local play. Live multiplayer neighbours are not
                connected.
              </p>
              <button className="button secondary full-width" onClick={close}>
                Back to the neighbourhood
                <ArrowRight size={17} />
              </button>
            </>
          )}
          {modal === 'plaza' && (
            <>
              <div className="plaza-hero">
                <Sprout size={62} />
              </div>
              <p className="dialog-description">
                A fountain, a shady bench, and nowhere you need to be. The little plaza is where
                Pepes come to recharge between big ideas.
              </p>
              <div className="plaza-stat">
                <Clock3 size={20} />
                <span>
                  You’ve spent <strong>{formatTime(game.playedSeconds)}</strong> making this city
                  your own.
                </span>
              </div>
              <p className="muted">Your company keeps earning while you take a breather.</p>
              <button className="button secondary full-width" onClick={close}>
                Back to the city
                <ArrowRight size={17} />
              </button>
            </>
          )}
          {modal === 'help' && (
            <>
              <p className="dialog-description">
                Welcome to Pepe & Co., a cosy office tycoon. Build a little company, hire your dream
                team, and turn hard work into $ImdUSD.
              </p>
              <div className="guide-steps">
                {[
                  {
                    icon: Sparkles,
                    title: '1. Meet your Pepe',
                    text: 'Your first Pepe is a free Intern. Mint more for 300 $ImdUSD. Rarer roles begin with higher work scores.',
                  },
                  {
                    icon: Building2,
                    title: '2. Open for business',
                    text: 'Spend 250 $ImdUSD to open a garage with three desks. Hire a Pepe from My Pepes to put them to work.',
                  },
                  {
                    icon: Coins,
                    title: '3. Collect a little green',
                    text: 'Earnings per minute = (building base + total team score) × boosts. Earnings accrue every second; Collect moves them into your balance.',
                  },
                  {
                    icon: GraduationCap,
                    title: '4. Help your team grow',
                    text: 'Training starts at 60 $ImdUSD, increases 65% per level, and adds a compounded 15% to work score, up to level 10.',
                  },
                  {
                    icon: TrendingUp,
                    title: '5. Make room for more',
                    text: 'Upgrade from Garage to Small Office, Office Floor, Office Tower, and Headquarters. Each upgrade adds desks and base income, with a 60-second cooldown.',
                  },
                  {
                    icon: ShoppingBag,
                    title: '6. Find their next chapter',
                    text: 'Free a Pepe’s desk before selling. Their level stays with them on the market. Keep at least one Pepe as your entry ticket.',
                  },
                ].map((step) => (
                  <div className="guide-step" key={step.title}>
                    <span className="icon-tile">
                      <step.icon size={20} />
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="local-note">
                <CircleHelp size={19} />
                <span>
                  <strong>A simulated prototype.</strong> Pepe NFTs, $ImdUSD and the neighbouring
                  companies are simulated in this browser. You start with 1,200 simulated $ImdUSD;
                  progress saves locally and offline earnings are capped at 8 hours. No wallet, chain,
                  token payout or live multiplayer is connected. Day and night alternate every four
                  minutes, or you can choose in City lights.
                </span>
              </div>
              <button
                className="button primary full-width"
                onClick={() => (game.company ? close() : setModal('start'))}
              >
                {game.company ? 'Back to my company' : 'Start my company'}
                <ArrowRight size={17} />
              </button>
            </>
          )}
          {modal === 'settings' && (
            <>
              <div className="settings-intro">
                <span className="icon-tile">
                  <Wallet size={22} />
                </span>
                <div>
                  <h3>Simulated play</h3>
                  <p>Your company lives in this browser. No wallet or real money is involved.</p>
                </div>
              </div>
              <p className="dialog-description">
                Your progress is saved automatically. Clearing site data removes your company.
                Download a copy to keep a record of your game.
              </p>
              <button className="button secondary full-width" onClick={downloadSave}>
                <ArrowDownToLine size={17} />
                Download save
              </button>
              <div className="settings-divider" />
              <h3>Reset</h3>
              <p className="dialog-description">
                Start over with 1,200 simulated $ImdUSD and a free first Pepe. This replaces the
                progress on this device.
              </p>
              <button className="button danger-quiet full-width" onClick={() => setModal('reset')}>
                Reset local game
              </button>
            </>
          )}
          {modal === 'reset' && (
            <>
              <p className="dialog-description">
                This will delete your company, Pepes, training, and balance from this browser. You
                can download your save first to keep a record.
              </p>
              <button className="text-button" onClick={downloadSave}>
                <ArrowDownToLine size={16} />
                Download save first
              </button>
              <div className="dialog-actions">
                <button className="button secondary" onClick={close}>
                  Keep my company
                </button>
                <button
                  className="button danger"
                  onClick={() => {
                    setGame(freshGame(Date.now()));
                    setDismissedNotice('');
                    close();
                    location.hash = 'city';
                  }}
                >
                  Reset local game
                </button>
              </div>
            </>
          )}
        </ModalShell>
      )}
    </div>
  );
}

export default App;
