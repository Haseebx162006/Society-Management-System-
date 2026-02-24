import { apiSlice } from "../api/apiSlice";

export interface EmailTarget {
    _id: string;
    name: string;
    memberCount: number;
}

export interface EmailTargetsResponse {
    totalMembers: number;
    groups: EmailTarget[];
}

export interface SendEmailRequest {
    society_id: string;
    subject: string;
    message: string;
    targetType: 'all' | 'groups';
    groupIds?: string[];
}

export interface SendEmailResponse {
    recipientCount: number;
    target: string;
}

export const emailApiSlice = apiSlice.injectEndpoints({
    overrideExisting: false,
    endpoints: (builder) => ({
        getEmailTargets: builder.query<EmailTargetsResponse, string>({
            query: (societyId) => `/email/${societyId}/targets`,
            transformResponse: (response: { data: EmailTargetsResponse }) => response.data,
        }),
        sendBulkEmail: builder.mutation<SendEmailResponse, SendEmailRequest>({
            query: ({ society_id, ...body }) => ({
                url: `/email/${society_id}/send`,
                method: 'POST',
                body,
            }),
            transformResponse: (response: { data: SendEmailResponse }) => response.data,
        }),
    }),
});

export const {
    useGetEmailTargetsQuery,
    useSendBulkEmailMutation,
} = emailApiSlice;
