'use client';

import React, { useState } from 'react';
import { FaPlus, FaTrash, FaGripVertical, FaArrowUp, FaArrowDown, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import {
    useGetEventFormsBySocietyQuery,
    useCreateEventFormMutation,
    useUpdateEventFormMutation,
    useDeleteEventFormMutation,
    EventForm,
    EventFormField
} from '@/lib/features/events/eventApiSlice';

interface EventFormBuilderProps {
    societyId: string;
}

const FIELD_TYPES: { value: EventFormField['field_type']; label: string }[] = [
    { value: 'TEXT', label: 'Short Text' },
    { value: 'TEXTAREA', label: 'Long Text' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'PHONE', label: 'Phone' },
    { value: 'DATE', label: 'Date' },
    { value: 'DROPDOWN', label: 'Dropdown' },
    { value: 'CHECKBOX', label: 'Checkbox' },
    { value: 'FILE', label: 'File Upload' },
];

const EventFormBuilder: React.FC<EventFormBuilderProps> = ({ societyId }) => {
    const { data: forms, isLoading } = useGetEventFormsBySocietyQuery(societyId);
    const [createForm, { isLoading: isCreating }] = useCreateEventFormMutation();
    const [updateForm, { isLoading: isUpdating }] = useUpdateEventFormMutation();
    const [deleteForm] = useDeleteEventFormMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [editingFormId, setEditingFormId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [fields, setFields] = useState<EventFormField[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFields([]);
        setEditingFormId(null);
        setIsEditing(false);
        setError('');
    };

    const startCreating = () => {
        resetForm();
        setIsEditing(true);
    };

    const startEditing = (form: EventForm) => {
        setFormTitle(form.title);
        setFormDescription(form.description || '');
        setFields(form.fields.map(f => ({ ...f })));
        setEditingFormId(form._id);
        setIsEditing(true);
        setError('');
    };

    const addField = () => {
        setFields([
            ...fields,
            {
                label: '',
                field_type: 'TEXT',
                is_required: false,
                options: [],
                placeholder: '',
                order: fields.length,
            },
        ]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
    };

    const updateField = (index: number, updates: Partial<EventFormField>) => {
        setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) return;
        const newFields = [...fields];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
        setFields(newFields.map((f, i) => ({ ...f, order: i })));
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        if (!formTitle.trim()) {
            setError('Form title is required');
            return;
        }
        if (fields.length === 0) {
            setError('At least one field is required');
            return;
        }
        const emptyLabel = fields.find(f => !f.label.trim());
        if (emptyLabel) {
            setError('All fields must have a label');
            return;
        }

        try {
            const body = {
                title: formTitle,
                description: formDescription,
                fields: fields.map(({ _id, ...rest }) => rest),
            };

            if (editingFormId) {
                await updateForm({ societyId, formId: editingFormId, body }).unwrap();
                setSuccess('Form updated successfully!');
            } else {
                await createForm({ societyId, body }).unwrap();
                setSuccess('Form created successfully!');
            }
            resetForm();
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to save form');
        }
    };

    const handleDelete = async (formId: string) => {
        if (!window.confirm('Are you sure you want to deactivate this form?')) return;
        try {
            await deleteForm({ societyId, formId }).unwrap();
            setSuccess('Form deactivated successfully!');
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to deactivate form');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-orange-500 animate-pulse text-lg">Loading event forms...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Event Form Builder</h2>
                    <p className="text-slate-500 mt-1">Create and manage dynamic registration forms for events</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={startCreating}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg shadow-lg shadow-orange-600/20 transition-all"
                    >
                        <FaPlus /> New Form
                    </button>
                )}
            </div>

            {(error || success) && (
                <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {error || success}
                </div>
            )}

            {isEditing && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">
                            {editingFormId ? 'Edit Form' : 'Create New Form'}
                        </h3>
                        <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Form Title & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Form Title *</label>
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                                placeholder="e.g., Hackathon Registration"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                            <input
                                type="text"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                                placeholder="Brief description of this form"
                            />
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-semibold text-slate-700">Form Fields</h4>
                            <button
                                onClick={addField}
                                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                            >
                                <FaPlus className="text-xs" /> Add Field
                            </button>
                        </div>

                        {fields.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 mb-3">No fields added yet</p>
                                <button
                                    onClick={addField}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Add Your First Field
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div
                                        key={index}
                                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FaGripVertical className="text-slate-300" />
                                            <span className="text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                                                #{index + 1}
                                            </span>
                                            <div className="flex-1" />
                                            <button
                                                onClick={() => moveField(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1.5 text-slate-400 hover:text-orange-600 disabled:opacity-30"
                                            >
                                                <FaArrowUp className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => moveField(index, 'down')}
                                                disabled={index === fields.length - 1}
                                                className="p-1.5 text-slate-400 hover:text-orange-600 disabled:opacity-30"
                                            >
                                                <FaArrowDown className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => removeField(index)}
                                                className="p-1.5 text-slate-400 hover:text-red-600"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Label *</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                                                    placeholder="Field label"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                                <select
                                                    value={field.field_type}
                                                    onChange={(e) => updateField(index, { field_type: e.target.value as EventFormField['field_type'] })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 bg-white"
                                                >
                                                    {FIELD_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Placeholder</label>
                                                <input
                                                    type="text"
                                                    value={field.placeholder || ''}
                                                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                                                    placeholder="Placeholder text"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.is_required}
                                                    onChange={(e) => updateField(index, { is_required: e.target.checked })}
                                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                                />
                                                Required
                                            </label>
                                        </div>

                                        {field.field_type === 'DROPDOWN' && (
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                                    Options (comma-separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={(field.options || []).join(', ')}
                                                    onChange={(e) => updateField(index, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                                                    placeholder="Option 1, Option 2, Option 3"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={isCreating || isUpdating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-500 disabled:opacity-50 transition-colors font-medium shadow-lg shadow-orange-600/20"
                        >
                            <FaSave /> {isCreating || isUpdating ? 'Saving...' : 'Save Form'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Forms List */}
            {!isEditing && (
                <div className="space-y-4">
                    {forms && forms.length > 0 ? (
                        forms.filter(f => f.is_active).map((form) => (
                            <div key={form._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{form.title}</h3>
                                        {form.description && (
                                            <p className="text-slate-500 text-sm mt-1">{form.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                                                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                Created {new Date(form.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEditing(form)}
                                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Edit form"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(form._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete form"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* Field preview */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {form.fields.map((field, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg"
                                        >
                                            {field.label} ({field.field_type.toLowerCase()})
                                            {field.is_required && <span className="text-red-400 ml-0.5">*</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                            <div className="text-5xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Event Forms Yet</h3>
                            <p className="text-slate-400 mb-4">Create your first dynamic registration form</p>
                            <button
                                onClick={startCreating}
                                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-500 transition-colors font-medium shadow-lg shadow-orange-600/20"
                            >
                                Create Form
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventFormBuilder;
