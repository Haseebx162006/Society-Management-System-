import { apiSlice } from "../api/apiSlice";

// -- Types --

export interface EventFormField {
    _id?: string;
    label: string;
    field_type: "TEXT" | "EMAIL" | "NUMBER" | "DROPDOWN" | "CHECKBOX" | "FILE" | "TEXTAREA" | "DATE" | "PHONE";
    is_required: boolean;
    options?: string[];
    placeholder?: string;
    order: number;
}

export interface EventForm {
    _id: string;
    society_id: string;
    title: string;
    description?: string;
    fields: EventFormField[];
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface EventContentSection {
    title: string;
    content: string;
}

export interface EventData {
    _id: string;
    society_id: string | { _id: string; name: string; description: string; logo?: string };
    title: string;
    description: string;
    event_date: string;
    event_end_date?: string;
    venue: string;
    event_type: "WORKSHOP" | "SEMINAR" | "COMPETITION" | "MEETUP" | "CULTURAL" | "SPORTS" | "OTHER";
    banner?: string;
    max_participants?: number;
    price: number;
    registration_start_date?: string;
    registration_deadline?: string;
    registration_form?: EventForm | string;
    content_sections: EventContentSection[];
    tags: string[];
    is_public: boolean;
    status: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED";
    payment_info?: {
        acc_num: string;
        acc_holder_name: string;
        acc_destination: string;
    };
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface EventFormResponse {
    field_label: string;
    field_type: string;
    value: string | number | boolean;
}

export interface EventRegistration {
    _id: string;
    event_id: string;
    user_id: { _id: string; name: string; email: string; phone?: string } | string;
    form_id: { _id: string; title: string; fields?: EventFormField[] } | string;
    responses: EventFormResponse[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejection_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at: string;
}

// -- API Slice --

export interface AllPublicEventsResponse {
    events: EventData[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const eventApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // ─── Event Form CRUD ─────────────────────────────────────────
        getEventFormsBySociety: builder.query<EventForm[], string>({
            query: (societyId) => `/society/${societyId}/event-forms`,
            transformResponse: (response: { data: EventForm[] }) => response.data,
            providesTags: (result, _error, societyId) =>
                result
                    ? [
                        ...result.map((f) => ({ type: "EventForm" as const, id: f._id })),
                        { type: "EventForm" as const, id: `SOCIETY_${societyId}` },
                    ]
                    : [{ type: "EventForm" as const, id: `SOCIETY_${societyId}` }],
        }),

        getEventFormById: builder.query<EventForm, { societyId: string; formId: string }>({
            query: ({ societyId, formId }) => `/society/${societyId}/event-forms/${formId}`,
            transformResponse: (response: { data: EventForm }) => response.data,
            providesTags: (_result, _error, { formId }) => [{ type: "EventForm" as const, id: formId }],
        }),

        createEventForm: builder.mutation<EventForm, { societyId: string; body: Partial<EventForm> }>({
            query: ({ societyId, body }) => ({
                url: `/society/${societyId}/event-forms`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId }) => [
                { type: "EventForm", id: `SOCIETY_${societyId}` },
            ],
        }),

        updateEventForm: builder.mutation<EventForm, { societyId: string; formId: string; body: Partial<EventForm> }>({
            query: ({ societyId, formId, body }) => ({
                url: `/society/${societyId}/event-forms/${formId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId, formId }) => [
                { type: "EventForm", id: formId },
                { type: "EventForm", id: `SOCIETY_${societyId}` },
            ],
        }),

        deleteEventForm: builder.mutation<void, { societyId: string; formId: string }>({
            query: ({ societyId, formId }) => ({
                url: `/society/${societyId}/event-forms/${formId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { societyId, formId }) => [
                { type: "EventForm", id: formId },
                { type: "EventForm", id: `SOCIETY_${societyId}` },
            ],
        }),

        // ─── Event CRUD ─────────────────────────────────────────────
        getAllPublicEvents: builder.query<AllPublicEventsResponse, { search?: string; type?: string; society?: string; page?: number; limit?: number }>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.type && params.type !== 'All') searchParams.append('type', params.type);
                if (params.society) searchParams.append('society', params.society);
                if (params.page) searchParams.append('page', String(params.page));
                if (params.limit) searchParams.append('limit', String(params.limit));
                const qs = searchParams.toString();
                return `/events${qs ? `?${qs}` : ''}`;
            },
            transformResponse: (response: { data: AllPublicEventsResponse }) => response.data,
            providesTags: (result) =>
                result?.events
                    ? [
                        ...result.events.map((e) => ({ type: "Event" as const, id: e._id })),
                        { type: "Event" as const, id: "ALL_PUBLIC" },
                    ]
                    : [{ type: "Event" as const, id: "ALL_PUBLIC" }],
        }),

