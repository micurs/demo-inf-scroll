import React from 'react';

export type Gender = 'male' | 'female' | 'all';

interface GenderSelectorProps {
  onSelect: (gender: Gender) => void;
}

export const GenderSelector = ({ onSelect }: GenderSelectorProps) => {
  const [gender, setGender] = React.useState<Gender>('all');

  React.useEffect(() => {
    onSelect(gender);
  }, [gender, onSelect]);

  return (
    <>
      <label className='label cursor-pointer'>
        <span className='label-text mx-2'>All</span>
        <input
          type='radio'
          name='radio-1'
          className='radio'
          checked={gender === 'all'}
          onChange={() => setGender('all')}
        />
      </label>
      <label className='label cursor-pointer'>
        <span className='label-text mx-2'>Female</span>
        <input
          type='radio'
          name='radio-2'
          className='radio'
          checked={gender === 'female'}
          onChange={() => setGender('female')}
        />
      </label>
      <label className='label cursor-pointer'>
        <span className='label-text mx-2'>Male</span>
        <input
          type='radio'
          name='radio-3'
          className='radio'
          checked={gender === 'male'}
          onChange={() => setGender('male')}
        />
      </label>
    </>
  );
};
