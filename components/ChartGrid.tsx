import React, { useState } from 'react';
import MetricChart from '@/components/Chart';
import { PlusCircle } from 'lucide-react';

interface MetricGridProps {
  metrics: Array<{ id: string; displayName: string }>;
  segments: Array<{ segmentKey: string; displayName: string; values: Array<{ segmentId: string; displayName: string }> }>;
}

interface Card {
  id: string;
  metric: string;
  segmentKey: string;
  segmentId: string;
  displayName: string;
}

const MetricGrid: React.FC<MetricGridProps> = ({ metrics, segments }) => {
  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      metric: metrics[0].id,
      segmentKey: segments[0].segmentKey,
      segmentId: segments[0].values[0].segmentId,
      displayName: `${metrics[0].displayName}, ${segments[0].values[0].displayName}`
    }
  ]);

  const getGridColumns = (cardCount: number) => {
    if (cardCount === 1) return 'grid-cols-1';
    if (cardCount === 2) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  const addCard = (id: string, position: 'left' | 'right') => {
    setCards(prevCards => {
      const index = prevCards.findIndex(card => card.id === id);
      const newCard: Card = {
        id: Date.now().toString(), // Generate a unique id
        metric: metrics[0].id,
        segmentKey: segments[0].segmentKey,
        segmentId: segments[0].values[0].segmentId,
        displayName: `${metrics[0].displayName}, ${segments[0].values[0].displayName}`
      };
      const newCards = [...prevCards];
      newCards.splice(position === 'left' ? index : index + 1, 0, newCard);
      return newCards;
    });
  };

  const updateCard = (id: string, metric: string, segmentKey: string, segmentId: string) => {
    setCards(prevCards => {
      return prevCards.map(card => {
        if (card.id === id) {
          const metricData = metrics.find(m => m.id === metric);
          const segmentData = segments.find(s => s.segmentKey === segmentKey)?.values.find(v => v.segmentId === segmentId);
          return {
            ...card,
            metric,
            segmentKey,
            segmentId,
            displayName: `${metricData?.displayName}, ${segmentData?.displayName}`
          };
        }
        return card;
      });
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className={`grid gap-4 ${getGridColumns(cards.length)}`}>
        {cards.map((card) => (
          <div key={card.id} className="relative group min-w-[300px]">
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => addCard(card.id, 'left')}
            >
              <PlusCircle className="text-white" fill='#119F97' />
            </button>
            <MetricChart
              {...card}
              metrics={metrics}
              segments={segments}
              onUpdate={(metric, segmentKey, segmentId) => updateCard(card.id, metric, segmentKey, segmentId)}
            />
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => addCard(card.id, 'right')}
            >
              <PlusCircle className="text-white" fill='#119F97' />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricGrid;