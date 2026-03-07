import { motion } from "framer-motion";
import { AlertTriangle, Info, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

export default function SocietyRegistration() {
  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Registration Guidelines</h2>
          <p className="text-stone-500 mt-2 font-medium">Please review our policies before submitting a request.</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Faculty Advisor Requirement</h3>
                <p className="text-stone-600 leading-relaxed">
                  Only officially recognized Faculty Advisors are permitted to request society registration or submit renewal forms. Student submissions will be automatically rejected.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Dual Submission Forms</h3>
                <p className="text-stone-600 leading-relaxed">
                  You will be provided with two specialized forms upon proceeding:
                  <br/>• <strong className="text-stone-800">Review Form:</strong> For initiating the registration of a completely new society.
                  <br/>• <strong className="text-stone-800">Renewal Form:</strong> For renewing an existing society's active status every academic year.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Strict Information Policy</h3>
                <p className="text-stone-600 leading-relaxed">
                  No false or misleading information is tolerated. Ensure all details, including society name and past activity descriptions, are 100% accurate. Discrepancies may lead to permanent suspension of registration privileges.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-stone-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
                <Info className="w-4 h-4" />
                By proceeding, you acknowledge these conditions.
              </div>
              <Link
                href="/society-registration"
                className="flex items-center gap-2 py-3 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 group"
              >
                Proceed to Form Submission
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
