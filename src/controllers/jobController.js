import Job from '../models/Job.js';
import { sendMail } from '../config/nodemailer.js';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function postAndNotifyJob(req, res) {
    const { title, description, experienceLevel, endDate, emails } = req.body;

    try {
        const job = await Job.create({ title, description, experienceLevel, endDate, companyId: req.companyId, candidates: emails || [] });

        const templatePath = path.join(__dirname, '../templates/jobNotification.hbs');
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        
        if (emails && emails.length > 0) {
            for (const email of emails) {

                const emailContent = template({
                    candidateName: email.split('@')[0],
                    jobTitle: job.title,
                    jobDescription: job.description,
                    experienceLevel: job.experienceLevel,
                    applicationDeadline: job.endDate.toDateString(),
                });

                await sendMail({
                    from: process.env.NODEMAILER_USER,
                    to: email,
                    subject: 'New Job Posting: ' + job.title,
                    html: emailContent,
                });
            }
        }

        return res.status(201).json({ 
            message: 'Job posted and candidates notified successfully', 
            job 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Job posting and notification failed' });
    }
}
