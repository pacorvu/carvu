import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Select,
  Checkbox,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  Divider,
  useToast,
  Icon,
  Badge,
  Flex
} from '@chakra-ui/react';
import { DownloadIcon, CalendarIcon } from '@chakra-ui/icons';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const Reports = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [includeOptions, setIncludeOptions] = useState({
    jobOffers: true,
    companiesVisited: true,
    packageDetails: true,
    companyNames: true
  });

  // Data State
  const [reportData, setReportData] = useState(null);

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  const years = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1
  ];

  const handleOptionChange = (option) => {
    setIncludeOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // 1. Fetch Data
      const [allDrives, allOffers] = await Promise.all([
        PlacementService.getAllDrives(),
        PlacementService.getAllJobOffers()
      ]);

      // 2. Filter by Date
      const filteredDrives = allDrives.filter(drive => {
        if (!drive.event_datetime) return false;
        const date = new Date(drive.event_datetime);
        return date.getMonth().toString() === selectedMonth && 
               date.getFullYear().toString() === selectedYear;
      });

      const filteredOffers = allOffers.filter(offer => {
        if (!offer.created_at) return false; // Assuming created_at tracks when offer was made
        const date = new Date(offer.created_at);
        return date.getMonth().toString() === selectedMonth && 
               date.getFullYear().toString() === selectedYear;
      });

      // 3. Aggregate Data
      const uniqueCompanies = [...new Set(filteredDrives.map(d => d.company_name))];
      
      const data = {
        month: months.find(m => m.value === selectedMonth).label,
        year: selectedYear,
        summary: {
          totalDrives: filteredDrives.length,
          totalOffers: filteredOffers.length,
          uniqueCompanies: uniqueCompanies.length,
          highestPackage: filteredOffers.reduce((max, o) => Math.max(max, parseFloat(o.ctc_max_lpa || o.ctc || 0)), 0),
          avgPackage: filteredOffers.length > 0 
            ? (filteredOffers.reduce((sum, o) => sum + parseFloat(o.ctc_min_lpa || o.ctc || 0), 0) / filteredOffers.length).toFixed(2)
            : 0
        },
        drives: filteredDrives,
        offers: filteredOffers,
        companies: uniqueCompanies
      };

      setReportData(data);
      toast({ title: "Report Generated", status: "success", duration: 2000 });

    } catch (error) {
      console.error(error);
      toast({ title: "Error generating report", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      ["Monthly Placement Report"],
      ["Period", `${reportData.month} ${reportData.year}`],
      ["Generated On", new Date().toLocaleDateString()],
      [],
      ["Metric", "Count/Value"],
      ["Companies Visited", reportData.summary.uniqueCompanies],
      ["Total Drives Conducted", reportData.summary.totalDrives],
      ["Total Job Offers", reportData.summary.totalOffers],
      ["Highest Package (LPA)", reportData.summary.highestPackage],
      ["Average Package (LPA)", reportData.summary.avgPackage]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Sheet 2: Job Offers (if selected)
    if (includeOptions.jobOffers) {
      const offerData = reportData.offers.map(o => ({
        USN: o.usn,
        Student: o.student_name,
        Company: o.company_name,
        Designation: o.designation,
        "Job Type": o.job_type,
        "CTC (LPA)": o.ctc_min_lpa || o.ctc,
        Status: o.offer_letter_status
      }));
      if (offerData.length > 0) {
        const wsOffers = XLSX.utils.json_to_sheet(offerData);
        XLSX.utils.book_append_sheet(wb, wsOffers, "Job Offers");
      }
    }

    // Sheet 3: Drives/Companies (if selected)
    if (includeOptions.companiesVisited) {
      const driveData = reportData.drives.map(d => ({
        Company: d.company_name,
        "Job Profile": d.job_profile,
        Date: new Date(d.event_datetime).toLocaleDateString(),
        "Job Type": d.job_type,
        "Eligibility": d.school,
        "CTC": d.ctc || d.ctc_structure?.total
      }));
      if (driveData.length > 0) {
        const wsDrives = XLSX.utils.json_to_sheet(driveData);
        XLSX.utils.book_append_sheet(wb, wsDrives, "Drives Conducted");
      }
    }

    XLSX.writeFile(wb, `Placement_Report_${reportData.month}_${reportData.year}.xlsx`);
    toast({ title: "Report Downloaded", status: "success" });
  };

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          
          <Flex mb={6} justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="gray.800">Monthly Reports</Heading>
              <Text color="gray.500">Generate and download placement reports</Text>
            </Box>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {/* Configuration Card */}
            <Card bg="white" shadow="sm" borderRadius="xl" gridColumn={{ md: "span 1" }}>
              <CardHeader pb={0}>
                <Heading size="md" color="gray.700">Report Settings</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="bold" fontSize="sm">Select Period</Text>
                    <HStack>
                      <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </Select>
                      <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </Select>
                    </HStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Text mb={2} fontWeight="bold" fontSize="sm">Include Data</Text>
                    <VStack align="start" spacing={2}>
                      <Checkbox 
                        isChecked={includeOptions.jobOffers} 
                        onChange={() => handleOptionChange('jobOffers')}
                        colorScheme="green"
                      >
                        Job Offers
                      </Checkbox>
                      <Checkbox 
                        isChecked={includeOptions.companiesVisited} 
                        onChange={() => handleOptionChange('companiesVisited')}
                        colorScheme="green"
                      >
                        Companies Visited
                      </Checkbox>
                      <Checkbox 
                        isChecked={includeOptions.packageDetails} 
                        onChange={() => handleOptionChange('packageDetails')}
                        colorScheme="green"
                      >
                        Package Details
                      </Checkbox>
                    </VStack>
                  </Box>

                  <Button 
                    colorScheme="blue" 
                    bg="#172e36" 
                    _hover={{ bg: "#2a4d5c" }}
                    onClick={generateReport}
                    isLoading={loading}
                    loadingText="Generating..."
                    mt={4}
                    width="100%"
                  >
                    Generate Report
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Preview Section */}
            <Box gridColumn={{ md: "span 2" }}>
              {reportData ? (
                <VStack spacing={6} align="stretch">
                  {/* Summary Cards */}
                  <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4}>
                    <Card bg="white" shadow="sm" borderRadius="lg" borderTop="4px solid #22c35e">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">OFFERS</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">{reportData.summary.totalOffers}</Text>
                      </CardBody>
                    </Card>
                    <Card bg="white" shadow="sm" borderRadius="lg" borderTop="4px solid #3182ce">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">COMPANIES</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">{reportData.summary.uniqueCompanies}</Text>
                      </CardBody>
                    </Card>
                    <Card bg="white" shadow="sm" borderRadius="lg" borderTop="4px solid #d69e2e">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">HIGHEST CTC</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">{reportData.summary.highestPackage}</Text>
                      </CardBody>
                    </Card>
                    <Card bg="white" shadow="sm" borderRadius="lg" borderTop="4px solid #805ad5">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">AVG CTC</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">{reportData.summary.avgPackage}</Text>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Detailed Tables Preview */}
                  <Card bg="white" shadow="sm" borderRadius="xl">
                    <CardHeader display="flex" justifyContent="space-between" alignItems="center">
                      <Heading size="md" fontSize="lg">Report Preview: {reportData.month} {reportData.year}</Heading>
                      <Button 
                        leftIcon={<DownloadIcon />} 
                        colorScheme="green" 
                        variant="solid"
                        onClick={downloadExcel}
                        size="sm"
                      >
                        Download Excel
                      </Button>
                    </CardHeader>
                    <CardBody>
                      {includeOptions.jobOffers && (
                        <Box mb={6}>
                          <Text fontWeight="bold" mb={2} color="gray.600">Recent Offers</Text>
                          <Box overflowX="auto">
                            <Table size="sm" variant="simple">
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th>Student</Th>
                                  <Th>Company</Th>
                                  <Th>Role</Th>
                                  <Th isNumeric>CTC</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {reportData.offers.slice(0, 5).map((offer, i) => (
                                  <Tr key={i}>
                                    <Td>{offer.student_name}</Td>
                                    <Td>{offer.company_name}</Td>
                                    <Td>{offer.designation}</Td>
                                    <Td isNumeric>{offer.ctc_min_lpa || offer.ctc}</Td>
                                  </Tr>
                                ))}
                                {reportData.offers.length === 0 && (
                                  <Tr><Td colSpan={4} textAlign="center">No offers this month</Td></Tr>
                                )}
                              </Tbody>
                            </Table>
                          </Box>
                          {reportData.offers.length > 5 && (
                            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                              And {reportData.offers.length - 5} more offers...
                            </Text>
                          )}
                        </Box>
                      )}

                      {includeOptions.companiesVisited && (
                        <Box>
                          <Text fontWeight="bold" mb={2} color="gray.600">Companies Visited</Text>
                          <Box overflowX="auto">
                            <Table size="sm" variant="simple">
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th>Company</Th>
                                  <Th>Date</Th>
                                  <Th>Profile</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {reportData.drives.slice(0, 5).map((drive, i) => (
                                  <Tr key={i}>
                                    <Td fontWeight="medium">{drive.company_name}</Td>
                                    <Td>{new Date(drive.event_datetime).toLocaleDateString()}</Td>
                                    <Td>{drive.job_profile}</Td>
                                  </Tr>
                                ))}
                                {reportData.drives.length === 0 && (
                                  <Tr><Td colSpan={3} textAlign="center">No drives this month</Td></Tr>
                                )}
                              </Tbody>
                            </Table>
                          </Box>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              ) : (
                <Flex 
                  bg="white" 
                  h="100%" 
                  minH="300px" 
                  borderRadius="xl" 
                  align="center" 
                  justify="center" 
                  direction="column"
                  color="gray.400"
                  shadow="sm"
                  border="2px dashed"
                  borderColor="gray.200"
                >
                  <Icon as={CalendarIcon} boxSize={10} mb={4} />
                  <Text fontSize="lg">Select options and click Generate Report</Text>
                </Flex>
              )}
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default Reports;
