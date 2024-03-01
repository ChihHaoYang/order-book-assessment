import React from 'react';
import { Roboto_Mono } from 'next/font/google';
import { formatNumber } from '../utils';

type PriceRowProps = {
  price: number;
  size: number;
  total: number;
  type: 'buy' | 'sell';
  flash: boolean;
};

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const PriceRow = React.memo(
  ({ price, size, total, type, flash }: PriceRowProps) => {
    const quoteClass = type === 'buy' ? 'text-quote-buy' : 'text-quote-sell';

    const trClass = flash
      ? type === 'buy'
        ? 'animate-green-flash'
        : 'animate-red-flash'
      : '';

    return (
      <tr
        className={`my-2 pointer  hover:bg-book-hover ${robotoMono.className} ${trClass}`}
      >
        <td className={`${quoteClass}`}>{formatNumber(price, 1)}</td>
        <td className='text-default text-right'>{formatNumber(size, 0)}</td>
        <td colSpan={3} className='text-default text-right'>
          {formatNumber(total, 0)}
        </td>
      </tr>
    );
  }
);

export default PriceRow;
