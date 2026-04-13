import { useState, useEffect } from 'react';
import { getStudyCards } from './api';
import './StudyMode.css';

const BREAK_EVERY = 100;
const POINTS_CORRECT = 10;

function UserSetup({ onStart }) {
  const [users, setUsers] = useState(['']);

  const addUser = () => setUsers(u => [...u, '']);
  const updateUser = (i, val) => setUsers(u => u.map((n, j) => j === i ? val : n));
  const removeUser = (i) => setUsers(u => u.filter((_, j) => j !== i));

  const handleStart = () => {
    const valid = users.map(u => u.trim()).filter(Boolean);
    if (valid.length === 0) return;
    onStart(valid);
  };

  return (
    <div className="setup">
      <h2 className="setup__title">Who's studying?</h2>
      <p className="setup__sub">Add one or more players</p>
      <div className="setup__list">
        {users.map((u, i) => (
          <div key={i} className="setup__row">
            <input
              className="setup__input"
              placeholder={`Player ${i + 1} name...`}
              value={u}
              onChange={e => updateUser(i, e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
            />
            {users.length > 1 && (
              <button className="setup__remove" onClick={() => removeUser(i)}>✕</button>
            )}
          </div>
        ))}
      </div>
      <button className="setup__add" onClick={addUser}>+ Add player</button>
      <button className="setup__start" onClick={handleStart}>Start studying →</button>
    </div>
  );
}

function BreakScreen({ cardsDone, onContinue, onStop }) {
  return (
    <div className="break">
      <div className="break__inner">
        <p className="break__label">Break time!</p>
        <h1 className="break__title">{cardsDone}</h1>
        <p className="break__sub">cards done — take a breather</p>
        <div className="break__btns">
          <button className="break__continue" onClick={onContinue}>Keep going →</button>
          <button className="break__stop" onClick={onStop}>End session</button>
        </div>
      </div>
    </div>
  );
}

function Scoreboard({ scores, onClose }) {
  const sorted = [...scores].sort((a, b) => b.points - a.points);
  return (
    <div className="scoreboard">
      <div className="scoreboard__inner">
        <h1 className="scoreboard__title">Session done!</h1>
        <div className="scoreboard__list">
          {sorted.map((s, i) => (
            <div key={s.name} className="scoreboard__row">
              <span className="scoreboard__rank">#{i + 1}</span>
              <span className="scoreboard__name">{s.name}</span>
              <span className="scoreboard__pts">{s.points} pts</span>
            </div>
          ))}
        </div>
        <button className="scoreboard__back" onClick={onClose}>← Back to deck</button>
      </div>
    </div>
  );
}

export default function StudyMode({ deck, onBack }) {
  const [phase, setPhase] = useState('setup');
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [cardsDoneThisBreak, setCardsDoneThisBreak] = useState(0);

  useEffect(() => {
    getStudyCards(deck.id).then(c => {
      setCards(c);
      setLoading(false);
    });
  }, [deck.id]);

  const handleStart = (names) => {
    setScores(names.map(name => ({ name, points: 0 })));
    setPhase('study');
  };

  const awardPoint = (userIndex) => {
    setScores(prev => prev.map((s, i) =>
      i === userIndex ? { ...s, points: s.points + POINTS_CORRECT } : s
    ));
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    const nextDone = cardsDoneThisBreak + 1;

    if (nextIndex >= cards.length) {
      setPhase('scoreboard');
      return;
    }

    if (nextDone >= BREAK_EVERY) {
      setCardsDoneThisBreak(0);
      setIndex(nextIndex);
      setFlipped(false);
      setPhase('break');
      return;
    }

    setIndex(nextIndex);
    setFlipped(false);
    setCardsDoneThisBreak(nextDone);
  };

  if (loading) return <div className="study__loading">Loading...</div>;

  if (cards.length === 0) return (
    <div className="study__loading">
      No cards yet!
      <button style={{ marginTop: 20 }} onClick={onBack}>← Go back</button>
    </div>
  );

  if (phase === 'setup') return (
    <div className="study">
      <div className="study__topbar">
        <button className="study__back" onClick={onBack}>← {deck.name}</button>
      </div>
      <UserSetup onStart={handleStart} />
    </div>
  );

  if (phase === 'break') return (
    <BreakScreen
      cardsDone={index}
      onContinue={() => setPhase('study')}
      onStop={() => setPhase('scoreboard')}
    />
  );

  if (phase === 'scoreboard') return (
    <Scoreboard scores={scores} onClose={onBack} />
  );

  const card = cards[index];
  const progress = (index / cards.length) * 100;

  return (
    <div className="study">
      <div className="study__topbar">
        <button className="study__back" onClick={onBack}>← {deck.name}</button>
        <span className="study__progress-label">{index + 1} / {cards.length}</span>
      </div>

      <div className="study__progress">
        <div className="study__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="study__scorebar">
        {scores.map((s, i) => (
          <div key={s.name} className="study__score-chip">
            <span className="study__score-name">{s.name}</span>
            <span className="study__score-pts">{s.points} pts</span>
          </div>
        ))}
      </div>

      <div className="study__stage">
        <div
          className="study__card"
          onClick={() => !flipped && setFlipped(true)}
        >
          <div className={`study__card-face study__card-front ${flipped ? 'study__face--hidden' : ''}`}>
            <span className="study__card-label">Front</span>
            <p className="study__card-text">{card.front}</p>
            <span className="study__card-hint">tap to reveal</span>
          </div>
          <div className={`study__card-face study__card-back ${!flipped ? 'study__face--hidden' : ''}`}>
            <span className="study__card-label">Back</span>
            <p className="study__card-text">{card.back}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="study__confidence">
          <p className="study__confidence-label">Award points</p>
          <div className="study__award-btns">
            {scores.map((s, i) => (
              <button
                key={s.name}
                className="study__award-btn"
                onClick={() => awardPoint(i)}
              >
                <span className="study__award-name">{s.name}</span>
                <span className="study__award-pts">{s.points} pts</span>
                <span className="study__award-plus">+{POINTS_CORRECT}</span>
              </button>
            ))}
          </div>
          <button className="study__next-btn" onClick={handleNext}>Next card →</button>
        </div>
      )}
    </div>
  );
}