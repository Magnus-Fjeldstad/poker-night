import SectionCard from './SectionCard.jsx';
import { CHIP_DENOMINATIONS } from '../lib/constants.js';
import { formatCurrency, formatNumber, getChipValue } from '../lib/gameLogic.js';

function getNumericInputDisplayValue(value) {
  return value === 0 || value === '0' || value === undefined || value === null ? '' : value;
}

function SettlementRow({ player, onFinalCountChange, payout }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/15 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl text-ivory-50">{player.name}</h3>
          <div className="mt-2 text-sm text-ivory-100/60">Innbetalt {formatCurrency(player.totalPaidIn)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Sluttstack</div>
          <div className="mt-2 text-2xl text-ivory-50">{formatNumber(getChipValue(player.finalCounts))}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {CHIP_DENOMINATIONS.map((denomination) => (
          <label key={denomination}>
            <span className="label">{denomination}s</span>
            <input
              className="field"
              type="number"
              min="0"
              step="1"
              value={getNumericInputDisplayValue(player.finalCounts[denomination])}
              onChange={(event) => onFinalCountChange(player.id, denomination, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Utbetaling</div>
          <div className="mt-2 text-xl text-emerald-200">{formatCurrency(payout?.payout || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Resultat</div>
          <div className={`mt-2 text-xl ${(payout?.net || 0) >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
            {formatCurrency(payout?.net || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Andel chips</div>
          <div className="mt-2 text-xl text-ivory-50">
            {payout?.finalChipUnits ? `${formatNumber(payout.finalChipUnits)} units` : '0 units'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettlementPanel({ players, payouts, totals, onFinalCountChange }) {
  const payoutByPlayerId = payouts.reduce((accumulator, row) => {
    accumulator[row.playerId] = row;
    return accumulator;
  }, {});

  const stackDifference = totals.totalStackUnits - totals.totalFinalUnits;
  const totalCalculatedPayout = payouts.reduce((total, payout) => total + (payout.payout || 0), 0);
  const unallocatedAmount = Number((totals.totalPaidIn - totalCalculatedPayout).toFixed(2));

  return (
    <SectionCard title="Settlement" subtitle="Sluttoppgjør">
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Totalt inn</div>
          <div className="mt-2 text-2xl text-ivory-50">{formatCurrency(totals.totalPaidIn)}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Utstedte units</div>
          <div className="mt-2 text-2xl text-ivory-50">{formatNumber(totals.totalStackUnits)} units</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Telt units</div>
          <div className="mt-2 text-2xl text-ivory-50">{formatNumber(totals.totalFinalUnits)} units</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Avvik</div>
          <div className={`mt-2 text-2xl ${stackDifference === 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
            {formatNumber(stackDifference)} units
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Ikke fordelt</div>
          <div className={`mt-2 text-2xl ${unallocatedAmount === 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
            {formatCurrency(unallocatedAmount)}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-black/10 p-4 text-sm text-ivory-100/65">
        Utbetaling beregnes nå mot totalt utstedte units fra alle buy-ins. Hvis ikke alle sluttstacks er tastet inn
        ennå, blir resten stående som <span className="font-semibold text-ivory-50">ikke fordelt</span>.
      </div>

      {players.length ? (
        <div className="space-y-5">
          {players.map((player) => (
            <SettlementRow
              key={player.id}
              player={player}
              onFinalCountChange={onFinalCountChange}
              payout={payoutByPlayerId[player.id]}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-ivory-100/60">
          Legg til spillere før du gjør opp spillet.
        </div>
      )}
    </SectionCard>
  );
}
