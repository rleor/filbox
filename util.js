export const validateUsername = (string) => {
    // TODO: validate username
    return true;
};

export const validatePassword = (string) => {
    //TODO: validate password
    return true;
};

export const isStringEmpty = (string) => {
    // NOTE(jim): This is not empty when its coerced into a string.
    if (string === 0) {
        return false;
    }

    if (!string) {
        return true;
    }

    if (typeof string === "object") {
        return true;
    }

    if (string.length === 0) {
        return true;
    }

    string = string.toString();

    return !string.trim();
};