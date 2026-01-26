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

const PlacementOverviewTab = ({ rows, salaryStats, academicYears, selectedYear, onYearChange }) => {
  const headerBg = '#f9e4a2';
  const headerRowBg = '#fbeec8';
  const dataRowBg = '#e9f4dd';
  const border = '#c2b38a';

  const palette = [
    '#e8f5e9', // soft green
    '#e3f2fd', // soft blue
    '#fff8e1', // soft amber
    '#e0f7fa', // soft cyan
    '#f1f8e9', // soft yellow‑green
    '#ede7f6', // soft indigo
    '#fff3e0', // soft orange
  ];

  const sortedRows = [...rows].sort((a, b) => {
    // 1. Sort by School
    const schoolCompare = (a.school || '').localeCompare(b.school || '');
    if (schoolCompare !== 0) return schoolCompare;
    
    // 2. Sort by Course (Program)
    const courseCompare = (a.course || '').localeCompare(b.course || '');
    if (courseCompare !== 0) return courseCompare;

    // 3. Sort by Current Year (Ascending: 1st, 2nd, 3rd...)
    const yearA = a.currentYear || 0;
    const yearB = b.currentYear || 0;
    return yearA - yearB;
  });

  const schoolColors = {};
  const schoolRowCounts = {};
  let colorIndex = 0;
  sortedRows.forEach((row) => {
    const key = row.school || 'Unknown';
    schoolRowCounts[key] = (schoolRowCounts[key] || 0) + 1;
    if (!schoolColors[key]) {
      schoolColors[key] = palette[colorIndex % palette.length];
      colorIndex += 1;
    }
  });

  const getRowBgForSchool = (school) => {
    const key = school || 'Unknown';
    return schoolColors[key] || dataRowBg;
  };

  return (
    <Box>
      <Flex justify="flex-end" mb={4} align="center">
        <HStack>
          <Text fontSize="sm" fontWeight="bold" color="gray.600">Academic Year:</Text>
          <Select 
            size="sm" 
            width="150px" 
            value={selectedYear} 
            onChange={(e) => onYearChange(e.target.value)}
            bg="white"
            borderColor="gray.300"
          >
            <option value="">All Years</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </HStack>
      </Flex>
      <Box
        bg="white"
        shadow="sm"
        border="1px"
        borderColor={border}
        overflowX="auto"
      >
        <Table size="sm" borderWidth="1px" borderColor={border}>
          <Thead>
            <Tr bg={headerRowBg}>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                School
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                Course
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                Current Year
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                Batch Strength
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                Internship/Placement Mode
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                is_eligible
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                opt in
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                Current Placement/others
              </Th>
              <Th
                fontSize="xs"
                textTransform="none"
                borderColor={border}
                textAlign="center"
              >
                Salary Range in LPA
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedRows.map((row, index) => {
              const key = row.school || 'Unknown';
              const isFirstOfSchool =
                index === 0 ||
                (sortedRows[index - 1].school || 'Unknown') !== key;
              
              const stats = salaryStats && salaryStats[key] ? salaryStats[key] : {
                 max: 0, min: 0, avg: 0, median: 0, paidInternships: 0
              };

              return (
                <Tr
                  key={`${row.school}-${row.course}-${row.year}-${index}`}
                  bg={getRowBgForSchool(row.school)}
                >
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    fontWeight="bold"
                    textAlign="center"
                    borderColor={border}
                  >
                    {row.school}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.course}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.currentYearLabel}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.batchStrength}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.mode}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.studentsTrained}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.optedIn}
                  </Td>
                  <Td
                    fontSize="sm"
                    color="gray.800"
                    borderColor={border}
                    textAlign="center"
                  >
                    {row.currentPlacement}
                  </Td>
                  {isFirstOfSchool && (
                    <Td
                      rowSpan={schoolRowCounts[key]}
                      fontSize="sm"
                      color="gray.800"
                      borderColor={border}
                      textAlign="center"
                      verticalAlign="middle"
                      p={4}
                    >
                      <SimpleGrid columns={2} spacingY={3} spacingX={4} textAlign="left" minW="180px">
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">Max</Text>
                          <Text fontWeight="bold" fontSize="md" color="green.600">{stats.max} LPA</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">Avg</Text>
                          <Text fontWeight="bold" fontSize="md" color="blue.600">{stats.avg} LPA</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">Median</Text>
                          <Text fontWeight="bold" fontSize="md" color="purple.600">{stats.median} LPA</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">Min</Text>
                          <Text fontWeight="bold" fontSize="md" color="orange.600">{stats.min} LPA</Text>
                        </Box>
                        <Box gridColumn="span 2" borderTop="1px dashed" borderColor="gray.200" pt={2} mt={1}>
                           <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Paid Internships</Text>
                              <Badge colorScheme="teal" variant="solid" borderRadius="full" px={2}>
                                {stats.paidInternships}
                              </Badge>
                           </HStack>
                        </Box>
                      </SimpleGrid>
                    </Td>
                  )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

const StudentEligibilityTab = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: '', school: '' });
  const [modifiedPolicies, setModifiedPolicies] = useState({}); // Map of id -> policy
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const policiesData = await PlacementService.getAllPolicies();
      setPolicies(policiesData);
      setModifiedPolicies({});
    } catch (error) {
      toast({ title: 'Error fetching data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncPolicies = async () => {
    try {
      setLoading(true);
      const res = await PlacementService.syncPolicies();
      toast({ title: 'Sync Successful', description: res.message, status: 'success' });
      fetchData();
    } catch (error) {
      toast({ title: 'Sync Failed', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePolicy = (policy, field) => {
    const updatedPolicy = {
        ...policy,
        [field]: !policy[field]
    };
    
    // Update local state
    setPolicies(prev => prev.map(p => p.id === policy.id ? updatedPolicy : p));
    
    // Track modification
    setModifiedPolicies(prev => ({
        ...prev,
        [policy.id]: updatedPolicy
    }));
  };

  const handleSaveChanges = async () => {
    try {
        setLoading(true);
        const updates = Object.values(modifiedPolicies);
        if (updates.length === 0) {
            toast({ title: 'No changes to save', status: 'info' });
            setLoading(false);
            return;
        }

        // Process updates in parallel
        await Promise.all(updates.map(p => PlacementService.upsertPolicy(p)));
        
        toast({ title: 'Changes saved successfully', status: 'success' });
        setModifiedPolicies({});
        // No need to refetch if we trust our local updates, but refetching is safer
        // fetchData(); 
    } catch (error) {
        toast({ title: 'Error saving changes', description: error.message, status: 'error' });
    } finally {
        setLoading(false);
    }
  };

  // Extract unique values for filters
  const uniqueYears = [...new Set(policies.map(p => p.joining_year))].sort().reverse();
  const uniqueSchools = [...new Set(policies.map(p => p.school_name))].sort();

  // Set default year filter if not set
  useEffect(() => {
    if (!filters.year && uniqueYears.length > 0) {
        setFilters(prev => ({ ...prev, year: uniqueYears[0].toString() }));
    }
  }, [uniqueYears, filters.year]);

  // Helper to get consistent color for school
  const getSchoolColor = (schoolName) => {
    if (!schoolName) return 'white';
    // Use softer, more pastel colors similar to dashboard/overview charts
    const colors = [
        '#E3F2FD', // Light Blue
        '#E8F5E9', // Light Green
        '#F3E5F5', // Light Purple
        '#FFF3E0', // Light Orange
        '#FFEBEE', // Light Red
        '#E0F2F1', // Light Teal
        '#E0F7FA', // Light Cyan
        '#FCE4EC', // Light Pink
        '#F1F8E9', // Light Lime
        '#FFF8E1'  // Light Amber
    ];
    let hash = 0;
    for (let i = 0; i < schoolName.length; i++) {
        hash = schoolName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Filter policies
  const filteredPolicies = policies.filter(p => {
      return (
          (!filters.year || p.joining_year.toString() === filters.year) &&
          (!filters.school || p.school_name === filters.school)
      );
  });

  return (
    <Box p={4} bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100">
       <HStack justify="space-between" mb={6}>
         <Heading size="md">placement eligbility track</Heading>
         <HStack>
             <Select 
                w="150px" 
                value={filters.year}
                onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
             >
                 {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
             </Select>
             <Select 
                placeholder="Filter School" 
                w="200px" 
                value={filters.school}
                onChange={e => setFilters(prev => ({ ...prev, school: e.target.value }))}
             >
                 {uniqueSchools.map(s => <option key={s} value={s}>{s}</option>)}
             </Select>
             <Button colorScheme="purple" onClick={handleSyncPolicies} isLoading={loading}>
               Sync All Programs
             </Button>
         </HStack>
       </HStack>

       {/* Table Section */}
       <Box overflowX="auto" mb={4}>
         <Table variant="simple" size="sm">
           <Thead bg="gray.50">
             <Tr>
               <Th>School</Th>
               <Th>Program</Th>
               <Th>Joining Year</Th>
               <Th textAlign="center">Immersion</Th>
               <Th textAlign="center">Internship</Th>
               <Th textAlign="center">Capstone</Th>
               <Th textAlign="center">Placement</Th>
               <Th textAlign="center">is_alumni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPolicies.map(policy => (
              <Tr key={policy.id} bg={getSchoolColor(policy.school_name)}>
                <Td>{policy.school_name}</Td>
                <Td>{policy.program_name}</Td>
                <Td>{policy.joining_year}</Td>
                <Td textAlign="center">
                  <Button 
                    size="xs" 
                    colorScheme={policy.summer_immersion ? 'green' : 'red'}
                    onClick={() => handleTogglePolicy(policy, 'summer_immersion')}
                    variant="solid"
                    width="60px"
                  >
                    {policy.summer_immersion ? 'Yes' : 'No'}
                  </Button>
                </Td>
                <Td textAlign="center">
                  <Button 
                    size="xs" 
                    colorScheme={policy.summer_internship ? 'green' : 'red'}
                    onClick={() => handleTogglePolicy(policy, 'summer_internship')}
                    variant="solid"
                    width="60px"
                  >
                    {policy.summer_internship ? 'Yes' : 'No'}
                  </Button>
                </Td>
                <Td textAlign="center">
                  <Button 
                    size="xs" 
                    colorScheme={policy.capstone ? 'green' : 'red'}
                    onClick={() => handleTogglePolicy(policy, 'capstone')}
                    variant="solid"
                    width="60px"
                  >
                    {policy.capstone ? 'Yes' : 'No'}
                  </Button>
                </Td>
                <Td textAlign="center">
                  <Button 
                    size="xs" 
                    colorScheme={policy.placement ? 'green' : 'red'}
                    onClick={() => handleTogglePolicy(policy, 'placement')}
                    variant="solid"
                    width="60px"
                  >
                    {policy.placement ? 'Yes' : 'No'}
                  </Button>
                </Td>
                <Td textAlign="center">
                  <Button 
                    size="xs" 
                    colorScheme={policy.alumni ? 'green' : 'red'}
                    onClick={() => handleTogglePolicy(policy, 'alumni')}
                    variant="solid"
                    width="60px"
                  >
                    {policy.alumni ? 'Yes' : 'No'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
         </Table>
       </Box>

       {/* Save Button */}
       <Flex justify="flex-end">
           <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={handleSaveChanges}
            isDisabled={Object.keys(modifiedPolicies).length === 0}
            isLoading={loading}
           >
               Save Changes
           </Button>
       </Flex>
    </Box>
  );
};


const Students = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Placement Overview State
  const [placementOverviewData, setPlacementOverviewData] = useState([]);
  const [placementSalaryStats, setPlacementSalaryStats] = useState({});
  const [availableAcademicYears, setAvailableAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  
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
    { id: 'student_is_eligible', label: 'is_eligible' },
    { id: 'opt_in', label: 'opt in' },
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

  const handleStudentUpdate = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.usn === updatedStudent.usn ? { ...s, ...updatedStudent } : s));
  };

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
    fetchPlacementOverview();
  }, []);

  useEffect(() => {
    fetchPlacementOverview();
  }, [selectedAcademicYear]);

  const fetchPlacementOverview = async () => {
    try {
      const data = await PlacementService.getPlacementOverview(selectedAcademicYear);
      setPlacementOverviewData(data.rows || []);
      setPlacementSalaryStats(data.schoolOverview || {});
      if (data.academicYears && data.academicYears.length > 0) {
         setAvailableAcademicYears(data.academicYears);
      }
    } catch (error) {
      console.error("Error fetching placement overview:", error);
      toast({
        title: 'Error fetching placement overview',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateMode = (graduationLevel, year) => {
    if (!year) return '-';
    // Graduation level might be 'UG' or 'PG' or undefined
    const level = graduationLevel ? graduationLevel.toUpperCase() : '';
    
    if (level === 'UG') {
      if (year === 1) return 'Foundation';
      if (year === 2) return 'Summer Internship';
      if (year >= 3) return 'Capstone & Placements';
    } else if (level === 'PG') {
      if (year === 1) return 'Foundation';
      if (year >= 2) return 'Capstone & Placement';
    }
    return '-';
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await PlacementService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: 'Error fetching students',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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

            case 'student_is_eligible': value = student.student_is_eligible === true ? 'Yes' : 'No'; break;
            case 'opt_in': value = student.opt_in === true ? 'Yes' : 'No'; break;

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
            case 'is_eligible': value = student.is_eligible === true ? 'Yes' : (student.is_eligible === false ? 'No' : '-'); break;
            case 'registration_status': value = student.registration_status || '-'; break;
            case 'approved_status': value = student.approved_status || '-'; break;
            case 'oa_status': value = student.oa_status === true ? 'Yes' : (student.oa_status === false ? 'No' : '-'); break;
            case 'gd_status': value = student.gd_status === true ? 'Yes' : (student.gd_status === false ? 'No' : '-'); break;
            case 'technical_round_status': value = student.technical_round_status === true ? 'Yes' : (student.technical_round_status === false ? 'No' : '-'); break;
            case 'interview_status': value = student.interview_status === true ? 'Yes' : (student.interview_status === false ? 'No' : '-'); break;
            case 'hr_round_status': value = student.hr_round_status === true ? 'Yes' : (student.hr_round_status === false ? 'No' : '-'); break;
            case 'final_select_status': value = student.final_select_status === true ? 'Shortlisted' : (student.final_select_status === false ? 'Rejected' : '-'); break;
            
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
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading as="h1" size="lg" color="gray.800" mb={1}>
                Students
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Browse all students or view placement overview
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

          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>View All Students</Tab>
              <Tab>Placement Overview</Tab>
              <Tab>placement track</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <Box
                  bg="white"
                  p={4}
                  borderRadius="xl"
                  shadow="sm"
                  mb={6}
                  border="1px"
                  borderColor="gray.100"
                >
                  <Flex
                    gap={4}
                    direction={{ base: 'column', md: 'row' }}
                    align="center"
                    flexWrap="wrap"
                  >
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
                        _focus={{ bg: 'white', boxShadow: 'outline', borderColor: 'blue.400' }}
                        _hover={{ borderColor: 'gray.300' }}
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
                      _focus={{ bg: 'white', boxShadow: 'outline', borderColor: 'blue.400' }}
                      _hover={{ borderColor: 'gray.300' }}
                    >
                      {schools.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
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
                      _focus={{ bg: 'white', boxShadow: 'outline', borderColor: 'blue.400' }}
                      _hover={{ borderColor: 'gray.300' }}
                    >
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </Select>

                    <HStack spacing={2} ml="auto">
                      <Button
                        leftIcon={<BsLayoutThreeColumns />}
                        bg="white"
                        border="1px"
                        borderColor="gray.200"
                        color="gray.600"
                        _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
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
                        _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
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

                <Box bg="white" borderRadius="xl" shadow="sm" overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="#172e36">
                      <Tr>
                        {visibleColumns.includes('index') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            #
                          </Th>
                        )}
                        {visibleColumns.includes('name') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            Name
                          </Th>
                        )}
                        {visibleColumns.includes('usn') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            USN
                          </Th>
                        )}
                        {visibleColumns.includes('school') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            School
                          </Th>
                        )}
                        {visibleColumns.includes('program') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            Program
                          </Th>
                        )}
                        {visibleColumns.includes('specialization') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            Specialization
                          </Th>
                        )}
                        {visibleColumns.includes('email') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            Email
                          </Th>
                        )}
                        {visibleColumns.includes('contact') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            Contact
                          </Th>
                        )}
                        {visibleColumns.includes('student_is_eligible') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            is_eligible
                          </Th>
                        )}
                        {visibleColumns.includes('opt_in') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            opt in
                          </Th>
                        )}
                        {visibleColumns.includes('placement') && (
                          <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>
                            Placement
                          </Th>
                        )}
                        {extraVisible.map((id) => (
                          <Th
                            key={id}
                            color="white"
                            fontSize="xs"
                            textTransform="uppercase"
                            py={4}
                          >
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
                            <Text mt={4} color="gray.500">
                              Loading students...
                            </Text>
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
                            {visibleColumns.includes('index') && (
                              <Td fontSize="sm" color="gray.600">
                                {indexOfFirstItem + index + 1}
                              </Td>
                            )}
                            {visibleColumns.includes('name') && (
                              <Td>
                                <Flex align="center">
                                  <Avatar
                                    size="xs"
                                    name={student.name}
                                    src={student.avatar}
                                    mr={2}
                                  />
                                  <Text fontWeight="600" color="gray.700" fontSize="sm">
                                    {student.name}
                                  </Text>
                                </Flex>
                              </Td>
                            )}
                            {visibleColumns.includes('usn') && (
                              <Td>
                                <Badge
                                  colorScheme="blue"
                                  fontSize="xs"
                                  variant="subtle"
                                >
                                  {student.usn}
                                </Badge>
                              </Td>
                            )}
                            {visibleColumns.includes('school') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.school}
                              </Td>
                            )}
                            {visibleColumns.includes('program') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.program}
                              </Td>
                            )}
                            {visibleColumns.includes('specialization') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.specialization || '-'}
                              </Td>
                            )}
                            {visibleColumns.includes('email') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.email}
                              </Td>
                            )}
                            {visibleColumns.includes('contact') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.contact || '-'}
                              </Td>
                            )}
                            {visibleColumns.includes('student_is_eligible') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.student_is_eligible === true ? 'Yes' : 'No'}
                              </Td>
                            )}
                            {visibleColumns.includes('opt_in') && (
                              <Td fontSize="sm" color="gray.600">
                                {student.opt_in === true ? 'Yes' : 'No'}
                              </Td>
                            )}
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
                                  <Text color="gray.400" fontSize="xs">
                                    Not Placed
                                  </Text>
                                )}
                              </Td>
                            )}
                            {extraVisible.map((id) => (
                              <Td key={id} fontSize="sm" color="gray.600">
                                {(() => {
                                  switch (id) {
                                    case 'gender':
                                      return student.gender || '-';
                                    case 'date_of_birth':
                                      return student.date_of_birth || '-';
                                    case 'blood_group':
                                      return student.blood_group || '-';
                                    case 'marital_status':
                                      return student.marital_status || '-';
                                    case 'specially_abled':
                                      return typeof student.specially_abled === 'boolean'
                                        ? student.specially_abled
                                          ? 'Yes'
                                          : 'No'
                                        : '-';
                                    case 'languages':
                                      return student.languages || '-';
                                    case 'year_of_joining':
                                      return student.year_of_joining || '-';
                                    case 'major':
                                      return student.major || '-';
                                    case 'minor':
                                      return student.minor || '-';
                                    case 'profile_image':
                                      return student.profile_image ? 'Available' : '-';
                                    case 'college_email':
                                      return student.college_email || '-';
                                    case 'personal_email':
                                      return student.email || '-';
                                    case 'phone':
                                      return student.phone_number || student.contact || '-';
                                    case 'links':
                                      return student.links ? 'Available' : '-';
                                    case 'latest_academic_year':
                                      return student.latest_academic_year || '-';
                                    case 'latest_semester':
                                      return student.latest_semester || '-';
                                    case 'latest_sgpa':
                                      return student.latest_sgpa || '-';
                                    case 'closed_backlogs':
                                      return student.closed_backlogs ?? '-';
                                    case 'live_backlogs':
                                      return student.live_backlogs ?? '-';
                                    case 'highest_education_level':
                                      return student.highest_education_level || '-';
                                    case 'latest_institute':
                                      return student.latest_institute || '-';
                                    case 'latest_year_of_passing':
                                      return student.latest_year_of_passing || '-';
                                    case 'latest_result':
                                      return student.latest_result || '-';
                                    case 'projects_count':
                                      return student.projects_count ?? '-';
                                    case 'latest_project_title':
                                      return student.latest_project_title || '-';
                                    case 'internships_count':
                                      return student.internships_count ?? '-';
                                    case 'latest_internship_org':
                                      return student.latest_internship_org || '-';
                                    case 'latest_internship_stipend':
                                      return student.latest_internship_stipend || '-';
                                    case 'trainings_count':
                                      return student.trainings_count ?? '-';
                                    case 'latest_training_title':
                                      return student.latest_training_title || '-';
                                    case 'certifications_count':
                                      return student.certifications_count ?? '-';
                                    case 'latest_certification_title':
                                      return student.latest_certification_title || '-';
                                    case 'publications_count':
                                      return student.publications_count ?? '-';
                                    case 'latest_publication_title':
                                      return student.latest_publication_title || '-';
                                    case 'latest_publication_date':
                                      return student.latest_publication_date || '-';
                                    case 'is_eligible':
                                      return student.is_eligible === true
                                        ? 'Yes'
                                        : student.is_eligible === false
                                          ? 'No'
                                          : '-';
                                    case 'registration_status':
                                      return student.registration_status || '-';
                                    case 'approved_status':
                                      return student.approved_status || '-';
                                    case 'oa_status':
                                      return student.oa_status === true
                                        ? 'Yes'
                                        : student.oa_status === false
                                          ? 'No'
                                          : '-';
                                    case 'gd_status':
                                      return student.gd_status === true
                                        ? 'Yes'
                                        : student.gd_status === false
                                          ? 'No'
                                          : '-';
                                    case 'technical_round_status':
                                      return student.technical_round_status === true
                                        ? 'Yes'
                                        : student.technical_round_status === false
                                          ? 'No'
                                          : '-';
                                    case 'interview_status':
                                      return student.interview_status === true
                                        ? 'Yes'
                                        : student.interview_status === false
                                          ? 'No'
                                          : '-';
                                    case 'hr_round_status':
                                      return student.hr_round_status === true
                                        ? 'Yes'
                                        : student.hr_round_status === false
                                          ? 'No'
                                          : '-';
                                    case 'final_select_status':
                                      return student.final_select_status === true
                                        ? 'Shortlisted'
                                        : student.final_select_status === false
                                          ? 'Rejected'
                                          : '-';
                                    case 'offer_company_name':
                                      return (
                                        student.offer_company_name ||
                                        student.placement?.company_name ||
                                        '-'
                                      );
                                    case 'offer_job_type':
                                      return student.offer_job_type || '-';
                                    case 'offer_designation':
                                      return student.offer_designation || '-';
                                    case 'offer_letter_status':
                                      return student.offer_letter_status || '-';
                                    case 'ctc_min_lpa':
                                      return student.ctc_min_lpa || '-';
                                    case 'ctc_max_lpa':
                                      return student.ctc_max_lpa || '-';
                                    default:
                                      return '-';
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

                <Modal
                  isOpen={isColumnModalOpen}
                  onClose={() => setIsColumnModalOpen(false)}
                  size="4xl"
                  scrollBehavior="inside"
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Select Columns</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <VStack align="stretch" spacing={6}>
                        {columnGroups.map((group) => (
                          <Box
                            key={group.id}
                            borderWidth="1px"
                            borderRadius="lg"
                            p={4}
                            bg="gray.50"
                          >
                            <Flex justify="space-between" align="center" mb={4}>
                              <Heading size="sm" color="gray.700">
                                {group.label}
                              </Heading>
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => {
                                    const ids = group.columns.map((c) => c.id);
                                    setVisibleColumns((prev) =>
                                      Array.from(new Set([...prev, ...ids])),
                                    );
                                  }}
                                >
                                  Select All
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const ids = group.columns.map((c) => c.id);
                                    setVisibleColumns((prev) =>
                                      prev.filter((id) => !ids.includes(id)),
                                    );
                                  }}
                                >
                                  Clear
                                </Button>
                              </HStack>
                            </Flex>
                            <Divider mb={4} borderColor="gray.300" />
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                              {group.columns.map((col) => (
                                <Checkbox
                                  key={col.id}
                                  isChecked={visibleColumns.includes(col.id)}
                                  onChange={() => {
                                    setVisibleColumns((prev) =>
                                      prev.includes(col.id)
                                        ? prev.filter((id) => id !== col.id)
                                        : [...prev, col.id],
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
                        <Button variant="ghost" onClick={() => setIsColumnModalOpen(false)}>
                          Close
                        </Button>
                      </HStack>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={isDownloadModalOpen}
                  onClose={() => setIsDownloadModalOpen(false)}
                  size="4xl"
                  scrollBehavior="inside"
                >
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
                              <Box
                                p={4}
                                bg="blue.50"
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor="blue.200"
                              >
                                <Checkbox
                                  isChecked={
                                    downloadSelectedColumns.length ===
                                    new Set(allColumnsMeta.map((c) => c.id)).size
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setDownloadSelectedColumns(
                                        Array.from(
                                          new Set(allColumnsMeta.map((c) => c.id)),
                                        ),
                                      );
                                    } else {
                                      setDownloadSelectedColumns(
                                        baseColumns.map((c) => c.id),
                                      );
                                    }
                                  }}
                                  fontWeight="bold"
                                  colorScheme="blue"
                                >
                                  Select All Columns (Master File)
                                </Checkbox>
                                <Text fontSize="xs" color="gray.600" mt={1} ml={6}>
                                  Selects every available column from all tables for a complete
                                  master export.
                                </Text>
                              </Box>

                              <Divider />

                              {columnGroups.map((group) => (
                                <Box
                                  key={group.id}
                                  borderWidth="1px"
                                  borderRadius="lg"
                                  p={4}
                                  bg="gray.50"
                                >
                                  <Flex justify="space-between" align="center" mb={4}>
                                    <Heading size="sm" color="gray.700">
                                      {group.label}
                                    </Heading>
                                    <HStack spacing={2}>
                                      <Button
                                        size="xs"
                                        colorScheme="blue"
                                        variant="ghost"
                                        onClick={() => {
                                          const ids = group.columns.map((c) => c.id);
                                          setDownloadSelectedColumns((prev) =>
                                            Array.from(new Set([...prev, ...ids])),
                                          );
                                        }}
                                      >
                                        Select All
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => {
                                          const ids = group.columns.map((c) => c.id);
                                          setDownloadSelectedColumns((prev) =>
                                            prev.filter((id) => !ids.includes(id)),
                                          );
                                        }}
                                      >
                                        Clear
                                      </Button>
                                    </HStack>
                                  </Flex>
                                  <Divider mb={4} borderColor="gray.300" />
                                  <SimpleGrid
                                    columns={{ base: 1, md: 2, lg: 3 }}
                                    spacing={3}
                                  >
                                    {group.columns.map((col) => (
                                      <Checkbox
                                        key={col.id}
                                        isChecked={downloadSelectedColumns.includes(col.id)}
                                        onChange={() => {
                                          setDownloadSelectedColumns((prev) =>
                                            prev.includes(col.id)
                                              ? prev.filter((id) => id !== col.id)
                                              : [...prev, col.id],
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
                                      onChange={(e) =>
                                        setFileTypes((prev) => ({
                                          ...prev,
                                          profileImage: e.target.checked,
                                        }))
                                      }
                                    >
                                      Profile Images
                                    </Checkbox>
                                    <Checkbox
                                      isChecked={fileTypes.resume}
                                      onChange={(e) =>
                                        setFileTypes((prev) => ({
                                          ...prev,
                                          resume: e.target.checked,
                                        }))
                                      }
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
                      <Button
                        variant="ghost"
                        mr={3}
                        onClick={() => setIsDownloadModalOpen(false)}
                      >
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

                {filteredStudents.length > 0 && (
                  <Flex justify="space-between" align="center" mt={6}>
                    <Text fontSize="sm" color="gray.500">
                      Showing {indexOfFirstItem + 1} to{' '}
                      {Math.min(indexOfLastItem, filteredStudents.length)} of{' '}
                      {filteredStudents.length} entries
                    </Text>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        isDisabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        isDisabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </TabPanel>
              <TabPanel px={0}>
                <PlacementOverviewTab 
                  rows={placementOverviewData} 
                  salaryStats={placementSalaryStats}
                  academicYears={availableAcademicYears}
                  selectedYear={selectedAcademicYear}
                  onYearChange={setSelectedAcademicYear}
                />
              </TabPanel>
              <TabPanel px={0}>
                <StudentEligibilityTab students={students} onUpdate={handleStudentUpdate} />
              </TabPanel>
            </TabPanels>
          </Tabs>

        </Container>
      </Box>
    </AdminLayout>
  );
};

export default Students;
