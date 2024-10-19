import { Router } from 'express';
import { postAndNotifyJob } from '../controllers/jobController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
const router = Router();

router.post('/postAndNotify', authenticate, postAndNotifyJob);

export default router;
