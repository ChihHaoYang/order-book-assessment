'use client';
import { useEffect, useState, useRef } from 'react';
import { PriceRow, LastPrice, OrderBookHead } from './components';
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
    // OrderBook Effect
    const { sendJsonMessage } = orderBookSocket;
    sendJsonMessage({ op: 'subscribe', args: ['update:BTCPFC_0'] });
    return () => {
      sendJsonMessage({ op: 'unsubscribe', args: ['update:BTCPFC_0'] });
      orderBookSocket.getWebSocket()?.close();
    };
  }, []);

  useEffect(() => {
    // Trade History (Last price) Effect
    const { sendJsonMessage } = lastPriceSocket;
    sendJsonMessage({
      op: 'subscribe',
      args: ['tradeHistoryApi:BTCPFC']
    });
    return () => {
      lastPriceSocket.getWebSocket()?.close();
    };
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
            setBids(data.bids);
            setAsks(data.asks);
            break;
          case 'delta':
            break;
        }
        break;
      }
    }
  }

  return (
    <div className='h-full flex justify-center items-center'>
      <div className='flex flex-col bg-book w-60 py-2 px-1'>
        <h2 className='text-default font-bold'>Order Book</h2>
        <table className='border-spacing-1.5 border-separate border-spacing-x-0'>
          <OrderBookHead />
          <tbody className='text-sm'>
            {asks.slice(0, 9).map((ask, index, arr) => {
              const total = arr.slice(index).reduce((acc, curr) => {
                acc += parseInt(curr[1]);
                return acc;
              }, 0);
              return (
                <PriceRow
                  key={ask[0]}
                  price={+ask[0]}
                  size={+ask[1]}
                  total={total}
                  type='sell'
                  flash={showedPrice[ask[0]]}
                />
              );
            })}
            <LastPrice price={lastPrice} change={lastPriceChange} />
            {bids.slice(0, 9).map((bid, index, arr) => {
              const total = arr.slice(index).reduce((acc, curr) => {
                acc += parseInt(curr[1]);
                return acc;
              }, 0);
              return (
                <PriceRow
                  key={bid[0]}
                  price={+bid[0]}
                  size={+bid[1]}
                  total={total}
                  type='buy'
                  flash={showedPrice[bid[0]]}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
