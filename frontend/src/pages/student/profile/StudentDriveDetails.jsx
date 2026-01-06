import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
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
  CardHeader,
  List,
  ListItem,
  ListIcon,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Alert,
  AlertIcon
} from "@chakra-ui/react"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { PlacementService } from "../../../services/placement.service"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useAuth } from "../../../context/AuthContext"
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaGraduationCap, FaBriefcase, FaFileAlt, FaGlobe, FaLinkedin, FaArrowLeft } from "react-icons/fa"

export const StudentDriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const studentUSN = user?.usn;

  useEffect(() => {
    if (studentUSN && id) {
        loadData();
    }
  }, [id, studentUSN]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [driveData, processData] = await Promise.all([
        PlacementService.getDriveById(id),
        PlacementService.getStudentProcess(studentUSN)
      ]);
      setDrive(driveData);
      
      const myApp = processData.find(p => p.placement_drive_id === id);
      setApplication(myApp);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusAlert = () => {
    if (!application) {
      return (
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          You have not applied for this drive yet.
        </Alert>
      );
    }

    if (application.final_select_status === 'Selected' || application.offer_letter_status === 'Issued') {
      return (
        <Alert status="success" borderRadius="md" mb={6} flexDirection="column" alignItems="center" textAlign="center">
          <AlertIcon boxSize="40px" mr={0} />
          <Heading size="md" mt={4} mb={1}>Congratulations!</Heading>
          <Text>You have been selected for this role.</Text>
        </Alert>
      );
    }

    if (application.final_select_status === 'Rejected') {
      return (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          Application Status: Rejected
        </Alert>
      );
    }

    return (
      <Alert status="warning" borderRadius="md" mb={6}>
        <AlertIcon />
        Application Status: {application.technical_round_status === 'Pending' ? 'In Progress' : 'Applied'}
      </Alert>
    );
  };

  const steps = [
    { title: 'Registration', description: 'Apply for the drive' },
    { title: 'Shortlisting', description: 'Resume screening' },
    { title: 'Assessments', description: 'Online tests' },
    { title: 'Interviews', description: 'Technical & HR' },
    { title: 'Offer', description: 'Final Selection' },
  ]

  const { activeStep } = useSteps({
    index: 1, // Dummy step for visualization
    count: steps.length,
  })

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

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Left Column: Company & Job Info */}
          <Box gridColumn={{ lg: "span 2" }}>
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

                <Heading size="md" mb={4} color="#20343c">Eligibility Criteria</Heading>
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
              </CardBody>
            </Card>
          </Box>

          {/* Right Column: Status & Timeline */}
          <Box>
            <Card variant="outline" mb={6} borderColor="gray.200">
              <CardHeader pb={0}>
                <Heading size="md" color="#20343c">Application Status</Heading>
              </CardHeader>
              <CardBody>
                {/* Status Alert */}
                {getStatusAlert()}
                
                {!application && (
                  <Button w="full" colorScheme="blue" size="lg" isDisabled={drive.placement_status !== "Open"}>
                    {drive.placement_status === "Open" ? "Apply Now" : "Applications Closed"}
                  </Button>
                )}
              </CardBody>
            </Card>

            <Card variant="outline" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" color="#20343c">Selection Process</Heading>
              </CardHeader>
              <CardBody>
                <Stepper index={activeStep} orientation="vertical" height="300px" gap="0">
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <StepIndicator>
                        <StepStatus
                          complete={<StepIcon />}
                          incomplete={<StepNumber />}
                          active={<StepNumber />}
                        />
                      </StepIndicator>

                      <Box flexShrink='0'>
                        <StepTitle>{step.title}</StepTitle>
                        <StepDescription>{step.description}</StepDescription>
                      </Box>

                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Container>
    </StudentProfileLayout>
  )
}