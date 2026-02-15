"use client";

import { useGetMySocietiesQuery } from "../../lib/features/user/userApiSlice";

export default function EnrolledSocieties() {
  const { data: societies, isLoading, error } = useGetMySocietiesQuery();

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-50 text-purple-700 border border-purple-100",
      MODERATOR: "bg-blue-50 text-blue-700 border border-blue-100",
      MEMBER: "bg-gray-50 text-gray-600 border border-gray-100",
    };
    return styles[role] || styles.MEMBER;
  };

  const getRoleIcon = (role: string) => {
    if (role === "ADMIN") {
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    }
    if (role === "MODERATOR") {
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-[var(--font-family-poppins)]">
          Enrolled Societies
        </h2>
        <p className="text-sm text-gray-400 mt-1">Societies you are a part of</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-3 w-48 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Failed to load your societies
        </div>
      )}

      {!isLoading && !error && (!societies || societies.length === 0) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No societies yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            You haven&apos;t joined any societies yet. Explore and join societies to see them here.
          </p>
        </div>
      )}

      {societies && societies.length > 0 && (
        <div className="space-y-3">
          {societies.map((society) => {
            const societyData = typeof society.society_id === "object" ? society.society_id : null;
            return (
              <div
                key={society._id}
                className="group rounded-2xl border border-gray-100 p-5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 shrink-0">
                    {societyData?.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {societyData?.name || "Unknown Society"}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getRoleBadge(society.role)}`}>
                        {getRoleIcon(society.role)}
                        {society.role}
                      </span>
                    </div>
                    {societyData?.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {societyData.description}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${society.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                    <span className="text-xs font-medium text-gray-400">
                      {society.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
