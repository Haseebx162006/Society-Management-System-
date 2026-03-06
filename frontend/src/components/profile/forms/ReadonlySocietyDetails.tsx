import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function ReadonlySocietyDetails({ request }: { request: any }) {

  const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-orange-100 text-orange-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    APPROVED: <CheckCircle2 className="w-5 h-5" />,
    PENDING: <Clock className="w-5 h-5" />,
    REJECTED: <AlertTriangle className="w-5 h-5" />,
  };

  const formData = request.form_data;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-10 font-(--font-family-poppins)"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-stone-400" />
            Registration Details
          </h3>
          <p className="text-sm text-stone-500 mt-1">You have already submitted a review form. Below are the details.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider ${statusColors[request.status] || statusColors.PENDING}`}>
          {statusIcons[request.status] || statusIcons.PENDING}
          {request.status}
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-10">
        
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Current President</h5>
                 <div className="space-y-2 text-sm">
                    <p><span className="text-stone-500 w-24 inline-block">Name:</span> <strong className="text-stone-900">{formData?.current_president?.name}</strong></p>
                    <p><span className="text-stone-500 w-24 inline-block">Reg No:</span> <strong className="text-stone-900">{formData?.current_president?.reg_no}</strong></p>
                    <p><span className="text-stone-500 w-24 inline-block">Phone:</span> <strong className="text-stone-900">{formData?.current_president?.phone}</strong></p>
                    <p><span className="text-stone-500 w-24 inline-block">Email:</span> <strong className="text-stone-900">{formData?.current_president?.email}</strong></p>
                 </div>
               </div>
               
               {formData?.past_president?.name && (
                 <div className="space-y-4">
                   <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Past President</h5>
                   <div className="space-y-2 text-sm">
                      <p><span className="text-stone-500 w-24 inline-block">Name:</span> <strong className="text-stone-900">{formData.past_president.name}</strong></p>
                      <p><span className="text-stone-500 w-24 inline-block">Reg No:</span> <strong className="text-stone-900">{formData.past_president.reg_no}</strong></p>
                   </div>
                 </div>
               )}
            </div>

            {formData?.other_office_bearers?.length > 0 && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Other Office Bearers</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                   {formData.other_office_bearers.map((b: any, i: number) => (
                     <div key={i} className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-sm">
                        <p className="font-bold text-stone-900">{b.name}</p>
                        <p className="text-stone-500 text-xs mt-0.5">{b.reg_no}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
               <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Faculty Advisor</h5>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                  <div><p className="text-orange-900/50 font-bold mb-1">Name</p><p className="font-semibold text-orange-950">{formData?.faculty_advisor?.name}</p></div>
                  <div><p className="text-orange-900/50 font-bold mb-1">Designation</p><p className="font-semibold text-orange-950">{formData?.faculty_advisor?.designation}</p></div>
                  <div><p className="text-orange-900/50 font-bold mb-1">Tenure</p><p className="font-semibold text-orange-950">{formData?.faculty_advisor?.tenure}</p></div>
               </div>
            </div>

            <div className="space-y-6">
               <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">History & Activities</h5>
               
               <div>
                 <p className="text-sm font-bold text-stone-800 mb-2">Qualitative and Quantitative Review</p>
                 <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-stone-100">{formData?.history?.review_comment}</p>
               </div>

               {formData?.history?.activities?.length > 0 && (
                 <div>
                   <p className="text-sm font-bold text-stone-800 mb-3">Critical Review of Activities</p>
                   <div className="space-y-3">
                     {formData.history.activities.map((act: any, i: number) => (
                       <div key={i} className="border border-stone-200 bg-stone-50/50 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-bold text-stone-900">{act.title}</h6>
                            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">{act.dates}</span>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed">{act.review}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {formData?.history?.challenges && (
                 <div>
                   <p className="text-sm font-bold text-stone-800 mb-2">Challenges Faced</p>
                   <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed border border-stone-100">{formData.history.challenges}</p>
                 </div>
               )}
               
               {formData?.history?.feedback && (
                 <div>
                   <p className="text-sm font-bold text-stone-800 mb-2">Feedback to Administration</p>
                   <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed border border-stone-100">{formData.history.feedback}</p>
                 </div>
               )}
            </div>
        </div>
      </div>
    </motion.div>
  );
}
