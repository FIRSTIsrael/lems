import Image from 'next/image';
import { Slide } from '@lems/presentations';

interface ImageSlideProps {
  src: string;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ src }) => {
  return (
    <Slide>
      <Image
        src={src}
        width={0}
        height={0}
        sizes="100vw"
        alt="שקף של תמונה"
        style={{
          padding: 200,
          objectFit: 'cover',
          width: '100%',
          height: 'auto'
        }}
      />
    </Slide>
  );
};

export default ImageSlide;
