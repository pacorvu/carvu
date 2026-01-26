import { Box, Button, HStack, Spinner, Center, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, VStack, Input } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useParams, useNavigate, useBlocker, useBeforeUnload } from "react-router-dom"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"

// Import all form components
import { PersonalInformationForm } from "../../../components/student/forms/PersonalInformationForm"
import { ContactLinksForm } from "../../../components/student/forms/ContactLinksForm"
import { ParentDetailsForm } from "../../../components/student/forms/ParentDetailsForm"
import { CareerOverviewForm } from "../../../components/student/forms/CareerOverviewForm"
import { EducationForm } from "../../../components/student/forms/EducationForm"
import { AcademicPerformanceForm } from "../../../components/student/forms/AcademicPerformanceForm"
import { ProjectsForm } from "../../../components/student/forms/ProjectsForm"
import { InternshipsForm } from "../../../components/student/forms/InternshipsForm"
import { TrainingWorkshopsForm } from "../../../components/student/forms/TrainingWorkshopsForm"
import { CertificationsForm } from "../../../components/student/forms/CertificationsForm"
import { PublicationsForm } from "../../../components/student/forms/PublicationsForm"
import { ExtraCurricularForm } from "../../../components/student/forms/ExtraCurricularForm"
import { OtherExperiencesForm } from "../../../components/student/forms/OtherExperiencesForm"
import { ResumeModule } from "../../../components/student/ResumeModule"

