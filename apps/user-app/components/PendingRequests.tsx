"use client"

import { Card } from "@repo/ui/card";
import convertDate from "../app/lib/actions/convertDate";
import { useState } from "react";
import { OtpModal } from "./OtpModal";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import axios from "axios";
import { sessionState } from "@repo/store/session";
import { useRecoilValue } from "recoil"
import { toast } from "sonner";
import { generateOtp } from "../app/lib/actions/generateOtp";

const PendingTransferRequests = ({
    pendingRequests
}: {
    pendingRequests: {
        id: number;
        time: Date;
        amount: number;
        fromUser: string | null;
        toUser: string | null;
        fromUserId: number;
        toUserId: number;
        status: string;
        remarks: string | null;
    }[];
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [otp, setOtp] = useState<string | undefined>();
    const session = useRecoilValue(sessionState)
    const [transferId, setTransferId] = useState<number>(-1)

    if (!pendingRequests || !pendingRequests.length) {
        return <Card title="Pending Transfer Requests">
            <div className="text-center pb-8 pt-8">
                No Pending transfer requests
            </div>
        </Card>
    }

    const payTheRequest = async () => {
        // if (!socket) return;
        // socket.send(
        //     JSON.stringify({
        //         type: "PAYTHEREQUEST",
        //         payload: {
        //             transferId
        //         }
        //     })
        // );
        if (otp !== undefined) {
            try {
                const response = await axios.post("http://localhost:8080/paytherequest", {
                    transferId,
                    from: session?.user.id,
                    otp
                });
                setIsModalOpen(false);
            } catch (e) {
                toast.error("Payment failed!");
            }
        } else {
            toast.error("Enter OTP!");
        }
    }

    const sendOtp = async () => {
        try {
            const response = await generateOtp();
            if (response.error) {
                toast.error(response.error);
                return;
            }
            toast.success(response.message);
            setIsModalOpen(true);
        } catch (e) {
            toast.error("Failed to send OTP!");
        }
    };

    return (
        <>
            {isModalOpen && (
                <OtpModal onClose={() => setIsModalOpen(false)}>
                    <TextInput
                        label=""
                        type="text"
                        placeholder="Enter OTP"
                        onChange={(value) => setOtp(value)}
                    />
                    <Button onClick={() => payTheRequest()}>Verify OTP</Button>
                </OtpModal>
            )}
            <Card title="Pending Transfer Requests">
                <div className="px-3 space-y-4">
                    {pendingRequests.map((transfer) => (
                        <div key={transfer.id} className="border-b pb-4 mb-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-900">{transfer.toUser}</h3>
                                <span className="text-sm text-gray-500">{convertDate(transfer.time)}</span>
                            </div>
                            <p className="text-sm text-gray-600">{transfer.remarks}</p>
                            <div className="mt-1 text-lg font-bold text-gray-900">₹{transfer.amount / 100}</div>
                            <button className="mt-2 w-full py-2 bg-black text-white font-semibold rounded-md" onClick={async () => {
                                setTransferId(transfer.id)
                                await sendOtp()
                            }}>
                                Pay
                            </button>
                        </div>
                    ))}
                </div>
            </Card >
        </>
    );
};

export default PendingTransferRequests;
