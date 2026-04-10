import { useState, useEffect } from 'react';
import { getStudyCards, submitReview } from './api';
import './StudyMode.css';

const LABELS = ['', 'Blackout', 'Hard', 'Unsure', 'Good', 'Perfect'];

export default function StudyMode({ deck, onBack }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudyCards(deck.id).then(c => {
      setCards(c);
      setLoading(false);
      if (c.length === 0) setDone(true);
    });
  }, [deck.id]);

  const handleConfidence = async (confidence) => {
    const card = cards[index];
    await submitReview(card.id, confidence);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  };

  if (loading) return <div className="study__loading">Loading...</div>;

  if (done) return (
    <div className="study__done">
      <div className="study__done-inner">
        <h1 className="study__done-title">Done!</h1>
        <p className="study__done-sub">All cards reviewed for today.</p>
        <button className="study__done-btn" onClick={onBack}>← Back to deck</button>
      </div>
    </div>
  );

  const card = cards[index];
  const progress = ((index) / cards.length) * 100;

  return (
    <div className="study">
      <div className="study__topbar">
        <button className="study__back" onClick={onBack}>← {deck.name}</button>
        <span className="study__progress-label">{index + 1} / {cards.length}</span>
      </div>

      <div className="study__progress">
        <div className="study__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="study__stage">
        <div
          className={`study__card ${flipped ? 'study__card--flipped' : ''}`}
          onClick={() => setFlipped(f => !f)}
        >
          <div className="study__card-inner">
            <div className="study__card-front">
              <span className="study__card-label">Front</span>
              <p className="study__card-text">{card.front}</p>
              <span className="study__card-hint">tap to reveal</span>
            </div>
            <div className="study__card-back">
              <span className="study__card-label">Back</span>
              <p className="study__card-text">{card.back}</p>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="study__confidence">
          <p className="study__confidence-label">How well did you know this?</p>
          <div className="study__confidence-btns">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`study__conf-btn study__conf-btn--${n}`}
                onClick={() => handleConfidence(n)}
              >
                <span className="study__conf-num">{n}</span>
                <span className="study__conf-name">{LABELS[n]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}