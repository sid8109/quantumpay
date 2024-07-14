import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { redirect } from 'next/navigation';
import SignIn from "../../components/singin";

export default async function SignInPage () {
    const session = await getServerSession(authOptions)
    if(session?.user) {
        redirect("/dashboard")       
    }

    return <SignIn />
}