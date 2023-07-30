import React from 'react';
import axios from 'axios';
// import { throttle } from 'throttle-debounce';

import './App.css'

interface UsersData {
  info: {
    seed: string;
    page: number;
    results: number;
    version: string;
  };
  results: UserInfo[];
}

interface UserInfo {
  name: {
    title: string;
    first: string;
    last: string;
  };
  picture: {
    medium: string;
    large: string;
  };
}

type LoadingPageCb = (page: number) => Promise<void>;
type ObserverStatus = 'loading' | 'complete' | 'ready';

/**
 * Load users from the randomuser.me API
 * @param page - Page number to load
 * @returns the response data
 */
const loadMoreUsers = (page: number): Promise<UsersData> => {
  return axios.get(`https://randomuser.me/api/?page=${page}&results=36&seed=rtx${page}`).then((res) => {
    return res.data;
  });
};

/**
 * React component to display a user
 * @param param0 - { user: UserInfo }
 * @returns
 */
function UserInfo({ user }: { user: UserInfo }) {
  return (
    <li className='card w-40 bg-base-100 card-compact shadow-x mr-6 my-3 p-0'>
      <figure>
        <img
          className='w-full'
          src={user.picture.large}
          alt='user'
        />
      </figure>
      <div className='card-body'>
        <h2>
          {user.name.title} {user.name.first} {user.name.last}
        </h2>
      </div>
    </li>
  );
}

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
const useIntersectionObserver = (
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
          console.log('Loaded page', page);
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

  // Load the first page of users - we make sure to use the ref to the loadMore
  const loadUsers = React.useRef((pageNum: number) => {
    return loadMoreUsers(pageNum).then((data) => {
      setUsersInfo((u) => [...u, ...data.results]);
    });
  });

  const [status, page] = useIntersectionObserver(loadUsers.current, loadMore);

  const listBottom = (status: ObserverStatus) => {
    switch (status) {
      case 'loading':
        return (
          <div className='alert alert-info my-4 mx-auto w-96'>
            <span className='loading loading-infinity loading-lg'></span>
            Loading more...
          </div>
        );
      case 'complete':
        return (
          <div className='alert alert-success my-4 mx-auto w-96'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='stroke-current shrink-0 h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>End of list</span>
          </div>
        );
      case 'ready':
        return (
          <div
            id='load-more'
            ref={loadMore}
            className='alert alert-warning my-4 mx-auto w-96'
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
