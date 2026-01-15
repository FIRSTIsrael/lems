import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { Slide } from '../slide';

interface ImageSlideProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({
  src,
  alt = 'Image',
  width = 1920,
  height = 1080
}) => {
  return (
    <Slide>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          position: 'relative'
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
    </Slide>
  );
};
