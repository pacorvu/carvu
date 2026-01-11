import React, { useState, useEffect, useMemo } from 'react';
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
  Badge,
  Flex,
  Spacer,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  useToast,
  Link as ChakraLink,
  Container,
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
  Textarea,
  Spinner,
  Checkbox,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import { BsLayoutThreeColumns } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const JobOffers = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Column Visibility State
  const baseColumns = [
    { id: 'usn', label: 'USN' },
    { id: 'student', label: 'Student' },
    { id: 'company', label: 'Company' },
    { id: 'designation', label: 'Designation' },
    { id: 'job_type', label: 'Job Type' },
    { id: 'ctc', label: 'CTC (LPA)' },
    { id: 'status', label: 'Status' },
  ];

  const columnGroups = [
    {
      id: 'offer_details',
      label: 'Offer Details',
      columns: [
        { id: 'usn', label: 'USN' },
        { id: 'student', label: 'Student' },
        { id: 'company', label: 'Company' },
        { id: 'designation', label: 'Designation' },
        { id: 'job_type', label: 'Job Type' },
        { id: 'ctc', label: 'CTC (LPA)' },
        { id: 'status', label: 'Status' },
      ],
    },
  ];

  const [visibleColumns, setVisibleColumns] = useState(baseColumns.map(c => c.id));
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSchools, setSelectedSchools] = useState([]);

  // New Offer Form State
  const [newOffer, setNewOffer] = useState({
    student_name: '',
    usn: '',
    company_name: '',
    designation: '',
    job_type: '',
    internship_duration: '',
    internship_stipend: '',
    ctc_min: '',
    ctc_max: '',
    variable_pay: '',
    offer_letter_status: '',
    final_interview_status: '',
    remarks: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOffer(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOffer = async () => {
    if (!newOffer.usn || !newOffer.company_name) {
      toast({ title: "Student USN and Company are required", status: "warning" });
      return;
    }

    try {
      const offerPayload = {
        ...newOffer,
        ctc_min_lpa: newOffer.ctc_min,
        ctc_max_lpa: newOffer.ctc_max,
        ctc_variable_pay: newOffer.variable_pay
      };
      
      await PlacementService.addJobOffer(offerPayload);
      toast({ title: "Job Offer added successfully", status: "success" });
      onClose();
      // Reset form
      setNewOffer({
        student_name: '',
        usn: '',
        company_name: '',
        designation: '',
        job_type: '',
        internship_duration: '',
        internship_stipend: '',
        ctc_min: '',
        ctc_max: '',
        variable_pay: '',
        offer_letter_status: '',
        final_interview_status: '',
        remarks: ''
      });
      fetchOffers();
    } catch (error) {
      toast({ title: error.message || "Error adding offer", status: "error" });
    }
  };

  // Master list of schools to ensure all are displayed
  const ALL_SCHOOLS = [
    'SoB',
    'SoCSE - BTech',
    'SoB - PG',
    'SoD - UG',
    'SoCSE - BSc',
    'SoB (Hons)',
    'SoLAS',
    'SoD - PG',
    'SoE',
    'SoFMA'
  ];

  // Stats for the School Filter Cards
  const schoolStats = useMemo(() => {
    // Initialize with 0 for all master schools
    const stats = ALL_SCHOOLS.reduce((acc, school) => {
      acc[school] = 0;
      return acc;
    }, {});

    offers.forEach(offer => {
      const school = offer.school ? offer.school.trim() : 'Other';
      stats[school] = (stats[school] || 0) + 1;
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [offers]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAllJobOffers();
      setOffers(data);
    } catch (error) {
      toast({
        title: "Error fetching offers",
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
    setSelectedJobType('');
    setSelectedSchools([]);
  };

  const handleDownloadExcel = () => {
    if (filteredOffers.length === 0) {
      toast({ title: "No data to export", status: "warning" });
      return;
    }

    const exportData = filteredOffers.map(offer => ({
      USN: offer.usn,
      "Student Name": offer.student_name,
      Company: offer.company_name,
      Designation: offer.designation,
      "Job Type": offer.job_type,
      "Internship Duration": offer.internship_duration,
      "Internship Stipend": offer.internship_stipend,
      "CTC Min (LPA)": offer.ctc_min_lpa || offer.ctc,
      "CTC Max (LPA)": offer.ctc_max_lpa,
      "Variable Pay": offer.ctc_variable_pay,
      "Offer Letter Status": offer.offer_letter_status,
      "Final Interview Status": offer.final_interview_status,
      Remarks: offer.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Job Offers");
    
    XLSX.writeFile(wb, "Job_Offers.xlsx");
    
    toast({ title: "Download started", status: "success" });
  };

  // Unique companies for dropdown
  const companies = [...new Set(offers.map(o => o.company_name).filter(Boolean))];
  const jobTypes = [...new Set(offers.map(o => o.job_type).filter(Boolean))];

  // Search Priority Logic
  const getMatchScore = (offer, query) => {
    if (!query) return 0;
    const q = query.toLowerCase();
    
    // Priority 1: Student Name
    if ((offer.student_name?.toLowerCase() || '').includes(q)) return 4;
    // Priority 2: Company Name
    if ((offer.company_name?.toLowerCase() || '').includes(q)) return 3;
    // Priority 3: USN
    if ((offer.usn?.toLowerCase() || '').includes(q)) return 2;
    // Priority 4: Other columns (Designation, Job Type, etc.)
    if ((offer.designation?.toLowerCase() || '').includes(q)) return 1;
    if ((offer.job_type?.toLowerCase() || '').includes(q)) return 1;
    
    return 0;
  };

  const filteredOffers = offers.filter(offer => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (offer.student_name?.toLowerCase() || '').includes(query) ||
      (offer.company_name?.toLowerCase() || '').includes(query) ||
      (offer.designation?.toLowerCase() || '').includes(query) ||
      (offer.usn?.toLowerCase() || '').includes(query) ||
      (offer.job_type?.toLowerCase() || '').includes(query);
    
    const matchesCompany = selectedCompany ? offer.company_name === selectedCompany : true;
    const matchesJobType = selectedJobType ? offer.job_type === selectedJobType : true;
    const matchesSchool = selectedSchools.length > 0 ? selectedSchools.some(selected => {
      const offerSchool = offer.school ? offer.school.trim() : 'Other';
      return offerSchool === selected;
    }) : true;
    
    return matchesSearch && matchesCompany && matchesJobType && matchesSchool;
  }).sort((a, b) => {
    // Apply sort only if there is a search query
    if (!searchQuery) return 0;
    return getMatchScore(b, searchQuery) - getMatchScore(a, searchQuery);
  });

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          {/* Header */}
          <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.800">Job Offers</Heading>
              <Text color="gray.500" fontSize="sm">All job offers across students and companies</Text>
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
                bg="#22c35e" 
                color="white" 
                _hover={{ bg: "#1da851" }}
                leftIcon={<AddIcon boxSize={3} />}
                onClick={onOpen}
                size="sm"
              >
                Add Offer
              </Button>
              <Button 
                colorScheme="blue"
                variant="outline"
                leftIcon={<DownloadIcon />}
                onClick={handleDownloadExcel}
                size="sm"
              >
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                colorScheme="purple" 
                borderColor="purple.400" 
                color="purple.500"
                _hover={{ bg: "purple.50" }}
                onClick={() => navigate('/placement/companies')}
                size="sm"
              >
                Add New Company
              </Button>
              <Button 
                variant="outline" 
                borderColor="gray.300"
                onClick={() => navigate(-1)}
                size="sm"
                bg="white"
              >
                Back
              </Button>
            </HStack>
          </Flex>

          {/* Search & Filters Section */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm" mb={6} border="1px solid" borderColor="gray.100">
            <Flex gap={4} wrap="wrap" align="center">
              {/* Search Bar */}
              <InputGroup size="md" maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by Student Name, Company, USN..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ bg: "white", borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                  _hover={{ borderColor: "gray.300" }}
                />
              </InputGroup>

              {/* Filters */}
              <Select 
                placeholder="All Companies" 
                maxW="200px" 
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                _focus={{ borderColor: "blue.500" }}
                size="md"
              >
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select 
                placeholder="All Job Types" 
                maxW="180px" 
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                _focus={{ borderColor: "blue.500" }}
                size="md"
              >
                {jobTypes.map(j => <option key={j} value={j}>{j}</option>)}
              </Select>
              
              <Spacer />
              
              {(searchQuery || selectedCompany || selectedJobType || selectedSchools.length > 0) && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="red" 
                  onClick={handleClearFilters} 
                  leftIcon={<span style={{fontSize: '16px'}}>×</span>}
                >
                  Clear All Filters
                </Button>
              )}
            </Flex>
          </Box>

          {/* School Stats Filters */}
          <Box mb={8}>
            <Flex justify="space-between" align="center" mb={4}>
               <Text fontWeight="700" color="gray.700" fontSize="lg">Filter by School</Text>
               {selectedSchools.length > 0 && (
                 <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
                   Selected: {selectedSchools.join(', ')}
                 </Badge>
               )}
            </Flex>
            <Flex gap={4} wrap="wrap" pb={2}>
              {schoolStats.map((stat) => {
                const isSelected = selectedSchools.includes(stat.name);
                return (
                  <Card 
                    key={stat.name} 
                    bg={isSelected ? "blue.50" : "white"}
                    boxShadow={isSelected ? "md" : "sm"}
                    borderRadius="xl" 
                    cursor="pointer"
                    border="1px solid"
                    borderColor={isSelected ? "blue.400" : "gray.100"}
                    onClick={() => {
                        setSelectedSchools(prev => 
                            isSelected 
                            ? prev.filter(s => s !== stat.name)
                            : [...prev, stat.name]
                        );
                    }}
                    minW="110px"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: "md", borderColor: "blue.200" }}
                    transition="all 0.2s"
                  >
                    <CardBody p={4} textAlign="center">
                      <Text fontSize="xs" fontWeight="bold" color={isSelected ? "blue.600" : "gray.500"} mb={1} textTransform="uppercase" letterSpacing="wide">
                        {stat.name}
                      </Text>
                      <Text fontSize="2xl" fontWeight="800" color={isSelected ? "blue.700" : "gray.700"}>
                        {stat.count}
                      </Text>
                    </CardBody>
                  </Card>
                );
              })}
            </Flex>
          </Box>

          {/* Offers Table */}
          <Box bg="white" borderRadius="xl" shadow="sm" overflowX="auto" border="1px solid" borderColor="gray.100">
            <Table variant="simple">
              <Thead bg="gray.50" borderBottom="2px solid" borderColor="gray.100">
                <Tr>
                  {visibleColumns.includes('usn') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">USN</Th>}
                  {visibleColumns.includes('student') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">Student</Th>}
                  {visibleColumns.includes('company') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">Company</Th>}
                  {visibleColumns.includes('designation') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">Designation</Th>}
                  {visibleColumns.includes('job_type') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">Job Type</Th>}
                  {visibleColumns.includes('ctc') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">CTC (LPA)</Th>}
                  {visibleColumns.includes('status') && <Th color="gray.600" fontSize="xs" textTransform="uppercase" py={5} letterSpacing="wider">Status</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={visibleColumns.length} textAlign="center" py={10}>
                      <Spinner size="xl" color="blue.500" />
                      <Text mt={4} color="gray.500">Loading offers...</Text>
                    </Td>
                  </Tr>
                ) : filteredOffers.length === 0 ? (
                  <Tr>
                    <Td colSpan={visibleColumns.length} textAlign="center" py={10}>
                      <Text color="gray.500">No offers found</Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredOffers.map((offer) => (
                    <Tr key={offer.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                      {visibleColumns.includes('usn') && (
                        <Td>
                          <Badge colorScheme="purple" fontSize="xs" variant="subtle">{offer.usn}</Badge>
                        </Td>
                      )}
                      {visibleColumns.includes('student') && (
                        <Td fontSize="sm" fontWeight="600" color="gray.700">
                          {offer.student_name}
                        </Td>
                      )}
                      {visibleColumns.includes('company') && (
                        <Td fontSize="sm" fontWeight="600" color="gray.700">
                          {offer.company_id ? (
                            <Text 
                              as="span" 
                              color="blue.600" 
                              cursor="pointer" 
                              _hover={{ textDecoration: 'underline' }}
                              onClick={() => navigate(`/placement/company/${offer.company_id}`)}
                            >
                              {offer.company_name}
                            </Text>
                          ) : (
                            offer.company_name
                          )}
                        </Td>
                      )}
                      {visibleColumns.includes('designation') && (
                        <Td fontSize="sm" color="gray.600">
                          {offer.designation}
                        </Td>
                      )}
                      {visibleColumns.includes('job_type') && <Td fontSize="sm" color="gray.600">{offer.job_type}</Td>}
                      {visibleColumns.includes('ctc') && <Td fontSize="sm" color="gray.600">{offer.ctc || '-'}</Td>}
                      {visibleColumns.includes('status') && (
                        <Td>
                          <Badge 
                            colorScheme={
                              ['Issued', 'Accepted'].includes(offer.offer_letter_status) ? 'green' :
                              ['Yet to Receive', 'Pending'].includes(offer.offer_letter_status) ? 'orange' :
                              offer.offer_letter_status === 'Rejected' ? 'red' : 'gray'
                            }
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="xs"
                            textTransform="capitalize"
                          >
                            {offer.offer_letter_status}
                          </Badge>
                        </Td>
                      )}
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

          {/* Add Job Offer Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Job Offer</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Student USN</FormLabel>
                    <Input name="usn" placeholder="Enter Student USN" value={newOffer.usn} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Company</FormLabel>
                    <Input name="company_name" placeholder="Search or type company" value={newOffer.company_name} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Designation</FormLabel>
                    <Input name="designation" value={newOffer.designation} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Type</FormLabel>
                    <Select name="job_type" placeholder="Select Job Type" value={newOffer.job_type} onChange={handleInputChange}>
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                    </Select>
                  </FormControl>
                  
                  <HStack width="100%" spacing={4}>
                    <FormControl>
                      <FormLabel>Internship Duration</FormLabel>
                      <Input name="internship_duration" value={newOffer.internship_duration} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Internship Stipend</FormLabel>
                      <Input name="internship_stipend" value={newOffer.internship_stipend} onChange={handleInputChange} />
                    </FormControl>
                  </HStack>

                  <HStack width="100%" spacing={4}>
                    <FormControl>
                      <FormLabel>CTC Min (LPA)</FormLabel>
                      <Input name="ctc_min" value={newOffer.ctc_min} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>CTC Max (LPA)</FormLabel>
                      <Input name="ctc_max" value={newOffer.ctc_max} onChange={handleInputChange} />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>CTC Variable Pay</FormLabel>
                    <Input name="variable_pay" value={newOffer.variable_pay} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Offer Letter Status</FormLabel>
                    <Input name="offer_letter_status" value={newOffer.offer_letter_status} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Final Interview Status</FormLabel>
                    <Input name="final_interview_status" value={newOffer.final_interview_status} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <Textarea name="remarks" value={newOffer.remarks} onChange={handleInputChange} />
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="green" bg="#22c35e" onClick={handleAddOffer}>
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

        </Container>
      </Box>
    </AdminLayout>
  );
};

export default JobOffers;
