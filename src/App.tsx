import React from 'react';
import axios from 'axios';
// import { throttle } from 'throttle-debounce';

import './App.css'

const loadMoreUsers = (page: number) => {
  return axios.get(`https://randomuser.me/api/?page=${page}&results=12&seed=rtx${page}`).then((res) => {
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
  rootMargin: '1px',
};

type LoadingPageCb = (page: number) => Promise<void>;
type ObserverStatus = 'loading' | 'complete' | 'ready';

/**
 *
 * @param loadingPageCb - Function to call when the loadMore is visible
 * @param loadMoreEl - Ref to the element that will be observed
 * @returns
 */
const useIntersectionObserver = (
  loadingPageCb: LoadingPageCb,
  loadMoreEl: React.RefObject<HTMLDivElement>
): [ObserverStatus, number] => {
  const [loading, setLoading] = React.useState(false);
  const [pageNum, setPageNum] = React.useState(0);
  const [io, setIo] = React.useState<IntersectionObserver | null>(null);

  React.useEffect(() => {
    let page = 0;
    const intersectCb = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && entry.intersectionRatio > 0.0) {
        setLoading(true);
        page += 1;
        loadingPageCb(page).then(() => {
          console.log('Loaded page', page);
          setLoading(false);
          setPageNum(page);
        });
      }
    };

    console.log('Creating IntersectionObserver');
    setIo(new IntersectionObserver(intersectCb, ioOption));
  }, [loadingPageCb]);

  React.useEffect(() => {
    if (!loading && io && loadMoreEl.current) {
      const cio = io;
      const el = loadMoreEl.current;
      console.log('Observing element', el.id);
      cio.observe(el);
      return () => {
        cio.unobserve(el);
      };
    }
  }, [loading, loadMoreEl, io]);

  return [loading ? 'loading' : pageNum < 20 ? 'ready' : 'complete', pageNum];
};

function App() {
  const [usersInfo, setUsersInfo] = React.useState<UserInfo[]>([]);
  const loadMore = React.useRef<HTMLDivElement>(null);

  const loadUsers = React.useRef((pageNum: number) => {
    return loadMoreUsers(pageNum).then((data) => {
      setUsersInfo((u) => [...u, ...data.results]);
    });
  });

  const [status, page] = useIntersectionObserver(loadUsers.current, loadMore);

  const listBottom = (status: ObserverStatus) => {
    switch (status) {
      case 'loading':
        return <div className='end-of-list'>Loading more...</div>;
      case 'complete':
        return <div className='end-of-list'>End of list</div>;
      case 'ready':
        return (
          <div
            id='load-more'
            ref={loadMore}
            className='end-of-list'
          >
            More users to read ...
          </div>
        );
    }
  };

  return (
    <>
      <h1 className='title'>
        <div className='text-3xl font-bold p-2'>Infinite Scroll Demo</div>
        <div className='text-sm'>
          {page}/{usersInfo.length}
        </div>
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
