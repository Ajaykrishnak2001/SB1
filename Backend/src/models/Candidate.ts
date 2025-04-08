import mongoose, { Schema, Document } from "mongoose";

// Define the CompanyDetails sub-schema
const CompanyDetailsSchema = new Schema({
  company: { type: String, required: true },
  is_po: { type: Boolean, required: true },
  interview_dates: [
    {
      date: { type: String, required: true }, 
      interviews: [
        [
          {
            actual_round: { type: String, required: true },
            feedback: { type: String, required: true },
          }
        ]
      ]
    }
  ]
});

// Define the Candidate schema
interface CandidateDocument extends Document {
  candidateName: string;
  expertName: string;
  is_in_po: boolean;
  round_totals: Record<string, number>;
  cumulative_total: number;
  details: typeof CompanyDetailsSchema[];
}

// Mongoose Schema
const CandidateSchema = new Schema<CandidateDocument>({
  candidateName: { type: String, required: true },
  expertName: { type: String, required: true },
  is_in_po: { type: Boolean, required: true },
  round_totals: { type: Schema.Types.Mixed, required: true },
  cumulative_total: { type: Number, required: true },
  details: [CompanyDetailsSchema] 
});

// Export the Mongoose model
export default mongoose.model<CandidateDocument>("Candidate", CandidateSchema);
