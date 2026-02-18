import { apiSlice } from "../api/apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Group {
    _id: string;
    society_id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    memberCount?: number;
}

export interface GroupMember {
    _id: string;
    group_id: string;
    user_id: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    society_id: string;
    role: "LEAD" | "CO-LEAD" | "GENERAL SECRETARY" | "MEMBER";
    joined_at: string;
}

export interface SocietyMember {
    _id: string;
    name: string;
    user_id: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    society_id: string;
    role: string;
    assigned_at: string;
}

export interface PaginatedMembers {
    members: SocietyMember[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── API Slice ───────────────────────────────────────────────────────────────

export const groupApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // ─── Society Members (paginated) ─────────────────────────────
        getSocietyMembers: builder.query<
            PaginatedMembers,
            { societyId: string; page?: number; limit?: number; search?: string }
        >({
            query: ({ societyId, page = 1, limit = 10, search = "" }) => ({
                url: `/society/${societyId}/members`,
                params: { page, limit, ...(search ? { search } : {}) },
            }),
            transformResponse: (response: { data: PaginatedMembers }) => response.data,
            providesTags: (result, _error, { societyId }) => [
                { type: "SocietyMember" as const, id: societyId },
            ],
        }),

        // ─── Group CRUD ──────────────────────────────────────────────
        getGroupsInSociety: builder.query<Group[], string>({
            query: (societyId) => `/groups/society/${societyId}`,
            transformResponse: (response: { data: Group[] }) => response.data,
            providesTags: (result, _error, societyId) =>
                result
                    ? [
                        ...result.map((g) => ({ type: "Group" as const, id: g._id })),
                        { type: "Group" as const, id: `SOCIETY_${societyId}` },
                    ]
                    : [{ type: "Group" as const, id: `SOCIETY_${societyId}` }],
        }),

        createGroup: builder.mutation<Group, { society_id: string; name: string; description?: string }>({
            query: (body) => ({
                url: "/groups",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { society_id }) => [
                { type: "Group" as const, id: `SOCIETY_${society_id}` },
            ],
        }),

        updateGroup: builder.mutation<Group, { id: string; body: Partial<Group>; societyId: string }>({
            query: ({ id, body }) => ({
                url: `/groups/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id, societyId }) => [
                { type: "Group" as const, id },
                { type: "Group" as const, id: `SOCIETY_${societyId}` },
            ],
        }),

        deleteGroup: builder.mutation<void, { id: string; societyId: string }>({
            query: ({ id }) => ({
                url: `/groups/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { id, societyId }) => [
                { type: "Group" as const, id },
                { type: "Group" as const, id: `SOCIETY_${societyId}` },
            ],
        }),

        // ─── Group Members ───────────────────────────────────────────
        getGroupMembers: builder.query<GroupMember[], string>({
            query: (groupId) => `/groups/${groupId}/members`,
            transformResponse: (response: { data: GroupMember[] }) => response.data,
            providesTags: (result, _error, groupId) => [
                { type: "GroupMember" as const, id: groupId },
            ],
        }),

        addMemberToGroup: builder.mutation<
            GroupMember,
            { groupId: string; user_id: string }
        >({
            query: ({ groupId, user_id }) => ({
                url: `/groups/${groupId}/members`,
                method: "POST",
                body: { user_id },
            }),
            invalidatesTags: (_result, _error, { groupId }) => [
                { type: "GroupMember" as const, id: groupId },
            ],
        }),

        removeMemberFromGroup: builder.mutation<
            void,
            { groupId: string; userId: string }
        >({
            query: ({ groupId, userId }) => ({
                url: `/groups/${groupId}/members/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { groupId }) => [
                { type: "GroupMember" as const, id: groupId },
            ],
        }),

        updateMemberRole: builder.mutation<
            GroupMember,
            { groupId: string; userId: string; role: string }
        >({
            query: ({ groupId, userId, role }) => ({
                url: `/groups/${groupId}/members/${userId}/role`,
                method: "PUT",
                body: { role },
            }),
            invalidatesTags: (_result, _error, { groupId }) => [
                { type: "GroupMember" as const, id: groupId },
            ],
        }),
    }),
});

export const {
    useGetSocietyMembersQuery,
    useGetGroupsInSocietyQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useGetGroupMembersQuery,
    useAddMemberToGroupMutation,
    useRemoveMemberFromGroupMutation,
    useUpdateMemberRoleMutation,
} = groupApiSlice;
