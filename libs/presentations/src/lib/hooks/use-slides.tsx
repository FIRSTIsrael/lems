'use client';

import { useState, useEffect, useId } from 'react';
import { SlideId } from '../components/deck';

export const PLACEHOLDER_CLASS_NAME = 'lems-slide';

// This hook actually goes and looks for <Slide> elements rendered
// lower in the tree. Slides decide on an ID for themselves and
// communicate via the `data-slide-id` element on their placeholder.
// Slide IDs are updated whenever the children are updated, allowing for
// dynamic presentation rendering.
export function useCollectSlides(children: React.ReactNode) {
  const [initialized, setInitialized] = useState(false);
  const [slideContainer, setSlideContainer] = useState<HTMLElement | null>();
  const [slideIds, setSlideIds] = useState<SlideId[]>([]);

  useEffect(() => {
    if (!slideContainer) return;
    const slides = slideContainer.getElementsByClassName(
      PLACEHOLDER_CLASS_NAME
    ) as unknown as Iterable<HTMLElement>;

    const nextSlideIds: SlideId[] = [];
    for (const placeholderNode of slides) {
      const { slideId } = placeholderNode.dataset;
      if (slideId !== undefined) {
        nextSlideIds.push(slideId);
      }
    }

    // Set state here is OK -> no chance of cascading renders
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlideIds(nextSlideIds);
    setInitialized(true);
  }, [slideContainer, children]);

  return [setSlideContainer, slideIds, initialized] as const;
}

export function useSlide(userProvidedId?: SlideId) {
  const id = useId();
  const [slideId] = useState<SlideId>(userProvidedId || id);
  return {
    slideId,
    placeholder: <div className={PLACEHOLDER_CLASS_NAME} data-slide-id={slideId} />
  };
}
