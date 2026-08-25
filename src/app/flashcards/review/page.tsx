'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Flashcard = {
  id: string;
  front: string;
  back: string;
  accessExpiresAt: string | null;
  progress?: any;
};

export default function FlashcardsReviewPage() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDueCards = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/flashcards/due?limit=10000');
      
      if (res.status === 401) {
        setError('Please log in to access flashcards');
        return;
      }
      
      if (res.status === 403) {
        setError('No active purchase - go to Products to buy access');
        return;
      }
      
      if (!res.ok) throw new Error('Failed to fetch cards');

      const data = await res.json();

      if (!data.success || !Array.isArray(data.due)) {
        throw new Error('Invalid response from server');
      }

      setAccessExpiresAt(data.due[0]?.accessExpiresAt || null);
      setCards(data.due);
      
      if (data.due.length === 0) {
        setError('🎉 No flashcards available yet.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleCardReview = async (difficulty: 'easy' | 'difficult') => {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });

      if (!res.ok) throw new Error('Failed to record review');

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setError('🎉 You\'ve reviewed all cards!');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCard = cards[currentIndex];

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen pt-32 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">Sign in required</h1>
          <p className="body-readable text-[#8a8279] text-sm mb-8">Please log in to access your flashcards.</p>
          <Link href="/login" className="btn-industrial px-6 py-3 text-[10px]">
            SIGN IN →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#8a8279] text-sm">Loading flashcards…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#c85b3a] text-sm mb-6">{error}</p>
          {error.includes('purchase') && (
            <Link href="/products" className="btn-industrial px-6 py-3 text-[10px]">
              BROWSE PRODUCTS →
            </Link>
          )}
          {!error.includes('purchase') && error.includes('reviewed all') && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="btn-industrial px-6 py-3 text-[10px]"
            >
              RESTART REVIEW →
            </button>
          )}
          {!error.includes('purchase') && !error.includes('reviewed all') && (
            <button
              onClick={fetchDueCards}
              className="btn-industrial px-6 py-3 text-[10px]"
            >
              RELOAD →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/account"
          className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
        >
          ← BACK TO ACCOUNT
        </Link>

        <div className="mb-10">
          <span className="meta text-[#c85b3a] text-sm">REVIEW</span>
          <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold">Flashcards</h1>
          <p className="body-readable text-[#8a8279] text-sm mt-2">
            {currentIndex + 1} of {cards.length} cards
            {accessExpiresAt && (
              <span className="ml-2">
                • Access until {new Date(accessExpiresAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <div
          onClick={handleFlip}
          className="min-h-[400px] bg-[#1a1815] border border-white/[0.06] rounded p-12 cursor-pointer transition-all duration-500 flex items-center justify-center text-center hover:border-white/[0.1]"
        >
          <div>
            <p className="meta text-[#c85b3a] text-[10px] tracking-[2px] mb-6">
              {isFlipped ? 'ANSWER' : 'QUESTION'}
            </p>
            <p className="body-readable text-white text-lg leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          {!isFlipped ? (
            <button
              onClick={handleFlip}
              disabled={isSubmitting}
              className="btn-industrial px-8 py-3 text-[10px] disabled:opacity-50"
            >
              REVEAL ANSWER
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => handleCardReview('easy')}
                disabled={isSubmitting}
                className="btn-industrial px-8 py-3 text-[10px] disabled:opacity-50"
              >
                {isSubmitting ? 'SAVING...' : 'GOT IT →'}
              </button>
              <button
                onClick={() => handleCardReview('difficult')}
                disabled={isSubmitting}
                className="btn-industrial-outline px-8 py-3 text-[10px] disabled:opacity-50"
              >
                {isSubmitting ? 'SAVING...' : 'DIFFICULT →'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[#4a453f] mt-12 text-[10px] meta">
          Total cards in database: {cards.length}
        </p>
      </div>
    </div>
  );
}