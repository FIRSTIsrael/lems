import Image from 'next/image';
import { getRegionFlagUrl } from '../utils';

interface FlagProps
  extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height' | 'fill'> {
  region: string;
  size: number;
}

export const Flag: React.FC<FlagProps> = ({ region, size = 16, ...props }) => {
  const src = getRegionFlagUrl(region);

  return <Image {...props} src={src} alt={region} width={size} height={size} />;
};
