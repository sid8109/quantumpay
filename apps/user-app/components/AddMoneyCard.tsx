"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnrampTransaction } from "../app/lib/actions/createOnrampTransaction";
import { toast } from "sonner";
import { generateOtp, verifyOtp } from "../app/lib/actions/generateOtp";
import { OtpModal } from "./OtpModal";
import { useRecoilValue } from "recoil";
import { sessionState } from "@repo/store/session";

const SUPPORTED_BANKS = [
    {
        name: "HDFC Bank",
        redirectUrl: "https://netbanking.hdfcbank.com",
    },
    {
        name: "Axis Bank",
        redirectUrl: "https://www.axisbank.com/",
    },
];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [value, setValue] = useState(0);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [otp, setOtp] = useState<string | undefined>();
    const session = useRecoilValue(sessionState);

    const handleAddMoney = async () => {
        if (value === 0 || !provider) {
            setError("Please fill in all details.");
            return;
        }

        setError("");

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

    const verifyHandler = async () => {
        if (otp !== undefined) {
            const response = await verifyOtp(Number(session?.user.id), otp);
            if (response.error) {
                toast.error(response.error);
                return;
            }

            try {
                const response = await createOnrampTransaction(provider, value);
                if (response.error) {
                    toast.error(response.error);
                    return;
                } else {
                    toast.success(response.message);
                }
                window.location.href = redirectUrl || "";
            } catch (error) {
                console.error("Error while creating onramp transaction:", error);
            }
        } else {
            toast.error("Enter OTP!");
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
                    <Button onClick={verifyHandler}>Verify OTP</Button>
                </OtpModal>
            )}
            <Card title="Add Money">
                <div className="w-full">
                    <TextInput
                        label="Amount"
                        type="number"
                        placeholder="Amount"
                        onChange={(value) => setValue(Number(value))}
                    />
                    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                    <div className="py-4 text-left">Bank</div>
                    <Select
                        onSelect={(value) => {
                            setRedirectUrl(
                                SUPPORTED_BANKS.find((x) => x.name === value)?.redirectUrl || ""
                            );
                            setProvider(value);
                        }}
                        options={SUPPORTED_BANKS.map((x) => ({
                            key: x.name,
                            value: x.name,
                        }))}
                    />
                    <div className="flex justify-center pt-4">
                        <Button onClick={handleAddMoney}>Add Money</Button>
                    </div>
                </div>
            </Card>
        </>
    );
};