        getEventsBySociety: builder.query<EventData[], string>({
            query: (societyId) => `/society/${societyId}/events`,
            transformResponse: (response: { data: EventData[] }) => response.data,
            providesTags: (result, _error, societyId) =>
                result
                    ? [
                        ...result.map((e) => ({ type: "Event" as const, id: e._id })),
                        { type: "Event" as const, id: `SOCIETY_${societyId}` },
                    ]
                    : [{ type: "Event" as const, id: `SOCIETY_${societyId}` }],
        }),

        getPublicEventsBySociety: builder.query<EventData[], string>({
            query: (societyId) => `/society/${societyId}/public-events`,
            transformResponse: (response: { data: EventData[] }) => response.data,
            providesTags: (result) =>
                result
                    ? result.map((e) => ({ type: "Event" as const, id: e._id }))
                    : [],
        }),

        getEventById: builder.query<EventData, string>({
            query: (eventId) => `/events/${eventId}`,
            transformResponse: (response: { data: EventData }) => response.data,
            providesTags: (_result, _error, eventId) => [{ type: "Event" as const, id: eventId }],
        }),

        createEvent: builder.mutation<EventData, { societyId: string; body: FormData }>({
            query: ({ societyId, body }) => ({
                url: `/society/${societyId}/events`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId }) => [
                { type: "Event", id: `SOCIETY_${societyId}` },
            ],
        }),

        updateEvent: builder.mutation<EventData, { societyId: string; eventId: string; body: FormData }>({
            query: ({ societyId, eventId, body }) => ({
                url: `/society/${societyId}/events/${eventId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { societyId, eventId }) => [
                { type: "Event", id: eventId },
                { type: "Event", id: `SOCIETY_${societyId}` },
            ],
        }),

        deleteEvent: builder.mutation<void, { societyId: string; eventId: string }>({
            query: ({ societyId, eventId }) => ({
                url: `/society/${societyId}/events/${eventId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { societyId, eventId }) => [
                { type: "Event", id: eventId },
                { type: "Event", id: `SOCIETY_${societyId}` },
            ],
        }),

        // ─── Event Registration ─────────────────────────────────────
        submitEventRegistration: builder.mutation<EventRegistration, { eventId: string; body: FormData }>({
            query: ({ eventId, body }) => ({
                url: `/events/${eventId}/register`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { eventId }) => [
                { type: "EventRegistration" as const, id: `EVENT_${eventId}` },
            ],
        }),

        getEventRegistrations: builder.query<EventRegistration[], { societyId: string; eventId: string; status?: string }>({
            query: ({ societyId, eventId, status }) => {
                let url = `/society/${societyId}/events/${eventId}/registrations`;
                if (status) url += `?status=${status}`;
                return url;
            },
            transformResponse: (response: { data: EventRegistration[] }) => response.data,
            providesTags: (result, _error, { eventId }) =>
                result
                    ? [
                        ...result.map((r) => ({ type: "EventRegistration" as const, id: r._id })),
                        { type: "EventRegistration" as const, id: `EVENT_${eventId}` },
                    ]
                    : [{ type: "EventRegistration" as const, id: `EVENT_${eventId}` }],
        }),

        getMyRegistration: builder.query<EventRegistration | null, string>({
            query: (eventId) => `/events/${eventId}/my-registration`,
            transformResponse: (response: { data: EventRegistration | null }) => response.data,
            providesTags: (_result, _error, eventId) => [{ type: "EventRegistration" as const, id: `MY_REG_${eventId}` }],
        }),

        updateRegistrationStatus: builder.mutation<
            EventRegistration,
            { societyId: string; eventId: string; registrationId: string; body: { status: string; rejection_reason?: string } }
        >({
            query: ({ societyId, eventId, registrationId, body }) => ({
                url: `/society/${societyId}/events/${eventId}/registrations/${registrationId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { eventId, registrationId }) => [
                { type: "EventRegistration", id: registrationId },
                { type: "EventRegistration", id: `EVENT_${eventId}` },
            ],
        }),

        sendMailToParticipants: builder.mutation<
            { total: number; successCount: number; failCount: number },
            { societyId: string; eventId: string; body: { subject: string; message: string } }
        >({
            query: ({ societyId, eventId, body }) => ({
                url: `/society/${societyId}/events/${eventId}/send-mail`,
                method: "POST",
                body,
            }),
            transformResponse: (response: { data: { total: number; successCount: number; failCount: number } }) => response.data,
        }),
    }),
});

export const {
    // Event Form
    useGetEventFormsBySocietyQuery,
    useGetEventFormByIdQuery,
    useCreateEventFormMutation,
    useUpdateEventFormMutation,
    useDeleteEventFormMutation,
    // Events
    useGetAllPublicEventsQuery,
    useGetEventsBySocietyQuery,
    useGetPublicEventsBySocietyQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    // Registrations
    useSubmitEventRegistrationMutation,
    useGetEventRegistrationsQuery,
    useGetMyRegistrationQuery,
    useUpdateRegistrationStatusMutation,
    // Mail
    useSendMailToParticipantsMutation,
} = eventApiSlice;
