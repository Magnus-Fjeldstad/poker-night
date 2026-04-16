import { useEffect, useState } from 'react';
import BlindSchedulePanel from './components/BlindSchedulePanel.jsx';
import ChipDistributionPanel from './components/ChipDistributionPanel.jsx';
import PlayersPanel from './components/PlayersPanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import SettlementPanel from './components/SettlementPanel.jsx';
import TimerPanel from './components/TimerPanel.jsx';
import {
  buildPlayerView,
  calculatePayouts,
  calculateTableTotals,
  createEmptyChipCounts,
  formatCurrency,
  formatNumber,
  generateBlindSchedule,
  getCurrentBlindLevel,
  parseDateTime,
  toLocalDateTimeInput,
} from './lib/gameLogic.js';

const STORAGE_KEY = 'home-poker-manager-state-v1';

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createInitialState() {
  const now = new Date();
  const start = new Date(now.getTime());
  const end = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const cutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return {
    settings: {
      standardBuyIn: 500,
      buyInCutoff: toLocalDateTimeInput(cutoff),
      gameStart: toLocalDateTimeInput(start),
      gameEnd: toLocalDateTimeInput(end),
    },
    players: [],
  };
}

function createBuyInDrafts(players, standardBuyIn) {
  return players.reduce((accumulator, player) => {
    accumulator[player.id] = standardBuyIn;
    return accumulator;
  }, {});
}

function normalizePlayers(players) {
  if (!Array.isArray(players)) {
    return [];
  }

  return players.map((player) => ({
    id: player?.id || createId('player'),
    name: typeof player?.name === 'string' ? player.name : '',
    buyIns: Array.isArray(player?.buyIns)
      ? player.buyIns.map((buyIn) => ({
          id: buyIn?.id || createId('buyin'),
          amount: Number(buyIn?.amount) || 0,
          createdAt: buyIn?.createdAt || toLocalDateTimeInput(new Date()),
        }))
      : [],
    finalCounts: {
      ...createEmptyChipCounts(),
      ...(player?.finalCounts || {}),
    },
  }));
}

function loadPersistedAppState() {
  const initialState = createInitialState();

  if (typeof window === 'undefined') {
    return {
      gameState: initialState,
      buyInDrafts: createBuyInDrafts([], initialState.settings.standardBuyIn),
    };
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return {
        gameState: initialState,
        buyInDrafts: createBuyInDrafts([], initialState.settings.standardBuyIn),
      };
    }

    const parsedState = JSON.parse(rawState);
    const players = normalizePlayers(parsedState?.gameState?.players);
    const standardBuyIn = Number(parsedState?.gameState?.settings?.standardBuyIn) || initialState.settings.standardBuyIn;
    const buyInDrafts = createBuyInDrafts(players, standardBuyIn);

    Object.entries(parsedState?.buyInDrafts || {}).forEach(([playerId, amount]) => {
      if (playerId in buyInDrafts) {
        buyInDrafts[playerId] = Number(amount) || 0;
      }
    });

    return {
      gameState: {
        settings: {
          ...initialState.settings,
          ...(parsedState?.gameState?.settings || {}),
          standardBuyIn,
        },
        players,
      },
      buyInDrafts,
    };
  } catch {
    return {
      gameState: initialState,
      buyInDrafts: createBuyInDrafts([], initialState.settings.standardBuyIn),
    };
  }
}

