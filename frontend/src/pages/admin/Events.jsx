import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useToast,
  Link as ChakraLink,
  Container,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Spinner,
  Badge,
  Checkbox,
  SimpleGrid,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, SettingsIcon, DownloadIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const Events = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedJobProfile, setSelectedJobProfile] = useState('');

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    company_name: '',
    tpo: '',
    year: '',
    school: '',
    course: '',
    job_profile: ''
  });

  // Manage Drive State - Removed in favor of dedicated page
  // const { isOpen: isManageOpen, onOpen: onManageOpen, onClose: onManageClose } = useDisclosure();
  // const [selectedDrive, setSelectedDrive] = useState(null);
  // const [driveApplications, setDriveApplications] = useState([]);
  // const [loadingApps, setLoadingApps] = useState(false);

  // Report Generation State
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().getMonth().toString());
  const [selectedReportYear, setSelectedReportYear] = useState(new Date().getFullYear().toString());
  const [reportOptions, setReportOptions] = useState({
    jobOffers: true,
    companiesVisited: true,
    packageDetails: true
  });

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

  const handleManageClick = async (drive) => {
    navigate(`/placement/events/${drive.id}/registrations`);
  };

  const handleStatusChange = async (processId, field, newValue) => {
    try {
      await PlacementService.updateProcessStatus(processId, { [field]: newValue });
      toast({ title: "Status updated", status: "success", duration: 1000 });
      // Update local state
      setDriveApplications(prev => prev.map(app => 
        app.id === processId ? { ...app, [field]: newValue } : app
      ));
    } catch (error) {
      toast({ title: "Error updating status", status: "error" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    if (!newEvent.company_name || !newEvent.school) {
      toast({ title: "Company and School are required", status: "warning" });
      return;
    }

    try {
      await PlacementService.addPlacementDrive(newEvent);
      toast({ title: "Event added successfully", status: "success" });
      onClose();
      setNewEvent({
        company_name: '',
        tpo: '',
        year: '',
        school: '',
        course: '',
        job_profile: ''
      });
      fetchDrives();
    } catch (error) {
      toast({ title: "Error adding event", status: "error" });
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAllDrives();
      setDrives(data);
    } catch (error) {
      toast({
        title: "Error fetching events",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCompany('');
    setSelectedYear('');
    setSelectedSchool('');
    setSelectedJobProfile('');
  };

  // Report Generation Logic
  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const [allDrives, allOffers] = await Promise.all([
        PlacementService.getAllDrives(),
        PlacementService.getAllJobOffers()
      ]);

      const filteredDrives = allDrives.filter(drive => {
        if (!drive.event_datetime) return false;
        const date = new Date(drive.event_datetime);
        return date.getMonth().toString() === selectedReportMonth && 
               date.getFullYear().toString() === selectedReportYear;
      });

      const filteredOffers = allOffers.filter(offer => {
        if (!offer.created_at) return false;
        const date = new Date(offer.created_at);
        return date.getMonth().toString() === selectedReportMonth && 
               date.getFullYear().toString() === selectedReportYear;
      });

      const uniqueCompanies = [...new Set(filteredDrives.map(d => d.company_name))];
      
      // Calculate Summaries
      const totalDrives = filteredDrives.length;
      const totalOffers = filteredOffers.length;
      const highestPackage = filteredOffers.reduce((max, o) => Math.max(max, parseFloat(o.ctc_max_lpa || o.ctc || 0)), 0);
      const avgPackage = filteredOffers.length > 0 
        ? (filteredOffers.reduce((sum, o) => sum + parseFloat(o.ctc_min_lpa || o.ctc || 0), 0) / filteredOffers.length).toFixed(2)
        : 0;

      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ["Monthly Placement Report"],
        ["Period", `${months.find(m => m.value === selectedReportMonth).label} ${selectedReportYear}`],
        ["Generated On", new Date().toLocaleDateString()],
        [],
        ["Metric", "Count/Value"],
        ["Companies Visited", uniqueCompanies.length],
        ["Total Drives Conducted", totalDrives],
        ["Total Job Offers", totalOffers],
        ["Highest Package (LPA)", highestPackage],
        ["Average Package (LPA)", avgPackage]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // Sheet 2: Job Offers
      if (reportOptions.jobOffers) {
        const offerData = filteredOffers.map(o => ({
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

      // Sheet 3: Drives
      if (reportOptions.companiesVisited) {
        const driveData = filteredDrives.map(d => ({
          Company: d.company_name,
          "Job Profile": d.job_profile,
          Date: new Date(d.event_datetime).toLocaleDateString(),
          "Eligibility": d.school,
          "Package": reportOptions.packageDetails ? (d.ctc || d.ctc_structure?.total) : "N/A"
        }));
        if (driveData.length > 0) {
          const wsDrives = XLSX.utils.json_to_sheet(driveData);
          XLSX.utils.book_append_sheet(wb, wsDrives, "Drives Conducted");
        }
      }

      XLSX.writeFile(wb, `Placement_Report_${months.find(m => m.value === selectedReportMonth).label}_${selectedReportYear}.xlsx`);
      toast({ title: "Report Generated & Downloaded", status: "success" });
      onReportClose();

    } catch (error) {
      console.error(error);
      toast({ title: "Error generating report", status: "error" });
    } finally {
      setReportLoading(false);
    }
  };

  // Derive unique values for filters
  const companies = [...new Set(drives.map(d => d.company_name).filter(Boolean))];
  const derivedYears = [...new Set(drives.map(d => d.year).filter(Boolean))];
  const schools = [...new Set(drives.map(d => d.school).filter(Boolean))];
  const jobProfiles = [...new Set(drives.map(d => d.job_profile).filter(Boolean))];

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = 
      drive.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.job_profile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(drive.year).includes(searchQuery);

    const matchesCompany = selectedCompany ? drive.company_name === selectedCompany : true;
    const matchesYear = selectedYear ? String(drive.year) === String(selectedYear) : true;
    const matchesSchool = selectedSchool ? drive.school === selectedSchool : true;
    const matchesJobProfile = selectedJobProfile ? drive.job_profile === selectedJobProfile : true;

    return matchesSearch && matchesCompany && matchesYear && matchesSchool && matchesJobProfile;
  });

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          {/* Header */}
          <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.800">Placement Drives</Heading>
              <Text color="gray.500" fontSize="sm">All placements table details with links to companies</Text>
            </Box>
            <HStack spacing={3}>
              <Button 
                colorScheme="blue" 
                variant="solid" 
                leftIcon={<DownloadIcon />} 
                onClick={onReportOpen}
                size="sm"
              >
                Monthly Report
              </Button>
              <Button 
                bg="#22c35e" 
                color="white" 
                _hover={{ bg: "#1da851" }}
                leftIcon={<AddIcon boxSize={3} />}
                onClick={onOpen}
                size="sm"
              >
                Add Drive
              </Button>
            </HStack>
          </Flex>

          {/* Filters */}
          <Box bg="white" p={4} borderRadius="lg" shadow="sm" mb={6}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
                <Input placeholder="Search drives..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </InputGroup>
              <Select placeholder="All Companies" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select placeholder="All Years" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {derivedYears.map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Select placeholder="All Schools" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                {schools.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              {/* Clear Filters Button */}
              <Button onClick={handleClearFilters} variant="ghost" colorScheme="red" size="sm">Clear Filters</Button>
            </SimpleGrid>
          </Box>

          {/* Table */}
          <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Company</Th>
                    <Th>Registrations</Th>
                    <Th>Job Profile</Th>
                    <Th>Date</Th>
                    <Th>Eligibility</Th>
                    <Th>Package (CTC)</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    <Tr><Td colSpan={7} textAlign="center"><Spinner /></Td></Tr>
                  ) : filteredDrives.length === 0 ? (
                    <Tr><Td colSpan={7} textAlign="center">No drives found</Td></Tr>
                  ) : (
                    filteredDrives.map((drive) => (
                      <Tr key={drive.id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="medium" color="#2c5282">{drive.company_name}</Td>
                        <Td>
                          <Button 
                            size="xs" 
                            colorScheme="blue" 
                            onClick={() => handleManageClick(drive)}
                          >
                            View Registrations
                          </Button>
                        </Td>
                        <Td>{drive.job_profile}</Td>
                        <Td>{new Date(drive.event_datetime).toLocaleDateString()}</Td>
                        <Td>{drive.school}</Td>
                        <Td>{drive.ctc || drive.ctc_structure?.total || "N/A"}</Td>
                        <Td><Badge colorScheme="green">Active</Badge></Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Container>

        {/* Add Drive Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Placement Drive</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Company Name</FormLabel>
                  <Input name="company_name" value={newEvent.company_name} onChange={handleInputChange} placeholder="e.g. Google" />
                </FormControl>
                <HStack w="100%">
                   <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Input name="year" value={newEvent.year} onChange={handleInputChange} placeholder="2024" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>School/Department</FormLabel>
                    <Input name="school" value={newEvent.school} onChange={handleInputChange} placeholder="CSE" />
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel>Job Profile</FormLabel>
                  <Input name="job_profile" value={newEvent.job_profile} onChange={handleInputChange} placeholder="Software Engineer" />
                </FormControl>
                {/* Additional fields could be added here */}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleAddEvent}>Save Drive</Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Manage Drive Modal - REMOVED (Moved to dedicated page) */}

        {/* Report Generation Modal */}
        <Modal isOpen={isReportOpen} onClose={onReportClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Generate Monthly Report</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="bold" fontSize="sm">Select Period</Text>
                  <HStack>
                    <Select value={selectedReportMonth} onChange={(e) => setSelectedReportMonth(e.target.value)}>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </Select>
                    <Select value={selectedReportYear} onChange={(e) => setSelectedReportYear(e.target.value)}>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                  </HStack>
                </Box>
                <Divider />
                <Box>
                  <Text mb={2} fontWeight="bold" fontSize="sm">Include Data</Text>
                  <VStack align="start" spacing={2}>
                    <Checkbox 
                      isChecked={reportOptions.jobOffers} 
                      onChange={(e) => setReportOptions(prev => ({ ...prev, jobOffers: e.target.checked }))}
                      colorScheme="green"
                    >
                      Job Offers
                    </Checkbox>
                    <Checkbox 
                      isChecked={reportOptions.companiesVisited} 
                      onChange={(e) => setReportOptions(prev => ({ ...prev, companiesVisited: e.target.checked }))}
                      colorScheme="green"
                    >
                      Companies Visited
                    </Checkbox>
                    <Checkbox 
                      isChecked={reportOptions.packageDetails} 
                      onChange={(e) => setReportOptions(prev => ({ ...prev, packageDetails: e.target.checked }))}
                      colorScheme="green"
                    >
                      Package Details
                    </Checkbox>
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button 
                colorScheme="blue" 
                onClick={handleGenerateReport}
                isLoading={reportLoading}
                loadingText="Generating..."
              >
                Download Report
              </Button>
              <Button onClick={onReportClose} ml={3}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Box>
    </AdminLayout>
  );
};

export default Events;
