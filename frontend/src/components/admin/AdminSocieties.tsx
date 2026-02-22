import React from 'react';
import { useGetAllSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import { FaUserTie, FaUsers } from 'react-icons/fa';

const AdminSocieties: React.FC = () => {
  const { data: societies, isLoading } = useGetAllSocietiesQuery(undefined);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Approved Societies</h2>
        <p className="text-slate-500">View and manage all societies active on the platform</p>
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
                          <img src={society.logo} alt={society.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
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
                      <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                        {society.description || "No description available."}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 shrink-0">
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-slate-400" />
                        <span>
                          Created By:<br/>
                          <span className="font-semibold text-slate-700">{society.created_by?.name || "Unknown"}</span>
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-2">
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
    </>
  );
};

export default AdminSocieties;
