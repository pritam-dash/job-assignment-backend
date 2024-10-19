const otpStore = {};

export const setOTP = (key, otp) => {
    otpStore[key] = otp;
};

export const getOTP = (key) => {
    return otpStore[key];
};

export const clearOTP = (key) => {
    delete otpStore[key];
};
