import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Badge,
  Avatar,
  InputGroup,
  InputLeftElement,
  Flex,
  Spinner,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  FormControl,
  FormLabel,
  useToast
} from '@chakra-ui/react';
import { SearchIcon, ChevronLeftIcon, DownloadIcon, CloseIcon } from '@chakra-ui/icons';
import { BsLayoutThreeColumns } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const Students = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  // Column visibility state
  const baseColumns = [
    { id: 'index', label: '#' },
    { id: 'name', label: 'Name' },
    { id: 'usn', label: 'USN' },
    { id: 'school', label: 'School' },
    { id: 'program', label: 'Program' },
    { id: 'specialization', label: 'Specialization' },
    { id: 'email', label: 'Email' },
    { id: 'contact', label: 'Contact' },
    { id: 'placement', label: 'Placement' },
  ];
  const [visibleColumns, setVisibleColumns] = useState(baseColumns.map(c => c.id));
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // Download state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSelectedColumns, setDownloadSelectedColumns] = useState(baseColumns.map(c => c.id));
  const [includeFiles, setIncludeFiles] = useState(false);
  const [fileTypes, setFileTypes] = useState({
    profileImage: true,
    resume: false // Placeholder for future implementation
  });

  // Column groups from database schema (simplified for list view)
  const columnGroups = [
    {
      id: 'students_personal_details',
      label: 'Personal Details',
      columns: [
        { id: 'name', label: 'Full Name' },
        { id: 'usn', label: 'USN' },
        { id: 'gender', label: 'Gender' },
        { id: 'date_of_birth', label: 'Date of Birth' },
        { id: 'blood_group', label: 'Blood Group' },
        { id: 'marital_status', label: 'Marital Status' },
        { id: 'specially_abled', label: 'Specially Abled' },
        { id: 'languages', label: 'Languages' },
        { id: 'school', label: 'School' },
        { id: 'year_of_joining', label: 'Year of Joining' },
        { id: 'program', label: 'Program' },
        { id: 'specialization', label: 'Specialization' },
        { id: 'major', label: 'Major' },
        { id: 'minor', label: 'Minor' },
        { id: 'profile_image', label: 'Profile Image' },
      ],
    },
    {
      id: 'student_profile_communication',
      label: 'Communication',
      columns: [
        { id: 'college_email', label: 'College Email' },
        { id: 'personal_email', label: 'Personal Email' },
        { id: 'phone', label: 'Phone Number' },
        { id: 'links', label: 'Links' },
      ],
    },
    {
      id: 'student_semester_academics',
      label: 'Semester Academics',
      columns: [
        { id: 'latest_academic_year', label: 'Academic Year' },
        { id: 'latest_semester', label: 'Semester' },
        { id: 'latest_sgpa', label: 'Result (SGPA)' },
        { id: 'closed_backlogs', label: 'Closed Backlogs' },
        { id: 'live_backlogs', label: 'Live Backlogs' },
      ],
    },
    {
      id: 'student_education_history',
      label: 'Education History',
      columns: [
        { id: 'highest_education_level', label: 'Education Level' },
        { id: 'latest_institute', label: 'Institute' },
        { id: 'latest_year_of_passing', label: 'Year of Passing' },
        { id: 'latest_result', label: 'Result' },
      ],
    },
    {
      id: 'student_projects',
      label: 'Projects',
      columns: [
        { id: 'projects_count', label: 'Projects Count' },
        { id: 'latest_project_title', label: 'Latest Project Title' },
      ],
    },
    {
      id: 'student_internships',
      label: 'Internships',
      columns: [
        { id: 'internships_count', label: 'Internships Count' },
        { id: 'latest_internship_org', label: 'Latest Internship Org' },
        { id: 'latest_internship_stipend', label: 'Latest Internship Stipend' },
      ],
    },
    {
      id: 'student_trainings',
      label: 'Trainings',
      columns: [
        { id: 'trainings_count', label: 'Trainings Count' },
        { id: 'latest_training_title', label: 'Latest Training Title' },
      ],
    },
    {
      id: 'student_certifications',
      label: 'Certifications',
      columns: [
        { id: 'certifications_count', label: 'Certifications Count' },
        { id: 'latest_certification_title', label: 'Latest Certification Title' },
      ],
    },
    {
      id: 'student_publications',
      label: 'Publications',
      columns: [
        { id: 'publications_count', label: 'Publications Count' },
        { id: 'latest_publication_title', label: 'Latest Publication Title' },
        { id: 'latest_publication_date', label: 'Latest Publication Date' },
      ],
    },
    {
      id: 'process',
      label: 'Placement Process',
      columns: [
        { id: 'is_eligible', label: 'Eligible' },
        { id: 'registration_status', label: 'Registration Status' },
        { id: 'approved_status', label: 'Approved Status' },
        { id: 'oa_status', label: 'OA Status' },
        { id: 'gd_status', label: 'GD Status' },
        { id: 'technical_round_status', label: 'Technical Round' },
        { id: 'interview_status', label: 'Interview Status' },
        { id: 'hr_round_status', label: 'HR Round Status' },
        { id: 'final_select_status', label: 'Final Select Status' },
      ],
    },
    {
      id: 'job_offers',
      label: 'Job Offers',
      columns: [
        { id: 'offer_company_name', label: 'Offer Company' },
        { id: 'offer_job_type', label: 'Offer Job Type' },
        { id: 'offer_designation', label: 'Designation' },
        { id: 'offer_letter_status', label: 'Offer Letter Status' },
        { id: 'ctc_min_lpa', label: 'CTC Min (LPA)' },
        { id: 'ctc_max_lpa', label: 'CTC Max (LPA)' },
      ],
    },
  ];

  const allColumnsMeta = [
    ...baseColumns,
    ...columnGroups.flatMap(g => g.columns),
  ];

  const getLabelForColumn = (id) => {
    const found = allColumnsMeta.find(c => c.id === id);
    return found ? found.label : id;
  };

  const baseColumnIds = baseColumns.map(c => c.id);
  const extraVisible = visibleColumns.filter(id => !baseColumnIds.includes(id));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await PlacementService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique schools and programs for filters
  const schools = [...new Set(students.map(s => s.school))].sort();
  
  // Filter programs based on selected school
  const programs = [...new Set(
    students
      .filter(s => !selectedSchool || s.school === selectedSchool)
      .map(s => s.program)
  )].sort();

  // Reset selected program when school changes
  useEffect(() => {
    setSelectedProgram('');
  }, [selectedSchool]);

  // Filter logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSchool = selectedSchool ? student.school === selectedSchool : true;
    const matchesProgram = selectedProgram ? student.program === selectedProgram : true;

    return matchesSearch && matchesSchool && matchesProgram;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSchool('');
    setSelectedProgram('');
    setCurrentPage(1);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const dataToExport = filteredStudents;

      // 1. Generate Excel
      const headers = downloadSelectedColumns.map(id => getLabelForColumn(id));
      const excelData = dataToExport.map(student => {
        const row = {};
        downloadSelectedColumns.forEach(id => {
          let value = '-';
          // Use the same switch logic as render, but simplified
          const label = getLabelForColumn(id);
          
          switch (id) {
            case 'index': value = dataToExport.indexOf(student) + 1; break;
            case 'name': value = student.name; break;
            case 'usn': value = student.usn; break;
            case 'school': value = student.school; break;
            case 'program': value = student.program; break;
            case 'specialization': value = student.specialization || '-'; break;
            case 'email': value = student.email; break;
            case 'contact': value = student.contact || '-'; break;
            case 'placement': value = student.placement ? student.placement.company_name : 'Not Placed'; break;
            
            // Personal Details
            case 'gender': value = student.gender || '-'; break;
            case 'date_of_birth': value = student.date_of_birth || '-'; break;
            case 'blood_group': value = student.blood_group || '-'; break;
            case 'marital_status': value = student.marital_status || '-'; break;
            case 'specially_abled': value = typeof student.specially_abled === 'boolean' ? (student.specially_abled ? 'Yes' : 'No') : '-'; break;
            case 'languages': value = student.languages || '-'; break;
            case 'year_of_joining': value = student.year_of_joining || '-'; break;
            case 'major': value = student.major || '-'; break;
            case 'minor': value = student.minor || '-'; break;
            case 'profile_image': value = student.profile_image ? 'Available' : '-'; break;
            
            // Communication
            case 'college_email': value = student.college_email || '-'; break;
            case 'personal_email': value = student.email || '-'; break;
            case 'phone': value = student.phone_number || student.contact || '-'; break;
            case 'links': value = student.links ? 'Available' : '-'; break;

            // Academics
            case 'latest_academic_year': value = student.latest_academic_year || '-'; break;
            case 'latest_semester': value = student.latest_semester || '-'; break;
            case 'latest_sgpa': value = student.latest_sgpa || '-'; break;
            case 'closed_backlogs': value = student.closed_backlogs ?? '-'; break;
            case 'live_backlogs': value = student.live_backlogs ?? '-'; break;

            // Education
            case 'highest_education_level': value = student.highest_education_level || '-'; break;
            case 'latest_institute': value = student.latest_institute || '-'; break;
            case 'latest_year_of_passing': value = student.latest_year_of_passing || '-'; break;
            case 'latest_result': value = student.latest_result || '-'; break;

            // Placement Process
            case 'is_eligible': value = student.is_eligible || '-'; break;
            case 'registration_status': value = student.registration_status || '-'; break;
            case 'approved_status': value = student.approved_status || '-'; break;
            case 'oa_status': value = student.oa_status || '-'; break;
            case 'gd_status': value = student.gd_status || '-'; break;
            case 'technical_round_status': value = student.technical_round_status || '-'; break;
            case 'interview_status': value = student.interview_status || '-'; break;
            case 'hr_round_status': value = student.hr_round_status || '-'; break;
            case 'final_select_status': value = student.final_select_status || '-'; break;
            
            // Job Offers
            case 'offer_company_name': value = student.offer_company_name || (student.placement?.company_name) || '-'; break;
            case 'offer_job_type': value = student.offer_job_type || '-'; break;
            case 'offer_designation': value = student.offer_designation || '-'; break;
            case 'offer_letter_status': value = student.offer_letter_status || '-'; break;
            case 'ctc_min_lpa': value = student.ctc_min_lpa || '-'; break;
            case 'ctc_max_lpa': value = student.ctc_max_lpa || '-'; break;
            
            // Default fallback
            default: 
              // Try to find if it matches any column id directly in student object
              value = student[id] || '-';
          }
          row[label] = value;
        });
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // 2. Handle Zip if files included
      if (includeFiles) {
        const zip = new JSZip();
        zip.file("students_data.xlsx", excelBuffer);
        
        // Add files folder
        const filesFolder = zip.folder("student_files");
        
        if (fileTypes.profileImage) {
          const imagesFolder = filesFolder.folder("profile_images");
          // Attempt to fetch images (Note: this depends on CORS and valid URLs)
          let successCount = 0;
          
          const promises = dataToExport.map(async (student) => {
             if (student.profile_image) {
               try {
                 const response = await fetch(student.profile_image);
                 if (response.ok) {
                   const blob = await response.blob();
                   // Get extension from mime type or url
                   const ext = response.headers.get("content-type")?.split("/")[1] || "jpg";
                   imagesFolder.file(`${student.usn}_${student.name.replace(/ /g, '_')}.${ext}`, blob);
                   successCount++;
                 }
               } catch (err) {
                 console.warn(`Failed to fetch image for ${student.usn}`, err);
               }
             }
          });
          
          await Promise.all(promises);
          
          if (successCount === 0 && dataToExport.some(s => s.profile_image)) {
             toast({
               title: "Warning",
               description: "Could not download profile images due to access restrictions (CORS) or invalid URLs.",
               status: "warning",
               duration: 5000,
               isClosable: true,
             });
          }
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        saveAs(zipContent, "students_export_with_files.zip");
      } else {
        // Just download Excel
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, "students_export.xlsx");
      }
      
      toast({
        title: "Export Successful",
        description: `Exported ${dataToExport.length} student records.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while generating the export file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          
          {/* Header */}
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading as="h1" size="lg" color="gray.800" mb={1}>
                All Students
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Browse all students; click a row for details
              </Text>
            </Box>
            <Button 
              leftIcon={<ChevronLeftIcon />} 
              variant="outline" 
              onClick={() => navigate(-1)}
              bg="white"
            >
              Back
            </Button>
          </Flex>

          {/* Search & Filters */}
          <Box bg="white" p={4} borderRadius="xl" shadow="sm" mb={6} border="1px" borderColor="gray.100">
            <Flex gap={4} direction={{ base: 'column', md: 'row' }} align="center" flexWrap="wrap">
              <InputGroup maxW={{ base: '100%', md: '300px' }} flex="1">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  _focus={{ bg: "white", boxShadow: "outline", borderColor: "blue.400" }}
                  _hover={{ borderColor: "gray.300" }}
                />
              </InputGroup>

              <Select 
                placeholder="All Schools" 
                maxW={{ base: '100%', md: '180px' }}
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _focus={{ bg: "white", boxShadow: "outline", borderColor: "blue.400" }}
                _hover={{ borderColor: "gray.300" }}
              >
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </Select>

              <Select 
                placeholder="All Programs" 
                maxW={{ base: '100%', md: '180px' }}
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _focus={{ bg: "white", boxShadow: "outline", borderColor: "blue.400" }}
                _hover={{ borderColor: "gray.300" }}
              >
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </Select>

              <HStack spacing={2} ml="auto">
                <Button 
                  leftIcon={<BsLayoutThreeColumns />} 
                  bg="white" 
                  border="1px"
                  borderColor="gray.200"
                  color="gray.600"
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }} 
                  onClick={() => setIsColumnModalOpen(true)}
                  size="md"
                >
                  Columns
                </Button>

                <Button 
                  leftIcon={<DownloadIcon />} 
                  bg="white" 
                  border="1px"
                  borderColor="gray.200"
                  color="gray.600"
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }} 
                  onClick={() => setIsDownloadModalOpen(true)}
                  size="md"
                >
                  Export
                </Button>

                {(searchQuery || selectedSchool || selectedProgram) && (
                  <Button 
                    leftIcon={<CloseIcon boxSize={3} />} 
                    colorScheme="red" 
                    variant="ghost" 
                    onClick={handleClearFilters}
                    size="md"
                    px={4}
                  >
                    Clear
                  </Button>
                )}
              </HStack>
            </Flex>
          </Box>

          {/* Students Table */}
          <Box bg="white" borderRadius="xl" shadow="sm" overflowX="auto">
            <Table variant="simple">
              <Thead bg="#172e36">
                <Tr>
                  {visibleColumns.includes('index') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>#</Th>}
                  {visibleColumns.includes('name') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Name</Th>}
                  {visibleColumns.includes('usn') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>USN</Th>}
                  {visibleColumns.includes('school') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>School</Th>}
                  {visibleColumns.includes('program') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Program</Th>}
                  {visibleColumns.includes('specialization') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Specialization</Th>}
                  {visibleColumns.includes('email') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Email</Th>}
                  {visibleColumns.includes('contact') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Contact</Th>}
                  {visibleColumns.includes('placement') && <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Placement</Th>}
                  {extraVisible.map(id => (
                    <Th key={id} color="white" fontSize="xs" textTransform="uppercase" py={4}>
                      {getLabelForColumn(id)}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={visibleColumns.length} textAlign="center" py={10}>
                      <Spinner size="xl" color="blue.500" />
                      <Text mt={4} color="gray.500">Loading students...</Text>
                    </Td>
                  </Tr>
                ) : currentStudents.length === 0 ? (
                  <Tr>
                    <Td colSpan={visibleColumns.length} textAlign="center" py={10}>
                      <Text color="gray.500">No students found matching your criteria</Text>
                    </Td>
                  </Tr>
                ) : (
                  currentStudents.map((student, index) => (
                    <Tr 
                      key={student.usn} 
                      _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                      transition="all 0.2s"
                      onClick={() => navigate(`/placement/students/${student.usn}`)}
                    >
                      {visibleColumns.includes('index') && <Td fontSize="sm" color="gray.600">{indexOfFirstItem + index + 1}</Td>}
                      {visibleColumns.includes('name') && (
                        <Td>
                          <Flex align="center">
                            <Avatar size="xs" name={student.name} src={student.avatar} mr={2} />
                            <Text fontWeight="600" color="gray.700" fontSize="sm">{student.name}</Text>
                          </Flex>
                        </Td>
                      )}
                      {visibleColumns.includes('usn') && (
                        <Td>
                          <Badge colorScheme="blue" fontSize="xs" variant="subtle">{student.usn}</Badge>
                        </Td>
                      )}
                      {visibleColumns.includes('school') && <Td fontSize="sm" color="gray.600">{student.school}</Td>}
                      {visibleColumns.includes('program') && <Td fontSize="sm" color="gray.600">{student.program}</Td>}
                      {visibleColumns.includes('specialization') && <Td fontSize="sm" color="gray.600">{student.specialization || '-'}</Td>}
                      {visibleColumns.includes('email') && <Td fontSize="sm" color="gray.600">{student.email}</Td>}
                      {visibleColumns.includes('contact') && <Td fontSize="sm" color="gray.600">{student.contact || '-'}</Td>}
                      {visibleColumns.includes('placement') && (
                        <Td fontSize="sm">
                          {student.placement ? (
                            <Badge 
                              colorScheme="green" 
                              cursor="pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/placement/company/${student.placement.company_id}`);
                              }}
                            >
                              {student.placement.company_name}
                            </Badge>
                          ) : (
                            <Text color="gray.400" fontSize="xs">Not Placed</Text>
                          )}
                        </Td>
                      )}
                      {extraVisible.map(id => (
                        <Td key={id} fontSize="sm" color="gray.600">
                          {(() => {
                            switch (id) {
                              // Personal Details
                              case 'gender': return student.gender || '-';
                              case 'date_of_birth': return student.date_of_birth || '-';
                              case 'blood_group': return student.blood_group || '-';
                              case 'marital_status': return student.marital_status || '-';
                              case 'specially_abled': return typeof student.specially_abled === 'boolean' ? (student.specially_abled ? 'Yes' : 'No') : '-';
                              case 'languages': return student.languages || '-';
                              case 'year_of_joining': return student.year_of_joining || '-';
                              case 'major': return student.major || '-';
                              case 'minor': return student.minor || '-';
                              case 'profile_image': return student.profile_image ? 'Available' : '-';
                              // Communication
                              case 'college_email': return student.college_email || '-';
                              case 'personal_email': return student.email || '-';
                              case 'phone': return student.phone_number || student.contact || '-';
                              case 'links': return student.links ? 'Available' : '-';
                              // Academics (aggregated)
                              case 'latest_academic_year': return student.latest_academic_year || '-';
                              case 'latest_semester': return student.latest_semester || '-';
                              case 'latest_sgpa': return student.latest_sgpa || '-';
                              case 'closed_backlogs': return student.closed_backlogs ?? '-';
                              case 'live_backlogs': return student.live_backlogs ?? '-';
                              // Education History
                              case 'highest_education_level': return student.highest_education_level || '-';
                              case 'latest_institute': return student.latest_institute || '-';
                              case 'latest_year_of_passing': return student.latest_year_of_passing || '-';
                              case 'latest_result': return student.latest_result || '-';
                              // Projects
                              case 'projects_count': return student.projects_count ?? '-';
                              case 'latest_project_title': return student.latest_project_title || '-';
                              // Internships
                              case 'internships_count': return student.internships_count ?? '-';
                              case 'latest_internship_org': return student.latest_internship_org || '-';
                              case 'latest_internship_stipend': return student.latest_internship_stipend || '-';
                              // Trainings
                              case 'trainings_count': return student.trainings_count ?? '-';
                              case 'latest_training_title': return student.latest_training_title || '-';
                              // Certifications
                              case 'certifications_count': return student.certifications_count ?? '-';
                              case 'latest_certification_title': return student.latest_certification_title || '-';
                              // Publications
                              case 'publications_count': return student.publications_count ?? '-';
                              case 'latest_publication_title': return student.latest_publication_title || '-';
                              case 'latest_publication_date': return student.latest_publication_date || '-';
                              // Placement Process
                              case 'is_eligible': return student.is_eligible || '-';
                              case 'registration_status': return student.registration_status || '-';
                              case 'approved_status': return student.approved_status || '-';
                              case 'oa_status': return student.oa_status || '-';
                              case 'gd_status': return student.gd_status || '-';
                              case 'technical_round_status': return student.technical_round_status || '-';
                              case 'interview_status': return student.interview_status || '-';
                              case 'hr_round_status': return student.hr_round_status || '-';
                              case 'final_select_status': return student.final_select_status || '-';
                              // Job Offers
                              case 'offer_company_name': return student.offer_company_name || (student.placement?.company_name) || '-';
                              case 'offer_job_type': return student.offer_job_type || '-';
                              case 'offer_designation': return student.offer_designation || '-';
                              case 'offer_letter_status': return student.offer_letter_status || '-';
                              case 'ctc_min_lpa': return student.ctc_min_lpa || '-';
                              case 'ctc_max_lpa': return student.ctc_max_lpa || '-';
                              default: return '-';
                            }
                          })()}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
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

          {/* Download/Export Modal */}
          <Modal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} size="4xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Export Data</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Tabs variant="enclosed">
                  <TabList>
                    <Tab>Select Columns</Tab>
                    <Tab>Include Files</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        <Box p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                          <Checkbox
                            isChecked={downloadSelectedColumns.length === new Set(allColumnsMeta.map(c => c.id)).size}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDownloadSelectedColumns(Array.from(new Set(allColumnsMeta.map(c => c.id))));
                              } else {
                                setDownloadSelectedColumns(baseColumns.map(c => c.id));
                              }
                            }}
                            fontWeight="bold"
                            colorScheme="blue"
                          >
                            Select All Columns (Master File)
                          </Checkbox>
                          <Text fontSize="xs" color="gray.600" mt={1} ml={6}>
                            Selects every available column from all tables for a complete master export.
                          </Text>
                        </Box>
                        
                        <Divider />

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
                                    setDownloadSelectedColumns(prev => Array.from(new Set([...prev, ...ids])));
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
                                    setDownloadSelectedColumns(prev => prev.filter(id => !ids.includes(id)));
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
                                  isChecked={downloadSelectedColumns.includes(col.id)}
                                  onChange={() => {
                                    setDownloadSelectedColumns(prev =>
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
                    </TabPanel>
                    <TabPanel>
                      <VStack align="stretch" spacing={6}>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="include-files" mb="0">
                            Include Associated Files (Download as ZIP)
                          </FormLabel>
                          <Switch 
                            id="include-files" 
                            isChecked={includeFiles} 
                            onChange={(e) => setIncludeFiles(e.target.checked)} 
                          />
                        </FormControl>
                        
                        {includeFiles && (
                          <Box pl={6} borderLeftWidth="2px" borderColor="blue.200">
                             <VStack align="start" spacing={3}>
                               <Checkbox 
                                 isChecked={fileTypes.profileImage}
                                 onChange={(e) => setFileTypes(prev => ({ ...prev, profileImage: e.target.checked }))}
                               >
                                 Profile Images
                               </Checkbox>
                               <Checkbox 
                                 isChecked={fileTypes.resume}
                                 onChange={(e) => setFileTypes(prev => ({ ...prev, resume: e.target.checked }))}
                                 isDisabled
                               >
                                 Resume (Coming Soon)
                               </Checkbox>
                             </VStack>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => setIsDownloadModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  loadingText="Exporting..."
                >
                  Download {includeFiles ? 'ZIP' : 'Excel'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <Flex justify="space-between" align="center" mt={6}>
              <Text fontSize="sm" color="gray.500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
              </Text>
              <HStack>
                <Button 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}

        </Container>
      </Box>
    </AdminLayout>
  );
};

export default Students;
