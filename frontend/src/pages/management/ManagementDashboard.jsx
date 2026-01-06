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
  CardHeader,
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
  Icon,
  Progress,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  HStack,
  Button
} from '@chakra-ui/react';
import { PlacementService } from '../../services/placement.service';
import { FiTrendingUp, FiUsers, FiBriefcase, FiPieChart, FiBarChart2, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ManagementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    schoolSummary: [],
    detailedStats: {},
    grandTotal: { strength: 0, opted: 0, placed: 0 },
    ctcMetrics: { max: 0, min: 0, avg: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await PlacementService.getManagementStats();
        setData(result);
      } catch (error) {
        console.error("Error fetching management stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const totalRowBg = useColorModeValue('blue.50', 'blue.900');

  // Excel Export Functions
  const handleExportSummary = () => {
    // 1. Prepare Data
    const excelData = data.schoolSummary.map(row => ({
      School: row.school,
      'Total Strength': row.strength,
      'Opted': row.opted,
      'Full Time': row.fullTime,
      'Internship': row.internship,
      'PPO': row.ppo,
      'Total Placed': row.total,
      'Unplaced': row.opted - row.total
    }));

    // Add Grand Total
    excelData.push({
      School: 'Grand Total',
      'Total Strength': data.grandTotal.strength,
      'Opted': data.grandTotal.opted,
      'Full Time': data.grandTotal.fullTime,
      'Internship': data.grandTotal.internship,
      'PPO': data.grandTotal.ppo,
      'Total Placed': data.grandTotal.placed,
      'Unplaced': data.grandTotal.opted - data.grandTotal.placed
    });

    // 2. Create Workbook and Worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Summary Report");

    // 3. Save File
    XLSX.writeFile(wb, "Placement_Summary_Report.xlsx");
  };

  const handleExportDetailed = () => {
    const excelData = [];

    // Flatten detailed stats
    Object.entries(data.detailedStats).forEach(([schoolName, schoolData]) => {
      schoolData.rows.forEach(row => {
        excelData.push({
          School: schoolName,
          Course: row.course,
          Year: row.year,
          'Batch Strength': row.strength,
          'Placement Mode': row.mode,
          'Trained': row.trained,
          'Opted In': row.opted,
          'Placed': row.placed
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detailed Breakdown");

    XLSX.writeFile(wb, "Placement_Detailed_Report.xlsx");
  };

  // Chart Data Preparation
  const barChartData = {
    labels: data.schoolSummary.map(s => s.school),
    datasets: [
      {
        label: 'Total Strength',
        data: data.schoolSummary.map(s => s.strength),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Opted for Placement',
        data: data.schoolSummary.map(s => s.opted),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
      {
        label: 'Placed',
        data: data.schoolSummary.map(s => s.total),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Full Time', 'Internship', 'PPO'],
    datasets: [
      {
        data: [
          data.grandTotal.fullTime,
          data.grandTotal.internship,
          data.grandTotal.ppo
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box pb={10}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>Placement Analytics & Insights</Heading>
        <Text color={textColor}>Real-time dashboard as of {new Date().toLocaleDateString()}</Text>
      </Box>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="blue.500">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Total Strength</StatLabel>
              <StatNumber fontSize="3xl">{data.grandTotal.strength}</StatNumber>
              <StatHelpText>Across all schools</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="orange.400">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Opted for Placement</StatLabel>
              <StatNumber fontSize="3xl">{data.grandTotal.opted}</StatNumber>
              <StatHelpText>
                {((data.grandTotal.opted / data.grandTotal.strength) * 100).toFixed(1)}% Participation
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="green.500">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Total Placed</StatLabel>
              <StatNumber fontSize="3xl">{data.grandTotal.placed}</StatNumber>
              <StatHelpText>
                {((data.grandTotal.placed / data.grandTotal.opted) * 100).toFixed(1)}% Conversion Rate
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} boxShadow="md" borderLeft="4px solid" borderColor="purple.500">
          <CardBody>
            <Stat>
              <StatLabel fontSize="md" color="gray.500">Paid Internships</StatLabel>
              <StatNumber fontSize="3xl">
                {/* Summing up paid internships from detailed stats manually for KPI */}
                {Object.values(data.detailedStats).reduce((acc, curr) => acc + (curr.salary?.paidInternships || 0), 0)}
              </StatNumber>
              <StatHelpText>Students with Stipend</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mb={10}>
        <Card bg={cardBg} boxShadow="lg" gridColumn={{ lg: "span 2" }}>
          <CardHeader>
            <Heading size="md">School-wise Performance Overview</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <Bar 
                data={barChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                  }
                }} 
              />
            </Box>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} boxShadow="lg">
          <CardHeader>
            <Heading size="md">Placement Type Distribution</Heading>
          </CardHeader>
          <CardBody display="flex" justifyContent="center" alignItems="center">
            <Box height="250px" width="250px">
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                  }
                }}
              />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Detailed Report Tabs */}
      <Card bg={cardBg} boxShadow="lg">
        <Tabs isFitted variant="enclosed" colorScheme="blue">
          <TabList mb="1em">
            <Tab fontWeight="bold">Summary Report</Tab>
            <Tab fontWeight="bold">Detailed Breakdown</Tab>
          </TabList>
          
          <TabPanels>
            {/* Tab 1: Summary Table (Image 2) */}
            <TabPanel>
              <Flex justify="flex-end" mb={4}>
                <Button 
                  leftIcon={<FiDownload />} 
                  colorScheme="green" 
                  size="sm" 
                  onClick={handleExportSummary}
                >
                  Download Summary Excel
                </Button>
              </Flex>
              <Table variant="simple" size="sm">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>School</Th>
                    <Th isNumeric>Total Strength</Th>
                    <Th isNumeric>Opted</Th>
                    <Th isNumeric>Full Time</Th>
                    <Th isNumeric>Internship</Th>
                    <Th isNumeric>PPO</Th>
                    <Th isNumeric>Total Placed</Th>
                    <Th isNumeric>Unplaced</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.schoolSummary.map((row) => (
                    <Tr key={row.id}>
                      <Td fontWeight="medium">{row.school}</Td>
                      <Td isNumeric>{row.strength}</Td>
                      <Td isNumeric>{row.opted}</Td>
                      <Td isNumeric>{row.fullTime}</Td>
                      <Td isNumeric>{row.internship}</Td>
                      <Td isNumeric>{row.ppo}</Td>
                      <Td isNumeric fontWeight="bold" color="green.500">{row.total}</Td>
                      <Td isNumeric color="red.400">{row.opted - row.total}</Td>
                    </Tr>
                  ))}
                  {/* Grand Total Row */}
                  <Tr bg={totalRowBg} fontWeight="bold">
                    <Td>Grand Total</Td>
                    <Td isNumeric>{data.grandTotal.strength}</Td>
                    <Td isNumeric>{data.grandTotal.opted}</Td>
                    <Td isNumeric>{data.grandTotal.fullTime}</Td>
                    <Td isNumeric>{data.grandTotal.internship}</Td>
                    <Td isNumeric>{data.grandTotal.ppo}</Td>
                    <Td isNumeric color="green.600">{data.grandTotal.placed}</Td>
                    <Td isNumeric color="red.500">{data.grandTotal.opted - data.grandTotal.placed}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TabPanel>

            {/* Tab 2: Detailed Breakdown (Image 1) */}
            <TabPanel>
              <Flex justify="flex-end" mb={4}>
                <Button 
                  leftIcon={<FiDownload />} 
                  colorScheme="green" 
                  size="sm" 
                  onClick={handleExportDetailed}
                >
                  Download Detailed Excel
                </Button>
              </Flex>
              {Object.entries(data.detailedStats).map(([schoolName, schoolData]) => (
                <Box key={schoolName} mb={8} borderBottom="1px solid" borderColor={borderColor} pb={6}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="blue.600">{schoolName}</Heading>
                    
                    {/* Salary Stats for this School */}
                    <HStack spacing={4}>
                      <Badge colorScheme="green" p={2} borderRadius="md">
                        Max: ₹{schoolData.salary.max} LPA
                      </Badge>
                      <Badge colorScheme="blue" p={2} borderRadius="md">
                        Avg: ₹{schoolData.salary.avg} LPA
                      </Badge>
                      <Badge colorScheme="purple" p={2} borderRadius="md">
                        Paid Internships: {schoolData.salary.paidInternships}
                      </Badge>
                    </HStack>
                  </Flex>

                  <Table variant="striped" size="sm" colorScheme="gray">
                    <Thead>
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
                      {schoolData.rows.map((row, idx) => (
                        <Tr key={idx}>
                          <Td>{row.course}</Td>
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
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default ManagementDashboard;
