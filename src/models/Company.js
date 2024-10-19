import { Schema, model } from 'mongoose';
const companySchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    employeeSize: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
});
export default model('Company', companySchema);
