import { 
  Box, 
  Heading, 
  Text, 
  HStack, 
  Badge, 
  Button, 
  Image, 
  Divider, 
  SimpleGrid, 
  Icon, 
  Spinner, 
  Container, 
  Card, 
  CardBody, 
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { PlacementService } from "../../../services/placement.service"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useAuth } from "../../../context/AuthContext"
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaGraduationCap, FaBriefcase, FaFileAlt, FaArrowLeft } from "react-icons/fa"

export const StudentDriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const { user } = useAuth();
  const studentUSN = user?.usn;

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, studentUSN]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (studentUSN) {
        const [driveData, processData] = await Promise.all([
          PlacementService.getDriveById(id),
          PlacementService.getStudentProcess(studentUSN)
        ]);
        setDrive(driveData);
        const driveIdNum = Number(id);
        const myApp = Array.isArray(processData)
          ? processData.find(p => Number(p.placement_drive_id) === driveIdNum)
          : null;
        setApplication(myApp || null);
      } else {
        const driveData = await PlacementService.getDriveById(id);
        setDrive(driveData);
        setApplication(null);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
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

  if (!drive) {
    return (
      <StudentProfileLayout>
        <Box p={8} textAlign="center">
          <Heading size="lg" color="gray.500">Drive Not Found</Heading>
          <Button mt={4} onClick={() => navigate('/student/placements/feed')}>Back to Feed</Button>
        </Box>
      </StudentProfileLayout>
    )
  }

  return (
    <StudentProfileLayout>
      <Container maxW="container.xl" py={8}>
        <Button 
          leftIcon={<FaArrowLeft />} 
          variant="ghost" 
          mb={6} 
          onClick={() => navigate('/student/placements/feed')}
        >
          Back to Placement Feed
        </Button>

        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8}>
          <Box>
            <Card variant="outline" mb={6} borderColor="gray.200">
              <CardBody>
                <HStack spacing={6} align="start" mb={6}>
                  {drive.company?.logo ? (
                    <Image src={drive.company.logo} boxSize="80px" objectFit="contain" />
                  ) : (
                     <Box 
                       boxSize="80px" 
                       bg="gray.50" 
                       display="flex" 
                       alignItems="center" 
                       justifyContent="center" 
                       borderRadius="md"
                       border="1px solid"
                       borderColor="gray.200"
                     >
                        <Icon as={FaBuilding} boxSize={8} color="gray.400" />
                     </Box>
                  )}
                  <Box flex="1">
                    <HStack justify="space-between">
                      <Heading size="lg" color="#20343c">{drive.company?.company_name}</Heading>
                      <Badge 
                        colorScheme={drive.placement_status === "Open" ? "green" : "red"} 
                        fontSize="md" 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                      >
                        {drive.placement_status}
                      </Badge>
                    </HStack>
                    <Text fontSize="lg" color="gray.600" mt={1}>{drive.job_profile || "Software Engineer"}</Text>
                    <HStack mt={2} spacing={4} color="gray.500">
                      <HStack><Icon as={FaMapMarkerAlt} /><Text>{drive.job_location}</Text></HStack>
                      <HStack><Icon as={FaBriefcase} /><Text>{drive.company?.company_type}</Text></HStack>
                    </HStack>
                  </Box>
                </HStack>

                <Divider mb={6} />

                <Heading size="md" mb={4} color="#20343c">Job Description</Heading>
                <Text color="gray.700" whiteSpace="pre-wrap" mb={6}>
                  {drive.job_description}
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <Box bg="blue.50" p={4} borderRadius="md">
                    <HStack mb={2}>
                      <Icon as={FaMoneyBillWave} color="blue.500" />
                      <Text fontWeight="bold" color="blue.700">CTC / Stipend</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="semibold">
                      {drive.ctc_structure?.total || drive.stipend_structure?.amount || "Not Disclosed"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {drive.stipend_structure?.amount ? "Monthly Stipend" : "Annual CTC"}
                    </Text>
                  </Box>
                  <Box bg="purple.50" p={4} borderRadius="md">
                    <HStack mb={2}>
                      <Icon as={FaClock} color="purple.500" />
                      <Text fontWeight="bold" color="purple.700">Important Dates</Text>
                    </HStack>
                    <Text fontSize="sm"><Text as="span" fontWeight="semibold">Register By:</Text> {new Date(drive.last_date_to_registration).toLocaleDateString()}</Text>
                    <Text fontSize="sm"><Text as="span" fontWeight="semibold">Drive Date:</Text> {drive.event_datetime ? new Date(drive.event_datetime).toLocaleDateString() : "TBD"}</Text>
                  </Box>
                </SimpleGrid>

                <Heading size="md" mb={4} color="#20343c">Requirements</Heading>
                <List spacing={3} mb={6}>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={FaGraduationCap} color="green.500" />
                    <Text><Text as="span" fontWeight="semibold">Programs:</Text> {drive.eligibility_academics?.allowed_programs?.join(", ") || "All"}</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={FaFileAlt} color="green.500" />
                    <Text><Text as="span" fontWeight="semibold">Min CGPA:</Text> {drive.eligibility_academics?.min_cgpa || "N/A"}</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={FaFileAlt} color="green.500" />
                    <Text><Text as="span" fontWeight="semibold">Backlogs Allowed:</Text> {drive.eligibility_academics?.backlogs_allowed ?? "0"}</Text>
                  </ListItem>
                </List>
                <Divider mb={6} />
                <Heading size="md" mb={4} color="#20343c">Process Status</Heading>
                {!Array.isArray(drive.process_rounds) || drive.process_rounds.length === 0 ? (
                  <Text color="gray.500">
                    Process rounds are not configured for this drive.
                  </Text>
                ) : !application ? (
                  <Text color="gray.500">
                    No process data found for your profile for this drive.
                  </Text>
                ) : (
                  <List spacing={3}>
                    {drive.process_rounds.map((round, index) => {
                      const normalized = String(round || "").toLowerCase().trim();
                      let field = null;
                      let label = round;
                      if (normalized === "oa") {
                        field = "oa_status";
                        label = "OA";
                      } else if (normalized === "gd") {
                        field = "gd_status";
                        label = "GD";
                      } else if (normalized === "technical round") {
                        field = "technical_round_status";
                        label = "Technical Round";
                      } else if (normalized === "interview") {
                        field = "interview_status";
                        label = "Interview";
                      } else if (normalized === "hr round") {
                        field = "hr_round_status";
                        label = "HR Round";
                      }

                      if (!field) {
                        return null;
                      }

                      const rawStatus = application ? application[field] : null;

                      let displayStatus = "Pending";
                      let colorScheme = "yellow";

                      if (rawStatus === true) {
                        displayStatus = "Qualified";
                        colorScheme = "green";
                      } else if (rawStatus === false) {
                        displayStatus = "Not Qualified";
                        colorScheme = "red";
                      } else {
                        displayStatus = "Pending";
                        colorScheme = "yellow";
                      }

                      return (
                        <ListItem key={`${round}-${index}`} display="flex" alignItems="center" justifyContent="space-between">
                          <HStack spacing={3}>
                            <ListIcon as={FaClock} color="purple.500" />
                            <Text fontWeight="semibold">{label}</Text>
                          </HStack>
                          <Badge colorScheme={colorScheme} px={3} py={1} borderRadius="full">
                            {displayStatus}
                          </Badge>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Container>
    </StudentProfileLayout>
  )
}
