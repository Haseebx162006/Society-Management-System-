import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RenewalFormData {
  exec_council: {
    president: { name: string, reg_no: string };
    gen_sec: { name: string, reg_no: string };
    treasurer: { name: string, reg_no: string };
    others: { name: string, reg_no: string }[];
  };
  exec_council_elect: { name: string, reg_no: string }[];
  calendar_events: {
    description: string;
    events: string[];
  };
  faculty_advisor: string;
  email: string;
  website?: string;
  functions: string;
}

export default function ReadonlyRenewalDetails({ request }: { request: { society_name: string, status: string, form_data: RenewalFormData } }) {

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
    doc.text('COMSOC Student Society Renewal Application Form', 105, 45, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Society: ${societyName}`, 14, 60);
    doc.text(`Status: ${request.status}`, 14, 67);

    let yPos = 75;

    // Table 1: Current Executive Council
    doc.setFontSize(14);
    doc.text('Current Executive Council', 14, yPos);
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Role', 'Name', 'Registration Number']],
      body: [
        ['President', formData?.exec_council?.president?.name || 'N/A', formData?.exec_council?.president?.reg_no || 'N/A'],
        ['Gen Secretary', formData?.exec_council?.gen_sec?.name || 'N/A', formData?.exec_council?.gen_sec?.reg_no || 'N/A'],
        ['Treasurer', formData?.exec_council?.treasurer?.name || 'N/A', formData?.exec_council?.treasurer?.reg_no || 'N/A'],
        ...(formData?.exec_council?.others || []).map((o: { name: string, reg_no: string }, i: number) => [`Member ${i + 4}`, o.name || 'N/A', o.reg_no || 'N/A']),
      ],
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
    });

    yPos = (doc as any & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    // Table 2: Executive Council Elect
    if (formData?.exec_council_elect?.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.text('Executive Council – Elect', 14, yPos);
      yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Name', 'Registration Number']],
        body: formData.exec_council_elect.map((b: { name: string, reg_no: string }, i: number) => [i + 1, b.name, b.reg_no]),
        theme: 'grid',
        headStyles: { fillColor: [87, 83, 78] },
      });
      yPos = (doc as any & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }

    // Table 3: Calendar of Events
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text('Proposed Calendar of Events', 14, yPos);
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Description']],
      body: [
        ['Management Strategy', formData?.calendar_events?.description || 'N/A'],
        ['Planned Events', (formData?.calendar_events?.events || []).join(', ') || 'N/A'],
      ],
      theme: 'grid',
      columnStyles: { 1: { cellWidth: 140 } },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    // Table 4: Other info
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    autoTable(doc, {
      startY: yPos,
      head: [['Field', 'Details']],
      body: [
        ['Faculty Advisor', formData?.faculty_advisor || 'N/A'],
        ['Society Email', formData?.email || 'N/A'],
        ['Society Website', formData?.website || 'N/A'],
        ['Functions of Society', formData?.functions || 'N/A'],
      ],
      theme: 'grid',
      columnStyles: { 1: { cellWidth: 140 } },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    // Signatures
    if (yPos > 200) { doc.addPage(); yPos = 20; }
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
    doc.text('Signature of the Nominated Faculty Advisor of Society', 14, yPos);

    yPos += 20;
    doc.setFontSize(14);
    doc.text('For Official Use Only', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Request Received on: ____________________________________________________________', 14, yPos);
    yPos += 10;
    doc.text('Recommended/Not Recommended: ', 14, yPos);
    yPos += 15;
    doc.text('Incharge Student Societies (Signature): _____________________', 14, yPos);
    yPos += 10;
    doc.text('Approval for Aforementioned Recommendation Granted by: ', 14, yPos);
    yPos += 15;
    doc.text('Director CIIT Lahore (Signature): _________________________', 14, yPos);

    doc.save(`${societyName}_Renewal_Form.pdf`);
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
             It is <span className="font-black underline uppercase">compulsory</span> to download this filled Renewal form, print it, obtain signatures from the President and Nominated Faculty Advisor, and submit it to the Head of Societies/Office of Incharge Student Societies in hard form.
           </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Renewal Application Details
          </h3>
          <p className="text-sm text-stone-500 mt-1">Below are the details of your submitted renewal request.</p>
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
                 <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Executive Council</h5>
                 <div className="space-y-2 text-sm">
                    <p><span className="text-stone-500 w-32 inline-block">President:</span> <strong className="text-stone-900">{formData?.exec_council?.president?.name}</strong> <span className="text-stone-400">({formData?.exec_council?.president?.reg_no})</span></p>
                    <p><span className="text-stone-500 w-32 inline-block">Gen Secretary:</span> <strong className="text-stone-900">{formData?.exec_council?.gen_sec?.name}</strong> <span className="text-stone-400">({formData?.exec_council?.gen_sec?.reg_no})</span></p>
                    <p><span className="text-stone-500 w-32 inline-block">Treasurer:</span> <strong className="text-stone-900">{formData?.exec_council?.treasurer?.name}</strong> <span className="text-stone-400">({formData?.exec_council?.treasurer?.reg_no})</span></p>
                 </div>
               </div>

                <div className="space-y-4">
                 <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Society Info</h5>
                 <div className="space-y-2 text-sm">
                    <p><span className="text-stone-500 w-32 inline-block">Faculty Advisor:</span> <strong className="text-stone-900">{formData?.faculty_advisor}</strong></p>
                    <p><span className="text-stone-500 w-32 inline-block">Email:</span> <strong className="text-stone-900">{formData?.email}</strong></p>
                    <p><span className="text-stone-500 w-32 inline-block">Website:</span> <strong className="text-stone-900">{formData?.website || 'N/A'}</strong></p>
                 </div>
               </div>
            </div>

            {formData?.calendar_events && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Proposed Calendar</h5>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-4">
                  <p className="text-sm text-stone-600 italic">&quot;{formData.calendar_events.description}&quot;</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.calendar_events.events?.map((ev: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700">{ev}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
               <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Functions</h5>
               <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-stone-100">{formData?.functions}</p>
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
                      <span className="text-xs text-stone-400">Signature of the Nominated Faculty Advisor of Society</span>
                    </div>
                    <div className="border-b border-stone-400 w-48 pb-1">
                      <span className="text-xs text-stone-400">Dated:</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
                <h6 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2">For Official Use Only</h6>
                <div className="space-y-8">
                  <p className="text-sm text-stone-600">Request Received on: <span className="inline-block border-b border-stone-300 w-full max-w-md ml-2 h-4"></span></p>
                  
                  <div className="flex justify-between items-center text-sm text-stone-600 pt-4">
                    <span>Recommended/Not Recommended: </span>
                    <div className="flex items-end gap-2">
                       <span className="text-xs text-stone-400">Incharge Student Societies (Signature):</span>
                       <span className="inline-block border-b border-stone-300 w-48 h-4"></span>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <p className="text-sm text-stone-600">Approval for Aforementioned Recommendation Granted by:</p>
                    <div className="flex justify-end items-end gap-2">
                       <span className="text-xs text-stone-400">Director CIIT Lahore (Signature):</span>
                       <span className="inline-block border-b border-stone-300 w-48 h-4"></span>
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
