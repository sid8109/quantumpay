import { Card } from "@repo/ui/card";
import convertDate from "../app/lib/actions/convertDate";

export const P2PTransferCard = ({
    p2pTransactions,
    currUserId
}: {
    p2pTransactions: {  
        id: number,
        time: Date,
        amount: number,
        fromUser: string | null,
        toUser: string | null,
        fromUserId: number,
        toUserId: number,
        status: string,
        remarks: string | null
    }[];
    currUserId: number;
}) => {
    if (!p2pTransactions || !p2pTransactions.length) {
        return <Card title="P2P Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent P2P transfers
            </div>
        </Card>
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'Requested':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAmountClass = (transaction: { amount: number, fromUserId: number, toUserId: number }) => {
        if (Number(transaction.fromUserId) === currUserId) {
            return 'text-red-600'; 
        }
        return 'text-green-600'; 
    };

    const getAmountDisplay = (transaction: { amount: number, fromUserId: number, toUserId: number }) => {
        const amount = transaction.amount / 100;
        if (Number(transaction.fromUserId) === currUserId) {
            return `-₹${amount}`;
        }
        return `₹${amount}`; 
    };

    return <Card title="P2P Transactions">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Remarks
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {p2pTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                            {convertDate(transaction.time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                            {Number(transaction.fromUserId) === currUserId ? transaction.toUser : transaction.fromUser}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center ${getAmountClass(transaction)}`}>
                            {getAmountDisplay(transaction)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center max-w-64" style={{ wordWrap: "break-word" }}>
                            {transaction.remarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 inline-flex text-sm leading-5 font-extrabold rounded-full ${getStatusClass(transaction.status)}`}>
                                {transaction.status === 'Requested' ? transaction.fromUserId === currUserId ? `Request Received` : `Request Sent` : transaction.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
}
