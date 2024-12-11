import { useRouter } from 'next/router';

export const useQueryParam = (
  param: string,
  initialState: string
): [string, (newValue: string) => Promise<boolean>] => {
  const router = useRouter();
  const { [param]: value } = router.query;
  const anchor = router.asPath.split('#')[1];
  const setValue = (newValue: string) =>
    router.push({
      query: { ...router.query, [param]: newValue },
      hash: anchor,
    });
  if (!value) setValue(initialState);
  return [(value ?? initialState) as string, setValue];
};
