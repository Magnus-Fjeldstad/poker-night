import SectionCard from './SectionCard.jsx';
import {
  buildChipStackForBuyIn,
  describeChipCounts,
  formatCurrency,
  formatDateTimeLabel,
  formatNumber,
  getOpeningBigBlind,
  getOpeningSmallBlind,
} from '../lib/gameLogic.js';

function getNumericInputDisplayValue(value) {
  return value === 0 || value === '0' || value === undefined || value === null ? '' : value;
}

export default function SettingsPanel({ settings, cutoffClosed, onSettingsChange }) {
  const standardStack = buildChipStackForBuyIn(settings.standardBuyIn, settings.standardBuyIn);
  const openingBigBlind = getOpeningBigBlind();
  const openingSmallBlind = getOpeningSmallBlind();

  return (
    <SectionCard
      title="Setup"
      subtitle="Spilloppsett"
      action={
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-right">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ivory-100/55">Re-entry</div>
          <div className={`mt-1 text-sm font-semibold ${cutoffClosed ? 'text-rose-200' : 'text-emerald-200'}`}>
            {cutoffClosed ? 'Stengt' : 'Åpent'}
          </div>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="label">Standard buy-in</span>
          <input
            className="field"
            type="number"
            min="0"
            step="5"
            value={getNumericInputDisplayValue(settings.standardBuyIn)}
            onChange={(event) => onSettingsChange('standardBuyIn', Number(event.target.value))}
          />
        </label>
        <label>
          <span className="label">Siste buy-in</span>
          <input
            className="field"
            type="datetime-local"
            value={settings.buyInCutoff}
            onChange={(event) => onSettingsChange('buyInCutoff', event.target.value)}
          />
        </label>
        <label>
          <span className="label">Starttid</span>
          <input
            className="field"
            type="datetime-local"
            value={settings.gameStart}
            onChange={(event) => onSettingsChange('gameStart', event.target.value)}
          />
        </label>
        <label>
          <span className="label">Sluttid</span>
          <input
            className="field"
            type="datetime-local"
            value={settings.gameEnd}
            onChange={(event) => onSettingsChange('gameEnd', event.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Stack preview</div>
          <div className="mt-3 text-3xl font-semibold text-ivory-50">{formatNumber(standardStack.totalUnits)} units</div>
          <div className="mt-2 text-sm text-ivory-100/70">
            {formatCurrency(settings.standardBuyIn)} gir {formatNumber(standardStack.totalChips)} chips og{' '}
            {formatNumber(standardStack.openingBigBlinds)} BB ved startblinds {openingSmallBlind}/{openingBigBlind}.
          </div>
          <div className="mt-3 text-sm text-ivory-100/65">{describeChipCounts(standardStack.counts)}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Buy-in cutoff</div>
            <div className="mt-2 text-lg text-ivory-50">{formatDateTimeLabel(settings.buyInCutoff)}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Spillvindu</div>
            <div className="mt-2 text-lg text-ivory-50">{formatDateTimeLabel(settings.gameStart)}</div>
            <div className="text-sm text-ivory-100/60">til {formatDateTimeLabel(settings.gameEnd)}</div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
