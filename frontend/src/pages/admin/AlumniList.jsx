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
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  useToast,
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
  Container,
  VStack,
  Badge,
  Icon,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  Spinner,
  Select
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ExternalLinkIcon, CheckIcon, CopyIcon, EmailIcon } from '@chakra-ui/icons';
import { FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const AlumniList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Manual Add Alumni Modal
  const { isOpen: isPromoteOpen, onOpen: onPromoteOpen, onClose: onPromoteClose } = useDisclosure(); // Promote Modal
  const { isOpen: isEmailOpen, onOpen: onEmailOpen, onClose: onEmailClose } = useDisclosure(); // Email Modal (Optional)

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Promotion State
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of USNs
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [promotionMessage, setPromotionMessage] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear());
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [yearOfJoiningFilter, setYearOfJoiningFilter] = useState('');
  const [showOnlyPersonalEmail, setShowOnlyPersonalEmail] = useState(true);

  // Form State (Manual Add)
  const [newAlumni, setNewAlumni] = useState({
    usn: '',
    full_name: '',
    graduation_year: '',
    current_company: '',
    current_designation: '',
    current_work_location: '',
    personal_email: '',
    phone_number: '',
    linkedin: '',
    other_links: ''
  });

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAllAlumni();
      setAlumni(data);
    } catch (error) {
      toast({
        title: "Error fetching alumni",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const data = await PlacementService.getAllStudents();
      // Filter out students who are already alumni? Maybe backend handles it, but good to filter.
      // For now, just fetch all.
      setStudents(data);
    } catch (error) {
      toast({ title: "Error fetching students", description: error.message, status: "error" });
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleOpenPromote = () => {
    fetchStudents();
    onPromoteOpen();
  };

  const handleStudentSelect = (usn) => {
    setSelectedStudents(prev => {
      if (prev.includes(usn)) return prev.filter(id => id !== usn);
      return [...prev, usn];
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(s => s.usn));
    } else {
      setSelectedStudents([]);
    }
  };

  const handlePromoteStudents = async () => {
    if (!selectedStudents.length) {
      toast({ title: "Select at least one student", status: "warning" });
      return;
    }
    setPromoting(true);
    try {
      const payload = {
        students: selectedStudents.map(usn => ({ usn })),
        message: promotionMessage,
        graduationYear: parseInt(graduationYear)
      };
      
      // Need to add promoteStudents to PlacementService
      // Assuming it's added as PlacementService.promoteStudents(payload)
      // I'll define it here or update the service file separately. 
      // For now, I'll update service file next.
      
      const res = await PlacementService.promoteStudents(payload);
      
      toast({ 
        title: "Promotion Completed", 
        description: `Successfully promoted ${res.successCount} students. ${res.failureCount > 0 ? `${res.failureCount} failed.` : ''}`,
        status: "success",
        duration: 5000
      });
      
      onPromoteClose();
      setSelectedStudents([]);
      setPromotionMessage('');
      fetchAlumni();
      
    } catch (error) {
      toast({ title: "Promotion failed", description: error.message, status: "error" });
    } finally {
      setPromoting(false);
    }
  };

  const handleCopyEmails = () => {
    const emails = filteredAlumni
        .map(a => a.personal_email)
        .filter(e => e) // remove nulls
        .join(', ');
        
    if (!emails) {
        toast({ title: "No emails to copy", status: "info" });
        return;
    }
    
    navigator.clipboard.writeText(emails);
    toast({ title: "Emails copied to clipboard", status: "success" });
  };

  const handleCopyRvuEmails = () => {
    const targetStudents = students.filter(s => {
      const name = s.name || s.full_name || '';
      const usn = s.usn || '';
      const school = s.school || '';
      const program = s.program || '';
      const yearOfJoining = s.year_of_joining ? String(s.year_of_joining) : '';
      const searchLower = studentSearchQuery.toLowerCase();
      const matchesSearch =
        !searchLower ||
        name.toLowerCase().includes(searchLower) ||
        usn.toLowerCase().includes(searchLower);
      const matchesSchool = !selectedSchool || school === selectedSchool;
      const matchesProgram = !selectedProgram || program === selectedProgram;
      const matchesYear =
        !yearOfJoiningFilter || yearOfJoining.startsWith(String(yearOfJoiningFilter));
      const personalEmail = s.personal_email || s.email;
      const hasPersonalEmail = !!personalEmail;
      return matchesSearch && matchesSchool && matchesProgram && matchesYear && !hasPersonalEmail;
    });
    const emails = targetStudents
      .map(s => s.college_email || s.collegeEmail || s.college_mail || s.collegeEmailId)
      .filter(Boolean)
      .join(', ');
      
    if (!emails) {
      toast({ title: "No RVU emails to copy", status: "info" });
      return;
    }

    navigator.clipboard.writeText(emails);
    toast({ title: "RVU emails copied to clipboard", status: "success" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlumni(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAlumni = async () => {
    if (!newAlumni.usn || !newAlumni.full_name) {
      toast({ title: "USN and Name are required", status: "warning" });
      return;
    }

    try {
      await PlacementService.addAlumni(newAlumni);
      toast({ title: "Alumni added successfully", status: "success" });
      onClose();
      setNewAlumni({
        usn: '',
        full_name: '',
        graduation_year: '',
        current_company: '',
        current_designation: '',
        current_work_location: '',
        personal_email: '',
        phone_number: '',
        linkedin: '',
        other_links: ''
      });
      fetchAlumni();
    } catch (error) {
      toast({ title: error.message || "Error adding alumni", status: "error" });
    }
  };

  const filteredAlumni = alumni.filter(a => {
    const searchLower = searchQuery.toLowerCase();
    return (
      a.full_name?.toLowerCase().includes(searchLower) ||
      a.usn?.toLowerCase().includes(searchLower) ||
      a.current_company?.toLowerCase().includes(searchLower)
    );
  });

  const filteredStudents = students.filter(s => {
    const searchLower = studentSearchQuery.toLowerCase();
    const name = s.name || s.full_name || '';
    const usn = s.usn || '';
    const school = s.school || '';
    const program = s.program || '';
    const yearOfJoining = s.year_of_joining ? String(s.year_of_joining) : '';
    const personalEmail = s.personal_email || s.email;
    const hasPersonalEmail = !!personalEmail;
    const matchesSearch =
      !searchLower ||
      name.toLowerCase().includes(searchLower) ||
      usn.toLowerCase().includes(searchLower);
    const matchesSchool = !selectedSchool || school === selectedSchool;
    const matchesProgram = !selectedProgram || program === selectedProgram;
    const matchesYear =
      !yearOfJoiningFilter || yearOfJoining.startsWith(String(yearOfJoiningFilter));
    const matchesEmail =
      !showOnlyPersonalEmail || hasPersonalEmail;
    return matchesSearch && matchesSchool && matchesProgram && matchesYear && matchesEmail;
  });

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          {/* Header */}
          <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.800">Alumni Network</Heading>
              <Text color="gray.500" fontSize="sm">Track and manage alumni placement records</Text>
            </Box>
            <HStack spacing={3}>
              <Button 
                bg="blue.600" 
                color="white" 
                _hover={{ bg: "blue.700" }}
                leftIcon={<Icon as={FaUserGraduate} />}
                onClick={handleOpenPromote}
                size="sm"
              >
                Promote Students
              </Button>
              <Button 
                bg="#22c35e" 
                color="white" 
                _hover={{ bg: "#1da851" }}
                leftIcon={<AddIcon boxSize={3} />}
                onClick={onOpen}
                size="sm"
              >
                Add Manual
              </Button>
               <Button 
                variant="outline"
                colorScheme="gray"
                leftIcon={<CopyIcon />}
                onClick={handleCopyEmails}
                size="sm"
              >
                Copy Emails
              </Button>
            </HStack>
          </Flex>

          {/* Search */}
          <Box bg="white" p={4} borderRadius="xl" shadow="sm" mb={6}>
            <InputGroup maxW="100%">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Search alumni by name, USN, or company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="gray.50"
                border="none"
                _focus={{ bg: "white", boxShadow: "outline" }}
              />
            </InputGroup>
          </Box>

          {/* Alumni Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredAlumni.map((alum) => (
              <Card 
                key={alum.usn} 
                bg="white" 
                boxShadow="sm" 
                borderRadius="xl" 
                cursor="pointer"
                _hover={{ boxShadow: "md", transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                onClick={() => navigate(`/placement/alumni/${alum.usn}`)}
              >
                <CardBody>
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="gray.800">{alum.full_name}</Text>
                      <Text fontSize="sm" color="gray.500">{alum.usn}</Text>
                    </Box>
                    <Badge colorScheme="blue" variant="subtle">{alum.graduation_year}</Badge>
                  </Flex>
                  
                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">Current Role</Text>
                    <Text fontSize="md" fontWeight="medium" color="#20343c">{alum.current_designation || 'N/A'}</Text>
                    <Text fontSize="sm" color="blue.600">{alum.current_company || 'N/A'}</Text>
                  </Box>

                  <HStack mt={4} spacing={4} color="gray.400">
                    {alum.personal_email && <Icon as={EmailIcon} title={alum.personal_email} />}
                    {alum.linkedin && <Icon as={ExternalLinkIcon} title="LinkedIn" />}
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {filteredAlumni.length === 0 && !loading && (
             <Box textAlign="center" py={10}>
                <Text color="gray.500">No alumni found.</Text>
             </Box>
          )}

          {/* Promote Students Modal */}
          <Modal isOpen={isPromoteOpen} onClose={onPromoteClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Promote Students to Alumni</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {studentsLoading ? (
                        <Flex justify="center" align="center" minH="200px">
                            <Spinner size="xl" />
                        </Flex>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">
                                Select students to promote. Their current student password will be reused for their alumni login (personal email).
                            </Text>
                            
                            <HStack>
                                <Input 
                                    placeholder="Search students..." 
                                    value={studentSearchQuery}
                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                />
                                <Flex align="center" gap={2}>
                                    <Text fontSize="sm" whiteSpace="nowrap" color="gray.600">Grad Year:</Text>
                                    <Input 
                                        type="number" 
                                        value={graduationYear} 
                                        onChange={(e) => setGraduationYear(e.target.value)} 
                                        maxW="100px"
                                    />
                                </Flex>
                            </HStack>

                            <Checkbox
                                isChecked={showOnlyPersonalEmail}
                                onChange={(e) => {
                                    setShowOnlyPersonalEmail(e.target.checked);
                                    setSelectedStudents([]);
                                }}
                            >
                                Show only students with personal email (for promotion)
                            </Checkbox>

                            <HStack>
                                <Select
                                    placeholder="All Schools"
                                    value={selectedSchool}
                                    onChange={(e) => {
                                        setSelectedSchool(e.target.value);
                                        setSelectedProgram('');
                                        setYearOfJoiningFilter('');
                                    }}
                                >
                                    {Array.from(new Set(students.map(s => s.school).filter(Boolean))).sort().map(school => (
                                        <option key={school} value={school}>
                                            {school}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="All Programs"
                                    value={selectedProgram}
                                    onChange={(e) => {
                                        setSelectedProgram(e.target.value);
                                        setYearOfJoiningFilter('');
                                    }}
                                    isDisabled={!selectedSchool}
                                >
                                    {Array.from(new Set(students
                                        .filter(s => !selectedSchool || s.school === selectedSchool)
                                        .map(s => s.program)
                                        .filter(Boolean)
                                    )).sort().map(program => (
                                        <option key={program} value={program}>
                                            {program}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="Year of Joining"
                                    value={yearOfJoiningFilter}
                                    onChange={(e) => setYearOfJoiningFilter(e.target.value)}
                                    isDisabled={!selectedProgram}
                                    maxW="180px"
                                >
                                    {Array.from(new Set(students
                                        .filter(s => 
                                            (!selectedSchool || s.school === selectedSchool) &&
                                            (!selectedProgram || s.program === selectedProgram)
                                        )
                                        .map(s => s.year_of_joining)
                                        .filter(Boolean)
                                    )).sort().map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Select>
                                <Button 
                                    onClick={() => {
                                        setSelectedSchool('');
                                        setSelectedProgram('');
                                        setYearOfJoiningFilter('');
                                    }}
                                    isDisabled={!selectedSchool && !selectedProgram && !yearOfJoiningFilter}
                                    colorScheme="gray"
                                >
                                    Clear
                                </Button>
                            </HStack>

                            <Box maxH="400px" overflowY="auto" borderWidth="1px" borderRadius="md">
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                                        <Tr>
                                            <Th width="40px">
                                                <Checkbox 
                                                    isChecked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                                    isIndeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </Th>
                                            <Th>USN</Th>
                                            <Th>Name</Th>
                                            <Th>Email</Th>
                                            <Th>Program</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredStudents.map(student => (
                                            <Tr key={student.usn} _hover={{ bg: "gray.50" }}>
                                                <Td>
                                                    <Checkbox 
                                                        isChecked={selectedStudents.includes(student.usn)}
                                                        onChange={() => handleStudentSelect(student.usn)}
                                                        isDisabled={!(student.personal_email || student.email)}
                                                    />
                                                </Td>
                                                <Td fontWeight="medium">{student.usn}</Td>
                                                <Td>{student.name || student.full_name}</Td>
                                                <Td>{student.personal_email || student.email || student.college_email || student.collegeEmail || '-'}</Td>
                                                <Td>{student.program || '-'}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                                {filteredStudents.length === 0 && (
                                    <Box p={4} textAlign="center" color="gray.500">No students found</Box>
                                )}
                            </Box>

                            <FormControl>
                                <FormLabel>Notification Message (Optional)</FormLabel>
                                <Textarea 
                                    placeholder="Enter a welcome message to send to these alumni..." 
                                    value={promotionMessage}
                                    onChange={(e) => setPromotionMessage(e.target.value)}
                                    rows={3}
                                />
                            </FormControl>

                            <Box bg="blue.50" p={3} borderRadius="md">
                                <Text fontSize="xs" color="blue.700">
                                    <strong>Note:</strong> Selected students will be added to the Alumni table. 
                                    Their <strong>Personal Email</strong> will be used as their new Alumni Login ID. 
                                    Their <strong>Student Password</strong> will be reused.
                                </Text>
                            </Box>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onPromoteClose}>Cancel</Button>
                    <Button
                        variant="outline"
                        mr={3}
                        leftIcon={<CopyIcon />}
                        onClick={handleCopyRvuEmails}
                        isDisabled={students.length === 0}
                    >
                        Copy RVU Emails
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handlePromoteStudents}
                        isLoading={promoting}
                        loadingText="Promoting..."
                        isDisabled={selectedStudents.length === 0}
                    >
                        Promote ({selectedStudents.length})
                    </Button>
                </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Add Alumni Modal (Manual) */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Alumni (Manual)</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl isRequired>
                      <FormLabel>USN</FormLabel>
                      <Input name="usn" value={newAlumni.usn} onChange={handleInputChange} placeholder="1RVU..." />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input name="full_name" value={newAlumni.full_name} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl>
                    <FormLabel>Graduation Year</FormLabel>
                    <Input name="graduation_year" type="number" value={newAlumni.graduation_year} onChange={handleInputChange} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl>
                      <FormLabel>Current Company</FormLabel>
                      <Input name="current_company" value={newAlumni.current_company} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Designation</FormLabel>
                      <Input name="current_designation" value={newAlumni.current_designation} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Work Location</FormLabel>
                    <Input name="current_work_location" value={newAlumni.current_work_location} onChange={handleInputChange} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl>
                      <FormLabel>Personal Email</FormLabel>
                      <Input name="personal_email" value={newAlumni.personal_email} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input name="phone_number" value={newAlumni.phone_number} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <Input name="linkedin" value={newAlumni.linkedin} onChange={handleInputChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Other Links</FormLabel>
                    <Input name="other_links" value={newAlumni.other_links} onChange={handleInputChange} />
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="green" bg="#22c35e" onClick={handleAddAlumni}>
                  Save Alumni
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

        </Container>
      </Box>
    </AdminLayout>
  );
};

export default AlumniList;
