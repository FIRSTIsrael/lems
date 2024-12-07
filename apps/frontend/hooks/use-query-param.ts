import { useRouter } from 'next/router';

export const useQueryParam = (
  param: string,
  initialState: string
): [string, (newValue: string) => Promise<boolean>] => {
  const router = useRouter();
  const { [param]: value } = router.query;
  const setValue = (newValue: string) =>
    router.push({ query: { ...router.query, [param]: newValue } });
  if (!value) setValue(initialState);
  return [(value ?? initialState) as string, setValue];
};
