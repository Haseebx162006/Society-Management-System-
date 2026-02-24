import { apiSlice } from "../api/apiSlice";
import { User } from "../auth/authSlice";

export interface SocietyRole {
    _id: string;
    name: string;
    user_id: string;
    society_id: {
        _id: string;
        name: string;
        description: string;
        status: string;
        logo?: string;
    } | string;
    role: string;
    group_id?: string | null;
    is_active: boolean;
    joined_at: string;
}

export interface SocietyRequest {
    _id: string;
    society_name: string;
    description: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejection_reason?: string;
    created_at: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
    
    endpoints: (builder) => ({
        getMySocieties: builder.query<SocietyRole[], void>({
            query: () => '/user/societies',
            transformResponse: (response: { success: boolean; message: string; data: SocietyRole[] }) => response.data,
            providesTags: ['User'],
        }),
        getMyRequests: builder.query<SocietyRequest[], void>({
            query: () => '/user/requests',
            transformResponse: (response: { success: boolean; message: string; data: SocietyRequest[] }) => response.data,
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<User, { name?: string; phone?: string }>({
            query: (data) => ({
                url: '/user/profile',
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: { success: boolean; message: string; data: User }) => response.data,
            invalidatesTags: ['User'],
        }),
        getProfile: builder.query<User, void>({
            query: () => '/user/me',
            transformResponse: (response: { success: boolean; message: string; data: User }) => response.data,
            providesTags: ['User'],
        }),
        changePassword: builder.mutation<void, { currentPassword?: string; newPassword?: string }>({
            query: (data) => ({
                url: '/user/password',
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const { useGetMySocietiesQuery, useGetMyRequestsQuery, useUpdateProfileMutation, useGetProfileQuery, useChangePasswordMutation } = userApiSlice;
