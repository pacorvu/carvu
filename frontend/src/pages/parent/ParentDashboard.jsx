import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Badge,
  HStack,
  VStack,
  Spinner,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, StarIcon, InfoIcon } from '@chakra-ui/icons';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const fetchData = async () => {
      if (user?.childUsn) {
        try {
          const result = await PlacementService.getParentChildData(user.childUsn);
          setData(result);
        } catch (error) {
          console.error("Error fetching child data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!data) return <Text>No data available.</Text>;

  const { student, offers, internships, projects } = data;

  return (
    <Box pb={10}>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2}>Welcome, {user.name}</Heading>
        <Text color={textColor}>Here is the academic and placement overview for your child, <b>{student.name} ({student.usn})</b>.</Text>
      </Box>

      {/* Academic Snapshot */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Current CGPA</StatLabel>
              <StatNumber fontSize="3xl" color="blue.600">{student.cgpa}</StatNumber>
              <StatHelpText>Excellent Performance</StatHelpText>
            </Stat>
            <Progress value={student.cgpa * 10} size="xs" colorScheme="blue" mt={3} borderRadius="full" />
          </CardBody>
        </Card>
        <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Attendance</StatLabel>
              <StatNumber fontSize="3xl" color={student.attendance > 85 ? "green.500" : "orange.500"}>{student.attendance}%</StatNumber>
              <StatHelpText>Total Classes Attended</StatHelpText>
            </Stat>
            <Progress value={student.attendance} size="xs" colorScheme={student.attendance > 85 ? "green" : "orange"} mt={3} borderRadius="full" />
          </CardBody>
        </Card>
        <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Placement Status</StatLabel>
              <StatNumber fontSize="3xl" color={offers.length > 0 ? "purple.600" : "gray.600"}>
                {offers.length > 0 ? "Placed" : "Open"}
              </StatNumber>
              <StatHelpText>{offers.length} Offer(s) Received</StatHelpText>
            </Stat>
            {offers.length > 0 && (
                <HStack mt={2}>
                    {offers.map((o, i) => (
                        <Badge key={i} colorScheme="purple">{o.company}</Badge>
                    ))}
                </HStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Detailed Sections */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        
        {/* Placement Offers */}
        <Box>
            <Heading size="md" mb={4}>Placement & Internship Offers</Heading>
            {offers.length > 0 ? (
                <VStack spacing={4} align="stretch">
                    {offers.map((offer, idx) => (
                        <Card key={idx} bg={cardBg} boxShadow="sm" borderLeft="4px solid" borderColor="green.400">
                            <CardBody>
                                <Flex justify="space-between" align="start">
                                    <Box>
                                        <Heading size="sm" mb={1}>{offer.company}</Heading>
                                        <Text fontSize="sm" fontWeight="bold" color="gray.600">{offer.role}</Text>
                                        <Text fontSize="xs" color="gray.500">CTC: {offer.ctc}</Text>
                                    </Box>
                                    <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>OFFERED</Badge>
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            ) : (
                <Card bg={cardBg} p={6} borderStyle="dashed" borderWidth="2px" borderColor="gray.200">
                    <Flex direction="column" align="center" color="gray.500">
                        <TimeIcon boxSize={8} mb={3} />
                        <Text>No offers received yet.</Text>
                    </Flex>
                </Card>
            )}
        </Box>

        {/* Child's Projects */}
        <Box>
            <Heading size="md" mb={4}>Student Projects</Heading>
            {projects.length > 0 ? (
                 <VStack spacing={4} align="stretch">
                    {projects.map((project, idx) => (
                        <Card key={idx} bg={cardBg} boxShadow="sm">
                            <CardBody>
                                <HStack align="start" spacing={4}>
                                    <Box 
                                        minW="50px" 
                                        h="50px" 
                                        bg="blue.100" 
                                        borderRadius="md" 
                                        display="flex" 
                                        alignItems="center" 
                                        justifyContent="center"
                                        color="blue.600"
                                    >
                                        <StarIcon />
                                    </Box>
                                    <Box>
                                        <Heading size="sm" noOfLines={1}>{project.title}</Heading>
                                        <Text fontSize="xs" color="gray.500" mb={2}>{project.domain}</Text>
                                        <Text fontSize="sm" noOfLines={2} color={textColor}>
                                            {project.description}
                                        </Text>
                                    </Box>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                 </VStack>
            ) : (
                <Card bg={cardBg} p={6} borderStyle="dashed" borderWidth="2px" borderColor="gray.200">
                    <Flex direction="column" align="center" color="gray.500">
                        <InfoIcon boxSize={8} mb={3} />
                        <Text>No projects uploaded yet.</Text>
                    </Flex>
                </Card>
            )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default ParentDashboard;
