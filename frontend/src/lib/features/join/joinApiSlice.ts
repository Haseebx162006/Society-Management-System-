import { apiSlice } from "../api/apiSlice";

// -- Types --

export interface FormField {
    _id?: string;
    label: string;
    field_type: "TEXT" | "EMAIL" | "NUMBER" | "DROPDOWN" | "CHECKBOX" | "FILE";
    is_required: boolean;
    options?: string[];
    order: number;
}

export interface JoinForm {
    _id: string;
    society_id: string | { _id: string; name: string; description: string };
    title: string;
    description?: string;
    fields: FormField[];
    is_active: boolean;
    is_public: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface FormResponse {
    field_label: string;
    field_type: string;
    value: string | number | boolean;
}

export interface JoinRequest {
    _id: string;
    user_id: { _id: string; name: string; email: string; phone?: string } | string;
    society_id: { _id: string; name: string } | string;
    form_id: { _id: string; title: string; fields?: FormField[] } | string;
    selected_team?: { _id: string; name: string } | string | null;
    responses: FormResponse[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejection_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at: string;
}

export interface Team {
    _id: string;
    name: string;
    description?: string;
}

export interface PublicFormResponse {
    form: JoinForm;
    teams: Team[];
}

// -- API Slice --

export const joinApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // President: CRUD join forms
        getJoinFormsBySociety: builder.query<JoinForm[], string>({
            query: (societyId) => `/society/${societyId}/join-forms`,
            transformResponse: (response: { data: JoinForm[] }) => response.data,
            providesTags: (result, _error, societyId) =>
                result
                    ? [
                        ...result.map((f) => ({ type: "JoinForm" as const, id: f._id })),
                        { type: "JoinForm" as const, id: `SOCIETY_${societyId}` },
                    ]
                    : [{ type: "JoinForm" as const, id: `SOCIETY_${societyId}` }],
        }),

        // Public: List active forms for a society (no auth required)
        getPublicJoinFormsBySociety: builder.query<JoinForm[], string>({
            query: (societyId) => `/society/${societyId}/public-join-forms`,
            transformResponse: (response: { data: JoinForm[] }) => response.data,
            providesTags: (result, _error, societyId) =>
                result
                    ? [
                        ...result.map((f) => ({ type: "JoinForm" as const, id: f._id })),
                        { type: "JoinForm" as const, id: `PUBLIC_${societyId}` },
                    ]
                    : [{ type: "JoinForm" as const, id: `PUBLIC_${societyId}` }],
        }),

        createJoinForm: builder.mutation<
            JoinForm,
            { societyId: string; body: Partial<JoinForm> }
        >({
            query: ({ societyId, body }) => ({
                url: `/society/${societyId}/join-forms`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId }) => [
                { type: "JoinForm", id: `SOCIETY_${societyId}` },
            ],
        }),

