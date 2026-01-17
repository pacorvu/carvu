import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Spinner,
  useColorModeValue,
  HStack,
  Button
} from '@chakra-ui/react';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const DeanDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.school) {
        try {
          const result = await PlacementService.getDeanStats(user.school);
          setData(result);
        } catch (error) {
          console.error("Error fetching dean stats:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  // Hook calls at top level
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.800');

  const handleExport = () => {
      if (!data) return;

      const excelData = data.stats.rows.map(row => ({
          Course: row.course,
          Year: row.year,
          'Batch Strength': row.strength,
          'Placement Mode': row.mode,
          'Trained': row.trained,
          'Opted In': row.opted,
          'Placed': row.placed
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${user.school}_Detailed_Report`);
      XLSX.writeFile(wb, `${user.school}_Placement_Report.xlsx`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!data) {
      return <Text>No data available for your school.</Text>;
  }

  const { totals, stats, companies } = data;
  const { salary } = stats;

  return (
    <Box pb={10}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>{user.school} Placement Dashboard</Heading>
        <Text color={textColor}>School Dean View - Real-time Analytics</Text>
      </Box>

      {/* KPI Cards - Top Row (Aggregates) */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="blue.500">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Total Students</StatLabel>
              <StatNumber fontSize="3xl">{totals.strength}</StatNumber>
              <StatHelpText>Enrolled in School</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="orange.400">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Opted In</StatLabel>
              <StatNumber fontSize="3xl">{totals.opted}</StatNumber>
              <StatHelpText>
                {totals.strength > 0 ? ((totals.opted / totals.strength) * 100).toFixed(1) : 0}% Participation
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="green.500">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Total Placed</StatLabel>
              <StatNumber fontSize="3xl">{totals.placed}</StatNumber>
              <StatHelpText>
                {totals.opted > 0 ? ((totals.placed / totals.opted) * 100).toFixed(1) : 0}% Conversion
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="purple.500">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Paid Internships</StatLabel>
              <StatNumber fontSize="3xl">{totals.internship}</StatNumber>
              <StatHelpText>Students with Stipend</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Salary & Metrics Row */}
      <Card bg={cardBg} boxShadow="lg" mb={8}>
          <CardBody>
              <Heading size="md" mb={6}>CTC Metrics & Opportunities</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} textAlign="center">
                  <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>Highest Package</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">₹{salary.max} LPA</Text>
                  </Box>
                  <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>Average Package</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">₹{salary.avg} LPA</Text>
                  </Box>
                  <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>Paid Internships (Detailed)</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">{salary.paidInternships}</Text>
                  </Box>
              </SimpleGrid>
          </CardBody>
      </Card>

      {/* Detailed Table */}
      <Card bg={cardBg} boxShadow="lg">
        <CardBody>
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md">Detailed Breakdown by Course</Heading>
            <Button 
                leftIcon={<FiDownload />} 
                colorScheme="green" 
                size="sm" 
                onClick={handleExport}
            >
                Download Report
            </Button>
          </Flex>
          
          <Box overflowX="auto">
            <Table variant="striped" size="sm" colorScheme="gray">
                <Thead bg={headerBg}>
                <Tr>
                    <Th>Course</Th>
                    <Th>Year</Th>
                    <Th isNumeric>Batch Strength</Th>
                    <Th>Placement Mode</Th>
                    <Th>Trained</Th>
                    <Th isNumeric>Opted In</Th>
                    <Th isNumeric>Placed</Th>
                </Tr>
                </Thead>
                <Tbody>
                {stats.rows.map((row, idx) => (
                    <Tr key={idx}>
                    <Td fontWeight="medium">{row.course}</Td>
                    <Td>{row.year}</Td>
                    <Td isNumeric>{row.strength}</Td>
                    <Td>{row.mode}</Td>
                    <Td>{row.trained}</Td>
                    <Td isNumeric>{row.opted}</Td>
                    <Td isNumeric fontWeight={row.placed !== '-' ? 'bold' : 'normal'}>
                        {row.placed}
                    </Td>
                    </Tr>
                ))}
                </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Visited Companies Section */}
      <Box mt={8}>
          <Heading size="md" mb={6}>Visited Companies & Recruiters</Heading>
          {companies && companies.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={6}>
                  {companies.map((company, index) => (
                      <Card key={index} bg={cardBg} boxShadow="md" _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
                          <CardBody>
                              <Flex align="center" mb={3}>
                                  <Box 
                                      w="40px" 
                                      h="40px" 
                                      bg={company.color || 'gray.200'} 
                                      borderRadius="md" 
                                      mr={3} 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center"
                                      fontWeight="bold"
                                      color="white"
                                  >
                                      {company.company_name ? company.company_name.substring(0, 1) : 'C'}
                                  </Box>
                                  <Box overflow="hidden">
                                      <Heading size="sm" noOfLines={1}>{company.company_name}</Heading>
                                      <Text fontSize="xs" color="gray.500">{company.company_type}</Text>
                                  </Box>
                              </Flex>
                              <HStack spacing={2} mb={2}>
                                  {company.remarks1 && <Badge colorScheme="green" fontSize="0.7em">{company.remarks1}</Badge>}
                              </HStack>
                              <Text fontSize="sm" color={textColor} noOfLines={2}>
                                  {company.description}
                              </Text>
                          </CardBody>
                      </Card>
                  ))}
              </SimpleGrid>
          ) : (
              <Text color="gray.500">No company data available for this school yet.</Text>
          )}
      </Box>
    </Box>
  );
};

export default DeanDashboard;
