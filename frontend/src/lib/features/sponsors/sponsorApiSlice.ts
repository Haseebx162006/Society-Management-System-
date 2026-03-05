import { apiSlice } from "../api/apiSlice";

export const sponsorApiSlice = apiSlice.injectEndpoints({
    overrideExisting: false,
    endpoints: (builder) => ({
        getSponsorsBySociety: builder.query({
            query: (societyId) => `/sponsors/society/${societyId}`,
            providesTags: ["Sponsor"],
            transformResponse: (response: { data: any }) => response.data,
        }),
        createSponsor: builder.mutation({
            query: (data) => ({
                url: "/sponsors",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Sponsor"],
        }),
        updateSponsor: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/sponsors/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Sponsor"],
        }),
        deleteSponsor: builder.mutation({
            query: (id) => ({
                url: `/sponsors/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Sponsor"],
        }),
    }),
});

export const {
    useGetSponsorsBySocietyQuery,
    useCreateSponsorMutation,
    useUpdateSponsorMutation,
    useDeleteSponsorMutation,
} = sponsorApiSlice;
