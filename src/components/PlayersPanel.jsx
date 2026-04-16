import SectionCard from './SectionCard.jsx';
import { formatCurrency, formatDateTimeLabel, formatNumber } from '../lib/gameLogic.js';

function getNumericInputDisplayValue(value) {
  return value === 0 || value === '0' || value === undefined || value === null ? '' : value;
}

function PlayerCard({
  player,
  buyInDraft,
  onBuyInDraftChange,
  onAddBuyIn,
  onRemovePlayer,
  buyInLocked,
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/15 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl text-ivory-50">{player.name}</h3>
          <div className="mt-2 text-sm text-ivory-100/65">
            Innbetalt {formatCurrency(player.totalPaidIn)} • {formatNumber(player.totalStackUnits)} units
          </div>
        </div>
        <button className="button-danger" type="button" onClick={() => onRemovePlayer(player.id)}>
          Fjern
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label>
          <span className="label">Nytt buy-in</span>
          <input
            className="field"
            type="number"
            min="0"
            step="5"
            value={getNumericInputDisplayValue(buyInDraft)}
            onChange={(event) => onBuyInDraftChange(player.id, Number(event.target.value))}
          />
        </label>
        <button className="button-primary" type="button" onClick={() => onAddBuyIn(player.id)} disabled={buyInLocked}>
          {buyInLocked ? 'Stengt' : 'Legg til'}
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {player.buyIns.length ? (
          player.buyIns.map((buyIn) => (
            <div key={buyIn.id} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-semibold text-ivory-50">{formatCurrency(buyIn.amount)}</div>
                <div className="text-sm text-ivory-100/55">{formatDateTimeLabel(buyIn.createdAt)}</div>
              </div>
              <div className="mt-1 text-sm text-ivory-100/65">
                {formatNumber(buyIn.stack.totalUnits)} units • {formatNumber(buyIn.stack.totalChips)} chips
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-ivory-100/55">
            Ingen buy-ins registrert ennå.
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayersPanel({
  players,
  newPlayerName,
  onNewPlayerNameChange,
  onAddPlayer,
  buyInDrafts,
  onBuyInDraftChange,
  onAddBuyIn,
  onRemovePlayer,
  buyInLocked,
}) {
  return (
    <SectionCard title="Players" subtitle="Spillere og buy-ins">
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="field"
          type="text"
          placeholder="Navn på spiller"
          value={newPlayerName}
          onChange={(event) => onNewPlayerNameChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onAddPlayer();
            }
          }}
        />
        <button className="button-primary" type="button" onClick={onAddPlayer}>
          Legg til spiller
        </button>
      </div>

      {players.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              buyInDraft={buyInDrafts[player.id]}
              onBuyInDraftChange={onBuyInDraftChange}
              onAddBuyIn={onAddBuyIn}
              onRemovePlayer={onRemovePlayer}
              buyInLocked={buyInLocked}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-ivory-100/60">
          Ingen spillere lagt til ennå.
        </div>
      )}
    </SectionCard>
  );
}
