import React from 'react';
import { Slide } from '../slide';
import { Appear } from '../appear';

interface TitleSlideProps {
  primary: string;
  secondary?: string;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary }) => {
  return (
    <Slide>
      <div className="flex flex-col items-center justify-center h-full gap-8 px-20 text-center">
        <Appear activeStyle={{ opacity: 1, scale: 1 }} inactiveStyle={{ opacity: 0, scale: 0.8 }}>
          <h1 className="text-8xl font-bold text-white">{primary}</h1>
        </Appear>
        {secondary && (
          <Appear activeStyle={{ opacity: 1, scale: 1 }} inactiveStyle={{ opacity: 0, scale: 0.8 }}>
            <p className="text-5xl text-gray-200">{secondary}</p>
          </Appear>
        )}
      </div>
    </Slide>
  );
};
