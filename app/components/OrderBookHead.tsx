import React from 'react';

const OrderBookHead = () => {
  return (
    <thead className='text-quote-head text-sm'>
      <tr>
        <th className='text-left'>Price (USD)</th>
        <th className='text-right'>Size</th>
        <th className='text-right'>Total</th>
      </tr>
    </thead>
  );
};

export default OrderBookHead;
