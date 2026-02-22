import React, { useState, useMemo } from 'react';
import { useGetAllPlatformMembersQuery, useGetAllSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminMembers: React.FC = () => {
  const { data: members, isLoading: isLoadingMembers } = useGetAllPlatformMembersQuery(undefined);
  const { data: societies, isLoading: isLoadingSocieties } = useGetAllSocietiesQuery(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSociety, setSelectedSociety] = useState('ALL');

  const filteredMembers = useMemo(() => {
    if (!members) return [];

    return members.filter((member: any) => {
      const matchesSearch = 
        (member.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.user_id?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.user_id?.phone || '').includes(searchTerm);
        
      const matchesSociety = selectedSociety === 'ALL' || member.society_id?._id === selectedSociety;

      return matchesSearch && matchesSociety;
    });
  }, [members, searchTerm, selectedSociety]);

  const downloadPDF = () => {
    if (!filteredMembers || filteredMembers.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Platform Members", 14, 22);
    
    // Add subtitle indicating filters if any
    doc.setFontSize(11);
    doc.setTextColor(100);
    let subtitle = `Total: ${filteredMembers.length} members`;
    if (selectedSociety !== 'ALL') {
        const societyName = societies?.find((s:any) => s._id === selectedSociety)?.name;
        subtitle += ` | Filtered by Society: ${societyName}`;
    }
    if (searchTerm) {
        subtitle += ` | Searched: "${searchTerm}"`;
    }
    doc.text(subtitle, 14, 30);

    const tableData = filteredMembers.map((member: any) => [
      member.user_id?.name || "Unknown",
      member.user_id?.email || "N/A",
      member.user_id?.phone || "N/A",
      member.society_id?.name || "Unknown",
      member.role || "MEMBER",
      member.group_id?.name || "General"
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['Name', 'Email', 'Phone', 'Society', 'Role', 'Team']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] },
      styles: { fontSize: 8 },
    });

    doc.save("platform_members_export.pdf");
  };

  const isLoading = isLoadingMembers || isLoadingSocieties;

  return (
    <>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Platform Members</h2>
          <p className="text-slate-500">View and filter all members across all societies</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm w-full sm:w-64"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-slate-400" />
            </div>
            <select
              value={selectedSociety}
              onChange={(e) => setSelectedSociety(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm w-full sm:w-48 appearance-none bg-white"
            >
              <option value="ALL">All Societies</option>
              {societies?.map((society: any) => (
                <option key={society._id} value={society._id}>
                  {society.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadPDF}
            disabled={isLoading || filteredMembers.length === 0}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl border border-red-200 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
          >
            <FaDownload /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 overflow-hidden rounded-2xl">
        <div className="border-t border-slate-200">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading members...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="flex justify-center mb-4"><FaUser className="text-5xl text-slate-300" /></div>
              <p className="font-medium text-slate-700">No members found</p>
              <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Member Info
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Society & Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredMembers.map((member: any) => (
                    <tr key={member._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg border border-slate-200">
                              {(member.user_id?.name || '?').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{member.user_id?.name || "Unknown User"}</div>
                            <div className="text-sm text-slate-500 mt-0.5">
                               {member.group_id?.name ? `Team: ${member.group_id.name}` : "General Member"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                           <div className="text-sm text-slate-900 flex items-center gap-2">
                             <FaEnvelope className="text-slate-400" /> 
                             <a href={`mailto:${member.user_id?.email}`} className="hover:text-blue-600 transition-colors">
                               {member.user_id?.email || "N/A"}
                             </a>
                           </div>
                           <div className="text-sm text-slate-500 flex items-center gap-2">
                             <FaPhone className="text-slate-400" /> 
                             {member.user_id?.phone || "N/A"}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex flex-col items-start gap-2">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-100 items-center gap-1.5">
                          <FaUniversity className="text-orange-400" />
                          {member.society_id?.name || "Unknown Society"}
                        </span>
                        <span className="px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                          {member.role || "MEMBER"}
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

export default AdminMembers;
