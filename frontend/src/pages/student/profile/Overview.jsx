import { Heading, SimpleGrid, Box, Text, Badge, Button, Flex, HStack } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"
import { calculateProfileCompletion, calculateSectionCompletion } from "../../../utils/profileHelper"

export const ProfileOverview = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const usn = user?.usn
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usn) {
        return
    }
    const fetchProfile = async () => {
        const data = await StudentProfileService.getFullProfile(usn)
        setProfile(data)
        setLoading(false)
    }
    fetchProfile()
  }, [usn])

  if (!usn) {
      return <StudentProfileLayout>Please log in to view your profile.</StudentProfileLayout>
  }

  if (loading || !profile) {
      return <StudentProfileLayout>Loading...</StudentProfileLayout>
  }

  const normalizedProfile = {
    ...profile,
    communication: profile.communication || profile.contact || {},
    parents: profile.parents || profile.family || []
  }

  const isComplete = (data) => {
      if (Array.isArray(data)) return data.length > 0
      if (typeof data === "object" && data !== null) {
          return Object.values(data).some(val => val !== "" && val !== null && (Array.isArray(val) ? val.length > 0 : true))
      }
      return false
  }

  const sections = [
    { id: "personal", label: "Personal Details", data: normalizedProfile.personal },
    { id: "communication", label: "Communication", data: normalizedProfile.communication },
    { id: "career", label: "Career Summary", data: normalizedProfile.career },
    { id: "education", label: "Education History", data: normalizedProfile.education },
    { id: "academics", label: "Semester Academics", data: normalizedProfile.academics },
    { id: "projects", label: "Projects", data: normalizedProfile.projects },
    { id: "internships", label: "Internships", data: normalizedProfile.internships },
    { id: "trainings", label: "Trainings", data: normalizedProfile.trainings },
    { id: "certifications", label: "Certifications", data: normalizedProfile.certifications },
    { id: "publications", label: "Publications", data: normalizedProfile.publications },
    { id: "extraCurricular", label: "Extra-Curricular", data: normalizedProfile.extraCurricular },
    { id: "other", label: "Other Experiences", data: normalizedProfile.otherExperiences },
    { id: "parents", label: "Parent Details", data: normalizedProfile.parents },
  ]

  const categories = [
    {
      id: "coreIdentity",
      label: "Core Identity",
      sectionKeys: ["personal", "communication", "parents", "education", "academics"]
    },
    {
      id: "growthPortfolio",
      label: "Growth Portfolio",
      sectionKeys: ["projects", "internships", "trainings", "certifications", "publications", "extraCurricular", "otherExperiences"]
    },
    {
      id: "professionalSnapshot",
      label: "Professional Snapshot",
      sectionKeys: ["career"]
    }
  ]

  const getCategoryPercentage = (sectionKeys) => {
    if (!sectionKeys.length) return 0
    const completedCount = sectionKeys.reduce((count, key) => {
      const value = normalizedProfile[key]
      return count + (isComplete(value) ? 1 : 0)
    }, 0)
    return Math.round((completedCount / sectionKeys.length) * 100)
  }

  const overallCompletion = calculateProfileCompletion({
    ...normalizedProfile,
    communication: normalizedProfile.communication
  })

  return (
    <StudentProfileLayout>
      <Heading size="md" mb={6}>Profile Overview</Heading>
      
      <Box mb={8} p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.100">
          <Heading size="sm" mb={2}>Overall Completion: {overallCompletion}%</Heading>
          <Text fontSize="sm" color="gray.600">Complete all sections to generate your resume.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={8}>
        {categories.map(category => {
          const percentage = getCategoryPercentage(category.sectionKeys)
          const isCompleteCategory = percentage === 100
          return (
            <Box key={category.id} p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="semibold">{category.label}</Text>
                <Badge colorScheme={isCompleteCategory ? "green" : "yellow"}>
                  {percentage}%
                </Badge>
              </Flex>
              <Text fontSize="sm" color="gray.600">
                {isCompleteCategory ? "All sections filled" : "Keep filling details in this category"}
              </Text>
            </Box>
          )
        })}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {sections.map((section) => {
            const isGrowthPortfolio = ["projects", "internships", "trainings", "certifications", "publications", "extraCurricular", "other"].includes(section.id)
            
            let percent = 0
            let completed = false
            
            if (isGrowthPortfolio) {
                // For growth portfolio sections, we don't calculate percentage
                // We consider it "filled" if there is any data, just for visual consistency (white bg)
                // or just always show as white/active
                completed = isComplete(section.data)
            } else {
                percent = calculateSectionCompletion(section.id, normalizedProfile)
                completed = percent === 100
            }

            return (
                <Box key={section.id} p={4} borderWidth="1px" borderRadius="md" bg={completed ? "white" : "gray.50"}>
                    <Flex justify="space-between" align="center">
                        <Text fontWeight="medium">{section.label}</Text>
                        {!isGrowthPortfolio && (
                            <Badge colorScheme={completed ? "green" : "yellow"}>
                                {percent}%
                            </Badge>
                        )}
                    </Flex>
                </Box>
            )
        })}
      </SimpleGrid>

      <HStack mt={8} gap={4}>
        <Button colorScheme="blue" onClick={() => navigate("/student/profile/edit")}>
            Edit Profile
        </Button>
        <Button variant="outline" onClick={() => navigate("/student/profile/preview")}>
            Preview Resume
        </Button>
      </HStack>
    </StudentProfileLayout>
  )
}