export const EditProfile = () => {
  const { section } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Use USN from auth context
  const usn = user?.usn 
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [majorOptions, setMajorOptions] = useState([])
  const [minorOptions, setMinorOptions] = useState([])
  const [specializationOptions, setSpecializationOptions] = useState([])
  const [schoolOptions, setSchoolOptions] = useState([])
  const [programOptions, setProgramOptions] = useState([])

  const initialDataRef = useRef(null)

  // Map section URL param to internal data key
  const getSectionKey = (param) => {
      switch(param) {
          case 'personal': return 'personal'
          case 'contact': return 'contact'
          case 'family': return 'family'
          case 'career': return 'career'
          case 'education': return 'education'
          case 'academics': return 'academics'
          case 'projects': return 'projects'
          case 'internships': return 'internships'
          case 'trainings': return 'trainings'
          case 'certifications': return 'certifications'
          case 'publications': return 'publications'
          case 'extra-curricular': return 'extraCurricular'
          case 'other': return 'otherExperiences'
          case 'resume': return 'resume'
          default: return 'personal'
      }
  }

  const currentSectionKey = getSectionKey(section)

  const hasUnsavedChanges = useMemo(() => {
    if (section === 'resume') return false
    if (!initialDataRef.current || !data) return false
    return JSON.stringify(initialDataRef.current) !== JSON.stringify(data)
  }, [section, data])

  // Block navigation when editing
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && 
      currentLocation.pathname !== nextLocation.pathname && 
      isEditing
  );

  // Handle browser refresh/close
  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasUnsavedChanges) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      [hasUnsavedChanges]
    )
  );

  const allowEditMajor = useMemo(() => {
    if (section !== 'personal') return false
    const x = initialDataRef.current || {}
    return !x.majorId && !x.majorName
  }, [section])

  const allowEditMinor = useMemo(() => {
    if (section !== 'personal') return false
    const x = initialDataRef.current || {}
    return !x.minorId && !x.minorName
  }, [section])

  const allowEditSpecialization = useMemo(() => {
    if (section !== 'personal') return false
    const x = initialDataRef.current || {}
    return !x.specializationId && !x.specializationName
  }, [section])

  useEffect(() => {
    // Reset editing state when switching sections
    setIsEditing(false)

    // If no section provided, redirect to personal
    if (!section) {
        navigate('/student/profile/personal')
        return
    }

    if (!usn) {
        return // Wait for auth
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            // For resume, we might need full profile data
            if (section === 'resume') {
                const fullProfile = await StudentProfileService.getFullProfile(usn)
                setData(fullProfile)
            } else if (section === 'personal') {
                const [maj, min, spec, schools, programs] = await Promise.all([
                  StudentProfileService.getMajors().catch(() => []),
                  StudentProfileService.getMinors().catch(() => []),
                  StudentProfileService.getSpecializations().catch(() => []),
                  StudentProfileService.getSchools().catch(() => []),
                  StudentProfileService.getPrograms().catch(() => []),
                ])
                setMajorOptions(Array.isArray(maj) ? maj : [])
                setMinorOptions(Array.isArray(min) ? min : [])
                setSpecializationOptions(Array.isArray(spec) ? spec : [])
                setSchoolOptions(Array.isArray(schools) ? schools : [])
                setProgramOptions(Array.isArray(programs) ? programs : [])

                const sectionData = await StudentProfileService.getSection(usn, 'personal')
                setData(sectionData || {})
                initialDataRef.current = sectionData || {}
            } else {
                const sectionData = await StudentProfileService.getSection(usn, currentSectionKey)
                
                let finalData = sectionData || {}
                // Ensure links is array for contact section
                if (currentSectionKey === 'contact') {
                    let links = finalData.links;
                    if (!links) {
                        links = [];
                    } else if (!Array.isArray(links) && typeof links === 'object') {
                        links = Object.entries(links).map(([k, v]) => ({ name: k, url: v }));
                    } else if (!Array.isArray(links)) {
                        links = [];
                    }
                    finalData.links = links;
                }

                setData(finalData)
                initialDataRef.current = finalData
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            alert("Error loading data")
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  }, [section, currentSectionKey, navigate, usn])

  const handleUpdate = (newData) => setData(newData)

  const handleSave = async () => {
      setSaving(true)
      try {
          await StudentProfileService.saveSection(usn, currentSectionKey, data)
          initialDataRef.current = data
          alert("Changes saved successfully")
          setIsEditing(false)
          return true
      } catch (error) {
          console.error("Error saving data:", error)
          alert("Error saving data")
          return false
      } finally {
          setSaving(false)
      }
  }

  const renderContent = () => {
      if (loading || (section !== 'resume' && !data)) {
          return (
              <Center h="50vh">
                  <Spinner size="xl" color="#d4a960" />
              </Center>
          )
      }

      switch (section) {
          case 'personal':
              return (
                <PersonalInformationForm
                  data={data}
                  onUpdate={handleUpdate}
                  isEditing={isEditing}
                  mode="student"
                  majorOptions={majorOptions}
                  minorOptions={minorOptions}
                  specializationOptions={specializationOptions}
                  schoolOptions={schoolOptions}
                  programOptions={programOptions}
                  allowEditMajor={allowEditMajor}
                  allowEditMinor={allowEditMinor}
                  allowEditSpecialization={allowEditSpecialization}
                />
              )
          case 'contact':
              return <ContactLinksForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'family':
              return <ParentDetailsForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'career':
              return <CareerOverviewForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'education':
              return <EducationForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'academics':
              return <AcademicPerformanceForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'projects':
              return <ProjectsForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'internships':
              return <InternshipsForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'trainings':
              return <TrainingWorkshopsForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'certifications':
              return <CertificationsForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'publications':
              return <PublicationsForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'extra-curricular':
              return <ExtraCurricularForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'other':
              return <OtherExperiencesForm data={data} onUpdate={handleUpdate} isEditing={isEditing} />
          case 'resume':
              // Resume module handles its own data generation from the full profile passed to it
              return <ResumeModule fullProfile={data} usn={usn} />
          default:
              return <Box>Section Not Found</Box>
      }
  }

  return (
    <StudentProfileLayout>
      <Box maxW="5xl" mx="auto">
        {renderContent()}
        
        {section !== 'resume' && !loading && (
            <HStack justifyContent="flex-end" mt={8} pb={10}>
                {!isEditing ? (
                        <Button 
                            bg="#d4a960" 
                            color="#20343c" 
                            _hover={{ bg: "#c39850" }} 
                            size="lg"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    ) : (
                        <>
                            <Button 
                                bg="#d4a960" 
                                color="#20343c" 
                                _hover={{ bg: "#c39850" }} 
                                size="lg"
                                isLoading={saving}
                                loadingText="Saving..."
                                onClick={handleSave}
                            >
                                Save Changes
                            </Button>
                            <Button 
                                ml={4}
                                variant="outline"
                                colorScheme="red"
                                size="lg"
                                onClick={() => {
                                    setData(initialDataRef.current || {});
                                    setIsEditing(false);
                                }}
                                isDisabled={saving}
                            >
                                Cancel
                            </Button>
                        </>
                    )
                }
            </HStack>
        )}

        {/* Navigation Block Modal */}
        {blocker.state === "blocked" && (
            <Modal isOpen={true} onClose={() => blocker.reset()} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Unsaved Changes</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            You have unsaved changes. Do you want to save them before leaving?
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => blocker.reset()}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="red" 
                            variant="outline" 
                            mr={3} 
                            onClick={() => blocker.proceed()}
                        >
                            Discard Changes
                        </Button>
                        <Button 
                            bg="#d4a960" 
                            color="#20343c"
                            _hover={{ bg: "#c39850" }}
                            onClick={async () => {
                                const success = await handleSave()
                                if (success) {
                                    blocker.proceed()
                                }
                            }}
                            isLoading={saving}
                        >
                            Save & Leave
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )}
      </Box>
    </StudentProfileLayout>
  )
}
