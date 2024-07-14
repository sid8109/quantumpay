import { Card } from "@repo/ui/card";

export const BalanceCard = ({ amount, locked }: {
    amount: number;
    locked: number;
}) => {
    return (
      <Card title={"Balance"}>
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-gray-700">Unlocked Balance</span>
                <span className="font-semibold">₹{amount / 100}</span>
            </div>
            <div className="relative w-full h-3 bg-gray-200 rounded-md">
                <div className="absolute top-0 left-0 h-3 bg-black rounded-md" style={{ width: `${amount / (amount + locked) * 100}%` }}></div>
            </div>
        </div>
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-gray-700">Locked Balance</span>
                <span className="font-semibold">₹{locked / 100}</span>
            </div>
            <div className="relative w-full h-3 bg-gray-200 rounded-md">
                <div className="absolute top-0 left-0 h-3 bg-black rounded-md" style={{ width: `${locked / (amount + locked) * 100}%` }}></div>
            </div>  
        </div>
        <div className="flex justify-between mt-4 pt-4 border-t">
            <span className="text-gray-700">Total Balance</span>
            <span className="font-semibold">₹{(amount + locked) / 100}</span>
        </div>
    </Card>
    );
};
