import { useEffect, useCallback } from 'react';

type OptionalConfig = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'shiftKey'>;

interface ShortcutConfig extends Partial<OptionalConfig> {
  code: KeyboardEvent['code'];
  shortcutTarget?: HTMLElement;
}

type ShortcutAction = (e: KeyboardEvent) => void;

export default function useKeyboardShortcut(
  shortcutAction: ShortcutAction,
  config: ShortcutConfig
) {
  const targetElement = config.shortcutTarget || document;

  const eventHandler: EventListener = useCallback(
    evt => {
      const e = evt as KeyboardEvent;
      const { code, ctrlKey, altKey, shiftKey } = e;
      if (config.code !== code) return;
      if (config.ctrlKey && !ctrlKey) return;
      if (config.shiftKey && !shiftKey) return;
      if (config.altKey && !altKey) return;

      shortcutAction(e);
    },
    [shortcutAction, config]
  );

  useEffect(() => {
    targetElement.addEventListener('keydown', eventHandler);
    return () => targetElement.removeEventListener('keydown', eventHandler);
  }, [targetElement, eventHandler]);
}
