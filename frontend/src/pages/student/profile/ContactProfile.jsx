import { Box, Button, HStack, Spinner, Center, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate, useBlocker, useBeforeUnload } from "react-router-dom"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"
import { ContactLinksForm } from "../../../components/student/forms/ContactLinksForm"
import isEqual from "lodash/isEqual"

export const ContactProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const usn = user?.usn 
  const toast = useToast()
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const initialDataRef = useRef(null)

  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current || !data) return false
    return !isEqual(initialDataRef.current, data)
  }, [data])

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
            const sectionData = await StudentProfileService.getSection(usn, 'contact')
            let finalData = sectionData || {}
            
            // Ensure links is array for contact section
            let links = finalData.links;
            if (!links) {
                links = [];
            } else if (!Array.isArray(links) && typeof links === 'object') {
                links = Object.entries(links).map(([k, v]) => ({ name: k, url: v }));
            } else if (!Array.isArray(links)) {
                links = [];
            }
            finalData.links = links;

            setData(finalData)
            initialDataRef.current = finalData
        } catch (error) {
            console.error("Error fetching data:", error)
            toast({
                title: "Error loading data",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  }, [usn, toast])

  const handleUpdate = (newData) => setData(newData)

  const handleSave = async () => {
      if (saving) return
      setSaving(true)
      try {
          // Prepare payload with transformation
          const payload = JSON.parse(JSON.stringify(data));
          
          // Transform links array to object with camelCase keys
          if (Array.isArray(payload.links)) {
              const linksObj = {};
              payload.links.forEach(link => {
                  if (link.name && link.url) {
                      // camelCase the name: "Linked In" -> "linkedIn"
                      const key = link.name.trim()
                        .toLowerCase()
                        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                      
                      // Trim the URL
                      linksObj[key] = link.url.trim();
                  }
              });
              payload.links = linksObj;
          }

          await StudentProfileService.saveSection(usn, 'contact', payload)
          
          // Update initialDataRef with the *current* state (array form) to avoid unsaved changes warning
          // We keep the local state as array for editing, but send object to backend.
          initialDataRef.current = structuredClone(data);
          
          toast({
              title: "Changes saved successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
          })
          setIsEditing(false)
          return true
      } catch (error) {
          console.error("Error saving data:", error)
          toast({
              title: "Error saving data",
              status: "error",
              duration: 3000,
              isClosable: true,
          })
          return false
      } finally {
          setSaving(false)
      }
  }

  // Auto-exit edit mode if no changes
  useEffect(() => {
    if (isEditing && !hasUnsavedChanges && initialDataRef.current) {
        // Optional: setIsEditing(false)
    }
  }, [isEditing, hasUnsavedChanges])

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
      <Box maxW="5xl" mx="auto">
        <ContactLinksForm
            data={data}
            onUpdate={handleUpdate}
            isEditing={isEditing}
            mode="student"
        />
        
        <HStack justifyContent="flex-end" mt={8} pb={10}>
            {!isEditing ? (
                    <Button 
                        bg="#d4a960" 
                        color="#20343c" 
                        _hover={{ bg: "#c39850" }} 
                        size="lg"
                        onClick={() => setIsEditing(true)}
                        isDisabled={loading}
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
                                setData(structuredClone(initialDataRef.current || {}));
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
                            Stay on this page
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
                                if (saving) return
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
