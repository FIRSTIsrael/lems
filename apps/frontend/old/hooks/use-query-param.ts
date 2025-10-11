import { useRouter } from 'next/router';
import { useState } from 'react';

export const useQueryParam = (
  param: string,
  initialState: string,
  refresh = false,
  shallow = false
): [string, (newValue: string) => void] => {
  const router = useRouter();
  const { [param]: value } = router.query;
  const [_value, _setValue] = useState(value ?? initialState);

  const setValue = (newValue: string) => {
    if (refresh || !('URLSearchParams' in window)) {
      router.push({ query: { ...router.query, [param]: newValue } }, undefined, { shallow });
    } else {
      const url = new URL(window.location.toString());
      url.searchParams.set(param, newValue);
      history.pushState(null, '', url);
    }
    _setValue(newValue);
  };

  return [_value as string, setValue];
};
