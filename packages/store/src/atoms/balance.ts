import { atom } from "recoil";

export interface BalanceHistoryEntry {
    id: number;
    userId: number;
    amount: number;
    changeType: "DEPOSIT" | "WITHDRAWAL" | "LOCK" | "UNLOCK";
    timestamp: Date;
}

export interface P2PTransfer {
    id: number;
    time: Date;
    amount: number;
    fromUser: string | null;
    toUser: string | null;
    fromUserId: number;
    toUserId: number;
    status: "Paid" | "Requested";
    remarks: string | null;
}

export interface onRamp {
    time: Date;
    amount: number;
    status: string;
    provider: string;
}

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const selectedTimeState = atom<TimeRange>({
    key: "selectedTime",
    default: '1M',
})

export const sixMonthBalanceHistoryState = atom<BalanceHistoryEntry[] | null>({
    key: 'sixMonthBalanceHistory',
    default: null,
});

export const isLoadingState = atom<boolean>({
    key: 'isLoading',
    default: false,
});

export const p2pTransferState = atom<P2PTransfer[] | null>({
    key: 'p2pTransfer',
    default: null,
})

export const p2pRequestState = atom<P2PTransfer[] | null>({
    key: 'p2pRequest',
    default: null,
})

export const onRampTransaction = atom<{
    time: Date;
    amount: number;
    status: string;
    provider: string;
    token: string;
}[] | null>({
    key: 'onRampTransaction',
    default: null,
})