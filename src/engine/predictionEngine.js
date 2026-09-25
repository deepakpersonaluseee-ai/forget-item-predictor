/**
 * Compiled / ESM version of predictionEngine for zero-dependency test runner.
 */
export function calculateForgottenRiskScore(item, context) {
  const threshold = context.riskThreshold ?? 16.0;
  const factors = [];
  const reasons = [];

  const baseMultiplier = 1.0;
  const baseContrib = item.baseWeight * baseMultiplier;
  factors.push({
    name: 'Base Importance',
    weight: item.baseWeight,
    multiplier: baseMultiplier,
    contribution: baseContrib,
  });

  let totalScore = baseContrib;

  // 1. Weather Signal
  if (item.weatherConditionMatch) {
    let weatherMultiplier = 0;
    if (item.weatherConditionMatch === 'rain' && (context.todayWeather.condition === 'rainy' || context.todayWeather.rainChance >= 40)) {
      weatherMultiplier = 2.8;
      reasons.push(`🌧️ Rain predicted (${context.todayWeather.rainChance}% chance)`);
    } else if (item.weatherConditionMatch === 'cold' && context.todayWeather.temp <= 50) {
      weatherMultiplier = 2.2;
      reasons.push(`❄️ Chilly weather (${context.todayWeather.temp}°F)`);
    } else if (item.weatherConditionMatch === 'snow' && context.todayWeather.condition === 'snowy') {
      weatherMultiplier = 3.2;
      reasons.push(`🌨️ Snow warning today`);
    }

    if (weatherMultiplier > 0) {
      const contrib = item.baseWeight * weatherMultiplier;
      totalScore += contrib;
      factors.push({
        name: 'Weather Context',
        weight: item.baseWeight,
        multiplier: weatherMultiplier,
        contribution: contrib,
      });
    }
  }

  // 2. Calendar Event Signal
  if (item.calendarKeywordMatch && item.calendarKeywordMatch.length > 0) {
    let matchedEvent;
    for (const event of context.upcomingCalendarEvents) {
      const titleLower = event.title.toLowerCase();
      const match = item.calendarKeywordMatch.some(kw => titleLower.includes(kw.toLowerCase()));
      if (match) {
        matchedEvent = event;
        break;
      }
    }

    if (matchedEvent) {
      const calendarMultiplier = 3.0;
      const contrib = item.baseWeight * calendarMultiplier;
      totalScore += contrib;
      reasons.push(`📅 Needed for: "${matchedEvent.title}" at ${matchedEvent.time}`);
      factors.push({
        name: 'Calendar Match',
        weight: item.baseWeight,
        multiplier: calendarMultiplier,
        contribution: contrib,
      });
    }
  }

  // 3. Routine Schedule / Day of Week Signal
  if (item.recurringDays && item.recurringDays.length > 0) {
    if (item.recurringDays.includes(context.currentDayOfWeek)) {
      const dayMultiplier = 1.4;
      const contrib = item.baseWeight * dayMultiplier;
      totalScore += contrib;
      factors.push({
        name: 'Scheduled Routine Day',
        weight: item.baseWeight,
        multiplier: dayMultiplier,
        contribution: contrib,
      });
      if (reasons.length === 0) {
        reasons.push(`🔄 Active on today's schedule`);
      }
    }
  }

  // 4. Past Forgotten History Signal
  const pastForgets = context.historicalForgetRates?.[item.id] || 0;
  if (pastForgets > 0) {
    const histMultiplier = Math.min(pastForgets * 0.6, 2.0);
    const contrib = item.baseWeight * histMultiplier;
    totalScore += contrib;
    factors.push({
      name: 'Past Forgetting Frequency',
      weight: item.baseWeight,
      multiplier: histMultiplier,
      contribution: contrib,
    });
    reasons.push(`⚠️ Forgotten ${pastForgets}x in recent outings`);
  }

  const roundedScore = Math.round(totalScore * 10) / 10;
  const isFlagged = roundedScore >= threshold;

  const flagReason = reasons.length > 0
    ? reasons[0]
    : (item.baseWeight >= 8.5 ? '⭐ Essential daily safeguard' : 'Routine daily item');

  return {
    score: roundedScore,
    isFlagged,
    flagReason,
    contributingFactors: factors,
  };
}

export function rankChecklistItems(items, context) {
  return items.map(item => {
    const result = calculateForgottenRiskScore(item, context);
    return {
      ...item,
      score: result.score,
      isFlagged: result.isFlagged,
      flagReason: result.flagReason,
    };
  }).sort((a, b) => {
    if (a.packed !== b.packed) {
      return a.packed ? 1 : -1;
    }
    if (a.isFlagged !== b.isFlagged) {
      return a.isFlagged ? -1 : 1;
    }
    return b.score - a.score;
  });
}
