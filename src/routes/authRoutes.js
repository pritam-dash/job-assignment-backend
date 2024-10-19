import { Router } from 'express';
import { register, login, verifyEmailOTP, verifyPhoneOTP, logout } from '../controllers/authController.js';
const router = Router();

router.post('/register', register);
router.post('/verify/email', verifyEmailOTP);
router.post('/verify/phone', verifyPhoneOTP);
router.post('/login', login);
router.post('/logout', logout);

export default router;
