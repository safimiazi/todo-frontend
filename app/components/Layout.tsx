import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { token, loading, logout } = useAuth();
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!token) {
                router.push("/login");
            } else {
                setVerified(true);
            }
        }
    }, [token, loading, router]);

    if (loading || !verified) {
        return (
            <p className="text-center mt-10 text-gray-500">
                Checking authentication...
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-black text-white p-4 flex justify-between items-center">
                <span className="font-bold">My To-Do App</span>
                <div onClick={logout} className="">
                    <LogOut />
                </div>
            </header>
            <main className="container mx-auto p-4">{children}</main>
        </div>
    );
};

export default Layout;
