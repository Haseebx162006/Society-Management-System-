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
import { toast } from "react-hot-toast";
import Header from "@/components/Header";
import { 
  Loader2, 
  AlertCircle, 
  UploadCloud, 
  CheckCircle2, 
  Mail, 
  User, 
  Hash, 
  ChevronRight,
  FileText
} from "lucide-react";

export default function JoinFormPage() {
  const { formId } = useParams();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const { data: formData, isLoading, error } = useGetJoinFormPublicQuery(formId as string);
  const [submitRequest, { isLoading: isSubmitting }] = useSubmitJoinRequestMutation();

  const [responses, setResponses] = useState<Record<string, string | boolean>>({});
  const [fileInputs, setFileInputs] = useState<Record<string, File>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user && !isLoading) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [user, router, isLoading]);

  const form = formData?.form;
  const teams = formData?.teams || [];
  const societyName = typeof form?.society_id === "object" ? form.society_id.name : "";
  const sortedFields = form?.fields ? [...form.fields].sort((a, b) => a.order - b.order) : [];

  const handleFieldChange = (label: string, value: string | boolean) => {
    setResponses((prev) => ({ ...prev, [label]: value }));
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
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFilePreviews((prev) => ({ ...prev, [label]: url }));
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
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of sortedFields) {
      if (!field.is_required) continue;
      if (field.field_type === "FILE") {
        if (!fileInputs[field.label]) errors[field.label] = `${field.label} is required`;
      } else {
        const value = responses[field.label];
        if (!value) errors[field.label] = `${field.label} is required`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedResponses: FormResponse[] = sortedFields.map((field) => ({
      field_label: field.label,
      field_type: field.field_type,
      value: field.field_type === "FILE" ? "__pending_upload__" : (responses[field.label] as string) ?? "",
    }));

    const bodyData = new FormData();
    bodyData.append("responses", JSON.stringify(formattedResponses));
    if (selectedTeams.length > 0) bodyData.append("selected_teams", JSON.stringify(selectedTeams));
    for (const key in fileInputs) bodyData.append(key, fileInputs[key]);

    try {
      await submitRequest({ formId: formId as string, body: bodyData }).unwrap();
      toast.success("Joined successfully!");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err?.data?.message || "Submission failed.");
    }
  };

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Setting up your form...</p>
        </div>
      </main>
    );
  }

  if (error || !form) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Form Expired</h2>
            <p className="text-slate-500 mb-8">This registration link is no longer active or has been moved.</p>
            <button onClick={() => router.push("/societies")} className="text-orange-600 font-semibold hover:underline">
              Browse Other Societies
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      <Header />
      <div className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
            <span className="inline-block px-4 py-1.5 text-[10px] font-bold text-orange-700 bg-orange-100 rounded-full uppercase tracking-widest mb-6">
              Official Membership
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{form.title}</h1>
            <p className="text-orange-600 font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} /> {societyName}
            </p>
            {form.description && <p className="text-slate-500 leading-relaxed text-sm">{form.description}</p>}
            
            {(form.society_id as any).registration_fee > 0 && (form.society_id as any).payment_info && (
              <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4 text-orange-800">
                  <Hash className="w-4 h-4" />
                  <h4 className="font-bold text-sm tracking-tight uppercase">Payment Instructions</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest">Fee Amount</p>
                    <p className="font-bold text-xl text-orange-900">PKR {(form.society_id as any).registration_fee}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest">Account Number</p>
                    <p className="font-mono font-bold text-orange-900">{(form.society_id as any).payment_info.acc_num}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest">Holder Name</p>
                    <p className="font-bold text-orange-900">{(form.society_id as any).payment_info.acc_holder_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest">Destination</p>
                    <p className="font-bold text-orange-900">{(form.society_id as any).payment_info.acc_destination}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-[11px] text-orange-700 leading-relaxed font-medium bg-orange-100/50 p-2 rounded-lg">
                    Notice: Membership is subject to fee verification. After submitting this form, please transfer the fee and keep the receipt ready if requested.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 space-y-8">
              {sortedFields.map((field) => (
                <div key={field.label} className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 transition-colors group-focus-within:text-orange-600">
                    {field.label} {field.is_required && <span className="text-orange-500">*</span>}
                  </label>

                  {/* Text/Email/Number Inputs */}
                  {(field.field_type === "TEXT" || field.field_type === "EMAIL" || field.field_type === "NUMBER") && (
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors">
                        {field.field_type === "EMAIL" ? <Mail size={18} /> : field.field_type === "NUMBER" ? <Hash size={18} /> : <User size={18} />}
                      </div>
                      <input
                        type={field.field_type.toLowerCase()}
                        value={(responses[field.label] as string) || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={`w-full h-13 pl-12 pr-4 bg-slate-50/50 border rounded-2xl text-sm transition-all outline-none 
                          ${validationErrors[field.label] ? "border-red-300 ring-4 ring-red-50" : "border-slate-200 focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10"}`}
                        placeholder={`Your ${field.label.toLowerCase()}...`}
                      />
                    </div>
                  )}

                  {/* Dropdown */}
                  {field.field_type === "DROPDOWN" && (
                    <select
                      value={(responses[field.label] as string) || ""}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      className="w-full h-13 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 transition-all appearance-none"
                    >
                      <option value="">Choose one...</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {/* Modern File Upload */}
                  {field.field_type === "FILE" && (
                    <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all 
                      ${fileInputs[field.label] ? "border-green-400 bg-green-50/30" : "border-slate-200 bg-slate-50/50 hover:border-orange-400 hover:bg-orange-50/20"}`}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(field.label, e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {filePreviews[field.label] ? (
                        <img src={filePreviews[field.label]} alt="Preview" className="w-20 h-20 object-cover rounded-xl mx-auto shadow-md" />
                      ) : (
                        <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${fileInputs[field.label] ? "text-green-500" : "text-slate-300"}`} />
                      )}
                      <p className="text-sm font-bold text-slate-700">{fileInputs[field.label]?.name || "Upload Document"}</p>
                      <p className="text-xs text-slate-400 mt-1">Images or PDF (Max 5MB)</p>
                    </div>
                  )}

                  {validationErrors[field.label] && <p className="text-xs text-red-500 mt-2 font-medium ml-1">{validationErrors[field.label]}</p>}
                </div>
              ))}

              {/* Enhanced Team Selection */}
              {teams.length > 0 && (
                <div className="pt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-5 ml-1">Preferred Teams (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div
                        key={team._id}
                        onClick={() => setSelectedTeams(prev => prev.includes(team._id) ? prev.filter(id => id !== team._id) : [...prev, team._id])}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 
                          ${selectedTeams.includes(team._id) ? "border-orange-600 bg-orange-50/50" : "border-slate-100 bg-white hover:border-orange-200"}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                          ${selectedTeams.includes(team._id) ? "bg-orange-600 border-orange-600" : "border-slate-300"}`}>
                          {selectedTeams.includes(team._id) && <ChevronRight className="text-white" size={14} />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${selectedTeams.includes(team._id) ? "text-orange-900" : "text-slate-700"}`}>{team.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{team.description || "Join this specific team"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="sticky bottom-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                {isSubmitting ? "Processing..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}