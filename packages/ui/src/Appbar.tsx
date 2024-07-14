import Link from 'next/link';
import CreditCardIcon from './Logo';
import UserDropdown from "./UserDropDown";

interface AppbarProps {
    user?: {
        name?: string | null;
    },
    // TODO: can u figure out what the type should be here?
    onSignin: any,
    onSignout: any
}

export const Appbar = ({
    user,
    onSignin,
    onSignout
}: AppbarProps) => {
    return <div className="flex justify-between border-b border-slate-300 px-6">
        <div className="text-lg flex flex-col justify-center font-bold">
            <Link href={'/dashboard'}>
                <div className="flex items-center space-x-1">
                    <CreditCardIcon className="h-8 w-8 text-[#00baf2]" />
                    <div>QuantumPay</div>
                </div>
            </Link>
        </div>
        <div className="flex flex-col justify-center py-2">
            {/* <Button onClick={user ? onSignout : onSignin}>{user ? "Logout" : "Login"}</Button> */}
            <UserDropdown onSignout={onSignout}/>
        </div>
    </div>
}