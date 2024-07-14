"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useRecoilValue } from "recoil";
import { toast } from "sonner";
import { sessionState } from "@repo/store/session";
import { generateOtp, verifyOtp } from "../app/lib/actions/generateOtp";
import { OtpModal } from "./OtpModal";
import axios from "axios";

interface TransferErrors {
    number?: string;
    amount?: string;
}

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [errors, setErrors] = useState<TransferErrors>({});
    const session = useRecoilValue(sessionState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [otp, setOtp] = useState<string | undefined>();

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

    const p2pTransfer = async (to: string, amount: number, remarks: string) => {
        if (otp !== undefined) {
            try {
                const response = await axios.post("http://localhost:8080/pay", {
                    to,
                    amount,
                    remarks,
                    from: session?.user.id,
                    otp
                });
                setIsModalOpen(false);
                clearFields();
            } catch (e) {
                toast.error("Payment failed!");
            }
        } else {
            toast.error("Enter OTP!");
        }
    };

    const p2pRequest = async (to: string, amount: number, remarks: string) => {
        try {
            const response = await axios.post("http://localhost:8080/request", {
                to,
                amount,
                remarks,
                from: session?.user.id
            });
            clearFields();
        } catch (e) {
            toast.error("Request failed!");
        }
    };

    const handleSubmit = async (type: "PAY" | "REQUEST") => {
        setErrors({});
        const newErrors: TransferErrors = {};
        if (!number) newErrors.number = "Recipient's mobile number is required";
        if (!amount) newErrors.amount = "Amount is required";
        if(Number(amount) <= 0) newErrors.amount = "Amount cannot be negative";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        if (type === "REQUEST") {
            await p2pRequest(number, Number(amount) * 100, remarks);
            return;
        }

        await sendOtp();
    };

    const clearFields = () => {
        setNumber("");
        setAmount("");
        setRemarks("");
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
                    <Button onClick={() => p2pTransfer(number, Number(amount) * 100, remarks)}>Verify OTP</Button>
                </OtpModal>
            )}
            <Card title="Send">
                <div className="min-w-72 pt-2">
                    <div className="space-y-1">
                        <TextInput
                            placeholder={"Enter recipient's mobile number"}
                            type="text"
                            label="Recipient's Mobile Number"
                            value={number}
                            onChange={(value) => {
                                setNumber(value);
                                setErrors((prev) => ({ ...prev, number: undefined }));
                            }}
                            error={errors.number}
                        />
                    </div>
                    <div className="space-y-1">
                        <TextInput
                            placeholder={"Enter amount to transfer"}
                            type="number"
                            label="Amount"
                            value={amount}
                            onChange={(value) => {
                                setAmount(value);
                                setErrors((prev) => ({ ...prev, amount: undefined }));
                            }}
                            error={errors.amount}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium pt-3 mb-2">Remarks (Optional)</label>
                        <textarea
                            placeholder="Enter any remarks"
                            maxLength={80}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="border border-gray-300 rounded-md bg-gray-50 text-sm w-full p-2.5 text-gray-700 leading-tight resize-none"
                        ></textarea>
                        <div className="text-right text-xs text-gray-500 mt-1">80 characters max</div>
                    </div>
                    <div className="pt-4 flex justify-center space-x-4">
                        <button
                            className="w-full py-2 px-5 rounded-md bg-green-400 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={async () => await handleSubmit("REQUEST")}
                        >
                            Request
                        </button>
                        <Button
                            onClick={async () => {
                                await handleSubmit("PAY")
                            }}
                        >
                            Pay
                        </Button>
                    </div>
                </div>
            </Card>
        </>
    );
}