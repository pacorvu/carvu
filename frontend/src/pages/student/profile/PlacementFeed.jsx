import { Box, Heading, Text, VStack, Button, Badge, HStack, Spinner, Image, Card, CardBody, Stack, Divider, SimpleGrid, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlacementService } from "../../../services/placement.service"
import { useAuth } from "../../../context/AuthContext"

export const PlacementFeed = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [processRecords, setProcessRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const { user } = useAuth();
  
  const studentUSN = user?.usn;

  useEffect(() => {
    if (studentUSN) {
      loadData();
    }
  }, [studentUSN]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drivesData, processData] = await Promise.all([
        PlacementService.getAllDrives(),
        PlacementService.getStudentProcess(studentUSN)
      ]);

      setDrives(drivesData);
      setProcessRecords(processData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    setApplying(driveId);
    try {
      const result = await PlacementService.registerForDrive(studentUSN, driveId);
      // Check if the result is an object with success property or just the new process object
      // Based on placement.service.js, it returns the newProcess object on success, or rejects on failure.
      if (result && result.id) {
        alert("Applied successfully!");
        loadData(); // Reload to reflect changes
      } else {
         // Fallback if structure is different
        alert("Application processed.");
        loadData();
      }
    } catch (error) {
      alert(typeof error === 'string' ? error : "Error applying for drive");
    } finally {
      setApplying(null);
    }
  };

  // Filter Logic
  const myApplications = processRecords; // processRecords is already filtered by USN from the service call
  const appliedDriveIds = myApplications.map(p => p.placement_drive_id);

  // Helper to check rejection and selection
  const isRejected = (driveId) => {
    const app = myApplications.find(p => p.placement_drive_id === driveId);
    return app?.final_select_status === 'Rejected';
  };

  const isSelected = (driveId) => {
    const app = myApplications.find(p => p.placement_drive_id === driveId);
    return app?.final_select_status === 'Selected' || app?.offer_letter_status === 'Issued';
  };

  const upcomingDrives = drives.filter(d => d.placement_status === 'Open' && !appliedDriveIds.includes(d.id));
  
  const rejectedDrives = drives.filter(d => appliedDriveIds.includes(d.id) && isRejected(d.id));

  const selectedDrives = drives.filter(d => appliedDriveIds.includes(d.id) && isSelected(d.id));

  // Ongoing = Applied AND Not Rejected AND Not Selected AND (Not Closed OR (Closed but process still active?))
  const ongoingDrives = drives.filter(d => appliedDriveIds.includes(d.id) && !isRejected(d.id) && !isSelected(d.id) && d.placement_status !== 'Closed');

  // Attended = Applied AND Not Rejected AND Not Selected AND Closed
  const attendedDrives = drives.filter(d => appliedDriveIds.includes(d.id) && !isRejected(d.id) && !isSelected(d.id) && d.placement_status === 'Closed');

  const DriveCard = ({ drive, showApply = true }) => (
    <Card key={drive.id} variant="outline" borderColor="gray.200" _hover={{ shadow: "md", borderColor: "#d4a960" }} transition="all 0.2s">
      <CardBody>
        <Stack spacing={4}>
          <HStack justify="space-between" align="start">
            <HStack spacing={4}>
              {drive.company?.logo || drive.company?.company_logo_link ? (
                <Image 
                  src={drive.company.logo || drive.company.company_logo_link} 
                  boxSize="50px" 
                  objectFit="contain" 
                />
              ) : (
                <Box 
                  boxSize="50px" 
                  bg="white" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  border="1px solid" 
                  borderColor="gray.200"
                  borderRadius="md"
                >
                   <Text 
                     fontWeight="bold" 
                     fontSize="lg" 
                     color={drive.company?.color || "gray.500"}
                     fontFamily={drive.company?.fontFamily || "serif"}
                   >
                     {drive.company?.company_name?.substring(0, 2).toUpperCase() || "C"}
                   </Text>
                </Box>
              )}
              <Box>
                <Heading size="md" color="#20343c">{drive.company?.company_name}</Heading>
                <Text fontSize="sm" color="gray.500">{drive.company?.company_type} • {drive.job_location}</Text>
              </Box>
            </HStack>
            <Badge 
              colorScheme={drive.placement_status === "Open" ? "green" : "red"} 
              fontSize="0.8em" 
              px={2} 
              py={1} 
              borderRadius="full"
            >
              {drive.placement_status}
            </Badge>
          </HStack>

          <Divider />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
             <Box>
               <Text fontWeight="bold" fontSize="sm" color="gray.600">Role</Text>
               <Text>{drive.job_type} - {drive.type_of_hiring}</Text>
             </Box>
             <Box>
               <Text fontWeight="bold" fontSize="sm" color="gray.600">CTC / Stipend</Text>
               <Text>
                 {drive.ctc_structure?.total || drive.stipend_structure?.monthly || "Not Disclosed"}
               </Text>
             </Box>
             <Box>
               <Text fontWeight="bold" fontSize="sm" color="gray.600">Deadline</Text>
               <Text color="red.500" fontWeight="medium">
                 {new Date(drive.last_date_to_registration).toLocaleDateString()}
               </Text>
             </Box>
             <Box>
               <Text fontWeight="bold" fontSize="sm" color="gray.600">Eligibility</Text>
               <Text>Min CGPA: {drive.eligibility_academics?.min_cgpa || "N/A"}</Text>
             </Box>
          </SimpleGrid>

          <Box bg="gray.50" p={3} borderRadius="md" fontSize="sm" color="gray.700">
            <Text noOfLines={2}>{drive.job_description}</Text>
          </Box>

          <HStack justify="flex-end" pt={2}>
            <Button 
              variant="outline" 
              size="sm" 
              colorScheme="blue"
              onClick={() => navigate(`/student/placements/drive/${drive.id}`)}
            >
              View Details
            </Button>
            {showApply && (
              <Button 
                bg="#20343c" 
                color="white" 
                size="sm" 
                _hover={{ bg: "#1a2b32" }}
                onClick={() => handleApply(drive.id)}
                isLoading={applying === drive.id}
                isDisabled={drive.placement_status !== "Open"}
              >
                Apply Now
              </Button>
            )}
            {!showApply && (
               <Badge 
                 colorScheme={
                    isSelected(drive.id) ? "green" :
                    isRejected(drive.id) ? "red" : 
                    "purple"
                 } 
                 p={2} 
                 borderRadius="md"
               >
                  {isSelected(drive.id) ? "Selected / Offer Issued" :
                   isRejected(drive.id) ? "Rejected" : 
                   (ongoingDrives.includes(drive) ? "Application Submitted" : "Attended")}
               </Badge>
            )}
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <StudentProfileLayout>
        <Box display="flex" justifyContent="center" alignItems="center" h="400px">
          <Spinner size="xl" color="#d4a960" />
        </Box>
      </StudentProfileLayout>
    )
  }

  return (
    <StudentProfileLayout>
      <Box bg="white" p={8} borderRadius="xl" shadow="sm" minH="80vh">
        <Heading size="lg" color="#20343c" mb={6}>Placement Drives</Heading>
        
        <Tabs variant="soft-rounded" colorScheme="yellow">
          <TabList mb={4} overflowX="auto" py={1}>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>Upcoming ({upcomingDrives.length})</Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>Ongoing ({ongoingDrives.length})</Tab>
            <Tab _selected={{ color: 'white', bg: '#2F855A' }}>Selected ({selectedDrives.length})</Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>Attended ({attendedDrives.length})</Tab>
            <Tab _selected={{ color: 'white', bg: '#c53030' }}>Rejected ({rejectedDrives.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Upcoming */}
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {upcomingDrives.length === 0 ? (
                   <Text color="gray.500">No upcoming drives available for registration.</Text>
                ) : (
                   upcomingDrives.map(drive => <DriveCard key={drive.id} drive={drive} showApply={true} />)
                )}
              </VStack>
            </TabPanel>

            {/* Ongoing */}
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {ongoingDrives.length === 0 ? (
                   <Text color="gray.500">No ongoing applications.</Text>
                ) : (
                   ongoingDrives.map(drive => <DriveCard key={drive.id} drive={drive} showApply={false} />)
                )}
              </VStack>
            </TabPanel>

            {/* Selected */}
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {selectedDrives.length === 0 ? (
                   <Text color="gray.500">No selected applications yet.</Text>
                ) : (
                   selectedDrives.map(drive => <DriveCard key={drive.id} drive={drive} showApply={false} />)
                )}
              </VStack>
            </TabPanel>

            {/* Attended */}
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {attendedDrives.length === 0 ? (
                   <Text color="gray.500">No past attended drives found.</Text>
                ) : (
                   attendedDrives.map(drive => <DriveCard key={drive.id} drive={drive} showApply={false} />)
                )}
              </VStack>
            </TabPanel>

            {/* Rejected */}
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {rejectedDrives.length === 0 ? (
                   <Text color="gray.500">No rejected applications.</Text>
                ) : (
                   rejectedDrives.map(drive => <DriveCard key={drive.id} drive={drive} showApply={false} />)
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </StudentProfileLayout>
  )
}
