"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetSocietyByIdQuery } from "@/lib/features/societies/societyApiSlice";
import { useGetPublicJoinFormsBySocietyQuery } from "@/lib/features/join/joinApiSlice";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function SocietyRegisterPage() {
    const { id } = useParams();
    const router = useRouter();
    const user = useAppSelector(selectCurrentUser);

    const { data: societyData, isLoading: societyLoading } =
        useGetSocietyByIdQuery(id as string);
    const society = societyData?.society;

    const {
        data: forms,
        isLoading: formsLoading,
        error: formsError,
    } = useGetPublicJoinFormsBySocietyQuery(id as string, {
        skip: !id,
    });

    const isLoading = societyLoading || formsLoading;

    const activeForms = useMemo(() => forms || [], [forms]);

    useEffect(() => {
        if (!user) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
        }
    }, [user, router]);

    useEffect(() => {
        if (user && !isLoading && society && !formsError && activeForms.length === 1) {
            router.push(`/join/${activeForms[0]._id}`);
        }
    }, [isLoading, society, formsError, activeForms, router, user]);

    if (!user || isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                            {!user ? "Redirecting to login..." : "Loading registration forms..."}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (!society) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Society Not Found
                        </h2>
                        <Link
                            href="/societies"
                            className="text-indigo-600 font-semibold hover:text-indigo-700"
                        >
                            Browse Societies
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (formsError || activeForms.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Registration Not Open
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {society.name} has not published a registration form yet. Check
                            back later or contact the society directly.
                        </p>
                        <Link
                            href={`/societies/${id}`}
                            className="text-indigo-600 font-semibold hover:text-indigo-700"
                        >
                            Back to {society.name}
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (activeForms.length === 1) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 pt-24 pb-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href={`/societies/${id}`}
                            className="text-sm text-gray-500 hover:text-indigo-600 font-medium"
                        >
                            Back to {society.name}
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-4">
                            Choose a Registration Form
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {society.name} has multiple registration forms. Select one to
                            proceed.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {activeForms.map((form) => (
                            <Link
                                key={form._id}
                                href={`/join/${form._id}`}
                                className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {form.title}
                                        </h3>
                                        {form.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {form.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">
                                            {form.fields.length} fields
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
