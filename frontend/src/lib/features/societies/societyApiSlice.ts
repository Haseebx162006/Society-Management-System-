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
    }),
  }),
});

export const { useCreateSocietyRequestMutation, useGetAllSocietiesQuery } = societyApiSlice;
