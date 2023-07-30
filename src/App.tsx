import React from 'react';
import axios from 'axios';
// import { throttle } from 'throttle-debounce';

import './App.css'

const loadMoreUsers = (page: number) => {
  return axios.get('https://randomuser.me/api/?page=${page}&results=40&seed=rtx${page}').then((res) => {
    return res.data;
  });
};

interface UserInfo {
  name: {
    first: string;
    last: string;
  };
  picture: {
    medium: string;
  };
}

function UserInfo({ user }: { user: UserInfo }) {
  return (
    <li className='user-info'>
      <img
        src={user.picture.medium}
        className='w-16 h-16 rounded-full border-2 border-green-600'
        alt='user'
      />
      <div className='user-name'>
        {user.name.first} {user.name.last}
      </div>
    </li>
  );
}

type IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

const ioOption = {
  threshold: 0.1,
  rootMargin: '10px',
};

type LoadingPageCb = (pageNum: number) => Promise<void>;
type ObserverStatus = 'loading' | 'complete' | 'ready';

/**
 *
 * @param loadingPageCb - Function to call when the loadMore is visible
 * @param loadMoreEl - Ref to the element that will be observed
 * @returns
 */
const useIntersectionObserver = (loadingPageCb: LoadingPageCb, loadMoreEl: React.RefObject<HTMLDivElement>): ObserverStatus => {
  const [pageNum, setPageNum] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);

  const intersectCb = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      console.log('intersectCb', entry.intersectionRatio);
      if (entry.isIntersecting && entry.intersectionRatio > 0.0) {
        setLoading(true);
        loadingPageCb(pageNum + 1).then(() => {
          console.log('Increase Page:', pageNum + 1);
          setLoading(false);
          setPageNum((p) => p + 1);
        });
      }
    },
    [pageNum, loadingPageCb]
  );

  const io = React.useRef(new IntersectionObserver(intersectCb, ioOption));

  React.useEffect(() => {
    if (!loading && loadMoreEl.current) {
      const cio = io.current;
      const el = loadMoreEl.current;
      cio.observe(el);
      return () => {
        cio.unobserve(el);
      };
    }
  }, [loading, loadMoreEl]);

  return loading ? 'loading' : pageNum < 20 ? 'ready' : 'complete';
};

function App() {
  const [usersInfo, setUsersInfo] = React.useState<UserInfo[]>([]);
  const loadMore = React.useRef<HTMLDivElement>(null);

  const loadUsers = (pageNum: number) => {
    return loadMoreUsers(pageNum).then((data) => {
      setUsersInfo((u) => [...u, ...data.results]);
    });
  };

  const status = useIntersectionObserver(loadUsers, loadMore);

  const listBottom = (status: ObserverStatus) => {
    switch (status) {
      case 'loading':
        return <div className='end-of-list'>Loading more...</div>;
      case 'complete':
        return <div className='end-of-list'>End of list</div>;
      case 'ready':
        return (
          <div
            ref={loadMore}
            className='end-of-list'
          >
            If you see this it must Load more
          </div>
        );
    }
  };

  return (
    <>
      <h1 className='title'>
        <div>Infinite Scroll Demo</div>
        <div className='small'>{usersInfo.length}</div>
      </h1>
      <div className='scrollable'>
        <ul className='page'>
          {usersInfo.map((u, i) => (
            <UserInfo
              key={i}
              user={u}
            />
          ))}
        </ul>
        {listBottom(status)}
      </div>
    </>
  );
}

export default App
