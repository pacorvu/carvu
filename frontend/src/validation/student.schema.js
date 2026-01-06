import { z } from "zod";

// 🔹 Section 1: Personal Details
export const PersonalDetailsSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  gender: z.enum(["Male", "Female", "Other"], { errorMap: () => ({ message: "Gender is required" }) }),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  profileImage: z.string().optional(),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  schoolName: z.string().min(1, "School Name is required"),
  yearOfJoining: z.number().min(2000, "Invalid Year of Joining"),
  programId: z.string().min(1, "Program ID is required"),
  specializationId: z.string().optional(),
  majorId: z.string().optional(),
  minorId: z.string().optional(),
});

// 🔹 Section 2: Communication Details
export const CommunicationDetailsSchema = z.object({
  collegeEmail: z.string().email("Invalid College Email"),
  personalEmail: z.string().email("Invalid Personal Email"),
  phoneCountryCode: z.string().min(1, "Country Code is required"),
  phoneNumber: z.string().min(10, "Phone Number must be at least 10 digits"),
  links: z.object({
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
    portfolio: z.string().url("Invalid Portfolio URL").optional().or(z.literal("")),
    other: z.string().url("Invalid URL").optional().or(z.literal("")),
  }),
});

// 🔹 Section 3: Career Summary
export const CareerSummarySchema = z.object({
  briefSummary: z.string().min(10, "Summary must be at least 10 characters"),
  keyExpertise: z.array(z.string()).min(1, "Add at least one expertise"),
  hobbiesInterests: z.array(z.string()).min(1, "Add at least one hobby"),
  careerObjective: z.string().min(10, "Objective must be at least 10 characters"),
  dreamCompany: z.string().optional(),
  dreamPackage: z.number().optional(),
});

// 🔹 Section 4: Education History
export const EducationHistorySchema = z.object({
  id: z.string().optional(),
  educationLevel: z.enum(["10th", "12th", "Diploma", "Undergraduate", "Postgraduate", "PhD"]),
  instituteName: z.string().min(1, "Institute Name is required"),
  board: z.string().min(1, "Board is required"),
  city: z.string().min(1, "City is required"),
  yearOfPassing: z.number().min(2000, "Invalid Year"),
  result: z.number().min(0, "Result cannot be negative"),
  resultType: z.enum(["Percentage", "CGPA"]),
  subjects: z.array(z.string()).min(1, "Add at least one subject"),
  gapType: z.string().optional(),
  gapDurationMonths: z.number().optional(),
  gapReason: z.string().optional(),
});

// 🔹 Section 5: Semester Academics
export const SemesterAcademicSchema = z.object({
  id: z.string().optional(),
  academicYear: z.string().min(1, "Academic Year is required"),
  semester: z.number().min(1, "Semester is required"),
  sgpa: z.number().min(0).max(10, "Invalid SGPA"),
  liveBacklogs: z.number().min(0),
  closedBacklogs: z.number().min(0),
  resultUploadLink: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// 🔹 Section 6: Projects
export const StudentProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  projectLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  mentorName: z.string().optional(),
});

// 🔹 Section 7: Internships
export const StudentInternshipSchema = z.object({
  id: z.string().optional(),
  jobRole: z.string().min(1, "Job Role is required"),
  organization: z.string().min(1, "Organization is required"),
  durationMonths: z.number().min(1, "Duration must be at least 1 month"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  location: z.string().min(1, "Location is required"),
  stipend: z.string().optional(),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

// 🔹 Section 8: Trainings
export const StudentTrainingSchema = z.object({
  id: z.string().optional(),
  trainingName: z.string().min(1, "Training Name is required"),
  organization: z.string().min(1, "Organization is required"),
  duration: z.string().min(1, "Duration is required"),
  completionDate: z.string().min(1, "Completion Date is required"),
  description: z.string().optional(),
});

// 🔹 Section 9: Certifications
export const StudentCertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification Name is required"),
  issuingOrganization: z.string().min(1, "Issuing Organization is required"),
  issueDate: z.string().min(1, "Issue Date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// 🔹 Section 10: Publications (Optional)
export const StudentPublicationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Publication Title is required"),
  journalConference: z.string().min(1, "Journal/Conference Name is required"),
  publicationDate: z.string().min(1, "Publication Date is required"),
  description: z.string().optional(),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// 🔹 Section 11: Extra-Curricular Activities
export const ExtraCurricularActivitySchema = z.object({
  id: z.string().optional(),
  activityName: z.string().min(1, "Activity Name is required"),
  role: z.string().optional(),
  organization: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
});

// 🔹 Section 12: Other Experiences
export const OtherExperienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Experience Title is required"),
  organization: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// 🔹 Section 13: Parent / Guardian Details
export const ParentDetailSchema = z.object({
  id: z.string().optional(),
  parentType: z.enum(["Father", "Mother", "Guardian"]),
  name: z.string().min(1, "Name is required"),
  occupation: z.string().min(1, "Occupation is required"),
  organization: z.string().optional(),
  phoneCountryCode: z.string().min(1, "Country Code is required"),
  phoneNumber: z.string().min(10, "Phone Number must be at least 10 digits"),
  email: z.string().email("Invalid Email").optional().or(z.literal("")),
});
