import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    experienceLevel: {
        type: String,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    candidates: [{
        type: String,
        required: false, 
    }],
});

const Job = mongoose.model('Job', jobSchema);
export default Job;

