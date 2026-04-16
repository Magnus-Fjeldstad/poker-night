import { BASE_STACK_UNITS, BLIND_LADDER, CHIP_DENOMINATIONS, OPENING_BIG_BLIND } from './constants.js';

const currencyFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('nb-NO');

export function formatCurrency(amount) {
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(value) {
  return integerFormatter.format(Number.isFinite(value) ? value : 0);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function roundToNearestStep(value, step) {
  return Math.round(value / step) * step;
}

export function sumChipCounts(counts = {}) {
  return CHIP_DENOMINATIONS.reduce((total, denomination) => {
    const count = Number(counts[denomination]) || 0;
    return total + count;
  }, 0);
}

export function getChipValue(counts = {}) {
  return CHIP_DENOMINATIONS.reduce((total, denomination) => {
    const count = Number(counts[denomination]) || 0;
    return total + count * denomination;
  }, 0);
}

export function createEmptyChipCounts() {
  return CHIP_DENOMINATIONS.reduce((accumulator, denomination) => {
    accumulator[denomination] = 0;
    return accumulator;
  }, {});
}

export function toLocalDateTimeInput(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function parseDateTime(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateTimeLabel(value) {
  const parsed = parseDateTime(value);

  if (!parsed) {
    return 'Not set';
  }

  return parsed.toLocaleString('nb-NO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function getDurationMinutes(startValue, endValue) {
  const start = parseDateTime(startValue);
  const end = parseDateTime(endValue);

  if (!start || !end || end <= start) {
    return 0;
  }

  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export function calculateTargetStackUnits(buyInAmount, standardBuyIn) {
  const safeStandard = Math.max(Number(standardBuyIn) || 1, 1);
  const safeBuyIn = Math.max(Number(buyInAmount) || 0, 0);

  // Every standard buy-in maps to a fixed 5,000-unit stack, and stacks are
  // rounded to whole opening big blinds so chip totals map cleanly to BB depth.
  return roundToNearestStep((safeBuyIn / safeStandard) * BASE_STACK_UNITS, OPENING_BIG_BLIND);
}

function getSeedCounts(targetUnits) {
  if (targetUnits < 1000) {
    return { 5: 2, 10: 2, 25: 2, 50: 1, 100: 0, 500: 0 };
  }

  if (targetUnits < 2500) {
    return { 5: 4, 10: 4, 25: 4, 50: 3, 100: 0, 500: 0 };
  }

  return { 5: 6, 10: 6, 25: 8, 50: 6, 100: 0, 500: 0 };
}

export function getOpeningBigBlind() {
  return OPENING_BIG_BLIND;
}

export function getOpeningSmallBlind() {
  return OPENING_BIG_BLIND / 2;
}

export function getOpeningBigBlindCount(stackUnits) {
  return Math.round((Number(stackUnits) || 0) / OPENING_BIG_BLIND);
}

export function buildChipCountsFromUnits(targetUnits) {
  const safeTarget = roundToNearestStep(Math.max(Number(targetUnits) || 0, 0), 5);
  const counts = { ...getSeedCounts(safeTarget) };
  let remainingValue = safeTarget - getChipValue(counts);

  if (safeTarget <= 0) {
    return createEmptyChipCounts();
  }

  if (remainingValue < 0) {
    for (const denomination of [100, 50, 25, 10, 5]) {
      while (remainingValue < 0 && counts[denomination] > 0) {
        counts[denomination] -= 1;
        remainingValue += denomination;
      }
    }
  }

  if (remainingValue > 0) {
    // 100-chips remain the main workhorse, but larger starting stacks should
    // still consolidate some value into 500s so we do not end up with too many hundreds.
    const desiredFiveHundreds = Math.min(
      Math.floor((safeTarget + 250) / 1000),
      Math.floor(remainingValue / 500),
    );

    counts[500] += desiredFiveHundreds;
    remainingValue -= desiredFiveHundreds * 500;

    counts[100] += Math.floor(remainingValue / 100);
    remainingValue %= 100;

    for (const denomination of [50, 25, 10, 5]) {
      if (remainingValue <= 0) {
        break;
      }

      const amount = Math.floor(remainingValue / denomination);
      if (amount > 0) {
        counts[denomination] += amount;
        remainingValue -= amount * denomination;
      }
    }
  }

  return counts;
}

export function buildChipStackForBuyIn(buyInAmount, standardBuyIn) {
  const targetUnits = calculateTargetStackUnits(buyInAmount, standardBuyIn);
  const counts = buildChipCountsFromUnits(targetUnits);
  const totalUnits = getChipValue(counts);
  const totalChips = sumChipCounts(counts);

  return {
    counts,
    totalUnits,
    totalChips,
    openingBigBlinds: getOpeningBigBlindCount(totalUnits),
    currencyPerUnit: totalUnits > 0 ? buyInAmount / totalUnits : 0,
  };
}

export function describeChipCounts(counts) {
  return CHIP_DENOMINATIONS.map((denomination) => `${denomination}: ${counts[denomination] || 0}`).join(
    ' • ',
  );
}

export function getTotalPaidIn(player) {
  return (player.buyIns || []).reduce((total, buyIn) => total + (Number(buyIn.amount) || 0), 0);
}

export function getFinalChipUnits(player) {
  return getChipValue(player.finalCounts);
}

export function getPlayerStackUnits(player, standardBuyIn) {
  return (player.buyIns || []).reduce(
    (total, buyIn) => total + calculateTargetStackUnits(buyIn.amount, standardBuyIn),
    0,
  );
}

export function buildPlayerView(player, standardBuyIn) {
  const buyIns = (player.buyIns || []).map((buyIn) => ({
    ...buyIn,
    stack: buildChipStackForBuyIn(buyIn.amount, standardBuyIn),
  }));

  return {
    ...player,
    buyIns,
    totalPaidIn: getTotalPaidIn(player),
    totalStackUnits: buyIns.reduce((total, buyIn) => total + buyIn.stack.totalUnits, 0),
    finalChipUnits: getFinalChipUnits(player),
  };
}

export function calculateTableTotals(players, standardBuyIn) {
  return players.reduce(
    (totals, player) => {
      totals.totalPaidIn += getTotalPaidIn(player);
      totals.totalStackUnits += getPlayerStackUnits(player, standardBuyIn);
      totals.totalFinalUnits += getFinalChipUnits(player);
      return totals;
    },
    {
      totalPaidIn: 0,
      totalStackUnits: 0,
      totalFinalUnits: 0,
    },
  );
}

export function calculatePayouts(players, standardBuyIn) {
  const totalPaidIn = players.reduce((total, player) => total + getTotalPaidIn(player), 0);
  const totalIssuedUnits = players.reduce(
    (total, player) => total + getPlayerStackUnits(player, standardBuyIn),
    0,
  );

  if (!players.length) {
    return [];
  }

  if (totalIssuedUnits <= 0) {
    return players.map((player) => ({
      playerId: player.id,
      name: player.name,
      totalPaidIn: getTotalPaidIn(player),
      finalChipUnits: 0,
      payout: 0,
      net: 0,
    }));
  }

  return players.map((player, index) => {
    const finalChipUnits = getFinalChipUnits(player);
    const rawPayout = (finalChipUnits / totalIssuedUnits) * totalPaidIn;
    const payout = Number(rawPayout.toFixed(2));

    return {
      playerId: player.id,
      name: player.name,
      totalPaidIn: getTotalPaidIn(player),
      finalChipUnits,
      payout,
      net: Number((payout - getTotalPaidIn(player)).toFixed(2)),
      issuedUnits: getPlayerStackUnits(player, standardBuyIn),
    };
  });
}

function determineLevelCount(durationMinutes) {
  return clamp(Math.round(durationMinutes / 25), 6, 12);
}

function determineProgressionEndIndex(durationMinutes, levelCount) {
  const speedBonus = durationMinutes <= 180 ? 3 : durationMinutes <= 240 ? 2 : durationMinutes <= 360 ? 1 : 0;
  return Math.min(BLIND_LADDER.length - 1, levelCount - 1 + speedBonus);
}

function getLadderIndexes(levelCount, endIndex) {
  if (levelCount <= 1) {
    return [0];
  }

  const indexes = [];
  let previous = -1;

  for (let level = 0; level < levelCount; level += 1) {
    const progress = level / (levelCount - 1);
    const ideal = Math.round(progress * endIndex);
    const levelsLeft = levelCount - level - 1;
    const maxAllowed = endIndex - levelsLeft;
    const index = clamp(Math.max(ideal, previous + 1), 0, maxAllowed);
    indexes.push(index);
    previous = index;
  }

  return indexes;
}

export function generateBlindSchedule(startValue, endValue) {
  const start = parseDateTime(startValue);
  const end = parseDateTime(endValue);

  if (!start || !end || end <= start) {
    return [];
  }

  const durationMinutes = getDurationMinutes(startValue, endValue);
  const levelCount = determineLevelCount(durationMinutes);
  const totalDurationMs = end.getTime() - start.getTime();
  const endIndex = determineProgressionEndIndex(durationMinutes, levelCount);
  const ladderIndexes = getLadderIndexes(levelCount, endIndex);

  // Shorter games skip further up the blind ladder, while longer games use
  // more intermediate steps, but the full schedule always fits the exact game window.
  return ladderIndexes.map((ladderIndex, index) => {
    const levelStartMs = start.getTime() + (index / levelCount) * totalDurationMs;
    const levelEndMs = start.getTime() + ((index + 1) / levelCount) * totalDurationMs;
    const bigBlind = BLIND_LADDER[ladderIndex];

    return {
      level: index + 1,
      ladderIndex,
      bigBlind,
      smallBlind: bigBlind / 2,
      startMs: levelStartMs,
      endMs: levelEndMs,
      durationMinutes: Math.round((levelEndMs - levelStartMs) / 60000),
    };
  });
}

export function getCurrentBlindLevel(schedule, nowMs) {
  if (!schedule.length) {
    return null;
  }

  const now = Number(nowMs) || Date.now();

  if (now < schedule[0].startMs) {
    return {
      status: 'pending',
      level: schedule[0],
    };
  }

  const active = schedule.find((level) => now >= level.startMs && now < level.endMs);

  if (active) {
    return {
      status: 'running',
      level: active,
    };
  }

  return {
    status: 'ended',
    level: schedule[schedule.length - 1],
  };
}
