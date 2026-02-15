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
    getAllSocieties: builder.query({
        query: () => "/society",
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
  }),
});

export const {
  useCreateSocietyRequestMutation,
  useGetAllSocietiesQuery,
  useGetSocietyRequestsQuery,
  useUpdateSocietyRequestStatusMutation,
} = societyApiSlice;
