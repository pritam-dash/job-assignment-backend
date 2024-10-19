import Company from '../models/Company.js';

import jwt from 'jsonwebtoken';
const { sign } = jwt;

import { sendMail } from '../config/nodemailer.js';
import twilioClient from '../config/twilio.js';
import { setOTP, getOTP, clearOTP } from '../utils/otpStore.js';

const sendOTP = async (email, phone) => {
    const otpMail = Math.floor(100000 + Math.random() * 900000).toString();
    const otpPhone = Math.floor(100000 + Math.random() * 900000).toString();

    setOTP(email, otpMail);
    setOTP(phone, otpPhone);

    // Send OTP via email
    await sendMail({
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: 'Your OTP',
        text: `Your OTP is ${otpMail}`,
    });
    // Send OTP via SMS
    await twilioClient.messages.create({
        body: `Your OTP is ${otpPhone}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    });
    return {otpMail, otpPhone};
};

export async function register(req, res) {
    const { name, phone, companyName, email, employeeSize } = req.body;
    try {
        const existingCompany = await Company.findOne({ $or: [{ email }, { phone }] });

        if (existingCompany) {
            const emailInUse = existingCompany.email === email;
            const phoneInUse = existingCompany.phone === phone;

            if (emailInUse && phoneInUse) {
                return res.status(400).json({ error: 'Email and phone number already in use' });
            } else if (emailInUse) {
                return res.status(400).json({ error: 'Email already in use' });
            } else if (phoneInUse) {
                return res.status(400).json({ error: 'Phone number already in use' });
            }
        }
        
        await Company.create({ name, phone, companyName, email, employeeSize });
        await sendOTP(email, phone);
        return res.status(201).json({ message: 'Account created! Activate your account by providing the OTP sent to email and phone.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
}

export async function verifyEmailOTP(req, res) {
    const { email, inputOtp } = req.body;
    try {
        const otpFromEmail = getOTP(email);
        if (inputOtp === otpFromEmail) {
            await Company.findOneAndUpdate({ email }, { isEmailVerified: true });
            clearOTP(email);
            return res.status(200).json({ message: 'Email verified successfully' });
        }

        return res.status(400).json({ error: 'Invalid OTP' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Email verification failed' });
    }
}

export async function verifyPhoneOTP(req, res) {
    const { phone, inputOtp } = req.body;
    try {
        const otpFromPhone = getOTP(phone);
        if (inputOtp === otpFromPhone) {
            await Company.findOneAndUpdate({ phone }, { isPhoneVerified: true });
            clearOTP(phone);
            return res.status(200).json({ message: 'Phone verified successfully' });
        }
        return res.status(400).json({ error: 'Invalid OTP' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Phone verification failed' });
    }
}

export async function login(req, res) {
    const { email } = req.body;
    try {
        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        
        const accessToken = sign({ id: company._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

        const refreshToken = sign({ id: company._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

        res.header('Authorization', `Bearer ${accessToken}`);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            //secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: 'strict',
        });

        return res.status(200).json({ message: "Logged in successfully" });
    } catch (error) {
        return res.status(500).json({ error: 'Login failed' });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            //secure: true,
            sameSite: 'strict',
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Logout failed' });
    }
}

