import React from 'react';
import Image from 'next/image';
import { Roboto_Mono } from 'next/font/google';
import { formatNumber } from '../utils';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

type LastPriceProps = {
  price: number;
  change: 'same' | 'high' | 'low';
};

const LastPrice = ({ price, change }: LastPriceProps) => {
  const cellClass: string = {
    same: 'text-last-p-same bg-last-p-same',
    low: 'text-last-p-low bg-last-p-low',
    high: 'text-last-p-high bg-last-p-high'
  }[change];

  const renderIcon = () => {
    return (
      <>
        <Image
          src='/IconGreenArrowDown.svg'
          className={`rotate-180 ${change === 'high' ? '' : 'hidden'}`}
          width={16}
          height={16}
          alt='arrow up'
        />
        <Image
          src='/IconRedArrowDown.svg'
          className={`${change === 'low' ? '' : 'hidden'}`}
          width={16}
          height={16}
          alt='arrow down'
        />
      </>
    );
  };

  return (
    <tr>
      <td
        className={`text-default text-lg text-center ${cellClass}`}
        colSpan={3}
      >
        <div
          className={`flex justify-center items-center font-bold ${robotoMono.className}`}
        >
          {formatNumber(price, 1)}
          <div className='ml-1'>{renderIcon()}</div>
        </div>
      </td>
    </tr>
  );
};

export default LastPrice;
