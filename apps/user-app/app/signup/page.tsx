"use client";

import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { toast } from "sonner";
import CreditCardIcon from "@repo/ui/logo";
import GithubComponent from "../../components/GithubComponent";
import LineChart from "../../components/DemoLineChart";
import { createUser } from "../lib/actions/signupHandler";
import Link from "next/link";
import Footer from "@repo/ui/footer";

interface SignupErrors {
    name?: string;
    email?: string;
    number?: string;
    password?: string;
}

export default function Signup() {
    const [number, setNumber] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [errors, setErrors] = useState<SignupErrors>({});

    const handleSubmit = async () => {
        setErrors({});

        const newErrors: SignupErrors = {};
        if (!name) newErrors.name = "Name is required";
        if (!email) newErrors.email = "Email is required";
        if (!number) newErrors.number = "Phone number is required";
        if (!password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const response = await createUser({ number, password, name, email });

        if (response.message) {
            toast.success("Verify your email to continue!");
        } else {
            toast.error(response.error);
            console.log(response.error);
        }
    };

    return (
        <div>
            <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:block">
                    <div className="flex h-full w-full items-center justify-center">
                        <LineChart className="w-[80%] aspect-[4/3]" />
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="mx-auto w-[350px] space-y-6">
                        <div className="space-y-2 text-center">
                            <div className="flex items-center justify-center">
                                <CreditCardIcon className="h-9 w-9 text-[#00baf2]" />
                                <h1 className="text-3xl font-bold px-1">QuantumPay</h1>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">Sign up to your QuantumPay account</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <TextInput
                                    label="Name"
                                    placeholder="John Doe"
                                    type="text"
                                    onChange={(value: string) => {
                                        setName(value);
                                        setErrors((prev) => ({ ...prev, name: undefined }));
                                    }}
                                    error={errors.name}
                                />
                            </div>
                            <div className="space-y-1">
                                <TextInput
                                    label="Email"
                                    placeholder="johndoe23@gmail.com"
                                    type="email"
                                    onChange={(value: string) => {
                                        setEmail(value);
                                        setErrors((prev) => ({ ...prev, email: undefined }));
                                    }}
                                    error={errors.email}
                                />
                            </div>
                            <div className="space-y-1">
                                <TextInput
                                    label="Phone Number"
                                    placeholder="9999999999"
                                    type="number"
                                    onChange={(value: string) => {
                                        setNumber(value);
                                        setErrors((prev) => ({ ...prev, number: undefined }));
                                    }}
                                    error={errors.number}
                                />
                            </div>
                            <div className="space-y-1">
                                <TextInput
                                    label="Password"
                                    placeholder="Password"
                                    type="password"
                                    onChange={(value: string) => {
                                        setPassword(value);
                                        setErrors((prev) => ({ ...prev, password: undefined }));
                                    }}
                                    error={errors.password}
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    await handleSubmit();
                                }}
                                type="button"
                                className="w-full py-2 px-5 rounded-md bg-[#00baf2] text-white hover:bg-[#0095c4]"
                            >
                                Sign Up
                            </button>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/signin" className="text-[#00baf2] hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <GithubComponent />
            <Footer />
        </div>
    );
}
