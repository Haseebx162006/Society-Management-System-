import { apiSlice } from "../api/apiSlice";

export const documentationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSocietyDocumentations: builder.query({
            query: (societyId) => `/documentations/society/${societyId}`,
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ _id }: { _id: string }) => ({
                              type: "Documentation" as const,
                              id: _id,
                          })),
                          { type: "Documentation", id: "LIST" },
                      ]
                    : [{ type: "Documentation", id: "LIST" }],
        }),
        uploadDocumentation: builder.mutation({
            query: ({ societyId, formData }) => ({
                url: `/documentations/society/${societyId}`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Documentation", id: "LIST" }],
        }),
        deleteDocumentation: builder.mutation({
            query: ({ societyId, docId }) => ({
                url: `/documentations/${docId}/society/${societyId}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Documentation", id: "LIST" }],
        }),
    }),
});

export const {
    useGetSocietyDocumentationsQuery,
    useUploadDocumentationMutation,
    useDeleteDocumentationMutation,
} = documentationApiSlice;
