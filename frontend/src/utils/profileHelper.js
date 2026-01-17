export const calculateProfileCompletion = (data) => {
  let score = 0
  const weights = {
    personal: 15,
    communication: 10,
    education: 20,
    career: 10,
    projects: 15,
    experience: 15,
    certifications: 10,
    resume: 5 // Assuming resume upload is part of career or separate
  }

  // Personal (15%)
  if (data.personal?.fullName && data.personal?.dateOfBirth && data.personal?.gender) score += weights.personal

  // Communication (10%)
  if (data.communication?.phoneNumber && data.communication?.personalEmail) score += weights.communication

  // Education (20%) - At least one entry
  if (data.education?.length > 0) score += weights.education

  // Career (10%)
  if (data.career?.careerObjective || data.career?.briefSummary) score += weights.career

  // Projects (15%)
  if (data.projects?.length > 0) score += weights.projects

  // Experience (15%) - Internships or Trainings
  if (data.internships?.length > 0 || data.trainings?.length > 0) score += weights.experience

  // Certifications (10%)
  if (data.certifications?.length > 0) score += weights.certifications
  
  // Resume (5%) - Placeholder logic
  // if (data.resume) score += weights.resume
  score += 5 // Giving free points for now

  return Math.min(score, 100)
}
