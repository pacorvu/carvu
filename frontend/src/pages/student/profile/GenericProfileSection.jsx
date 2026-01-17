import { Box, Button, HStack, Spinner, Center, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate, useBlocker, useBeforeUnload } from "react-router-dom"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"

export const GenericProfileSection = ({ sectionKey, FormComponent }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const usn = user?.usn 
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const initialDataRef = useRef(null)

  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current || !data) return false
    return JSON.stringify(initialDataRef.current) !== JSON.stringify(data)
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
            const sectionData = await StudentProfileService.getSection(usn, sectionKey)
            setData(sectionData || {})
            initialDataRef.current = sectionData || {}
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

  const handleSave = async () => {
      setSaving(true)
      try {
          await StudentProfileService.saveSection(usn, sectionKey, data)
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
        <FormComponent data={data} onUpdate={handleUpdate} isEditing={isEditing} />
        
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
