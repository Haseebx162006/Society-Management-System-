import React from 'react';
import { useGetAllSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import { FaUserTie, FaEnvelope, FaPhone, FaUniversity, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminPresidents: React.FC = () => {
  const { data: societies, isLoading } = useGetAllSocietiesQuery(undefined);

  // Extract unique presidents from the societies list
  // The backend populates 'created_by' with 'name' and 'email'
  // Some phone numbers might not be populated here, but we will display what we have
  const presidents = React.useMemo(() => {
    if (!societies) return [];
    
    const presidentMap = new Map();
    
    societies.forEach((society: any) => {
      const creator = society.created_by;
      if (creator && creator._id) {
        if (!presidentMap.has(creator._id)) {
            // Keep track of the first society they created for display
          presidentMap.set(creator._id, {
            ...creator,
            societyName: society.name
          });
        }
      }
    });
    
    return Array.from(presidentMap.values());
  }, [societies]);

  const downloadPDF = () => {
    if (!presidents || presidents.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Society Presidents", 14, 22);

    const tableData = presidents.map((president: any) => [
      president.name || "Unknown",
      president.email || "N/A",
      president.phone || "N/A",
      president.societyName || "Unknown"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Email', 'Phone', 'Society']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] },
    });

    doc.save("presidents_list.pdf");
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Society Presidents</h2>
          <p className="text-slate-500">View contact details for society presidents</p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={isLoading || presidents.length === 0}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg border border-red-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 overflow-hidden rounded-2xl">
        <div className="border-t border-slate-200">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500 text-sm">Loading presidents...</div>
          ) : presidents.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No presidents found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      President Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Society
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {presidents.map((president: any) => (
                    <tr key={president._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-200">
                              {(president.name || '?').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{president.name}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                              <FaUserTie className="text-[10px]" /> President
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                           <div className="text-sm text-slate-900 flex items-center gap-2">
                             <FaEnvelope className="text-slate-400" /> 
                             <a href={`mailto:${president.email}`} className="hover:text-orange-600 transition-colors">
                               {president.email}
                             </a>
                           </div>
                           <div className="text-sm text-slate-500 flex items-center gap-2">
                             <FaPhone className="text-slate-400" /> 
                             {president.phone || "N/A"}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-100 items-center gap-1.5">
                          <FaUniversity className="text-orange-400" />
                          {president.societyName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPresidents;
