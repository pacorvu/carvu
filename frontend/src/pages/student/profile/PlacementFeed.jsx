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
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Error applying for drive";
      alert(message);
    } finally {
      setApplying(null);
    }
  };

  // Filter Logic based on student_placement_process
  const allProcesses = Array.isArray(processRecords) ? processRecords : [];

  const getProcessByDriveId = (driveId) => {
    return allProcesses.find(p => p.placement_drive_id === driveId);
  };

  const isEligibleProcess = (process) => {
    return !!process && process.is_eligible === true;
  };

  const isRegisteredProcess = (process) => {
    if (!process) return false;
    const rawStatus = process.registration_status;
    if (!rawStatus) return false;
    const value = String(rawStatus).toLowerCase();
    return value === 'registered';
  };

  // Helper to check rejection and selection
  const isRejected = (driveId) => {
    const app = getProcessByDriveId(driveId);
    const finalStatus = app?.final_select_status;
    return finalStatus === false;
  };

  const isSelected = (driveId) => {
    const app = getProcessByDriveId(driveId);
    const finalStatus = app?.final_select_status;
    return finalStatus === true || app?.offer_letter_status === 'Issued';
  };

  const upcomingDrives = drives.filter(d => {
    const process = getProcessByDriveId(d.id);
    if (!isEligibleProcess(process)) return false;
    if (isRegisteredProcess(process)) return false;
    const status = String(d.placement_status || '').toLowerCase();
    return status !== 'closed';
  });

  const ongoingDrives = drives.filter(d => {
    const process = getProcessByDriveId(d.id);
    if (!isEligibleProcess(process)) return false;
    if (!isRegisteredProcess(process)) return false;
    const status = String(d.placement_status || '').toLowerCase();
    return status !== 'closed';
  });

  const historyDrives = drives.filter(d => {
    const process = getProcessByDriveId(d.id);
    if (!isEligibleProcess(process)) return false;
    if (!isRegisteredProcess(process)) return false;
    const status = String(d.placement_status || '').toLowerCase();
    return status === 'closed';
  });

  const missedDrives = drives.filter(d => {
    const process = getProcessByDriveId(d.id);
    if (!isEligibleProcess(process)) return false;
    if (isRegisteredProcess(process)) return false;
    const status = String(d.placement_status || '').toLowerCase();
    return status === 'closed';
  });

  const DriveCard = ({ drive, showApply = true }) => {
    const process = getProcessByDriveId(drive.id);
    const hasApplied = isRegisteredProcess(process);
    const totalApplied = drive.number_of_registrations ?? 0;
    const openings = drive.number_of_openings ?? null;

    const getCtcLabel = () => {
      const total = drive.ctc_structure?.total;
      const stipendMonthly = drive.stipend_structure?.monthly || drive.stipend_structure?.amount;
      if (total) return `${total} LPA`;
      if (stipendMonthly) return `${stipendMonthly} / month`;
      return "Not Disclosed";
    };

    return (
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
                  <Text fontSize="sm" color="gray.600">
                    {drive.job_type} • {drive.type_of_hiring}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {drive.job_location} • {drive.company?.company_type}
                  </Text>
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
                <Text fontWeight="bold" fontSize="sm" color="gray.600">CTC</Text>
                <Text>{getCtcLabel()}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.600">Location</Text>
                <Text>{drive.job_location}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.600">Drive Date</Text>
                <Text>
                  {drive.event_datetime ? new Date(drive.event_datetime).toLocaleDateString() : "TBD"}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.600">Apply By</Text>
                <Text color="red.500" fontWeight="medium">
                  {new Date(drive.last_date_to_registration).toLocaleDateString()}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.600">Eligibility</Text>
                <Text fontSize="sm">
                  CGPA ≥ {drive.eligibility_academics?.min_cgpa || "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.600">Applications</Text>
                <Text fontSize="sm">
                  {totalApplied} applied{openings ? ` | ${openings} openings` : ""}
                </Text>
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
                  isDisabled={drive.placement_status === "Closed"}
                >
                  Apply Now
                </Button>
              )}
              {!showApply && (
                <Badge
                  colorScheme={
                    isSelected(drive.id) ? "green" :
                    isRejected(drive.id) ? "red" :
                    !hasApplied && drive.placement_status === "Closed" ? "orange" :
                    drive.placement_status === "Closed" ? "gray" :
                    "purple"
                  }
                  p={2}
                  borderRadius="md"
                >
                  {isSelected(drive.id)
                    ? "Selected / Offer Issued"
                    : isRejected(drive.id)
                    ? "Rejected"
                    : hasApplied
                    ? (drive.placement_status === "Closed" ? "Completed" : "Applied")
                    : "Missed"}
                </Badge>
              )}
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    );
  };

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
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>
              New Drives ({upcomingDrives.length})
            </Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>
              Ongoing ({ongoingDrives.length})
            </Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>
              Completed ({historyDrives.length})
            </Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>
              Missed ({missedDrives.length})
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {upcomingDrives.length === 0 ? (
                  <Text color="gray.500">
                    No upcoming drives available for registration.
                  </Text>
                ) : (
                  upcomingDrives.map(drive => (
                    <DriveCard
                      key={drive.id}
                      drive={drive}
                      showApply={true}
                    />
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {ongoingDrives.length === 0 ? (
                  <Text color="gray.500">No ongoing applications.</Text>
                ) : (
                  ongoingDrives.map(drive => (
                    <DriveCard
                      key={drive.id}
                      drive={drive}
                      showApply={false}
                    />
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {historyDrives.length === 0 ? (
                  <Text color="gray.500">No completed drives found.</Text>
                ) : (
                  historyDrives.map(drive => (
                    <DriveCard
                      key={drive.id}
                      drive={drive}
                      showApply={false}
                    />
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {missedDrives.length === 0 ? (
                  <Text color="gray.500">No missed drives.</Text>
                ) : (
                  missedDrives.map(drive => (
                    <DriveCard
                      key={drive.id}
                      drive={drive}
                      showApply={false}
                    />
                  ))
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </StudentProfileLayout>
  )
}
