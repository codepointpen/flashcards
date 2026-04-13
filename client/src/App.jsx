import { useState } from 'react';
import DeckList from './DeckList';
import CardEditor from './CardEditor';
import StudyMode from './StudyMode';

export default function App() {
  const [view, setView] = useState('decks');
  const [selectedDeck, setSelectedDeck] = useState(null);

  const goToDeck = (deck) => { setSelectedDeck(deck); setView('editor'); };
  const goToStudy = () => setView('study');
  const goToDecks = () => { setView('decks'); setSelectedDeck(null); };
  const goToEditor = () => setView('editor');

  if (view === 'decks') return <DeckList onSelectDeck={goToDeck} />;
  if (view === 'editor') return <CardEditor deck={selectedDeck} onBack={goToDecks} onStudy={goToStudy} />;
  if (view === 'study') return <StudyMode deck={selectedDeck} onBack={goToEditor} />;
}