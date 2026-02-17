import { apiSlice } from "../api/apiSlice";

export const societyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSocietyRequest: builder.mutation({
      query: (data) => ({
        url: "/society/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"], // Refresh user requests list
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
      query: ({ id, ...data }) => ({
        url: `/society/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Society"],
    }),
  }),
});

export const {
  useCreateSocietyRequestMutation,
  useCreateSocietyMutation,
  useGetAllSocietiesQuery,
  useGetSocietyRequestsQuery,
  useUpdateSocietyRequestStatusMutation,
  useUpdateSocietyMutation,
} = societyApiSlice;
