"use client";

import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CreditCardIcon from "@repo/ui/logo";
import GithubComponent from "./GithubComponent";
import LineChart from "./DemoLineChart";
import Link from "next/link";
import Footer from "@repo/ui/footer";

interface SignInErrors {
    number?: string;
    password?: string;
}

export default function SignIn() {
    const [number, setNumber] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<SignInErrors>({});
    const router = useRouter();

    const handleSubmit = async () => {
        setErrors({});

        const newErrors: SignInErrors = {};
        if (!number) newErrors.number = "Phone number is required";
        if (!password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const response = await signIn("credentials", {
            number,
            password,
            redirect: false
        });

        if (response?.error) {
            toast.error(response.error);
        } else {
            toast.success("Signed In")
            router.replace("/dashboard");
        }
    };

    const handleGoogleSubmit = async () => {
        const response = await signIn("google", {
            callbackUrl: "/dashboard",
            redirect: false
        });
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
                            <p className="text-gray-500 dark:text-gray-400">Sign in to your QuantumPay account</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <TextInput
                                    label="Phone Number"
                                    placeholder="9999999999"
                                    type="text"
                                    onChange={(value) => {
                                        setNumber(value);
                                        setErrors((prev) => ({ ...prev, number: undefined }));
                                    }}
                                    error={errors.number}
                                />
                            </div>
                            <div className="space-y-2">
                                <TextInput
                                    label="Password"
                                    placeholder="Password"
                                    type="password"
                                    onChange={(value) => {
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
                                Sign In
                            </button>
                            {/* <div className="flex items-center w-full mb-4">
                                <hr className="flex-grow border-t border-gray-300" />
                                <span className="mx-2 text-gray-500">or</span>
                                <hr className="flex-grow border-t border-gray-300" />
                            </div>
                            <div className="flex justify-center items-center space-x-2 bg-gray-800 text-[#00baf2] hover:bg-gray-950 py-2 px-5 rounded-md cursor-pointer" onClick={async () => {
                                await handleGoogleSubmit();
                            }}>
                                <FaGoogle size={22} />
                                <button>
                                    Sign In with Google
                                </button>
                            </div> */}
                            <div className="text-gray-500 dark:text-gray-400 text-center text-sm">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-[#00baf2] hover:underline">
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <GithubComponent />
            <Footer />
        </div>
    );
}
