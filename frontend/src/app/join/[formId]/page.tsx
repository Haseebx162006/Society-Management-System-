"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import {
    useGetJoinFormPublicQuery,
    useSubmitJoinRequestMutation,
    FormResponse,
} from "@/lib/features/join/joinApiSlice";
import Navbar from "@/components/marketing/Navbar";
import { toast } from "react-hot-toast";

export default function JoinFormPage() {
    const { formId } = useParams();
    const router = useRouter();
    const user = useAppSelector(selectCurrentUser);

    const {
        data: formData,
        isLoading,
        error,
    } = useGetJoinFormPublicQuery(formId as string);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
        }
    }, [user, router]);

    const [submitRequest, { isLoading: isSubmitting }] =
        useSubmitJoinRequestMutation();

    const [responses, setResponses] = useState<Record<string, string | boolean>>({});
    const [fileInputs, setFileInputs] = useState<Record<string, File>>({});
    const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const form = formData?.form;
    const teams = formData?.teams || [];

    // Get society info from the populated form data
    const societyName =
        typeof form?.society_id === "object" ? form.society_id.name : "";
    const societyDescription =
        typeof form?.society_id === "object" ? form.society_id.description : "";

    // Sort fields by order
    const sortedFields = form?.fields
        ? [...form.fields].sort((a, b) => a.order - b.order)
        : [];

    const handleFieldChange = (label: string, value: string | boolean) => {
        setResponses((prev) => ({ ...prev, [label]: value }));
        // Clear validation error when user types
        if (validationErrors[label]) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated[label];
                return updated;
            });
        }
    };

    const handleFileChange = (label: string, file: File | null) => {
        if (file) {
            setFileInputs((prev) => ({ ...prev, [label]: file }));
            // Create preview URL for images
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setFilePreviews((prev) => ({ ...prev, [label]: url }));
            } else {
                setFilePreviews((prev) => {
                    const updated = { ...prev };
                    delete updated[label];
                    return updated;
                });
            }
        } else {
            setFileInputs((prev) => {
                const updated = { ...prev };
                delete updated[label];
                return updated;
            });
            setFilePreviews((prev) => {
                const updated = { ...prev };
                delete updated[label];
                return updated;
            });
        }
        if (validationErrors[label]) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated[label];
                return updated;
            });
        }
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        for (const field of sortedFields) {
            if (!field.is_required) continue;
            if (field.field_type === "FILE") {
                if (!fileInputs[field.label]) {
                    errors[field.label] = `${field.label} is required`;
                }
            } else {
                const value = responses[field.label];
                if (value === undefined || value === "" || value === null) {
                    errors[field.label] = `${field.label} is required`;
                }
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            // Save current URL and redirect to login
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
            return;
        }

        if (!validate()) return;

        // Build responses for non-FILE fields
        const formattedResponses: FormResponse[] = sortedFields
            .filter((f) => f.field_type !== "FILE")
            .map((field) => ({
                field_label: field.label,
                field_type: field.field_type,
                value: responses[field.label] ?? "",
            }));

        // Also add placeholder entries for FILE fields (value will be replaced server-side)
        sortedFields
            .filter((f) => f.field_type === "FILE")
            .forEach((field) => {
                formattedResponses.push({
                    field_label: field.label,
                    field_type: "FILE",
                    value: "__pending_upload__",
                });
            });

        // Build FormData
        const formData = new FormData();
        formData.append("responses", JSON.stringify(formattedResponses));
        if (selectedTeam) {
            formData.append("selected_team", selectedTeam);
        }

        // Attach files using the field label as the key
        for (const field of sortedFields) {
            if (field.field_type === "FILE" && fileInputs[field.label]) {
                formData.append(field.label, fileInputs[field.label]);
            }
        }

        try {
            await submitRequest({
                formId: formId as string,
                body: formData,
            }).unwrap();
            toast.success("Your join request has been submitted successfully!");
            router.push("/profile");
        } catch (err: any) {
            const message =
                err?.data?.message || "Failed to submit request. Please try again.";
            toast.error(message);
        }
    };

    // Loading state
    if (isLoading || !user) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                            {!user ? "Redirecting to login..." : "Loading form..."}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // Error state
    if (error || !form) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Form Not Available
                        </h2>
                        <p className="text-gray-500 mb-6">
                            This registration form may have been deactivated or does not exist.
                        </p>
                        <button
                            onClick={() => router.push("/societies")}
                            className="text-indigo-600 font-semibold hover:text-indigo-700"
                        >
                            Browse Societies
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 pt-24 pb-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full uppercase tracking-wider">
                                Registration
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {form.title}
                        </h1>
                        {societyName && (
                            <p className="text-lg font-medium text-indigo-600 mb-2">
                                {societyName}
                            </p>
                        )}
                        {form.description && (
                            <p className="text-gray-500 leading-relaxed">
                                {form.description}
                            </p>
                        )}
                        {societyDescription && !form.description && (
                            <p className="text-gray-500 leading-relaxed">
                                {societyDescription}
                            </p>
                        )}
                    </div>



                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
                            {sortedFields.map((field) => (
                                <div key={field.label}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {field.label}
                                        {field.is_required && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </label>

                                    {field.field_type === "TEXT" && (
                                        <input
                                            type="text"
                                            value={(responses[field.label] as string) || ""}
                                            onChange={(e) =>
                                                handleFieldChange(field.label, e.target.value)
                                            }
                                            className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${validationErrors[field.label]
                                                ? "border-red-300"
                                                : "border-gray-200"
                                                }`}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    )}

                                    {field.field_type === "EMAIL" && (
                                        <input
                                            type="email"
                                            value={(responses[field.label] as string) || ""}
                                            onChange={(e) =>
                                                handleFieldChange(field.label, e.target.value)
                                            }
                                            className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${validationErrors[field.label]
                                                ? "border-red-300"
                                                : "border-gray-200"
                                                }`}
                                            placeholder="email@example.com"
                                        />
                                    )}

                                    {field.field_type === "NUMBER" && (
                                        <input
                                            type="number"
                                            value={(responses[field.label] as string) || ""}
                                            onChange={(e) =>
                                                handleFieldChange(field.label, e.target.value)
                                            }
                                            className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${validationErrors[field.label]
                                                ? "border-red-300"
                                                : "border-gray-200"
                                                }`}
                                            placeholder="0"
                                        />
                                    )}

                                    {field.field_type === "DROPDOWN" && (
                                        <select
                                            value={(responses[field.label] as string) || ""}
                                            onChange={(e) =>
                                                handleFieldChange(field.label, e.target.value)
                                            }
                                            className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${validationErrors[field.label]
                                                ? "border-red-300"
                                                : "border-gray-200"
                                                }`}
                                        >
                                            <option value="">Select an option</option>
                                            {field.options?.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {field.field_type === "CHECKBOX" && (
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!responses[field.label]}
                                                onChange={(e) =>
                                                    handleFieldChange(field.label, e.target.checked)
                                                }
                                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-600">
                                                Yes, I confirm
                                            </span>
                                        </label>
                                    )}

                                    {field.field_type === "FILE" && (
                                        <div>
                                            <div
                                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${validationErrors[field.label]
                                                        ? "border-red-300 bg-red-50/50"
                                                        : fileInputs[field.label]
                                                            ? "border-green-300 bg-green-50/50"
                                                            : "border-gray-200 hover:border-indigo-300 bg-gray-50/50"
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            field.label,
                                                            e.target.files?.[0] || null
                                                        )
                                                    }
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {fileInputs[field.label] ? (
                                                    <div>
                                                        {filePreviews[field.label] ? (
                                                            <img
                                                                src={filePreviews[field.label]}
                                                                alt="Preview"
                                                                className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {fileInputs[field.label].name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Click to change file
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                        </svg>
                                                        <p className="text-sm text-gray-500">Click to upload file</p>
                                                        <p className="text-xs text-gray-400 mt-1">Image or PDF accepted</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {validationErrors[field.label] && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {validationErrors[field.label]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {/* Team Selection */}
                            {teams.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Preferred Team
                                    </label>
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">No preference</option>
                                        {teams.map((team) => (
                                            <option key={team._id} value={team._id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Optional. The president may assign you to a different team.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Registration"}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Your request will be reviewed by the society president.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
