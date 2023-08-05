import React from 'react';

type LoadingPageCb = (page: number) => Promise<void>;
export type ObserverStatus = 'loading' | 'complete' | 'ready';

const ioOption = {
  threshold: 0.01,
  rootMargin: '50px',
};

/**
 *
 * @param loadingPageCb - Function to call when the loadMore is visible
 * @param loadMoreEl - Ref to the element that will be observed
 * @returns
 */
export const useIntersectionObserver = (
  loadingPageCb: LoadingPageCb,
  loadMoreEl: React.RefObject<HTMLDivElement>
): [ObserverStatus, number] => {
  const [loading, setLoading] = React.useState(false);
  const [pageNum, setPageNum] = React.useState(0);
  const [io, setIo] = React.useState<IntersectionObserver | null>(null);

  // Initialize the IntersectionObserver once the loadingPageCb is set
  React.useEffect(() => {
    // internal page counter
    let page = 0;
    // Internal callback for the IntersectionObserver
    const intersectCb = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && entry.intersectionRatio > 0.0) {
        setLoading(true);
        page += 1;
        loadingPageCb(page).then(() => {
          setLoading(false);
          setPageNum(page);
        });
      }
    };
    // Create the IntersectionObserver and set it to state
    setIo(new IntersectionObserver(intersectCb, ioOption));
  }, [loadingPageCb]);

  // Observe the loadMore element once the IntersectionObserver is set
  React.useEffect(() => {
    if (!loading && io && loadMoreEl.current) {
      const cio = io;
      const el = loadMoreEl.current;
      cio.observe(el);
      return () => {
        cio.unobserve(el);
      };
    }
  }, [loading, loadMoreEl, io]);

  return [loading ? 'loading' : pageNum < 40 ? 'ready' : 'complete', pageNum];
};
