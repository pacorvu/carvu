import { Heading, SimpleGrid, Box, Text, Badge, Button, Flex, HStack } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"

export const ProfileOverview = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const usn = user?.usn
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usn) {
        setLoading(false)
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

  // Helper to check if a section is "complete" (naive check)
  const isComplete = (data) => {
      if (Array.isArray(data)) return data.length > 0
      if (typeof data === 'object' && data !== null) {
          return Object.values(data).some(val => val !== "" && val !== null && (Array.isArray(val) ? val.length > 0 : true))
      }
      return false
  }

  const sections = [
    { id: "personal", label: "Personal Details", data: profile.personal },
    { id: "communication", label: "Communication", data: profile.communication },
    { id: "career", label: "Career Summary", data: profile.career },
    { id: "education", label: "Education History", data: profile.education },
    { id: "academics", label: "Semester Academics", data: profile.academics },
    { id: "projects", label: "Projects", data: profile.projects },
    { id: "internships", label: "Internships", data: profile.internships },
    { id: "trainings", label: "Trainings", data: profile.trainings },
    { id: "certifications", label: "Certifications", data: profile.certifications },
    { id: "publications", label: "Publications", data: profile.publications },
    { id: "extraCurricular", label: "Extra-Curricular", data: profile.extraCurricular },
    { id: "other", label: "Other Experiences", data: profile.otherExperiences },
    { id: "parents", label: "Parent Details", data: profile.parents },
  ]

  return (
    <StudentProfileLayout>
      <Heading size="md" mb={6}>Profile Overview</Heading>
      
      <Box mb={8} p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.100">
          <Heading size="sm" mb={2}>Overall Completion: 85%</Heading>
          <Text fontSize="sm" color="gray.600">Complete all sections to generate your resume.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {sections.map((section) => {
            const completed = isComplete(section.data)
            return (
                <Box key={section.id} p={4} borderWidth="1px" borderRadius="md" bg={completed ? "white" : "gray.50"}>
                    <Flex justify="space-between" align="center">
                        <Text fontWeight="medium">{section.label}</Text>
                        <Badge colorScheme={completed ? "green" : "red"}>
                            {completed ? "Completed" : "Incomplete"}
                        </Badge>
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
