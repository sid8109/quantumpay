"use client";

import { useEffect, useState } from "react";
import { useSetRecoilState, useRecoilState } from 'recoil';
import { useSession } from "next-auth/react";
import { sessionState } from "@repo/store/session";
import Sidebar from "@repo/ui/sidebar";
import { AppbarClient } from "../../components/AppbarClient";
import Footer from "@repo/ui/footer";
import { toast } from "sonner";
import { onRampTransaction, p2pRequestState, p2pTransferState, sixMonthBalanceHistoryState } from "@repo/store/balance";
import Loading from "./loading";
import { redirect } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
    const [sessionData, setSession] = useRecoilState(sessionState);
    const { data: session, status } = useSession();
    const setSixMonthBalanceHistory = useSetRecoilState(sixMonthBalanceHistoryState);
    const [onRampTrans, setOnRampTrans] = useRecoilState(onRampTransaction);
    const [p2pTransactions, setP2PTransactions] = useRecoilState(p2pTransferState);
    const [pendingRequests, setPendingRequests] = useRecoilState(p2pRequestState);
    const [loading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") {
            setIsLoading(true);
            return;
        }
        if (!session) {
            redirect("/signin")
        }
        console.log(session)
        setSession(session);
    }, [session, setSession, status]);

    useEffect(() => {
        if (!sessionData) {
            return;
        }
        const userId = sessionData?.user?.id;

        const ws = new WebSocket(`ws://localhost:8080?userId=${userId}`);

        ws.onopen = () => {
            console.log("Connected to server");
            setIsLoading(false);
        };

        ws.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.type === 'ONRAMP') {
                toast.success(<OnRampNotification amount={data.amount} />);
                console.log(data.newBalanceHistory);
                const updatedOnRampTrans = onRampTrans.map(transaction => {
                    if (transaction.token === data.token) {
                        return { ...transaction, status: "Success" };
                    }
                    return transaction;
                });
                console.log(updatedOnRampTrans)
                setSixMonthBalanceHistory(prev => [data.newBalanceHistory, ...prev]);
                setOnRampTrans(updatedOnRampTrans);
            } else if (data.type === 'PAID') {
                console.log("PAID");
                const newTxn = {
                    time: new Date(data.timestamp),
                    amount: data.amount,
                    fromUser: data.fromUser,
                    toUser: data.toUser,
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    status: data.status,
                    remarks: data.remarks
                };
                toast.success(<P2PPaid amount={data.amount} fromUser={session?.user?.id === data.fromUserId ? data.toUser : data.fromUser} isSent={session?.user?.id === data.fromUserId} />);
                setP2PTransactions(prevTransactions => [newTxn, ...prevTransactions]);
            } else if (data.type === 'REQUESTED') {
                console.log(data);
                const newRequest = {
                    id: data.id,
                    time: new Date(data.timestamp),
                    amount: data.amount,
                    fromUser: data.fromUser,
                    toUser: data.toUser,
                    fromUserId: Number(data.fromUserId),
                    toUserId: Number(data.toUserId),
                    status: data.status,
                    remarks: data.remarks
                };
                if (newRequest.fromUserId === Number(session?.user?.id)) {
                    setPendingRequests(prevRequests => [newRequest, ...prevRequests]);
                }
                setP2PTransactions(prevTransactions => [newRequest, ...prevTransactions]);
                toast.success(<P2PNotification amount={data.amount} fromUser={data.fromUser === session?.user?.name ? data.toUser : data.fromUser} isSent={data.fromUser !== session?.user?.name ? true : false} />);
            } else if (data.type === 'PAIDTHEREQUEST') {
                console.log("PAIDTHEREQUEST");
                setPendingRequests(prevRequests => prevRequests.filter(req => req.id !== data.id));
                setP2PTransactions(prevTransactions => prevTransactions.map(req => {
                    if (req.id === data.id) {
                        return {
                            ...req,
                            status: 'Paid'
                        };
                    }
                    return req;
                }));
                toast.success(<P2PPaid amount={data.amount} fromUser={session?.user?.id === data.fromUserId ? data.toUserName : data.fromUserName} isSent={session?.user?.id === data.fromUserId} />);
            } else {
                console.log(data);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket closed");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log("WebSocket closed");
                ws.close();
            }
        };
    }, [sessionData])

    return (
        <>
            {loading ? <Loading /> :
                <>
                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex-shrink-0">
                            <Sidebar />
                        </div>
                        <div className="flex-1 flex flex-col overflow-auto">
                            <AppbarClient />
                            <main className="min-h-screen flex-1 p-4 overflow-y-auto">{children}</main>
                        </div>
                    </div>
                    <Footer />
                </>
            }
        </>
    );
}

function P2PNotification({ amount, fromUser, isSent }: { amount: number, fromUser: string, isSent: boolean }) {
    return (
        <div>
            <p>You {isSent ? 'sent' : 'received'} a request of ₹{amount / 100} {isSent ? 'to' : 'from'} {fromUser}</p>
        </div>
    );
}

function P2PPaid({ amount, fromUser, isSent }: { amount: number, fromUser: string, isSent: boolean }) {
    return (
        <div>
            <p>You {isSent ? 'paid' : 'received'} ₹{amount / 100} {isSent ? 'to' : 'from'} {fromUser}</p>
        </div>
    );
}

function OnRampNotification({ amount }: { amount: number }) {
    return (
        <div>
            <p>You have transferred ₹{amount / 100}</p>
        </div>
    );
}