        updateJoinForm: builder.mutation<
            JoinForm,
            { societyId: string; formId: string; body: Partial<JoinForm> }
        >({
            query: ({ societyId, formId, body }) => ({
                url: `/society/${societyId}/join-forms/${formId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId, formId }) => [
                { type: "JoinForm", id: formId },
                { type: "JoinForm", id: `SOCIETY_${societyId}` },
            ],
        }),

        deleteJoinForm: builder.mutation<
            void,
            { societyId: string; formId: string }
        >({
            query: ({ societyId, formId }) => ({
                url: `/society/${societyId}/join-forms/${formId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { societyId, formId }) => [
                { type: "JoinForm", id: formId },
                { type: "JoinForm", id: `SOCIETY_${societyId}` },
            ],
        }),

        // Public: view form and submit request
        getJoinFormPublic: builder.query<PublicFormResponse, string>({
            query: (formId) => `/join-forms/${formId}`,
            transformResponse: (response: { data: PublicFormResponse }) =>
                response.data,
            providesTags: (_result, _error, formId) => [
                { type: "JoinForm", id: formId },
            ],
        }),

        submitJoinRequest: builder.mutation<
            JoinRequest,
            { formId: string; body: FormData }
        >({
            query: ({ formId, body }) => ({
                url: `/join-forms/${formId}/submit`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["JoinRequest", "User"],
        }),

        // President: manage requests
        getJoinRequestsForSociety: builder.query<
            JoinRequest[],
            { societyId: string; status?: string }
        >({
            query: ({ societyId, status }) => ({
                url: `/society/${societyId}/join-requests`,
                params: status ? { status } : undefined,
            }),
            transformResponse: (response: { data: JoinRequest[] }) => response.data,
            providesTags: (result, _error, { societyId }) =>
                result
                    ? [
                        ...result.map((r) => ({
                            type: "JoinRequest" as const,
                            id: r._id,
                        })),
                        { type: "JoinRequest" as const, id: `SOCIETY_${societyId}` },
                    ]
                    : [{ type: "JoinRequest" as const, id: `SOCIETY_${societyId}` }],
        }),

        updateJoinRequestStatus: builder.mutation<
            JoinRequest,
            {
                societyId: string;
                requestId: string;
                body: {
                    status: "APPROVED" | "REJECTED";
                    rejection_reason?: string;
                    assign_team?: string;
                };
            }
        >({
            query: ({ societyId, requestId, body }) => ({
                url: `/society/${societyId}/join-requests/${requestId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId, requestId }) => [
                { type: "JoinRequest", id: requestId },
                { type: "JoinRequest", id: `SOCIETY_${societyId}` },
                "User",
            ],
        }),

        // User: my requests
        getMyJoinRequests: builder.query<JoinRequest[], void>({
            query: () => `/my/join-requests`,
            transformResponse: (response: { data: JoinRequest[] }) => response.data,
            providesTags: ["JoinRequest"],
        }),

        // ─── Previous Members (President) ───────────────────────────────
        uploadPreviousMembers: builder.mutation<
            { total_in_file: number; newly_added: number; duplicates_skipped: number; with_account: number; without_account: number; unregistered_emails: string[] },
            { societyId: string; body: FormData }
        >({
            query: ({ societyId, body }) => ({
                url: `/society/${societyId}/previous-members/upload`,
                method: "POST",
                body,
            }),
            transformResponse: (response: { data: any }) => response.data,
            invalidatesTags: (_result, _error, { societyId }) => [
                { type: "PreviousMember" as const, id: `SOCIETY_${societyId}` },
            ],
        }),

        getPreviousMembers: builder.query<
            { _id: string; email: string; has_account: boolean; created_at: string }[],
            string
        >({
            query: (societyId) => `/society/${societyId}/previous-members`,
            transformResponse: (response: { data: any[] }) => response.data,
            providesTags: (result, _error, societyId) =>
                result
                    ? [
                        ...result.map((m) => ({ type: "PreviousMember" as const, id: m._id })),
                        { type: "PreviousMember" as const, id: `SOCIETY_${societyId}` },
                    ]
                    : [{ type: "PreviousMember" as const, id: `SOCIETY_${societyId}` }],
        }),

        deletePreviousMember: builder.mutation<void, { societyId: string; memberId: string }>({
            query: ({ societyId, memberId }) => ({
                url: `/society/${societyId}/previous-members/${memberId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { societyId, memberId }) => [
                { type: "PreviousMember", id: memberId },
                { type: "PreviousMember", id: `SOCIETY_${societyId}` },
            ],
        }),

        clearPreviousMembers: builder.mutation<void, string>({
            query: (societyId) => ({
                url: `/society/${societyId}/previous-members`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, societyId) => [
                { type: "PreviousMember", id: `SOCIETY_${societyId}` },
            ],
        }),
    }),
});

export const {
    useGetJoinFormsBySocietyQuery,
    useGetPublicJoinFormsBySocietyQuery,
    useCreateJoinFormMutation,
    useUpdateJoinFormMutation,
    useDeleteJoinFormMutation,
    useGetJoinFormPublicQuery,
    useSubmitJoinRequestMutation,
    useGetJoinRequestsForSocietyQuery,
    useUpdateJoinRequestStatusMutation,
    useGetMyJoinRequestsQuery,
    useUploadPreviousMembersMutation,
    useGetPreviousMembersQuery,
    useDeletePreviousMemberMutation,
    useClearPreviousMembersMutation,
} = joinApiSlice;
