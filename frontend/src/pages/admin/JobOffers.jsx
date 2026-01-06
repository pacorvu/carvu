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
  Spinner
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

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
    if (!newOffer.student_name || !newOffer.company_name) {
      toast({ title: "Student Name and Company are required", status: "warning" });
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
      toast({ title: "Error adding offer", status: "error" });
    }
  };

  // Stats for the School Filter Cards
  // Hardcoded to match screenshot for visual accuracy, but could be dynamic
  const schoolStats = [
    { name: 'SoB', count: 222 },
    { name: 'SoCSE - BTech', count: 198 },
    { name: 'SoB - PG', count: 167 },
    { name: 'SoD - UG', count: 113 },
    { name: 'SoCSE - BSc', count: 106 },
    { name: 'SoB (Hons)', count: 62 },
    { name: 'SoLAS', count: 37 },
    { name: 'SoD - PG', count: 33 },
    { name: 'SoE', count: 22 },
    { name: 'SoFMA', count: 6 },
  ];

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
    setSelectedSchool('');
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
  const companies = [...new Set(offers.map(o => o.company_name))];
  const jobTypes = [...new Set(offers.map(o => o.job_type))];

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.usn?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = selectedCompany ? offer.company_name === selectedCompany : true;
    const matchesJobType = selectedJobType ? offer.job_type === selectedJobType : true;
    const matchesSchool = selectedSchool ? offer.school === selectedSchool : true;
    
    return matchesSearch && matchesCompany && matchesJobType && matchesSchool;
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

          {/* Search */}
          <Box bg="white" p={4} borderRadius="xl" shadow="sm" mb={6}>
            <VStack spacing={4} align="stretch">
              <InputGroup maxW="100%">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by student, company, role, type" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.50"
                  border="none"
                  _focus={{ bg: "white", boxShadow: "outline" }}
                />
              </InputGroup>

              {/* Filters Row */}
              <HStack spacing={4} wrap="wrap">
                <Select 
                  placeholder="Filter by Company" 
                  maxW="200px" 
                  bg="gray.50"
                  border="none"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select 
                  placeholder="Filter by Job Type" 
                  maxW="200px" 
                  bg="gray.50"
                  border="none"
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                >
                  {jobTypes.map(j => <option key={j} value={j}>{j}</option>)}
                </Select>
                <Button size="sm" variant="ghost" onClick={handleClearFilters} color="gray.500">
                  Clear Filters
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* School Stats Filters */}
          <Box mb={8}>
            <Text fontWeight="bold" mb={3} color="gray.700" fontSize="sm">Filter by School</Text>
            <Flex gap={4} wrap="wrap">
              {schoolStats.map((stat) => (
                <Card 
                  key={stat.name} 
                  bg="white" 
                  boxShadow="sm" 
                  borderRadius="xl" 
                  cursor="pointer"
                  border={selectedSchool === stat.name ? "2px solid #d1a85d" : "1px solid transparent"}
                  onClick={() => setSelectedSchool(selectedSchool === stat.name ? '' : stat.name)}
                  minW="100px"
                  _hover={{ boxShadow: "md", transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  <CardBody p={3} textAlign="center">
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>{stat.name}</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">{stat.count}</Text>
                  </CardBody>
                </Card>
              ))}
            </Flex>
          </Box>

          {/* Offers Table */}
          <Box bg="white" borderRadius="xl" shadow="sm" overflowX="auto">
            <Table variant="simple">
              <Thead bg="#172e36">
                <Tr>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>USN</Th>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Student</Th>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Company</Th>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Designation</Th>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Job Type</Th>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>CTC (LPA) <span style={{fontSize: '10px'}}>⇅</span></Th>
                  <Th color="white" fontSize="xs" textTransform="uppercase" py={4}>Offer Letter Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={10}>
                      <Spinner size="xl" color="blue.500" />
                      <Text mt={4} color="gray.500">Loading offers...</Text>
                    </Td>
                  </Tr>
                ) : offers.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={10}>
                      <Text color="gray.500">No offers found</Text>
                    </Td>
                  </Tr>
                ) : (
                  offers.map((offer) => (
                    <Tr key={offer.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                      <Td>
                        <Badge colorScheme="purple" fontSize="xs" variant="subtle">{offer.usn}</Badge>
                      </Td>
                      <Td fontSize="sm" fontWeight="600" color="gray.700">
                        {offer.student_name}
                      </Td>
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
                      <Td fontSize="sm" color="gray.600">
                        {offer.designation}
                      </Td>
                      <Td fontSize="sm" color="gray.600">{offer.job_type}</Td>
                      <Td fontSize="sm" color="gray.600">{offer.ctc || '-'}</Td>
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
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          {/* Add Job Offer Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Job Offer</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Students</FormLabel>
                    <Input name="student_name" placeholder="Type name, USN, school or program" value={newOffer.student_name} onChange={handleInputChange} />
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
