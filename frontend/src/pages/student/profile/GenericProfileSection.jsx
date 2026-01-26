import { Box, Button, HStack, Spinner, Center, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Badge, Flex, CircularProgress, CircularProgressLabel } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate, useBlocker, useBeforeUnload } from "react-router-dom"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"
import { calculateSectionCompletion } from "../../../utils/profileHelper"

export const GenericProfileSection = ({ sectionKey, FormComponent }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const usn = user?.usn 
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pendingFiles, setPendingFiles] = useState({})
  const [personalMeta, setPersonalMeta] = useState(null)
  
  const initialDataRef = useRef(null)

  const isGrowthPortfolio = ["projects", "internships", "trainings", "certifications", "publications", "extra-curricular", "other-experiences"].includes(sectionKey)

  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current || !data) return false
    return JSON.stringify(initialDataRef.current) !== JSON.stringify(data)
  }, [data])

  const completionPercent = useMemo(() => {
    if (isGrowthPortfolio) return 0
    if (!data) return 0
    const payload = {}
    let sectionId = null

    switch (sectionKey) {
      case "education":
        sectionId = "education"
        payload.education = data
        break
      case "academics":
        sectionId = "academics"
        payload.academics = data
        if (personalMeta) {
          payload.personal = personalMeta
        }
        break
      case "projects":
        sectionId = "projects"
        payload.projects = data
        break
      case "internships":
        sectionId = "internships"
        payload.internships = data
        break
      case "trainings":
        sectionId = "trainings"
        payload.trainings = data
        break
      case "certifications":
        sectionId = "certifications"
        payload.certifications = data
        break
      case "publications":
        sectionId = "publications"
        payload.publications = data
        break
      case "extra-curricular":
        sectionId = "extraCurricular"
        payload.extraCurricular = data
        break
      case "other-experiences":
        sectionId = "other"
        payload.otherExperiences = data
        break
      case "family":
        sectionId = "parents"
        payload.parents = Array.isArray(data) ? data : (data.parents || [])
        break
      case "career":
        sectionId = "career"
        payload.career = data
        break
      default:
        return 0
    }

    return calculateSectionCompletion(sectionId, payload)
  }, [sectionKey, data, personalMeta])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && 
      currentLocation.pathname !== nextLocation.pathname && 
      isEditing
  );

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

  useEffect(() => {
    if (!usn) return

    const fetchData = async () => {
        setLoading(true)
        try {
            if (sectionKey === "academics") {
                const [sectionData, personalData] = await Promise.all([
                    StudentProfileService.getSection(usn, sectionKey),
                    StudentProfileService.getSection(usn, "personal")
                ])
                setData(sectionData || [])
                initialDataRef.current = sectionData || []
                setPersonalMeta(personalData || {})
            } else {
                const sectionData = await StudentProfileService.getSection(usn, sectionKey)
                setData(sectionData || {})
                initialDataRef.current = sectionData || {}
                setPersonalMeta(null)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            alert("Error loading data")
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  }, [usn, sectionKey])

  const handleUpdate = (newData) => setData(newData)

  const handleFileSelect = (index, file) => {
    setPendingFiles((prev) => ({
      ...prev,
      [index]: file
    }))
  }

  const handleSave = async () => {
      setSaving(true)
      try {
          let payload = data

          if ((sectionKey === "education" || sectionKey === "academics") && usn && Array.isArray(data)) {
              const updatedItems = [...data]
              const entries = Object.entries(pendingFiles || {})
              
              if (entries.length > 0) {
                  // Only show uploading alert if there are files to upload
                  // console.log("Uploading files...", entries.length)
              }

              for (const [key, file] of entries) {
                  const index = Number(key)
                  const target = updatedItems[index]
                  if (!target || !file) continue

                  try {
                      const folder = sectionKey === "education" ? "education" : "academics"
                      const result = await StudentProfileService.uploadFile(usn, file, { folder })
                      const url = result?.url || result?.path
                      if (url) {
                          if (sectionKey === "education") {
                            updatedItems[index] = { ...target, proofFile: url }
                          } else {
                            // For academics, DB expects jsonb array, but utils maps resultUploadLink to it.
                            // We should assign array of strings.
                            updatedItems[index] = { ...target, resultUploadLink: [url] }
                          }
                      }
                  } catch (e) {
                      console.error(`Error uploading ${sectionKey} file:`, e)
                      const msg = e && e.message ? e.message : ""
                      if (msg.toLowerCase().includes("unauthorized")) {
                          alert("You are not authorized to upload this file. Please log in again and try once more.")
                      } else if (msg) {
                          alert(`Error uploading one of the files: ${msg}`)
                      } else {
                          alert("Error uploading one of the files. Please try again.")
                      }
                      return false
                  }
              }

              payload = updatedItems
              setData(updatedItems)
          }

          await StudentProfileService.saveSection(usn, sectionKey, payload)
          initialDataRef.current = payload
          if (sectionKey === "education" || sectionKey === "academics") {
              setPendingFiles({})
          }
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

  if (loading || !data) {
      return (
        <StudentProfileLayout>
          <Center h="50vh">
              <Spinner size="xl" color="#d4a960" />
          </Center>
        </StudentProfileLayout>
      )
  }

  return (
    <StudentProfileLayout>
      <Box maxW="5xl" mx="auto" position="relative" pt={8}>
        {!isEditing && !isGrowthPortfolio && (
            <Box position="absolute" top={0} right={0} zIndex={2}>
                <CircularProgress 
                    value={completionPercent} 
                    color={completionPercent === 100 ? "green.400" : "#d4a960"} 
                    size="60px"
                    thickness="10px"
                    trackColor="gray.100"
                >
                    <CircularProgressLabel fontSize="sm" fontWeight="bold" color="gray.600">
                        {completionPercent}%
                    </CircularProgressLabel>
                </CircularProgress>
            </Box>
        )}

        <FormComponent 
          data={data} 
          onUpdate={handleUpdate} 
          isEditing={isEditing} 
          {...(sectionKey === "education" || sectionKey === "academics"
            ? { onFileSelect: handleFileSelect }
            : {})}
          {...(sectionKey === "academics" ? { personalDetails: personalMeta } : {})}
        />
        
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
