import React from 'react';
import axios from 'axios';
// import { throttle } from 'throttle-debounce';

import './App.css';
import { Gender, GenderSelector } from './components/gender-selector';
import { ObserverStatus, useIntersectionObserver } from './hooks/use-intersection-observer';
import { UserInfo, UsersData } from './types';
import { UserBadge } from './components/user-badge';

/**
 * Load users from the `randomuser.me` API
 * @param page - Page number to load
 * @returns the response data
 */
const loadMoreUsers = (page: number): Promise<UsersData> => {
  return axios.get(`https://randomuser.me/api/?page=${page}&results=8&seed=rtx${page}`).then((res) => {
    return res.data;
  });
};

const matchGender = (matchGender: Gender) => (user: UserInfo) => {
  return matchGender === 'all' || user.gender === matchGender;
};

function App() {
  const [usersInfo, setUsersInfo] = React.useState<UserInfo[]>([]);
  const loadMore = React.useRef<HTMLDivElement>(null);
  const [gender, setGender] = React.useState<Gender>('all');

  const handleGenderSelect = (newGender: Gender) => {
    if (newGender !== gender) {
      setGender(newGender);
      console.log('Gender', newGender);
    }
  };

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
      <h1 className='title bg-neutral border-accent border-b '>
        <div className='text-2xl font-bold p-2'>Infinite Scroll Demo</div>
        <div className='text-sm border border-base-100 flex-1 rounded-lg leading-8 mx-4 flex justify-around'>
          <GenderSelector onSelect={handleGenderSelect} />
        </div>
        <div className='text-sm'>
          {page}/{usersInfo.length}
        </div>
      </h1>
      <div className='scrollable bg-base-100'>
        <ul className='page'>
          {usersInfo.filter(matchGender(gender)).map((u, i) => (
            <UserBadge
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

export default App;
