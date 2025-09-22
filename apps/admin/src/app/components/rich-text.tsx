import { ReactNode } from 'react';

type Tag = 'b' | 'i';

type Props = {
  children(tags: Record<Tag, (chunks: ReactNode) => ReactNode>): ReactNode;
};

export default function RichText({ children }: Props) {
  return (
    <>
      {children({
        b: (chunks: ReactNode) => <b>{chunks}</b>,
        i: (chunks: ReactNode) => <i>{chunks}</i>
      })}
    </>
  );
}
