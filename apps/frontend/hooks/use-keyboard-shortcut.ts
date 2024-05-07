import { useEffect, useCallback } from 'react';

type OptionalConfig = Pick<KeyboardDivision, 'altKey' | 'ctrlKey' | 'shiftKey'>;

interface ShortcutConfig extends Partial<OptionalConfig> {
  code: KeyboardDivision['code'];
  shortcutTarget?: HTMLElement;
}

type ShortcutAction = (e: KeyboardDivision) => void;

export default function useKeyboardShortcut(
  shortcutAction: ShortcutAction,
  config: ShortcutConfig
) {
  const targetElement = config.shortcutTarget || document;

  const eventHandler: DivisionListener = useCallback(
    evt => {
      const e = evt as KeyboardDivision;
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
