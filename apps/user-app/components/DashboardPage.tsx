"use client"

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BalanceHistoryEntry, TimeRange, isLoadingState, selectedTimeState } from '../../../packages/store/src/atoms/balance';
import { sixMonthBalanceHistoryState } from '../../../packages/store/src/atoms/balance';
import { getWalletBalance } from '../app/lib/actions/getWalletBalance';
import { useEffect, useState } from 'react';
import { sessionState } from '@repo/store/session';
import { getBalance } from '../app/lib/actions/createOnrampTransaction';
import Loading from '@repo/ui/loading';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const DashboardPage = () => {
  const session = useRecoilValue(sessionState);
  const [selectedTime, setSelectedTime] = useRecoilState(selectedTimeState);
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null);
  const [sixMonthBalanceHistory, setSixMonthBalanceHistory] = useRecoilState(sixMonthBalanceHistoryState);
  const [balance, setBalance] = useState<any>({ amount: 0, locked: 0 })

  useEffect(() => {
    async function main() {
      setIsLoading(true)
      const result = await getBalance()
      setBalance(result)
      const response: any = await getWalletBalance()
      setSixMonthBalanceHistory(response)
      setIsLoading(false)
    }

    main()
  }, [])

  let result: any[] = [];
  useEffect(() => {
    async function main() {
      const result = await getBalance()
      setBalance(result)
    }
    main()

    if (sixMonthBalanceHistory === null || sixMonthBalanceHistory.length === 0) return;
    if (selectedTime === '1W') {
      const weektime = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < sixMonthBalanceHistory.length; i++) {
        if (new Date(sixMonthBalanceHistory[i].timestamp).getTime() > weektime) {
          result.push(sixMonthBalanceHistory[i]);
        }
      }
      console.log("1w", result)
    } else if (selectedTime === '1M') {
      const monthtime = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < sixMonthBalanceHistory.length; i++) {
        if (new Date(sixMonthBalanceHistory[i].timestamp).getTime() > monthtime) {
          result.push(sixMonthBalanceHistory[i]);
        }
      }
      console.log("1", result)
    } else if (selectedTime === '3M') {
      const threemonthtime = new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < sixMonthBalanceHistory.length; i++) {
        if (new Date(sixMonthBalanceHistory[i].timestamp).getTime() > threemonthtime) {
          result.push(sixMonthBalanceHistory[i]);
        }
      }
      console.log("3", result)
    } else if (selectedTime === '6M') {
      result.push(...sixMonthBalanceHistory)
      console.log("6", result)
    }
    result.reverse();

    if (result.length > 0) {
      const labels = result.map((entry: BalanceHistoryEntry) => new Date(entry.timestamp).toLocaleDateString());
      const amounts = result.map((entry: BalanceHistoryEntry) => entry.amount / 100);
      setData({
        labels,
        datasets: [
          {
            label: 'Balance',
            data: amounts,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
          },
        ],
      });
    }
  }, [sixMonthBalanceHistory, selectedTime]);

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Balance',
        },
        beginAtZero: true,
      },
    },
  };

  const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M'];

  console.log(data)
  return (
    <>

      {isLoading ? <Loading /> : (
        <div className='pt-3 pl-1'>
          <h1 className="text-3xl font-bold mb-4 text-[#00baf2]">Welcome, {session?.user.name}</h1>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-gray-500 text-lg mb-2">Wallet Ballance</div>
            <div className="text-3xl font-bold mb-4">₹{balance.amount / 100}</div>
            {isLoading ? (
              <div className="min-h-96 flex items-center justify-center text-gray-500">Loading...</div>
            ) : (
              data === null || data && data.datasets[0].data.length === 0 ? (
                <div className="min-h-96 flex items-center justify-center text-gray-500">No data available</div>
              ) : (
                data && <Line data={data} options={options} />
              )
            )}
            <div className="flex justify-center mt-4 space-x-2 bg-gray-100 rounded-full max-w-fit m-auto p-2 px-4">
              {timeRanges.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTime(period)}
                  className={`px-4 py-2 rounded-full focus:outline-none ${selectedTime === period
                    ? 'bg-white text-black shadow-md'
                    : 'text-gray-500'
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>)
      }
    </>
  );
};