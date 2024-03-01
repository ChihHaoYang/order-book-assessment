import React from 'react';
import { formatNumber } from '../utils';

type PriceRowProps = {
  price: number;
  size: number;
  total: number;
  type: 'buy' | 'sell';
};

const PriceRow = ({ price, size, total, type }: PriceRowProps) => {
  const quoteClass = type === 'buy' ? 'text-quote-buy' : 'text-quote-sell';
  return (
    <tr className='my-2 pointer hover:bg-book-hover'>
      <td className={`${quoteClass}`}>{formatNumber(price, 1)}</td>
      <td className='text-default text-right'>{formatNumber(size, 0)}</td>
      <td className='text-default text-right'>{formatNumber(total, 0)}</td>
    </tr>
  );
};

export default PriceRow;
