// Success response formatter
export const successResponse = (res, statusCode, data, message = 'Success') => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

// Error response formatter
export const errorResponse = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

// Validate required fields
export const validateFields = (fields, requiredFields) => {
    const missing = [];

    requiredFields.forEach((field) => {
        if (!fields[field]) {
            missing.push(field);
        }
    });

    return missing.length > 0 ? missing : null;
};
