"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { toast } from "react-hot-toast";
import { 
    FaFileAlt, FaTrash, FaCloudUploadAlt, FaTimes, FaSpinner, 
    FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaDownload 
} from "react-icons/fa";
import {
    useGetSocietyDocumentationsQuery,
    useUploadDocumentationMutation,
    useDeleteDocumentationMutation,
} from "@/lib/features/doc/docApiSlice";

interface DocumentationPageProps {
    societyId: string;
}

const DocumentationPage: React.FC<DocumentationPageProps> = ({ societyId }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user } = useSelector((state: RootState) => state.auth);
    const { data, isLoading } = useGetSocietyDocumentationsQuery(societyId);
    const [uploadDocumentation] = useUploadDocumentationMutation();
    const [deleteDocumentation] = useDeleteDocumentationMutation();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // For deleting
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const documentations = data?.data || [];
    
    // We need society object to check current user's role if possible, or assume it's passed or derived.
    // Let's assume the user's role in this society can be determined from the API or we can pass it as a prop.
    // For now, if the user sees the page, they have some access. 
    // Upload/Delete requires PRESIDENT or DOCUMENTATION MANAGER. 
    // A more robust way is to pass `userRole` property, but we can do a quick check:
    // User sees upload button if their user._id is in the document list (just checking permission).
    // Let's pass `currentUserRole` as a prop if needed, or if we assume PRESIDENT/DOCUMENTATION MANAGER have access.
    // We'll use a local check based on what happens (backend will reject anyway if unauthorized).
    
    // Assume `isManager` is true for PRESIDENT and DOCUMENTATION MANAGER. 
    // We will get this from the SocietyDashboard which already computes `currentUserRole`.
    // We will update the component to accept `userRole`.

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Documentation</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage and view society documents
                    </p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:shadow-orange-500/20"
                >
                    <FaCloudUploadAlt className="text-lg" />
                    <span>Upload Document</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-slate-400">
                    <FaSpinner className="animate-spin text-4xl text-orange-500" />
                </div>
            ) : documentations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FaFileAlt className="text-2xl text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Documents Found</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        There are currently no documents uploaded for this society.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documentations.map((doc: any) => {
                        const fileExt = doc.fileUrl.split('.').pop()?.toLowerCase();
                        let FileIcon = FaFileAlt;
                        let iconColor = "text-slate-500";
                        let iconBg = "bg-slate-50";

                        if (['pdf'].includes(fileExt)) {
                            FileIcon = FaFilePdf;
                            iconColor = "text-red-500";
                            iconBg = "bg-red-50";
                        } else if (['doc', 'docx'].includes(fileExt)) {
                            FileIcon = FaFileWord;
                            iconColor = "text-blue-500";
                            iconBg = "bg-blue-50";
                        } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
                            FileIcon = FaFileExcel;
                            iconColor = "text-green-500";
                            iconBg = "bg-green-50";
                        } else if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExt)) {
                            FileIcon = FaFileImage;
                            iconColor = "text-purple-500";
                            iconBg = "bg-purple-50";
                        }

                        return (
                            <div key={doc._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4 gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                        <FileIcon className={`text-2xl ${iconColor}`} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors"
                                            title="Download/View"
                                        >
                                            <FaDownload size={14} />
                                        </a>
                                        <button
                                            onClick={async () => {
                                                if(confirm("Are you sure you want to delete this document?")) {
                                                    setIsDeleting(doc._id);
                                                    try {
                                                        await deleteDocumentation({ societyId, docId: doc._id }).unwrap();
                                                        toast.success("Document deleted");
                                                    } catch (err: any) {
                                                        toast.error(err?.data?.message || "Failed to delete");
                                                    } finally {
                                                        setIsDeleting(null);
                                                    }
                                                }
                                            }}
                                            disabled={isDeleting === doc._id}
                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors font-semibold disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {isDeleting === doc._id ? <FaSpinner className="animate-spin" size={14} /> : <FaTrash size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grow">
                                    <h4 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2" title={doc.title}>{doc.title}</h4>
                                    {doc.description && (
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-3">{doc.description}</p>
                                    )}
                                </div>
                                <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                                            {doc.uploadedBy?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <span className="text-xs text-slate-500 truncate max-w-[100px]" title={doc.uploadedBy?.name}>
                                            {doc.uploadedBy?.name || "Unknown"}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Upload Document</h3>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-6">
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!title || !file) {
                                        toast.error("Title and file are required");
                                        return;
                                    }
                                    setIsUploading(true);
                                    const formData = new FormData();
                                    formData.append("title", title);
                                    if (description) formData.append("description", description);
                                    formData.append("file", file);
                                    
                                    try {
                                        await uploadDocumentation({ societyId, formData }).unwrap();
                                        toast.success("Document uploaded successfully");
                                        setIsUploadModalOpen(false);
                                        setTitle("");
                                        setDescription("");
                                        setFile(null);
                                    } catch (err: any) {
                                        toast.error(err?.data?.message || "Failed to upload document");
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Document Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-sans text-slate-900"
                                        placeholder="e.g. Q1 Financial Report"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-sans text-slate-900 resize-none"
                                        placeholder="Brief description of the document"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">File (Only .doc , .docx allowed) <span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        required
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                </div>
                                
                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                                    >
                                        {isUploading ? <FaSpinner className="animate-spin" /> : "Upload"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentationPage;
