"use client"

import { SendCard } from "../../../components/SendCard";
import { P2PTransferCard } from "../../../components/P2PTransferCard";
import PendingTransferRequests from "../../../components/PendingRequests";
import { useRecoilValue, useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { getP2PTransaction } from "../../lib/actions/p2ptransfer";
import { p2pTransferState, p2pRequestState } from "@repo/store/balance";
import { sessionState } from "@repo/store/session";
import Loading from '@repo/ui/loading';

export default function () {
    const session = useRecoilValue(sessionState)
    const [p2pTransactions, setP2PTransactions] = useRecoilState(p2pTransferState)
    const [pendingRequests, setPendingRequests] = useRecoilState(p2pRequestState)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function main() {
            if (p2pTransactions !== null) {
                return
            }
            setLoading(true)
            const result = await getP2PTransaction()
            setP2PTransactions(result.p2ptransfers)
            setPendingRequests(result.requestedp2ptransfers)
            setLoading(false)
        }
        main()
    }, [])

    return (
        <>
        {loading ? <Loading /> : 
            (<div className="w-full">
                <div className="text-3xl text-[#00baf2] pt-3 mb-4 font-bold text-center">
                    P2P Transfer
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5 p-1 mb-4">
                    <div className="md:col-span-3">
                        <SendCard />
                    </div>
                    <div className="md:col-span-2">
                        <PendingTransferRequests pendingRequests={pendingRequests} />
                    </div>
                </div>
                <P2PTransferCard p2pTransactions={p2pTransactions} currUserId={Number(session?.user.id)} />
            </div >)
            }
        </>
    )
}