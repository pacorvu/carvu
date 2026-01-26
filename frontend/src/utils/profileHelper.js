const countFilledFields = (obj, keys) => {
  if (!obj || typeof obj !== "object") return 0
  return keys.reduce((count, key) => {
    const val = obj[key]
    if (val === undefined || val === null) return count
    if (typeof val === "string" && val.trim() === "") return count
    if (Array.isArray(val) && val.length === 0) return count
    return count + 1
  }, 0)
}

export const calculateSectionCompletion = (sectionId, data) => {
  if (!data) return 0

  switch (sectionId) {
    case "personal": {
      // Base mandatory fields (weightage 1 each)
      // Added "section" as mandatory from 1st year per requirements
      const keys = ["fullName", "dateOfBirth", "gender", "programId", "section"]

      // Check for year-specific requirements
      // "if the student is 3rd year the major min specialization is must to be filled"
      const currentYear = data.personal?.currentYear ? parseInt(data.personal.currentYear, 10) : 0
      
      if (currentYear >= 3) {
        keys.push("majorId", "minorId", "specializationId")
      }

      const filled = countFilledFields(data.personal || {}, keys)
      return Math.round((filled / keys.length) * 100)
    }
    case "communication": {
      const contactData = data.communication || data.contact || {}
      const keys = ["phoneNumber", "personalEmail", "collegeEmail"]
      const filledFields = countFilledFields(contactData, keys)
      
      // Check links (minimum 2 required for full completion)
      const linksRaw = contactData.links
      let validLinksCount = 0
      
      if (Array.isArray(linksRaw)) {
          validLinksCount = linksRaw.filter(l => l && l.url && l.url.trim() !== "").length
      } else if (linksRaw && typeof linksRaw === 'object') {
          // If it's an object { linkedin: "url", ... }
          validLinksCount = Object.values(linksRaw).filter(url => typeof url === 'string' && url.trim() !== "").length
      }
      
      const linksScore = Math.min(validLinksCount, 2)
      
      // Total score = filled fields (3) + links score (2) = 5
      const totalScore = filledFields + linksScore
      const maxScore = keys.length + 2
      
      return Math.round((totalScore / maxScore) * 100)
    }
    case "career": {
      const keys = [
        "briefSummary", 
        "careerObjective", 
        "futureGoals", 
        "keyExpertise", 
        "hobbiesInterests", 
        "dreamPackage", 
        "dreamCompanies"
      ]
      const careerData = data.career || {}
      
      // Count filled fields (at least 1 word/non-empty)
      const filledCount = countFilledFields(careerData, keys)
      const allFieldsFilled = filledCount === keys.length
      
      // Count total words
      let totalWords = 0
      const countWords = (val) => {
        if (val === null || val === undefined) return 0
        const s = String(val).trim()
        if (!s) return 0
        return s.split(/\s+/).length
      }
      
      keys.forEach(k => {
        totalWords += countWords(careerData[k])
      })
      
      // If all requirements met (all fields filled AND >= 25 words total)
      if (allFieldsFilled && totalWords >= 25) return 100
      
      // Partial calculation
      // 50% for filling fields
      const fieldScore = (filledCount / keys.length) * 50
      // 50% for word count (capped at 25)
      const wordScore = (Math.min(totalWords, 25) / 25) * 50
      
      return Math.round(fieldScore + wordScore)
    }
    case "education": {
      const list = Array.isArray(data.education) ? data.education : []
      if (!list.length) return 0
      const keySet = [
        "educationLevel",
        "instituteName",
        "yearOfPassing",
        "resultType",
        "result",
        "boardOrUniversity",
        "city"
      ]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "academics": {
      const list = Array.isArray(data.academics) ? data.academics : Array.isArray(data) ? data : []
      
      const rawCurrent =
        (data.personal && data.personal.currentSemester != null ? data.personal.currentSemester : null) ??
        (data.currentSemester != null ? data.currentSemester : null)

      const currentSemester = rawCurrent != null && rawCurrent !== "" ? parseInt(rawCurrent, 10) : NaN

      // Helper to calculate score for a single semester item based on 80/20 rule
      const calculateItemScore = (item) => {
        if (!item) return 0
        
        // Check Image (80%)
        let hasImage = false
        // Check possible keys for the file
        const link = item.resultUploadLink || item.provisionalResultUploadLink || item.proofFile
        if (Array.isArray(link) && link.length > 0) hasImage = true
        else if (typeof link === "string" && link.trim() !== "") hasImage = true
        
        // Check Other Fields (20%)
        // academicYear, semester, sgpa, closedBacklogs, liveBacklogs
        const otherFields = ["academicYear", "semester", "sgpa", "closedBacklogs", "liveBacklogs"]
        const filledOther = countFilledFields(item, otherFields)
        const maxOther = otherFields.length // 5
        
        const imageScore = hasImage ? 80 : 0
        const otherScore = maxOther > 0 ? (filledOther / maxOther) * 20 : 0
        
        return imageScore + otherScore
      }

      // If we know the current semester, enforce the specific logic
      if (!Number.isNaN(currentSemester) && currentSemester > 1) {
        let totalPrev = currentSemester - 1
        
        // Buffer Logic: 1 month buffer
        // Jan (0) and July (6) only
        const today = new Date()
        const month = today.getMonth() // 0 = Jan, 6 = July
        
        const isBufferPeriod = month === 0 || month === 6

        let totalScore = 0
        let semCount = 0

        for (let sem = 1; sem <= totalPrev; sem += 1) {
          semCount++
          
          const item = list.find((x) => {
            const v = x && x.semester != null ? x.semester : null
            if (v === null || v === undefined || v === "") return false
            const n = parseInt(v, 10)
            if (Number.isNaN(n)) return false
            return n === sem
          })
          
          let score = calculateItemScore(item)
          
          // Buffer Exception for Previous Semester
          if (sem === totalPrev && isBufferPeriod) {
              // "if previous sem isnt uploaded in the buffer ... keep it 10%"
              // Check if image is uploaded
              const link = item?.resultUploadLink || item?.provisionalResultUploadLink || item?.proofFile
              const hasImage = (Array.isArray(link) && link.length > 0) || (typeof link === "string" && link.trim() !== "")
              
              if (!hasImage) {
                  score = 10
              }
          }
          
          totalScore += score
        }

        return semCount > 0 ? Math.round(totalScore / semCount) : 100
      }

      // Fallback if currentSemester is not available
      if (!list.length) return 0
      
      let totalScore = 0
      list.forEach((item) => {
        totalScore += calculateItemScore(item)
      })
      
      return Math.round(totalScore / list.length)
    }
    case "projects": {
      const list = Array.isArray(data.projects) ? data.projects : []
      if (!list.length) return 0
      const keySet = ["title", "description", "projectLink", "skills"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "internships": {
      const list = Array.isArray(data.internships) ? data.internships : []
      if (!list.length) return 0
      const keySet = ["jobRole", "organization", "startDate", "endDate", "skills"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "trainings": {
      const list = Array.isArray(data.trainings) ? data.trainings : []
      if (!list.length) return 0
      const keySet = ["title", "organization", "trainingType", "startDate", "endDate"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "certifications": {
      const list = Array.isArray(data.certifications) ? data.certifications : []
      if (!list.length) return 0
      const keySet = ["title", "issuingOrganization", "issueDate"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "publications": {
      const list = Array.isArray(data.publications) ? data.publications : []
      if (!list.length) return 0
      const keySet = ["title", "publicationDate", "journalOrConference"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "extraCurricular": {
      const list = Array.isArray(data.extraCurricular) ? data.extraCurricular : []
      if (!list.length) return 0
      const keySet = ["activityName", "activityType", "organization", "startDate", "endDate"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "other": {
      const list = Array.isArray(data.otherExperiences) ? data.otherExperiences : []
      if (!list.length) return 0
      const keySet = ["title", "organization", "description"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    case "parents": {
      const list = Array.isArray(data.parents) ? data.parents : []
      if (!list.length) return 0
      const keySet = ["parentType", "name", "phoneNumber", "occupation"]
      const perItemMax = keySet.length
      let filled = 0
      list.forEach((item) => {
        filled += countFilledFields(item || {}, keySet)
      })
      const max = list.length * perItemMax
      return max > 0 ? Math.round((filled / max) * 100) : 0
    }
    default:
      return 0
  }
}

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
  const comm = data.communication || data.contact || {}
  const hasPhoneEmail = comm.phoneNumber && comm.personalEmail
  
  const linksRaw = comm.links
  let validLinksCount = 0
  if (Array.isArray(linksRaw)) {
      validLinksCount = linksRaw.filter(l => l && l.url && l.url.trim() !== "").length
  } else if (linksRaw && typeof linksRaw === 'object') {
      validLinksCount = Object.values(linksRaw).filter(url => typeof url === 'string' && url.trim() !== "").length
  }

  if (hasPhoneEmail) score += 6
  if (validLinksCount >= 2) score += 4
  else if (validLinksCount === 1) score += 2

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
