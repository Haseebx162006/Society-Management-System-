import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RegistrationFormData {
  current_president: { name: string, reg_no: string, phone: string, email: string };
  past_president?: { name: string, reg_no: string, phone?: string, email?: string };
  other_office_bearers: { name: string, reg_no: string }[];
  faculty_advisor: { name: string, designation: string, tenure: string };
  history: {
    review_comment: string;
    activities: { title: string, dates: string, review: string }[];
    challenges?: string;
    feedback?: string;
    official_documents?: string;
  };
}

export default function ReadonlySocietyDetails({ request }: { request: { society_name: string, status: string, form_data: RegistrationFormData } }) {

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const societyName = request.society_name || 'Society';

    // Add Logo
    const img = new Image();
    img.src = '/logo.png';
    
    // Header Section
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Students Societies Office', 200, 15, { align: 'right' });
    doc.text('COMSATS University Islamabad, Lahore Campus', 200, 20, { align: 'right' });

    // Draw logo if loaded (or just leave space)
    try {
      doc.addImage(img, 'PNG', 14, 10, 30, 25);
    } catch (e) {
      console.error('Logo failed to load', e);
    }

    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22); // Orange
    doc.text('COMSOC Student Society Review Form', 105, 45, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Society: ${societyName}`, 14, 60);
    doc.text(`Status: ${request.status}`, 14, 67);

    let yPos = 75;

    // Table 1: Leadership (President & Advisor)
    autoTable(doc, {
      startY: yPos,
      head: [['Role', 'Name', 'Reg No', 'Contact Info']],
      body: [
        ['Current President', formData?.current_president?.name || 'N/A', formData?.current_president?.reg_no || 'N/A', `${formData?.current_president?.phone}\n${formData?.current_president?.email}`],
        ['Past President', formData?.past_president?.name || 'N/A', formData?.past_president?.reg_no || 'N/A', `${formData?.past_president?.phone || ''}\n${formData?.past_president?.email || ''}`.trim() || 'N/A'],
        ['Faculty Advisor', formData?.faculty_advisor?.name || 'N/A', formData?.faculty_advisor?.designation || 'N/A', `Tenure: ${formData?.faculty_advisor?.tenure || 'N/A'}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
    });

    yPos = (doc as any & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    // Table 2: Office Bearers
    if (formData?.other_office_bearers?.length > 0) {
      doc.setFontSize(14);
      doc.text('Other Current Office Bearers', 14, yPos);
      yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Name', 'Registration Number']],
        body: formData.other_office_bearers.map((b: { name: string, reg_no: string }, i: number) => [i + 1, b.name, b.reg_no]),
        theme: 'grid',
        headStyles: { fillColor: [87, 83, 78] },
      });
      yPos = (doc as any & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }

    // Table 3: History and Review
    doc.setFontSize(14);
    doc.text('History & Review of Activities', 14, yPos);
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Details']],
      body: [
        ['Qualitative Review', formData?.history?.review_comment || 'N/A'],
        ['Challenges Faced', formData?.history?.challenges || 'N/A'],
        ['Admin Feedback', formData?.history?.feedback || 'N/A'],
        ['Official Documents', formData?.history?.official_documents || 'N/A'],
      ],
      theme: 'grid',
      columnStyles: { 1: { cellWidth: 140 } },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Activities
    if (formData?.history?.activities?.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.text('Critical Review of Activities', 14, yPos);
      yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['Title', 'Dates', 'Review']],
        body: formData.history.activities.map((a: { title: string, dates: string, review: string }) => [a.title, a.dates, a.review]),
        theme: 'grid',
        columnStyles: { 2: { cellWidth: 100 } },
      });
      yPos = (doc as any & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }

    // Signatures
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text('Undertaking & Authorization', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text('1. I hereby submit that all the information provided in the application form is true and to the best of my knowledge.', 14, yPos, { maxWidth: 180 });
    yPos += 15;
    doc.text('_______________________', 14, yPos);
    doc.text('Dated: ____________________', 120, yPos);
    yPos += 5;
    doc.text('Signatures of the President of Society', 14, yPos);
    
    yPos += 15;
    doc.text('2. I have read the responsibilities of a Society Faculty Advisor outlined in the CIIT Lahore Student Society Policy and herein provide my consent', 14, yPos, { maxWidth: 180 });
    yPos += 15;
    doc.text('_________________________', 14, yPos);
    doc.text('Dated: ____________________', 120, yPos);
    yPos += 5;
    doc.text('Signature of the Faculty Advisor of Society', 14, yPos);

    yPos += 20;
    doc.setFontSize(14);
    doc.text('For Official Use Only', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Request Received on: ____________________________________________________________', 14, yPos);
    yPos += 10;
    doc.text('Comments by the Student Societies Committee:', 14, yPos);
    yPos += 12;
    doc.text('____________________________________________________________________________________________________', 14, yPos);
    yPos += 7;
    doc.text('____________________________________________________________________________________________________', 14, yPos);

    doc.save(`${societyName}_Review_Form.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-10 font-(--font-family-poppins)"
    >
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 mb-8">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
           <AlertTriangle size={20} />
        </div>
        <div>
           <h4 className="text-amber-800 font-bold text-sm">Submission Required</h4>
           <p className="text-amber-700 text-xs mt-1 leading-relaxed">
             It is <span className="font-black underline uppercase">compulsory</span> to download this filled Review form, print it, obtain signatures from the President and Faculty Advisor, and submit it to the Head of Societies/Office of Incharge Student Societies in hard form.
           </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-stone-400" />
            Registration Details
          </h3>
          <p className="text-sm text-stone-500 mt-1">You have already submitted a review form. Below are the details.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider ${statusColors[request.status] || statusColors.PENDING}`}>
            {statusIcons[request.status] || statusIcons.PENDING}
            {request.status}
          </div>
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
                   {formData.other_office_bearers.map((b: { name: string, reg_no: string }, i: number) => (
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
                     {formData.history.activities.map((act: { title: string, dates: string, review: string }, i: number) => (
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

            {/* Signature & Official Use Section */}
            <div className="mt-12 pt-8 border-t-2 border-dashed border-stone-200 space-y-12">
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    1. I hereby submit that all the information provided in the application form is true and to the best of my knowledge.
                  </p>
                  <div className="flex justify-between items-end mt-8">
                    <div className="border-b border-stone-400 w-64 pb-1">
                      <span className="text-xs text-stone-400">Signatures of the President of Society</span>
                    </div>
                    <div className="border-b border-stone-400 w-48 pb-1">
                      <span className="text-xs text-stone-400">Dated:</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    2. I have read the responsibilities of a Society Faculty Advisor outlined in the CIIT Lahore Student Society Policy and herein provide my consent
                  </p>
                  <div className="flex justify-between items-end mt-8">
                    <div className="border-b border-stone-400 w-64 pb-1">
                      <span className="text-xs text-stone-400">Signature of the Faculty Advisor of Society</span>
                    </div>
                    <div className="border-b border-stone-400 w-48 pb-1">
                      <span className="text-xs text-stone-400">Dated:</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
                <h6 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2">For Official Use Only</h6>
                <div className="space-y-6">
                  <p className="text-sm text-stone-600">Request Received on: <span className="inline-block border-b border-stone-300 w-full max-w-md ml-2 h-4"></span></p>
                  <div className="space-y-4">
                    <p className="text-sm text-stone-600">Comments by the Student Societies Committee:</p>
                    <div className="space-y-4">
                      <div className="border-b border-stone-200 w-full h-4"></div>
                      <div className="border-b border-stone-200 w-full h-4"></div>
                      <div className="border-b border-stone-200 w-full h-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
