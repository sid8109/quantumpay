"use client"

import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
import { getBalance, getOnRampTransactions } from "../../lib/actions/createOnrampTransaction";
import { useRecoilState } from "recoil"
import { onRampTransaction } from "@repo/store/balance";
import { useEffect, useState } from "react";
import Loading from '@repo/ui/loading';

export default function () {
    const [rampTrans, setOnRampTrans] = useRecoilState(onRampTransaction)
    const [balance, setBalance] = useState<any>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function main() {
            if (rampTrans !== null) {
                return
            }
            setLoading(true)
            const transactions = await getOnRampTransactions();
            setOnRampTrans(transactions);
            setLoading(false)
        }
        main()
    }, [])

    useEffect(() => {
        async function main() {
            const result = await getBalance();
            setBalance(result);
        }
        main()
    }, [rampTrans])

    return (
        <>
            {loading ? <Loading /> : (
                <div className="w-full">
                    <div className="text-3xl text-[#00baf2] pt-3 mb-4 font-bold text-center">
                        Transfer
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-1">
                        <div>
                            <AddMoney />
                        </div>
                        <div>
                            <BalanceCard amount={balance.amount} locked={balance.locked} />
                        </div>
                    </div>
                    <div className="pt-4">
                        <OnRampTransactions transactions={rampTrans} />
                    </div>
                </div>
            )}
        </>
    )
}