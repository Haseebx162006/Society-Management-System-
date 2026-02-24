"use client";

import React, { useState } from "react";
import {
    useGetJoinFormsBySocietyQuery,
    useCreateJoinFormMutation,
    useUpdateJoinFormMutation,
    useDeleteJoinFormMutation,
    FormField,
    JoinForm,
} from "@/lib/features/join/joinApiSlice";
import {
    Plus,
    Trash2,
    Edit3,
    Copy,
    ChevronDown,
    ChevronUp,
    Link as LinkIcon,
    ToggleLeft,
    ToggleRight,
    X,
    GripVertical,
    Loader2,
    FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface JoinFormManagerProps {
    societyId: string;
}

const FIELD_TYPES = [
    { value: "TEXT", label: "Text" },
    { value: "EMAIL", label: "Email" },
    { value: "NUMBER", label: "Number" },
    { value: "DROPDOWN", label: "Dropdown" },
    { value: "CHECKBOX", label: "Checkbox" },
    { value: "FILE", label: "File Upload" },
] as const;

const EMPTY_FIELD: FormField = {
    label: "",
    field_type: "TEXT",
    is_required: false,
    options: [],
    order: 0,
};

const JoinFormManager: React.FC<JoinFormManagerProps> = ({ societyId }) => {
    const { data: forms = [], isLoading } =
        useGetJoinFormsBySocietyQuery(societyId);
    const [createForm, { isLoading: isCreating }] = useCreateJoinFormMutation();
    const [updateForm, { isLoading: isUpdating }] = useUpdateJoinFormMutation();
    const [deleteForm] = useDeleteJoinFormMutation();

    // Editor state
    const [showEditor, setShowEditor] = useState(false);
    const [editingForm, setEditingForm] = useState<JoinForm | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [fields, setFields] = useState<FormField[]>([]);
    const [expandedField, setExpandedField] = useState<number | null>(null);

    const resetEditor = () => {
        setShowEditor(false);
        setEditingForm(null);
        setTitle("");
        setDescription("");
        setIsPublic(true);
        setFields([]);
        setExpandedField(null);
    };

    const openNewForm = () => {
        resetEditor();
        setShowEditor(true);
    };

    const openEditForm = (form: JoinForm) => {
        setEditingForm(form);
        setTitle(form.title);
        setDescription(form.description || "");
        setIsPublic(form.is_public);
        setFields(
            form.fields.map((f, i) => ({ ...f, order: f.order ?? i }))
        );
        setShowEditor(true);
    };

    const addField = () => {
        setFields((prev) => [
            ...prev,
            { ...EMPTY_FIELD, order: prev.length },
        ]);
        setExpandedField(fields.length);
    };

    const removeField = (index: number) => {
        setFields((prev) => prev.filter((_, i) => i !== index));
        setExpandedField(null);
    };

    const updateField = (index: number, updates: Partial<FormField>) => {
        setFields((prev) =>
            prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
        );
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const newFields = [...fields];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return;
        [newFields[index], newFields[targetIndex]] = [
            newFields[targetIndex],
            newFields[index],
        ];
        setFields(newFields.map((f, i) => ({ ...f, order: i })));
        setExpandedField(targetIndex);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Form title is required");
            return;
        }
        if (fields.length === 0) {
            toast.error("Add at least one field");
            return;
        }
        // Validate all fields have labels
        for (const field of fields) {
            if (!field.label.trim()) {
                toast.error("All fields must have a label");
                return;
            }
            if (
                field.field_type === "DROPDOWN" &&
                (!field.options || field.options.length === 0)
            ) {
                toast.error(`Dropdown field "${field.label}" needs at least one option`);
                return;
            }
        }

        const body = {
            title: title.trim(),
            description: description.trim() || undefined,
            fields: fields.map((f, i) => ({ ...f, order: i })),
            is_public: isPublic,
        };

        try {
            if (editingForm) {
                await updateForm({
                    societyId,
                    formId: editingForm._id,
                    body,
                }).unwrap();
                toast.success("Form updated successfully");
            } else {
                await createForm({ societyId, body }).unwrap();
                toast.success("Form created successfully");
            }
            resetEditor();
        } catch (err: any) {
            const message =
                err?.data?.message || "Failed to save form. Please try again.";
            toast.error(message);
        }
    };

    const handleDelete = async (formId: string) => {
        if (!window.confirm("Deactivate this form? It will no longer accept submissions.")) {
            return;
        }
        try {
            await deleteForm({ societyId, formId }).unwrap();
            toast.success("Form deactivated");
        } catch {
            toast.error("Failed to deactivate form");
        }
    };

    const copyShareLink = (formId: string) => {
        const link = `${window.location.origin}/join/${formId}`;
        navigator.clipboard.writeText(link);
        toast.success("Shareable link copied to clipboard");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
        );
    }

    // Show Editor
    if (showEditor) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-orange-600">
                        {editingForm ? "Edit Form" : "Create Join Form"}
                    </h2>
                    <button
                        onClick={resetEditor}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Meta */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Form Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Membership Registration 2026"
                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description shown to applicants..."
                            rows={2}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Public Form
                            </p>
                            <p className="text-xs text-slate-500">
                                Allow anyone to view (but login required to submit)
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className="text-2xl"
                        >
                            {isPublic ? (
                                <ToggleRight className="w-8 h-8 text-green-600" />
                            ) : (
                                <ToggleLeft className="w-8 h-8 text-slate-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Fields */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-stone-800">
                            Form Fields ({fields.length})
                        </h3>
                        <button
                            onClick={addField}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-orange-600/10 hover:bg-orange-600/20 text-orange-700 rounded-lg border border-orange-200 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Field
                        </button>
                    </div>

                    {fields.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl">
                            <p className="text-slate-500">No fields yet. Click "Add Field" above.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                            >
                                {/* Field Header */}
                                <div
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() =>
                                        setExpandedField(expandedField === index ? null : index)
                                    }
                                >
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 flex-1">
                                        {field.label || `Field ${index + 1}`}
                                    </span>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {field.field_type}
                                    </span>
                                    {field.is_required && (
                                        <span className="text-xs text-red-500">Required</span>
                                    )}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveField(index, "up");
                                            }}
                                            disabled={index === 0}
                                            className="p-1 text-slate-400 hover:text-orange-600 disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveField(index, "down");
                                            }}
                                            disabled={index === fields.length - 1}
                                            className="p-1 text-slate-400 hover:text-orange-600 disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeField(index);
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Field Editor */}
                                {expandedField === index && (
                                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                Label
                                            </label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) =>
                                                    updateField(index, { label: e.target.value })
                                                }
                                                placeholder="e.g. Full Name"
                                                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={field.field_type}
                                                    onChange={(e) =>
                                                        updateField(index, {
                                                            field_type: e.target.value as FormField["field_type"],
                                                        })
                                                    }
                                                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                >
                                                    {FIELD_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.is_required}
                                                        onChange={(e) =>
                                                            updateField(index, {
                                                                is_required: e.target.checked,
                                                            })
                                                        }
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-600">
                                                        Required
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Dropdown options */}
                                        {field.field_type === "DROPDOWN" && (
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                    Options (one per line)
                                                </label>
                                                <textarea
                                                    value={field.options?.join("\n") || ""}
                                                    onChange={(e) =>
                                                        updateField(index, {
                                                            options: e.target.value
                                                                .split("\n")
                                                                .filter((o) => o.trim()),
                                                        })
                                                    }
                                                    rows={3}
                                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isCreating || isUpdating}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 transition-all"
                    >
                        {isCreating || isUpdating ? "Saving..." : editingForm ? "Update Form" : "Create Form"}
                    </button>
                    <button
                        onClick={resetEditor}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-orange-600">Join Forms</h2>
                <button
                    onClick={openNewForm}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg shadow-lg shadow-orange-600/20 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Form
                </button>
            </div>

            {forms.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-2">
                        No join forms created yet
                    </p>
                    <p className="text-slate-500 text-sm mb-6">
                        Create a form so members can register for your society.
                    </p>
                    <button
                        onClick={openNewForm}
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-all"
                    >
                        Create First Form
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {forms.map((form) => (
                        <div
                            key={form._id}
                            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-slate-800 truncate">
                                            {form.title}
                                        </h3>
                                        {form.is_active ? (
                                            <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full border border-red-200">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    {form.description && (
                                        <p className="text-sm text-slate-500 mb-2 line-clamp-1">
                                            {form.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-400">
                                        {form.fields.length} fields | {form.is_public ? "Public" : "Private"} | Created{" "}
                                        {new Date(form.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => copyShareLink(form._id)}
                                        title="Copy shareable link"
                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditForm(form)}
                                        title="Edit form"
                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    {form.is_active && (
                                        <button
                                            onClick={() => handleDelete(form._id)}
                                            title="Deactivate form"
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JoinFormManager;
