import React, { useEffect, useState, useRef } from 'react';
import { Roboto_Mono } from 'next/font/google';
import { formatNumber } from '../utils';

type PriceRowProps = {
  price: number;
  size: number;
  total: number;
  type: 'buy' | 'sell';
  flash: boolean;
  percentage: number;
};

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const PriceRow = ({
  price,
  size,
  total,
  type,
  flash,
  percentage
}: PriceRowProps) => {
  const [flashCellClass, setFlashCellClass] = useState<string>('');
  const prevSize = useRef<number>(size);
  const quoteClass = type === 'buy' ? 'text-quote-buy' : 'text-quote-sell';

  useEffect(() => {
    if (prevSize.current) {
      if (prevSize.current > size) {
        setFlashCellClass('animate-green-flash');
        prevSize.current = size;
      } else if (prevSize.current < size) {
        setFlashCellClass('animate-red-flash');
        prevSize.current = size;
      }
      setTimeout(() => {
        setFlashCellClass('');
      }, 1000);
    } else {
      setFlashCellClass('');
      prevSize.current = size;
    }
  }, [size]);

  const trClass = flash
    ? type === 'buy'
      ? 'animate-green-flash'
      : 'animate-red-flash'
    : '';

  const barClass = type === 'buy' ? 'bg-bar-buy' : 'bg-bar-sell';

  return (
    <tr
      className={`relative my-2 pointer  hover:bg-book-hover ${robotoMono.className} ${trClass}`}
    >
      <td className={`${quoteClass}`}>{formatNumber(price, 1)}</td>
      <td className={`text-default text-right ${flashCellClass}`}>
        {formatNumber(size, 0)}
      </td>
      <td colSpan={3} className='text-default text-right'>
        {formatNumber(total, 0)}
      </td>
      <td
        className={`absolute h-full right-0 ${barClass}`}
        style={{ width: `${percentage}%` }}
      />
    </tr>
  );
};

export default React.memo(PriceRow);
