'use client';
import { useEffect, useState, useRef } from 'react';
import { PriceRow, LastPrice, OrderBookHead } from './components';
import useWebSocket from 'react-use-websocket';

const ROWS_TO_SHOW = 8;

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
  const [showedPrice, setShowedPrice] = useState<{ [key: string]: boolean }>(
    {}
  );
  const seqNum = useRef<number | null>(null);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [lastPriceChange, setLastPriceChange] = useState<
    'high' | 'low' | 'same'
  >('same');
  const bidsSum = getSumOfValues(bids);
  const asksSum = getSumOfValues(asks);

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

  function updateShowedPrice(
    bids: [string, string][],
    asks: [string, string][]
  ) {
    const newShowed = { ...showedPrice };
    [
      ...bids.slice(0, ROWS_TO_SHOW + 1),
      ...asks.slice(0, ROWS_TO_SHOW + 1)
    ].forEach(e => {
      newShowed[e[0]] = true;
    });
    setShowedPrice(newShowed);
  }

  function getSumOfValues(values: [string, string][]) {
    return values.slice(0, ROWS_TO_SHOW + 1).reduce((acc, curr) => {
      acc += parseInt(curr[1]);
      return acc;
    }, 0);
  }

  function getUpdatedValues(
    prev: [string, string][],
    incoming: [string, string][]
  ) {
    let newData = [...prev];
    for (const delta of incoming) {
      for (const value of newData) {
        if (delta[0] === value[0]) {
          value[1] = delta[1];
          break;
        } else if (+delta[0] > +value[0]) {
          newData.push(delta);
          break;
        }
      }
    }

    // Remove 0 values and sort
    newData = newData.filter(e => e[1] !== '0').sort((a, b) => +b[0] - +a[0]);

    return newData;
  }

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
            updateShowedPrice(data.bids, data.asks);
            setBids(data.bids);
            setAsks(data.asks);
            break;
          case 'delta':
            if (!seqNum.current) {
              seqNum.current = data.seqNum;
            } else if (seqNum.current !== data.prevSeqNum) {
              // Resubscribe if seqNum is wrong
              orderBookSocket.sendJsonMessage({
                op: 'unsubscribe',
                args: ['update:BTCPFC_0']
              });
              orderBookSocket.sendJsonMessage({
                op: 'subscribe',
                args: ['update:BTCPFC_0']
              });
              break;
            }
            const newBids = getUpdatedValues(bids, data.bids);
            const newAsks = getUpdatedValues(asks, data.asks);
            setBids(newBids);
            setAsks(newAsks);
            updateShowedPrice(newBids, newAsks);
            break;
        }
        break;
      }
    }
  }

  function renderRows(type: 'sell' | 'buy') {
    const data = type === 'sell' ? asks : bids;
    return data.slice(0, ROWS_TO_SHOW + 1).map((value, index, arr) => {
      const total = arr.slice(index).reduce((acc, curr) => {
        acc += parseInt(curr[1]);
        return acc;
      }, 0);
      return (
        <PriceRow
          key={value[0]}
          price={+value[0]}
          size={+value[1]}
          total={total}
          type={type}
          flash={showedPrice[value[0]]}
          percentage={(+value[1] / (type === 'sell' ? asksSum : bidsSum)) * 100}
        />
      );
    });
  }

  return (
    <div className='h-full flex justify-center items-center'>
      <div className='flex flex-col bg-book w-80 py-2 px-1'>
        <h2 className='text-default font-bold'>Order Book</h2>
        <table className='border-spacing-1.5 border-separate border-spacing-x-0'>
          <OrderBookHead />
          <tbody className='text-sm'>
            {renderRows('sell')}
            <LastPrice price={lastPrice} change={lastPriceChange} />
            {renderRows('buy')}
          </tbody>
        </table>
      </div>
    </div>
  );
}
