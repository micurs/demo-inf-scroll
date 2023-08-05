import { UserInfo } from '../types';
/**
 * React component to display a user
 * @param param0 - { user: UserInfo }
 * @returns
 */
export const UserBadge = ({ user }: { user: UserInfo }) => {
  return (
    <li className='card w-40 border-secondary border bg-neutral text-primary card-compact shadow-x mr-6 my-3 p-0'>
      <figure>
        <img
          className='w-full bor'
          src={user.picture.large}
          alt='user'
        />
      </figure>
      <div className='card-body'>
        <h2 className='text-lg'>
          {user.name.title} {user.name.first} {user.name.last}
        </h2>
      </div>
    </li>
  );
};
