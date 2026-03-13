import React, { useState } from 'react';
import { 
  useGetAllEventsAdminQuery, 
  useGetEventRegistrationsAdminQuery 
} from '@/lib/features/events/eventApiSlice';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel, 
  FaChevronRight,
  FaMapMarkerAlt,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminEvents: React.FC = () => {
  const { data: events, isLoading: isLoadingEvents } = useGetAllEventsAdminQuery();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: registrations, isLoading: isLoadingRegistrations } = useGetEventRegistrationsAdminQuery(
    selectedEvent?._id || '',
    { skip: !selectedEvent }
  );

  const openRegistrations = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeRegistrations = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const downloadExcel = () => {
    if (!registrations || registrations.length === 0) return;

    const exportData = registrations.map((reg: any, index: number) => {
      const row: any = {
        'S.No': index + 1,
        'Name': reg.user_id?.name || 'N/A',
        'Email': reg.user_id?.email || 'N/A',
        'Phone': reg.user_id?.phone || 'N/A',
        'Status': reg.status,
        'Registration Date': new Date(reg.created_at).toLocaleDateString()
      };

      // Add dynamic form responses
      reg.responses?.forEach((resp: any) => {
        row[resp.field_label] = resp.value;
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    XLSX.writeFile(workbook, `${selectedEvent?.title}_registrations.xlsx`);
  };

  const downloadPDF = () => {
    if (!registrations || registrations.length === 0) return;

    const doc = new jsPDF();
    
    const img = new Image();
    img.src = '/logo.png';

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Comsats University Islamabad, Lahore', 200, 15, { align: 'right' });

    try {
        doc.addImage(img, 'PNG', 14, 10, 25, 25);
    } catch (e) {
        console.error('Logo failed to load for PDF', e);
    }

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Event Registrations', 14, 45);
    
    doc.setFontSize(13);
    doc.setTextColor(80);
    doc.text(`Event: ${selectedEvent?.title}`, 14, 53);
    doc.text(`Society: ${selectedEvent?.society_id?.name || 'N/A'}`, 14, 59);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 66);

    const tableData = registrations.map((reg: any, index: number) => [
      index + 1,
      reg.user_id?.name || 'N/A',
      reg.user_id?.email || 'N/A',
      reg.user_id?.phone || 'N/A',
      reg.status
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['#', 'Name', 'Email', 'Phone', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] },
      styles: { fontSize: 9 }
    });

    doc.save(`${selectedEvent?.title}_registrations.pdf`);
  };

  if (isLoadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 animate-pulse font-medium">Loading events...</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px] text-center">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
          <FaCalendarAlt size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Events Found</h3>
        <p className="text-slate-500 max-w-sm">There are no events registered on the platform across any society yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Events Management</h2>
          <p className="text-slate-500">View and track all society events</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Society</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {events?.map((event: any) => (
                <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-4">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{event.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <FaClock className="text-[10px]" /> {new Date(event.event_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {event.society_id?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                      event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      event.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => openRegistrations(event)}
                      className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-bold transition-colors"
                    >
                      Registrations <FaChevronRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registrations Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedEvent?.title}</h3>
                <p className="text-sm text-slate-500">Registered Students</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadExcel}
                  disabled={isLoadingRegistrations || !registrations?.length}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors border border-green-100"
                  title="Export to Excel"
                >
                  <FaFileExcel size={18} />
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={isLoadingRegistrations || !registrations?.length}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                  title="Export to PDF"
                >
                  <FaFilePdf size={18} />
                </button>
                <button 
                  onClick={closeRegistrations}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ml-2"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingRegistrations ? (
                <div className="text-center py-12 text-slate-500">Loading registrations...</div>
              ) : registrations && registrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {registrations.map((reg: any) => (
                        <tr key={reg._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mr-3">
                                {reg.user_id?.name?.charAt(0) || '?'}
                              </div>
                              <div className="text-sm font-medium text-slate-900">{reg.user_id?.name || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-xs text-slate-600">{reg.user_id?.email || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{reg.user_id?.phone || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                              reg.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                              reg.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                              'bg-orange-50 text-orange-700'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                            {new Date(reg.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">No registrations found for this event.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
