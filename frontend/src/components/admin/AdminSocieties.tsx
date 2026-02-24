import React, { useState } from 'react';
import { 
  useGetAllSocietiesAdminQuery, 
  useSuspendSocietyMutation, 
  useReactivateSocietyMutation,
  useGetSocietyMembersQuery,
  useChangePresidentMutation 
} from '@/lib/features/societies/societyApiSlice';
import { FaUserTie, FaUsers, FaDownload, FaBan, FaCheckCircle, FaExclamationTriangle, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';

const AdminSocieties: React.FC = () => {
  const { data: societies, isLoading, refetch } = useGetAllSocietiesAdminQuery(undefined);
  const [suspendSociety, { isLoading: isSuspending }] = useSuspendSocietyMutation();
  const [reactivateSociety, { isLoading: isReactivating }] = useReactivateSocietyMutation();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    societyId: '',
    societyName: '',
    actionType: 'SUSPEND' as 'SUSPEND' | 'REACTIVATE' | 'CHANGE_PRESIDENT'
  });

  const [selectedNewPresidentId, setSelectedNewPresidentId] = useState<string>('');

  const { data: membersData, isLoading: isLoadingMembers } = useGetSocietyMembersQuery(
    { societyId: modalConfig.societyId, limit: 100 },
    { skip: modalConfig.actionType !== 'CHANGE_PRESIDENT' || !modalConfig.societyId }
  );

  const [changePresident, { isLoading: isChangingPresident }] = useChangePresidentMutation();

  const handleToggleStatus = (id: string, name: string, currentStatus: string) => {
    setModalConfig({
      isOpen: true,
      societyId: id,
      societyName: name,
      actionType: currentStatus === 'ACTIVE' ? 'SUSPEND' : 'REACTIVATE'
    });
  };

  const handleChangePresident = (id: string, name: string) => {
    setSelectedNewPresidentId('');
    setModalConfig({
      isOpen: true,
      societyId: id,
      societyName: name,
      actionType: 'CHANGE_PRESIDENT'
    });
  };

  const confirmAction = async () => {
    try {
      if (modalConfig.actionType === 'SUSPEND') {
         await suspendSociety(modalConfig.societyId).unwrap();
      } else if (modalConfig.actionType === 'REACTIVATE') {
         await reactivateSociety(modalConfig.societyId).unwrap();
      } else if (modalConfig.actionType === 'CHANGE_PRESIDENT' && selectedNewPresidentId) {
         await changePresident({ 
            societyId: modalConfig.societyId, 
            new_president_id: selectedNewPresidentId 
         }).unwrap();
      }
      setModalConfig({ ...modalConfig, isOpen: false });
      refetch();
    } catch (err) {
      console.error(`Failed to ${modalConfig.actionType.toLowerCase()}`, err);
    }
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    setSelectedNewPresidentId('');
  };

  const downloadPDF = () => {
    if (!societies || societies.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Approved Societies", 14, 22);

    const tableData = societies.map((society: any) => [
      society.name,
      society.status,
      society.membersCount || 0,
      society.created_by?.name || "Unknown"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Society Name', 'Status', 'Members', 'Created By']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] },
    });

    doc.save("societies_list.pdf");
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Approved Societies</h2>
          <p className="text-slate-500">View and manage all societies active on the platform</p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={isLoading || !societies || societies.length === 0}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg border border-red-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 overflow-hidden rounded-2xl">
        <div className="border-t border-slate-200">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500 text-sm">Loading societies...</div>
          ) : !societies || societies.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No societies found.</div>
          ) : (
            <ul role="list" className="divide-y divide-slate-100">
              {societies.map((society: any) => (
                <li key={society._id} className="p-6 hover:bg-slate-50/50 transition duration-150 ease-in-out">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {society.logo ? (
                          <Image src={society.logo} alt={society.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-200">
                            {society.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{society.name}</h3>
                          <span className={`px-2 py-0.5 mt-1 inline-flex text-xs leading-5 font-bold rounded-md ${
                            society.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {society.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                           {society.status === 'ACTIVE' ? (
                               <button 
                                 onClick={() => handleToggleStatus(society._id, society.name, society.status)}
                                 disabled={isSuspending || isReactivating}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded drop-shadow-sm text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-200"
                               >
                                 <FaBan /> Suspend Society
                               </button>
                           ) : society.status === 'SUSPENDED' ? (
                               <button 
                                 onClick={() => handleToggleStatus(society._id, society.name, society.status)}
                                 disabled={isSuspending || isReactivating}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded drop-shadow-sm text-xs font-semibold hover:bg-green-100 disabled:opacity-50 transition-colors border border-green-200"
                               >
                                 <FaCheckCircle /> Reactivate Society
                               </button>
                           ) : null}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-3">
                        {society.description || "No description available."}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 shrink-0">
                      <div className="flex gap-6 w-full justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-slate-400" />
                          <span>
                            President:<br/>
                            <span className="font-semibold text-slate-700">{society.president?.name || society.created_by?.name || "Unknown"}</span>
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex flex-col justify-center items-center">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 mt-1">Actions</span>
                          <button
                            onClick={() => handleChangePresident(society._id, society.name)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white text-orange-600 rounded border border-orange-200 hover:bg-orange-50 transition-colors text-xs font-medium whitespace-nowrap"
                          >
                            <FaExchangeAlt className="w-3 h-3" /> Change
                          </button>
                        </div>
                      </div>
                      <div className="w-full h-px bg-slate-200"></div>
                      <div className="flex items-center gap-2 w-full">
                        <FaUsers className="text-slate-400" />
                        <span>
                          Members:<br/>
                          <span className="font-semibold text-slate-700">{society.membersCount || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                {modalConfig.actionType === 'SUSPEND' ? (
                  <><FaExclamationTriangle className="text-red-500" /> Suspend Society</>
                ) : modalConfig.actionType === 'REACTIVATE' ? (
                  <><FaCheckCircle className="text-green-500" /> Reactivate Society</>
                ) : (
                  <><FaExchangeAlt className="text-orange-500" /> Change President</>
                )}
              </h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {modalConfig.actionType === 'CHANGE_PRESIDENT' ? (
                <div>
                  <p className="text-slate-600 mb-4">
                    Select a new president for <span className="font-bold text-slate-800">{modalConfig.societyName}</span>. The current president will be demoted to a regular member.
                  </p>
                  
                  {isLoadingMembers ? (
                    <div className="text-center py-6 text-slate-500">Loading members...</div>
                  ) : !membersData?.members || membersData.members.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                      No matching members found in this society. Add members first.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 max-w-full">
                      {membersData.members.map((member: any) => (
                        <div 
                          key={member.user_id._id}
                          onClick={() => setSelectedNewPresidentId(member.user_id._id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedNewPresidentId === member.user_id._id 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate pr-4">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold shrink-0">
                              {member.user_id.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <p className="font-medium text-slate-800 text-sm truncate">{member.user_id.name}</p>
                              <p className="text-xs text-slate-500 truncate">{member.user_id.email}</p>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center">
                            {member.role === 'PRESIDENT' && (
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded mr-2">
                                CURRENT
                              </span>
                            )}
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              selectedNewPresidentId === member.user_id._id 
                                ? 'border-orange-600 bg-orange-600 text-white' 
                                : 'border-slate-300'
                            }`}>
                              {selectedNewPresidentId === member.user_id._id && <FaCheckCircle className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-slate-600 mb-2">
                    Are you sure you want to {modalConfig.actionType === 'SUSPEND' ? 'suspend' : 'reactivate'}{' '}
                    <span className="font-bold text-slate-800">{modalConfig.societyName}</span>?
                  </p>
                  
                  {modalConfig.actionType === 'SUSPEND' && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4">
                      <p className="text-sm text-red-700 font-medium flex items-start gap-2">
                        <FaBan className="mt-0.5 shrink-0" />
                        If suspended, this society will be hidden from all standard users and they will lose access to its dashboard and features until reactivated.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-6 pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={closeModal}
                disabled={isSuspending || isReactivating || isChangingPresident}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={isSuspending || isReactivating || isChangingPresident || (modalConfig.actionType === 'CHANGE_PRESIDENT' && !selectedNewPresidentId)}
                className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  modalConfig.actionType === 'SUSPEND' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200' 
                    : modalConfig.actionType === 'REACTIVATE'
                      ? 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200'
                      : 'bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-200'
                }`}
              >
                {(isSuspending || isReactivating || isChangingPresident) 
                  ? 'Processing...' 
                  : modalConfig.actionType === 'SUSPEND' 
                    ? 'Yes, Suspend Society' 
                    : modalConfig.actionType === 'REACTIVATE'
                      ? 'Yes, Reactivate Society'
                      : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSocieties;
