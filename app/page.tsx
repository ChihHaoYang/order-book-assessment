'use client';
import { useEffect, useState, useRef } from 'react';
import PriceRow from './PriceRow';
import LastPrice from './LastPrice';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface SocketResponse {
  topic: string;
}

interface OrderBookResponse extends SocketResponse {
  data: {
    bids: [string, string][];
    asks: [string, string][];
    seqNum: number;
    prevSeqNum: number;
    type: string;
    timestamp: number;
    symbol: string;
  };
}

interface LastPriceResponse extends SocketResponse {
  data: {
    price: number;
    side: 'BUY' | 'SELL';
    symbol: string;
    size: number;
    tradeId: number;
    timestamp: number;
  }[];
}

export default function Home() {
  const [messageList, setMessageList] = useState<MessageEvent<any>[]>([]);
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [lastPriceChange, setLastPriceChange] = useState<
    'high' | 'low' | 'same'
  >('same');

  const orderBookSocket = useWebSocket('wss://ws.btse.com/ws/oss/futures', {
    onOpen: () => {
      console.log('orderbook opened');
    },
    onMessage: message => {
      handleOnMessage(message);
      setMessageList([...messageList, message]);
    },
    shouldReconnect: closeEvent => true
  });

  const lastPriceSocket = useWebSocket('wss://ws.btse.com/ws/futures', {
    onOpen: () => {
      console.log('lastprice opened');
    },
    onMessage: message => {
      handleOnMessage(message);
      setMessageList([...messageList, message]);
    },
    shouldReconnect: closeEvent => true
  });

  useEffect(() => {
    const { sendJsonMessage } = orderBookSocket;
    sendJsonMessage({ op: 'subscribe', args: ['update:BTCPFC_0'] });
    return () => {
      sendJsonMessage({ op: 'unsubscribe', args: ['update:BTCPFC_0'] });
    };
  }, []);

  useEffect(() => {
    const { sendJsonMessage } = lastPriceSocket;
    sendJsonMessage({
      op: 'subscribe',
      args: ['tradeHistoryApi:BTCPFC']
    });
  }, []);

  function handleOnMessage(message: MessageEvent<any>) {
    const parsedMessage: SocketResponse = JSON.parse(message.data);
    const { topic } = parsedMessage;
    switch (topic) {
      case 'tradeHistoryApi': {
        const { data } = parsedMessage as LastPriceResponse;
        const newPrice = data[0].price;
        setLastPriceChange(
          newPrice > lastPrice
            ? 'high'
            : newPrice === lastPrice
            ? 'same'
            : 'low'
        );
        setLastPrice(data[0].price);
        break;
      }
      case 'update:BTCPFC_0': {
        const { data } = parsedMessage as OrderBookResponse;
        switch (data.type) {
          case 'snapshot':
            setBids(data.bids.slice(0, 9));
            setAsks(data.asks.slice(0, 9));
            break;
          case 'delta':
            break;
        }
        break;
      }
    }
  }

  const getLastPriceClass = () => {
    switch (lastPriceChange) {
      case 'same':
        return 'text-last-p-same bg-last-p-same';
      case 'low':
        return 'text-last-p-low bg-last-p-low';
      case 'high':
        return 'text-last-p-high bg-last-p-high';
    }
  };

  return (
    <div className='h-full flex justify-center items-center'>
      <div className='flex flex-col bg-book w-60 p-2'>
        <h2 className='text-default font-bold'>Order Book</h2>
        <table className='border-spacing-1.5 border-separate border-spacing-x-0'>
          <thead className='text-quote-head text-sm'>
            <tr>
              <th className='text-left'>Price (USD)</th>
              <th className='text-right'>Size</th>
              <th className='text-right'>Total</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {bids.map(bid => (
              <PriceRow
                key={bid[0]}
                price={+bid[0]}
                size={+bid[1]}
                total={+bid[1]}
                type='sell'
              />
            ))}
            <LastPrice price={lastPrice} className={getLastPriceClass()} />
            {asks.map(ask => (
              <PriceRow
                key={ask[0]}
                price={+ask[0]}
                size={+ask[1]}
                total={+ask[1]}
                type='buy'
              />
            ))}
            {/* <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <PriceRow price={21710.5} size={1051} total={26372} type='sell' />
            <tr>
              <td className='text-default text-center' colSpan={3}>
                216110.0
              </td>
            </tr>
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' />
            <PriceRow price={21710.5} size={1051} total={26372} type='buy' /> */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
