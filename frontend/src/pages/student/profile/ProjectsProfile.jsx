import { Box, Button, HStack, Spinner, Center, Text, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Icon } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useState, useEffect, useRef } from "react"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"
import { ProjectsForm } from "../../../components/student/forms/ProjectsForm"
import { ProjectShowcase } from "../../../components/student/projects/ProjectShowcase"
import { ProjectStats } from "../../../components/student/projects/ProjectStats"
import { FaEdit, FaStore, FaChartLine } from "react-icons/fa"

export const ProjectsProfile = () => {
  const { user } = useAuth()
  const usn = user?.usn 
  const toast = useToast()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Ref for cancel functionality
  const initialDataRef = useRef([])

  useEffect(() => {
    if (!usn) return
    fetchData()
  }, [usn])

  const fetchData = async () => {
    setLoading(true)
    try {
        const sectionData = await StudentProfileService.getSection(usn, "projects")
        const projects = Array.isArray(sectionData) ? sectionData : (sectionData?.projects || [])
        setData(projects)
        initialDataRef.current = projects
    } catch (error) {
        console.error("Error fetching data:", error)
        toast({ title: "Error loading data", status: "error" })
    } finally {
        setLoading(false)
    }
  }

  const handleUpdate = (newData) => setData(newData)

  const handleSave = async () => {
      setSaving(true)
      try {
          await StudentProfileService.saveSection(usn, "projects", { projects: data })
          initialDataRef.current = data
          toast({ title: "Changes saved successfully", status: "success" })
          setIsEditing(false)
      } catch (error) {
          console.error("Error saving data:", error)
          toast({ title: "Error saving data", status: "error" })
      } finally {
          setSaving(false)
      }
  }

  if (loading) {
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
      <Box maxW="7xl" mx="auto" pt={8} pb={12}>
        <Tabs variant="soft-rounded" colorScheme="orange" isLazy defaultIndex={0}>
            <TabList mb={6} bg="white" p={2} borderRadius="xl" shadow="sm" display="flex" justifyContent="center">
                <Tab _selected={{ color: 'white', bg: '#d4a960' }} px={6}><HStack><Icon as={FaStore} /><Text>Showcase</Text></HStack></Tab>
                <Tab _selected={{ color: 'white', bg: '#d4a960' }} px={6}><HStack><Icon as={FaChartLine} /><Text>Analytics</Text></HStack></Tab>
                <Tab _selected={{ color: 'white', bg: '#d4a960' }} px={6}><HStack><Icon as={FaEdit} /><Text>Manage Projects</Text></HStack></Tab>
            </TabList>

            <TabPanels>
                {/* Showcase Tab */}
                <TabPanel p={0}>
                    <ProjectShowcase projects={data} />
                </TabPanel>

                {/* Analytics Tab */}
                <TabPanel p={0}>
                    <ProjectStats projects={data} />
                </TabPanel>

                {/* Manage Tab */}
                <TabPanel p={0}>
                     <Box position="relative">
                        <ProjectsForm 
                            data={data} 
                            onUpdate={handleUpdate} 
                            isEditing={isEditing} 
                        />
                        
                        <HStack justifyContent="flex-end" mt={8}>
                            {!isEditing ? (
                                <Button 
                                    bg="#d4a960" 
                                    color="#20343c" 
                                    _hover={{ bg: "#c39850" }} 
                                    size="lg"
                                    onClick={() => setIsEditing(true)}
                                    leftIcon={<FaEdit />}
                                >
                                    Edit Projects
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
                                        variant="ghost"
                                        colorScheme="red"
                                        size="lg"
                                        onClick={() => {
                                            setData(initialDataRef.current || []);
                                            setIsEditing(false);
                                        }}
                                        isDisabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </HStack>
                    </Box>
                </TabPanel>
            </TabPanels>
        </Tabs>
      </Box>
    </StudentProfileLayout>
  )
}
