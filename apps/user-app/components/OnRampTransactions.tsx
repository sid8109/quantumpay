import { Card } from "@repo/ui/card"
import convertDate from "../app/lib/actions/convertDate"

export const OnRampTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        // TODO: Can the type of `status` be more specific?
        status: string,
        provider: string
    }[] | null
}) => {
    if (transactions === null || transactions.length === 0) {
        return <Card title="Recent Transfers">
            <div className="text-center pb-8 pt-8">
                No recent transfers
            </div>
        </Card>
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Success':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Failure':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAmountClass = (amount: number) => {
        return amount > 0 ? 'text-green-600' : 'text-red-600';
    };

    return <Card title="Recent Transactions">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                    <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                            {convertDate(transaction.time)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center ${getAmountClass(transaction.amount)}`}>
                            ₹{transaction.amount / 100}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 inline-flex text-sm leading-5 font-extrabold rounded-full ${getStatusClass(transaction.status)}`}>
                                {transaction.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
}