"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

import ReviewForm from "../../components/profile/forms/ReviewForm";
import ApplicationForm from "../../components/profile/forms/ApplicationForm";

import { useGetMySocietyRequestsQuery } from "@/lib/features/societies/societyApiSlice";
import ReadonlySocietyDetails from "../../components/profile/forms/ReadonlySocietyDetails";

type FormType = "register" | "renew";

export default function SocietyRegistrationFormsPage() {
  const [activeForm, setActiveForm] = useState<FormType>("register");

  const { data: myRequests = [], isLoading } = useGetMySocietyRequestsQuery(undefined);

  // Find if they have a registration request
  const registrationRequest = myRequests.find((r: any) => r.request_type === "REGISTER");
  
  // Can only renew if there's an APPROVED registration
  const canRenew = registrationRequest?.status === "APPROVED";
  
  // If they have any registration request (pending, approved, rejected), we might want to show readonly instead of a blank form
  const hasSubmittedRegistration = !!registrationRequest;

  return (
    <div className="min-h-screen bg-stone-50 font-(--font-family-poppins) pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-orange-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight">Society Forms</h1>
            <p className="text-stone-500 mt-2 font-medium text-lg">Complete your society application or renewal below.</p>
          </div>
        </div>

        {/* Forms Container */}
        <div className="bg-white border border-stone-200 rounded-4xl overflow-hidden shadow-xl shadow-stone-200/50">
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row border-b border-stone-100">
            <button
              onClick={() => setActiveForm("register")}
              className={`flex-1 py-6 px-6 font-bold text-sm sm:text-base md:text-lg tracking-wide transition-all ${
                activeForm === "register" 
                  ? "bg-orange-50/50 text-orange-600 border-b-2 border-orange-600" 
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                {hasSubmittedRegistration ? "Registration Details" : "Review Form (New Registration)"}
              </div>
            </button>
            
            {canRenew && (
              <button
                onClick={() => setActiveForm("renew")}
                className={`flex-1 py-6 px-6 font-bold text-sm sm:text-base md:text-lg tracking-wide transition-all ${
                  activeForm === "renew" 
                    ? "bg-orange-50/50 text-orange-600 border-b-2 border-orange-600" 
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Renewal Form (Yearly)
                </div>
              </button>
            )}
            
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 md:p-12 lg:p-16 min-h-[400px]">
            {isLoading ? (
               <div className="flex justify-center items-center h-64">
                 <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
               </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeForm === "register" && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    {hasSubmittedRegistration ? (
                      <ReadonlySocietyDetails request={registrationRequest} />
                    ) : (
                      <ReviewForm />
                    )}
                  </motion.div>
                )}
                {activeForm === "renew" && canRenew && (
                  <motion.div
                    key="renew"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ApplicationForm prefillSocietyName={registrationRequest?.society_name} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
