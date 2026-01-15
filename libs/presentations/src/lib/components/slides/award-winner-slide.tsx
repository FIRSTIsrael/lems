import React from 'react';
import { Slide } from '../slide';
import { Appear } from '../appear';

export interface TeamWinner {
  id: string;
  name: string;
  number: number;
  affiliation?: {
    name: string;
    city: string;
  };
}

export interface PersonalWinner {
  id: string;
  name: string;
  team?: {
    id: string;
    name: string;
    number: number;
  };
}

export interface AwardWinnerSlideAward {
  id: string;
  name: string;
  place?: number;
  winner?: TeamWinner | PersonalWinner;
}

interface AwardWinnerSlideProps {
  award: AwardWinnerSlideAward;
  chromaKey?: boolean;
}

export const AwardWinnerSlide: React.FC<AwardWinnerSlideProps> = ({ award, chromaKey = false }) => {
  if (!award.winner) {
    return null;
  }

  const isTeamWinner = 'number' in award.winner;
  const winner = award.winner as TeamWinner | PersonalWinner;

  return (
    <Slide chromaKey={chromaKey}>
      <div
        className={`flex flex-col items-center justify-center h-full gap-8 px-20 text-center ${!chromaKey ? 'bg-gradient-to-b from-gray-800 to-gray-900' : ''}`}
      >
        <div className="flex flex-col items-center gap-6">
          <Appear activeStyle={{ opacity: 1, y: 0 }} inactiveStyle={{ opacity: 0, y: 20 }}>
            <div>
              <p className="text-5xl font-semibold text-gray-300 mb-4">פרס {award.name}</p>
              {award.place && award.place > 0 && (
                <p className="text-4xl text-gray-400">מקום {award.place}</p>
              )}
            </div>
          </Appear>

          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg px-12 py-8 max-w-2xl">
            <Appear
              activeStyle={{ opacity: 1, scale: 1 }}
              inactiveStyle={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-white">
                {isTeamWinner && 'number' in winner ? (
                  <>
                    <p className="text-3xl font-bold mb-2">
                      #{(winner as TeamWinner).number} {winner.name}
                    </p>
                    {(winner as TeamWinner).affiliation && (
                      <p className="text-2xl text-gray-300">
                        {(winner as TeamWinner).affiliation?.name},{' '}
                        {(winner as TeamWinner).affiliation?.city}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold mb-2">{winner.name}</p>
                    <p className="text-2xl text-gray-300">
                      {(winner as PersonalWinner).team?.name} (#
                      {(winner as PersonalWinner).team?.number})
                    </p>
                  </>
                )}
              </div>
            </Appear>
          </div>
        </div>
      </div>
    </Slide>
  );
};
