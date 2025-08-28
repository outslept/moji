import * as React from 'react';
import { observeElementRect } from './observe-element-rect';

import type { Measurable } from './observe-element-rect';

function useRect(measurable: Measurable | null) {
  const [rect, setRect] = React.useState<DOMRect>();
  React.useEffect(() => {
    if (measurable) {
      const unobserve = observeElementRect(measurable, setRect);
      return () => {
        setRect(undefined);
        unobserve();
      };
    }
    return;
  }, [measurable]);
  return rect;
}

export { useRect };
