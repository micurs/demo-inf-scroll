import React from 'react';
import axios from 'axios';
// import { throttle } from 'throttle-debounce';

import './App.css'

const loadMoreUsers = (page: number) => {
  return axios.get('https://randomuser.me/api/?page=${page}&results=20&seed=rtx${page}').then((res) => {
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
  rootMargin: '0px',
};

function App() {
  const [usersInfo, setUsersInfo] = React.useState<UserInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageNum, setPageNum] = React.useState<number>(1);
  const loadMore = React.useRef<HTMLDivElement>(null);

  const intersectCb = React.useCallback(
    (entries: IntersectionObserverEntry[], _observer: IntersectionObserver) => {
      const entry = entries[0];
      console.log('intersectCb', entry.intersectionRatio);
      if (entry.isIntersecting && entry.intersectionRatio > 0.0) {
        console.log('Increase Page:', pageNum + 1);
        setPageNum((p) => p + 1);
      }
    },
    [pageNum]
  );

  const io = React.useRef(new IntersectionObserver(intersectCb, ioOption));

  const loadUsers = async (pageNum: number) => {
    setLoading(true);
    loadMoreUsers(pageNum).then((data) => {
      setUsersInfo((u) => [...u, ...data.results]);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    if (pageNum < 40) {
      loadUsers(pageNum);
    }
  }, [pageNum]);

  React.useEffect(() => {
    // console.log('Loading:', loading);
    if (!loading) {
      // console.log('Setting up intersection observer ');
      const cio = io.current;
      const lm = loadMore.current;
      lm && cio.observe(lm);
      return () => {
        lm && cio.unobserve(lm);
      };
    }
  }, [loading, loadMore]);

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
        {pageNum < 40 ? (
          loading ? (
            <div className='end-of-list'>Loading more...</div>
          ) : (
            <div
              ref={loadMore}
              className='end-of-list'
            >
              If you see this it must Load more
            </div>
          )
        ) : (
          <div className='end-of-list'>End of list</div>
        )}
      </div>
    </>
  );
}

export default App