export default function App() {
  const [persistedState] = useState(() => loadPersistedAppState());
  const [gameState, setGameState] = useState(persistedState.gameState);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [buyInDrafts, setBuyInDrafts] = useState(persistedState.buyInDrafts);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gameState,
        buyInDrafts,
      }),
    );
  }, [gameState, buyInDrafts]);

  const players = gameState.players.map((player) => buildPlayerView(player, gameState.settings.standardBuyIn));
  const totals = calculateTableTotals(gameState.players, gameState.settings.standardBuyIn);
  const payouts = calculatePayouts(gameState.players, gameState.settings.standardBuyIn);
  const blindSchedule = generateBlindSchedule(gameState.settings.gameStart, gameState.settings.gameEnd);
  const currentBlind = getCurrentBlindLevel(blindSchedule, now);
  const cutoff = parseDateTime(gameState.settings.buyInCutoff);
  const buyInLocked = cutoff ? now > cutoff.getTime() : false;

  function handleSettingsChange(field, value) {
    if (field === 'standardBuyIn') {
      setBuyInDrafts((current) =>
        Object.keys(current).reduce((accumulator, playerId) => {
          accumulator[playerId] = Number(value) || 0;
          return accumulator;
        }, {}),
      );
    }

    setGameState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
  }

  function handleAddPlayer() {
    const trimmed = newPlayerName.trim();

    if (!trimmed) {
      return;
    }

    const id = createId('player');

    setGameState((current) => ({
      ...current,
      players: [
        ...current.players,
        {
          id,
          name: trimmed,
          buyIns: [],
          finalCounts: createEmptyChipCounts(),
        },
      ],
    }));

    setBuyInDrafts((current) => ({
      ...current,
      [id]: Number(gameState.settings.standardBuyIn) || 0,
    }));
    setNewPlayerName('');
  }

  function handleRemovePlayer(playerId) {
    setGameState((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
    }));
    setBuyInDrafts((current) => {
      const next = { ...current };
      delete next[playerId];
      return next;
    });
  }

  function handleBuyInDraftChange(playerId, amount) {
    setBuyInDrafts((current) => ({
      ...current,
      [playerId]: amount,
    }));
  }

  function handleAddBuyIn(playerId) {
    if (buyInLocked) {
      return;
    }

    const amount = Number(buyInDrafts[playerId]) || 0;

    if (amount <= 0) {
      return;
    }

    setGameState((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              buyIns: [
                ...player.buyIns,
                {
                  id: createId('buyin'),
                  amount,
                  createdAt: toLocalDateTimeInput(new Date()),
                },
              ],
            }
          : player,
      ),
    }));
  }

  function handleFinalCountChange(playerId, denomination, amount) {
    setGameState((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              finalCounts: {
                ...player.finalCounts,
                [denomination]: Math.max(0, amount || 0),
              },
            }
          : player,
      ),
    }));
  }

  function handleResetGame() {
    const nextState = createInitialState();
    setGameState(nextState);
    setBuyInDrafts(createBuyInDrafts([], nextState.settings.standardBuyIn));
    setNewPlayerName('');
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[2rem] border border-white/10 bg-black/20 p-6 shadow-felt backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brass-300/80">Poker Cash Game</p>
            <h1 className="mt-3 text-4xl text-ivory-50 sm:text-5xl">Enkel oversikt for buy-ins, blinds og oppgjør.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory-100/68">
              Appen starter tom. Legg inn spillere, registrer buy-ins og tell chips når spillet er ferdig.
            </p>
          </div>
          <button className="button-danger" type="button" onClick={handleResetGame}>
            Nullstill alt
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Spillere</div>
            <div className="mt-2 text-3xl text-ivory-50">{players.length}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Totalt inn</div>
            <div className="mt-2 text-3xl text-ivory-50">{formatCurrency(totals.totalPaidIn)}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Utstedte units</div>
            <div className="mt-2 text-3xl text-ivory-50">{formatNumber(totals.totalStackUnits)} units</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Nåværende blind</div>
            <div className="mt-2 text-3xl text-ivory-50">
              {currentBlind ? `${currentBlind.level.smallBlind}/${currentBlind.level.bigBlind}` : 'Ikke satt'}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        <SettingsPanel
          settings={gameState.settings}
          cutoffClosed={buyInLocked}
          onSettingsChange={handleSettingsChange}
        />
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <TimerPanel now={now} settings={gameState.settings} currentBlind={currentBlind} />
          <BlindSchedulePanel schedule={blindSchedule} currentBlind={currentBlind} />
        </div>
        <PlayersPanel
          players={players}
          newPlayerName={newPlayerName}
          onNewPlayerNameChange={setNewPlayerName}
          onAddPlayer={handleAddPlayer}
          buyInDrafts={buyInDrafts}
          onBuyInDraftChange={handleBuyInDraftChange}
          onAddBuyIn={handleAddBuyIn}
          onRemovePlayer={handleRemovePlayer}
          buyInLocked={buyInLocked}
        />
        <ChipDistributionPanel players={players} />
        <SettlementPanel
          players={players}
          payouts={payouts}
          totals={totals}
          onFinalCountChange={handleFinalCountChange}
        />
      </div>
    </div>
  );
}
