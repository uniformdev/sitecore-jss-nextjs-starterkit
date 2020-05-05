import { useContext } from 'react';
import { RouterContext } from './RouterContextProvider';

export function useRouter() {
  const { router } = useContext(RouterContext);
  return router;
}
