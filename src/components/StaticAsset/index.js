import { useContext } from 'react';
import { StaticAssetContext } from '../../lib/StaticAssetContext';

export default function StaticAsset({ path, children, ...otherProps }) {
  const { assetPrefix } = useContext(StaticAssetContext);

  const newProps = {
    ...otherProps,
    path: `${assetPrefix ? assetPrefix : ''}${path}`,
  };

  return children(newProps);
}
