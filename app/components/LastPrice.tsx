import React from 'react';
import { formatNumber } from '../utils';

type PriceRowProps = {
  price: number;
  className: string;
};

const LastPrice = ({ price, className }: PriceRowProps) => {
  return (
    <tr>
      <td
        className={`text-default text-lg text-center ${className}`}
        colSpan={3}
      >
        {formatNumber(price, 1)}
      </td>
    </tr>
  );
};

export default LastPrice;
