import React from 'react';
import { Slide } from '../slide';
import { Stepper } from '../appear';

export interface AdvancingTeamsAward {
  id: string;
  name: string;
  winner?: {
    id: string;
    name: string;
    number: number;
  };
}

interface AdvancingTeamsSlideProps {
  awards: AdvancingTeamsAward[];
}

export const AdvancingTeamsSlide: React.FC<AdvancingTeamsSlideProps> = ({ awards }) => {
  const teams = awards
    .filter(award => award.winner && 'number' in award.winner)
    .map(award => award.winner as { id: string; name: string; number: number });

  if (teams.length === 0) {
    return null;
  }

  return (
    <Slide>
      <div className="flex flex-col items-center justify-center h-full gap-8 px-20 text-center">
        <h2 className="text-6xl font-bold text-white mb-8">קבוצות מתקדמות</h2>
        <div className="grid grid-cols-2 gap-8 max-w-4xl">
          <Stepper
            values={teams as unknown[]}
            render={(team: unknown) => {
              const teamData = team as { id: string; name: string; number: number };
              return (
                <div
                  key={teamData.id}
                  className="p-6 rounded-lg transition-all bg-green-500 scale-105"
                >
                  <p className="text-4xl font-bold text-white">#{teamData.number}</p>
                  <p className="text-2xl text-white mt-2">{teamData.name}</p>
                </div>
              );
            }}
          />
        </div>
      </div>
    </Slide>
  );
};
