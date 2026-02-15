import { IFormField } from '../models/JoinForm';

interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validates submitted responses against the form's field definitions.
 * Returns an array of errors (empty = valid).
 */
export const validateResponses = (
    fields: IFormField[],
    responses: { field_label: string; field_type: string; value: any }[]
): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (const field of fields) {
        const response = responses.find(r => r.field_label === field.label);

        // ── Required check ────────────────────────────────────────────
        if (field.is_required && (!response || response.value === '' || response.value === null || response.value === undefined)) {
            errors.push({ field: field.label, message: `${field.label} is required` });
            continue;
        }

        if (!response) continue;  // optional field not provided — OK

        const val = response.value;

        // ── Type checks ───────────────────────────────────────────────
        switch (field.field_type) {
            case 'EMAIL':
                if (typeof val !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    errors.push({ field: field.label, message: 'Invalid email format' });
                }
                break;

            case 'NUMBER':
                if (typeof val !== 'number' && isNaN(Number(val))) {
                    errors.push({ field: field.label, message: 'Must be a number' });
                }
                break;

            case 'DROPDOWN':
                if (field.options && !field.options.includes(val as string)) {
                    errors.push({ field: field.label, message: `Must be one of: ${field.options.join(', ')}` });
                }
                break;

            case 'CHECKBOX':
                if (typeof val !== 'boolean') {
                    errors.push({ field: field.label, message: 'Must be true or false' });
                }
                break;

            case 'TEXT':
                if (typeof val !== 'string') {
                    errors.push({ field: field.label, message: 'Must be text' });
                }
                break;
        }
    }

    // ── Reject extra fields not in the form ───────────────────────────
    const validLabels = fields.map(f => f.label);
    for (const response of responses) {
        if (!validLabels.includes(response.field_label)) {
            errors.push({ field: response.field_label, message: 'Unknown field' });
        }
    }

    return errors;
};
