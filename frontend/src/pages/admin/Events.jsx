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
  Divider,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
// Force refresh
import { SearchIcon, AddIcon, SettingsIcon, DownloadIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { BsLayoutThreeColumns } from 'react-icons/bs';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const Events = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Column Visibility State
  const baseColumns = [
    { id: 'company', label: 'Company' },
    { id: 'registrations', label: 'Registrations' },
    { id: 'jobProfile', label: 'Job Profile' },
    { id: 'date', label: 'Date' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'package', label: 'Package (CTC)' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

  const columnGroups = [
    {
      id: 'core_details',
      label: 'Core Details',
      columns: [
        { id: 'id', label: 'ID' },
        { id: 'company', label: 'Company Name' },
        { id: 'jobProfile', label: 'Job Profile' },
        { id: 'job_type', label: 'Job Type' },
        { id: 'job_location', label: 'Job Location' },
        { id: 'job_description', label: 'Job Description' },
        { id: 'type_of_hiring', label: 'Type of Hiring' },
        { id: 'actions', label: 'Actions' },
      ],
    },
    {
      id: 'schedule_status',
      label: 'Schedule & Status',
      columns: [
        { id: 'date', label: 'Date' },
        { id: 'event_datetime', label: 'Event Datetime' },
        { id: 'last_date_to_registration', label: 'Last Date to Reg' },
        { id: 'onboarded_date', label: 'Onboarded Date' },
        { id: 'status', label: 'Status' },
        { id: 'placement_status', label: 'Placement Status (Raw)' },
        { id: 'offer_letter_status', label: 'Offer Letter Status' },
        { id: 'created_at', label: 'Created At' },
        { id: 'updated_at', label: 'Updated At' },
      ],
    },
    {
      id: 'compensation_eligibility',
      label: 'Compensation & Eligibility',
      columns: [
        { id: 'package', label: 'Package (CTC)' },
        { id: 'ctc_structure', label: 'CTC Structure (JSON)' },
        { id: 'stipend_structure', label: 'Stipend Structure (JSON)' },
        { id: 'eligibility', label: 'Eligibility' },
        { id: 'eligibility_academics', label: 'Eligibility Academics (JSON)' },
        { id: 'year', label: 'Year' },
      ],
    },
    {
      id: 'registration_stats',
      label: 'Registration & Stats',
      columns: [
        { id: 'registrations', label: 'Registrations' },
        { id: 'number_of_registrations', label: 'No. Registrations (Raw)' },
        { id: 'no_shortlisted', label: 'No. Shortlisted' },
        { id: 'number_of_openings', label: 'Number of Openings' },
      ],
    },
    {
      id: 'metadata',
      label: 'Metadata & Advanced',
      columns: [
        { id: 'company_id', label: 'Company ID' },
        { id: 'institution_id', label: 'Institution ID' },
        { id: 'school_id', label: 'School ID' },
        { id: 'program_id', label: 'Program ID' },
        { id: 'specialization_id', label: 'Specialization ID' },
        { id: 'tpo', label: 'TPO' },
        { id: 'company_remarks', label: 'Company Remarks' },
      ],
    },
  ];

  const [visibleColumns, setVisibleColumns] = useState(baseColumns.map(c => c.id));
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // Edit State
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedJobProfile, setSelectedJobProfile] = useState('');

  // Scroll to highlighted event
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      // Clear filters to ensure the highlighted event is visible
      setSearchQuery('');
      setSelectedCompany('');
      setSelectedYear('');
      setSelectedSchool('');
      setSelectedJobProfile('');

      if (!loading) {
        // Small timeout to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(`drive-${highlightId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [location.search, loading, drives]);

  // Metadata Lists
  const [companyList, setCompanyList] = useState([]);
  const [schoolList, setSchoolList] = useState([]);
  const [programList, setProgramList] = useState([]);

  // New Event Form State
  const initialEventState = {
    company_id: '',
    tpo: '',
    year: new Date().getFullYear().toString(),
    school_id: '',
    program_id: '',
    job_description: '',
    job_type: '',
    job_location: '',
    event_datetime: '',
    last_date_to_registration: '',
    type_of_hiring: '',
    number_of_openings: '',
    ctc: '',
    min_cgpa: '',
    stipend: '',
    placement_status: 'Scheduled',
    company_remarks: ''
  };

  const [newEvent, setNewEvent] = useState(initialEventState);

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
    setNewEvent(prev => {
      if (name === 'school_id') {
        return { ...prev, [name]: value, program_id: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleEditClick = (drive) => {
    setSelectedEventId(drive.id);
    setNewEvent({
      company_id: drive.company_id || '',
      tpo: drive.tpo || '',
      year: drive.year ? drive.year.toString() : new Date().getFullYear().toString(),
      school_id: drive.school_id || '',
      program_id: drive.program_id || '',
      job_description: drive.job_description || '',
      job_type: drive.job_type || '',
      job_location: drive.job_location || '',
      event_datetime: drive.event_datetime ? new Date(drive.event_datetime).toISOString().slice(0, 16) : '',
      last_date_to_registration: drive.last_date_to_registration ? new Date(drive.last_date_to_registration).toISOString().slice(0, 10) : '',
      type_of_hiring: drive.type_of_hiring || '',
      number_of_openings: drive.number_of_openings || '',
      ctc: drive.ctc || (drive.ctc_structure && (drive.ctc_structure.package || drive.ctc_structure.total)) || '',
      min_cgpa: (drive.eligibility_academics && drive.eligibility_academics.min_cgpa) || '',
      stipend: (drive.stipend_structure && drive.stipend_structure.stipend) || '',
      placement_status: drive.placement_status || 'Scheduled',
      company_remarks: drive.company_remarks || ''
    });
    onOpen();
  };

  const handleSaveEvent = async () => {
    if (!newEvent.company_id || !newEvent.school_id || !newEvent.event_datetime) {
      toast({ title: "Company, School and Date are required", status: "warning" });
      return;
    }

    // Sanitize payload: Convert empty strings to null for integer/optional fields
    const payload = {
      ...newEvent,
      number_of_openings: newEvent.number_of_openings === '' ? null : parseInt(newEvent.number_of_openings),
      program_id: newEvent.program_id === '' ? null : parseInt(newEvent.program_id),
      school_id: parseInt(newEvent.school_id),
      company_id: parseInt(newEvent.company_id),
      year: parseInt(newEvent.year),
      ctc_structure: { package: newEvent.ctc },
      eligibility_academics: { min_cgpa: newEvent.min_cgpa },
      stipend_structure: { stipend: newEvent.stipend }
    };

    try {
      if (selectedEventId) {
          await PlacementService.updatePlacementDrive(selectedEventId, payload);
          toast({ title: "Event updated successfully", status: "success" });
      } else {
          await PlacementService.addPlacementDrive(payload);
          toast({ title: "Event added successfully", status: "success" });
      }
      onClose();
      setNewEvent(initialEventState);
      setSelectedEventId(null);
      fetchDrives();
    } catch (error) {
      console.error(error);
      toast({ title: selectedEventId ? "Error updating event" : "Error adding event", status: "error" });
    }
  };

  const handleExportData = () => {
      const dataToExport = filteredDrives.map(drive => ({
          Company: drive.company_name,
          "Job Profile": drive.job_profile || drive.job_type,
          Date: new Date(drive.event_datetime).toLocaleDateString(),
          School: drive.school,
          Package: drive.ctc || drive.ctc_structure?.total || "N/A",
          Status: drive.placement_status,
          Registrations: drive.number_of_registrations || 0
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Placement Drives");
      XLSX.writeFile(wb, "Placement_Drives_Export.xlsx");
  };

  const handleModalClose = () => {
      onClose();
      setNewEvent(initialEventState);
      setSelectedEventId(null);
  };

  useEffect(() => {
    fetchDrives();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [companies, schools] = await Promise.all([
        PlacementService.getAllCompanies(),
        PlacementService.getSchools()
      ]);
      setCompanyList(companies);
      setSchoolList(schools);
    } catch (error) {
      console.error("Error fetching metadata", error);
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
          toast({ title: "Session expired. Please logout and login again.", status: "error", duration: 5000 });
      }
    }
  };

  useEffect(() => {
    if (newEvent.school_id) {
        PlacementService.getPrograms(newEvent.school_id)
            .then(data => {
                if (Array.isArray(data)) {
                    setProgramList(data);
                } else {
                    console.error("Expected array of programs, got:", data);
                    setProgramList([]);
                }
            })
            .catch(err => {
                console.error("Error fetching programs:", err);
                setProgramList([]);
            });
    } else {
        setProgramList([]);
    }
  }, [newEvent.school_id]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAllDrives();
      setDrives(data);
    } catch (error) {
      if (error.message === 'Forbidden' || error.message.includes('403')) {
          toast({ title: "Session expired. Please logout and login again.", status: "error", duration: 5000 });
      } else {
        toast({
          title: "Error fetching events",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
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
    const query = searchQuery.toLowerCase();
    const formattedDate = drive.event_datetime ? new Date(drive.event_datetime).toLocaleDateString() : '';
    
    const matchesSearch = 
      (drive.company_name?.toLowerCase() || '').includes(query) ||
      (drive.job_profile?.toLowerCase() || '').includes(query) ||
      (drive.job_type?.toLowerCase() || '').includes(query) ||
      (drive.school?.toLowerCase() || '').includes(query) ||
      (drive.tpo?.toLowerCase() || '').includes(query) ||
      (drive.job_location?.toLowerCase() || '').includes(query) ||
      (drive.placement_status?.toLowerCase() || '').includes(query) ||
      (drive.ctc?.toLowerCase() || '').includes(query) ||
      (drive.ctc_structure?.total?.toString().toLowerCase() || '').includes(query) ||
      String(drive.year || '').includes(query) ||
      String(drive.number_of_registrations || '').includes(query) ||
      formattedDate.toLowerCase().includes(query);

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
                leftIcon={<BsLayoutThreeColumns />} 
                bg="white" 
                border="1px"
                borderColor="gray.200"
                color="gray.600"
                _hover={{ bg: "gray.50", borderColor: "gray.300" }} 
                onClick={() => setIsColumnModalOpen(true)}
                size="sm"
              >
                Columns
              </Button>

              <Button 
                colorScheme="green" 
                variant="outline" 
                leftIcon={<DownloadIcon />} 
                onClick={handleExportData}
                size="sm"
                bg="white"
              >
                Export Excel
              </Button>

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
                <Input placeholder="Search by Company, Job Profile, Date, School..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                    {visibleColumns.includes('id') && <Th>ID</Th>}
                    {visibleColumns.includes('company') && <Th>Company Name</Th>}
                    {visibleColumns.includes('company_id') && <Th>Company ID</Th>}
                    {visibleColumns.includes('registrations') && <Th>Registrations</Th>}
                    {visibleColumns.includes('number_of_registrations') && <Th>No. Registrations (Raw)</Th>}
                    {visibleColumns.includes('jobProfile') && <Th>Job Profile</Th>}
                    {visibleColumns.includes('job_type') && <Th>Job Type</Th>}
                    {visibleColumns.includes('date') && <Th>Date</Th>}
                    {visibleColumns.includes('event_datetime') && <Th>Event Datetime</Th>}
                    {visibleColumns.includes('eligibility') && <Th>Eligibility</Th>}
                    {visibleColumns.includes('package') && <Th>Package (CTC)</Th>}
                    {visibleColumns.includes('status') && <Th>Status</Th>}
                    {visibleColumns.includes('placement_status') && <Th>Placement Status (Raw)</Th>}
                    {visibleColumns.includes('company_remarks') && <Th>Company Remarks</Th>}
                    {visibleColumns.includes('tpo') && <Th>TPO</Th>}
                    {visibleColumns.includes('year') && <Th>Year</Th>}
                    {visibleColumns.includes('eligibility_academics') && <Th>Eligibility Academics (JSON)</Th>}
                    {visibleColumns.includes('type_of_hiring') && <Th>Type of Hiring</Th>}
                    {visibleColumns.includes('ctc_structure') && <Th>CTC Structure (JSON)</Th>}
                    {visibleColumns.includes('job_location') && <Th>Job Location</Th>}
                    {visibleColumns.includes('onboarded_date') && <Th>Onboarded Date</Th>}
                    {visibleColumns.includes('last_date_to_registration') && <Th>Last Date to Reg</Th>}
                    {visibleColumns.includes('no_shortlisted') && <Th>No. Shortlisted</Th>}
                    {visibleColumns.includes('offer_letter_status') && <Th>Offer Letter Status</Th>}
                    {visibleColumns.includes('created_at') && <Th>Created At</Th>}
                    {visibleColumns.includes('updated_at') && <Th>Updated At</Th>}
                    {visibleColumns.includes('institution_id') && <Th>Institution ID</Th>}
                    {visibleColumns.includes('job_description') && <Th>Job Description</Th>}
                    {visibleColumns.includes('stipend_structure') && <Th>Stipend Structure (JSON)</Th>}
                    {visibleColumns.includes('school_id') && <Th>School ID</Th>}
                    {visibleColumns.includes('program_id') && <Th>Program ID</Th>}
                    {visibleColumns.includes('specialization_id') && <Th>Specialization ID</Th>}
                    {visibleColumns.includes('number_of_openings') && <Th>Number of Openings</Th>}
                    {visibleColumns.includes('actions') && <Th>Actions</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    <Tr><Td colSpan={visibleColumns.length} textAlign="center"><Spinner /></Td></Tr>
                  ) : filteredDrives.length === 0 ? (
                    <Tr><Td colSpan={visibleColumns.length} textAlign="center">No drives found</Td></Tr>
                  ) : (
                    filteredDrives.map((drive) => {
                      const isHighlighted = new URLSearchParams(location.search).get('highlight') === String(drive.id);
                      return (
                        <Tr 
                          key={drive.id} 
                          id={`drive-${drive.id}`}
                          bg={isHighlighted ? "yellow.100" : undefined}
                          _hover={{ bg: isHighlighted ? "yellow.200" : "gray.50" }}
                          transition="background-color 0.3s"
                        >
                          {visibleColumns.includes('id') && <Td>{drive.id}</Td>}
                          {visibleColumns.includes('company') && <Td fontWeight="medium" color="#2c5282">{drive.company_name}</Td>}
                          {visibleColumns.includes('company_id') && <Td>{drive.company_id}</Td>}
                          {visibleColumns.includes('registrations') && (
                            <Td>
                              <Button 
                                size="xs" 
                                colorScheme="blue" 
                                onClick={() => handleManageClick(drive)}
                              >
                                View ({drive.number_of_registrations || 0})
                              </Button>
                            </Td>
                          )}
                          {visibleColumns.includes('number_of_registrations') && <Td>{drive.number_of_registrations}</Td>}
                          {visibleColumns.includes('jobProfile') && <Td>{drive.job_type}</Td>}
                          {visibleColumns.includes('job_type') && <Td>{drive.job_type}</Td>}
                          {visibleColumns.includes('date') && <Td>{new Date(drive.event_datetime).toLocaleDateString()}</Td>}
                          {visibleColumns.includes('event_datetime') && <Td>{drive.event_datetime}</Td>}
                          {visibleColumns.includes('eligibility') && <Td>{drive.school}</Td>}
                          {visibleColumns.includes('package') && <Td>{drive.ctc || drive.ctc_structure?.total || "N/A"}</Td>}
                          {visibleColumns.includes('status') && (
                            <Td>
                              <Badge colorScheme={drive.placement_status === 'Completed' ? 'green' : drive.placement_status === 'Cancelled' ? 'red' : 'blue'}>
                                {drive.placement_status || 'Scheduled'}
                              </Badge>
                            </Td>
                          )}
                          {visibleColumns.includes('placement_status') && <Td>{drive.placement_status}</Td>}
                          {visibleColumns.includes('company_remarks') && <Td>{drive.company_remarks}</Td>}
                          {visibleColumns.includes('tpo') && <Td>{drive.tpo}</Td>}
                          {visibleColumns.includes('year') && <Td>{drive.year}</Td>}
                          {visibleColumns.includes('eligibility_academics') && <Td><pre style={{fontSize: '10px'}}>{JSON.stringify(drive.eligibility_academics, null, 2)}</pre></Td>}
                          {visibleColumns.includes('type_of_hiring') && <Td>{drive.type_of_hiring}</Td>}
                          {visibleColumns.includes('ctc_structure') && <Td><pre style={{fontSize: '10px'}}>{JSON.stringify(drive.ctc_structure, null, 2)}</pre></Td>}
                          {visibleColumns.includes('job_location') && <Td>{drive.job_location}</Td>}
                          {visibleColumns.includes('onboarded_date') && <Td>{drive.onboarded_date}</Td>}
                          {visibleColumns.includes('last_date_to_registration') && <Td>{drive.last_date_to_registration}</Td>}
                          {visibleColumns.includes('no_shortlisted') && <Td>{drive.no_shortlisted}</Td>}
                          {visibleColumns.includes('offer_letter_status') && <Td>{drive.offer_letter_status}</Td>}
                          {visibleColumns.includes('created_at') && <Td>{drive.created_at}</Td>}
                          {visibleColumns.includes('updated_at') && <Td>{drive.updated_at}</Td>}
                          {visibleColumns.includes('institution_id') && <Td>{drive.institution_id}</Td>}
                          {visibleColumns.includes('job_description') && <Td>{drive.job_description && drive.job_description.length > 50 ? drive.job_description.substring(0, 50) + '...' : drive.job_description}</Td>}
                          {visibleColumns.includes('stipend_structure') && <Td><pre style={{fontSize: '10px'}}>{JSON.stringify(drive.stipend_structure, null, 2)}</pre></Td>}
                          {visibleColumns.includes('school_id') && <Td>{drive.school_id}</Td>}
                          {visibleColumns.includes('program_id') && <Td>{drive.program_id}</Td>}
                          {visibleColumns.includes('specialization_id') && <Td>{drive.specialization_id}</Td>}
                          {visibleColumns.includes('number_of_openings') && <Td>{drive.number_of_openings}</Td>}
                          {visibleColumns.includes('actions') && (
                            <Td>
                              <HStack spacing={2}>
                                <Button size="xs" leftIcon={<EditIcon />} onClick={() => handleEditClick(drive)}>Edit</Button>
                              </HStack>
                            </Td>
                          )}
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {/* Column Selector Modal */}
          <Modal isOpen={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} size="4xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Select Columns</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack align="stretch" spacing={6}>
                  {columnGroups.map(group => (
                    <Box key={group.id} borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                      <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="sm" color="gray.700">{group.label}</Heading>
                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => {
                              const ids = group.columns.map(c => c.id);
                              setVisibleColumns(prev => Array.from(new Set([...prev, ...ids])));
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              const ids = group.columns.map(c => c.id);
                              setVisibleColumns(prev => prev.filter(id => !ids.includes(id)));
                            }}
                          >
                            Clear
                          </Button>
                        </HStack>
                      </Flex>
                      <Divider mb={4} borderColor="gray.300" />
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                        {group.columns.map(col => (
                          <Checkbox
                            key={col.id}
                            isChecked={visibleColumns.includes(col.id)}
                            onChange={() => {
                              setVisibleColumns(prev =>
                                prev.includes(col.id)
                                  ? prev.filter(id => id !== col.id)
                                  : [...prev, col.id]
                              );
                            }}
                          >
                            <Text fontSize="sm">{col.label}</Text>
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <HStack spacing={4}>
                  <Button variant="ghost" onClick={() => setIsColumnModalOpen(false)}>Close</Button>
                </HStack>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>

        {/* Add/Edit Drive Modal */}
        <Modal isOpen={isOpen} onClose={handleModalClose} size="3xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedEventId ? 'Edit Placement Drive' : 'Add New Placement Drive'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6} align="stretch">
                
                {/* Section 1: Core Company Info */}
                <Box>
                  <Heading size="sm" mb={3} color="blue.600">Company & Role Details</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Company</FormLabel>
                      <Select name="company_id" value={newEvent.company_id} onChange={handleInputChange} placeholder="Select Company">
                        {companyList.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Job Type</FormLabel>
                      <Input name="job_type" value={newEvent.job_type} onChange={handleInputChange} placeholder="e.g. Full Time" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Type of Hiring</FormLabel>
                      <Select name="type_of_hiring" value={newEvent.type_of_hiring} onChange={handleInputChange} placeholder="Select Type">
                         <option value="Internship">Internship</option>
                         <option value="Full Time">Full Time</option>
                         <option value="Internship + FTE">Internship + FTE</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Job Location</FormLabel>
                      <Input name="job_location" value={newEvent.job_location} onChange={handleInputChange} placeholder="City/State" />
                    </FormControl>

                    <FormControl gridColumn={{ md: "span 2" }}>
                      <FormLabel>Job Description</FormLabel>
                      <Textarea name="job_description" value={newEvent.job_description} onChange={handleInputChange} placeholder="Job description..." rows={3} />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Section 2: Schedule & Logistics */}
                <Box>
                  <Heading size="sm" mb={3} color="blue.600">Schedule & Logistics</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Event Date</FormLabel>
                      <Input 
                        type="datetime-local" 
                        name="event_datetime" 
                        value={newEvent.event_datetime} 
                        onChange={handleInputChange} 
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Last Date to Reg</FormLabel>
                      <Input 
                        type="date" 
                        name="last_date_to_registration" 
                        value={newEvent.last_date_to_registration} 
                        onChange={handleInputChange} 
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Year (Batch)</FormLabel>
                      <Input name="year" value={newEvent.year} onChange={handleInputChange} placeholder="2024" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>TPO Name</FormLabel>
                      <Input name="tpo" value={newEvent.tpo} onChange={handleInputChange} />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Number of Openings</FormLabel>
                      <Input type="number" name="number_of_openings" value={newEvent.number_of_openings} onChange={handleInputChange} />
                    </FormControl>
                    
                    <FormControl>
                       <FormLabel>Placement Status</FormLabel>
                       <Select name="placement_status" value={newEvent.placement_status} onChange={handleInputChange}>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                       </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Section 3: Eligibility & Target Audience */}
                <Box>
                  <Heading size="sm" mb={3} color="blue.600">Target Audience</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>School</FormLabel>
                      <Select name="school_id" value={newEvent.school_id} onChange={handleInputChange} placeholder="Select School">
                         {schoolList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </Select>
                    </FormControl>

                    <FormControl>
                       <FormLabel>Program</FormLabel>
                       <Select name="program_id" value={newEvent.program_id} onChange={handleInputChange} placeholder="Select Program">
                          {programList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Min CGPA</FormLabel>
                      <Input name="min_cgpa" value={newEvent.min_cgpa} onChange={handleInputChange} placeholder="e.g. 7.5" />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Section 4: Compensation */}
                <Box>
                  <Heading size="sm" mb={3} color="blue.600">Compensation</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Package (CTC)</FormLabel>
                      <Input name="ctc" value={newEvent.ctc} onChange={handleInputChange} placeholder="e.g. 10 LPA" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Stipend</FormLabel>
                      <Input name="stipend" value={newEvent.stipend} onChange={handleInputChange} placeholder="e.g. 25000/month" />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Section 5: Remarks */}
                <Box>
                  <FormControl>
                    <FormLabel>Company Remarks</FormLabel>
                    <Textarea name="company_remarks" value={newEvent.company_remarks} onChange={handleInputChange} rows={2} />
                  </FormControl>
                </Box>

              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSaveEvent}>{selectedEventId ? 'Update Drive' : 'Save Drive'}</Button>
              <Button onClick={handleModalClose}>Cancel</Button>
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
