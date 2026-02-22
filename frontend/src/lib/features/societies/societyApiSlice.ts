import { apiSlice } from "../api/apiSlice";

export const societyApiSlice = apiSlice.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    createSocietyRequest: builder.mutation({
      query: (data) => ({
        url: "/society/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    createSociety: builder.mutation({
      query: (data) => ({
        url: "/society",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Society"],
    }),
    getAllSocieties: builder.query({
        query: () => "/society",
        providesTags: ["Society"],
        transformResponse: (response: { data: any }) => response.data,
    }),
    getAllPlatformMembers: builder.query({
        query: () => "/society/members/all",
        providesTags: ["SocietyMember"],
        transformResponse: (response: { data: any }) => response.data,
    }),
    getMyManageableSocieties: builder.query({
        query: () => "/society/manageable",
        providesTags: ["Society"],
        transformResponse: (response: { data: any }) => response.data,
    }),
    getSocietyById: builder.query({
      query: (id) => `/society/${id}`,
      providesTags: (result, error, id) => [{ type: "Society", id }],
      transformResponse: (response: { data: any }) => response.data,
    }),
    getSocietyRequests: builder.query({
      query: (status) => ({
        url: "/society/requests",
        params: status ? { status } : undefined,
      }),
      providesTags: ["SocietyRequest"],
      transformResponse: (response: { data: any }) => response.data,
    }),
    updateSocietyRequestStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/society/requests/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SocietyRequest", "User"],
    }),
    updateSociety: builder.mutation({
      query: ({ id, data }) => ({
        url: `/society/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Society"],
    }),
    updateSocietyMemberRole: builder.mutation({
        query: ({ societyId, userId, role }) => ({
            url: `/society/${societyId}/members/${userId}`,
            method: "PUT",
            body: { role }
        }),
        invalidatesTags: ["SocietyMember", "Society"],
    }),
  }),
});

export const {
  useCreateSocietyRequestMutation,
  useCreateSocietyMutation,
  useGetAllSocietiesQuery,
  useGetAllPlatformMembersQuery,
  useGetMyManageableSocietiesQuery,
  useGetSocietyRequestsQuery,
  useUpdateSocietyRequestStatusMutation,
  useUpdateSocietyMutation,
  useGetSocietyByIdQuery,
  useUpdateSocietyMemberRoleMutation,
} = societyApiSlice;
