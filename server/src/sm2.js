/**
 * SM-2 Spaced Repetition Algorithm
 * confidence: 1 (completely forgot) → 5 (perfect recall)
 * Returns updated ease_factor, interval_days, and next due_date
 */
function sm2(confidence, card_id, db) {
  const last = db.prepare(
    'SELECT ease_factor, interval_days FROM reviews WHERE card_id = ? ORDER BY id DESC LIMIT 1'
  ).get(card_id);

  let ef = last?.ease_factor ?? 2.5;
  let interval = last?.interval_days ?? 1;

  if (confidence < 3) {
    // failed, reset back to day 1
    interval = 1;
  } else {
    if (!last) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
  }

  // hard cards get easier to space out, easy cards stretched further
  ef = Math.max(1.3, ef + 0.1 - (5 - confidence) * (0.08 + (5 - confidence) * 0.02));

  const due = new Date();
  due.setDate(due.getDate() + interval);
  const due_date = due.toISOString().split('T')[0];

  return { ease_factor: ef, interval_days: interval, due_date };
}

module.exports = sm2;