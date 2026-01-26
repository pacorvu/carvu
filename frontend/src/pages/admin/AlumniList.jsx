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
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ExternalLinkIcon, CopyIcon, EmailIcon } from '@chakra-ui/icons';

import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';
import AlumniRegistrationCodes from './AlumniRegistrationCodes';

const AlumniList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Manual Add Alumni Modal
  
  // Tab State
  const [tabIndex, setTabIndex] = useState(0);

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

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
          </Flex>

          <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed" colorScheme="blue" bg="white" borderRadius="xl" shadow="sm" p={2}>
            <TabList mb={4}>
                <Tab fontWeight="bold">Current Alumni</Tab>
                <Tab fontWeight="bold">Manage Registrations</Tab>
            </TabList>

            <TabPanels>
                {/* --- Tab 1: Current Alumni --- */}
                <TabPanel p={0}>
                    <Flex mb={6} justify="space-between" align="center" gap={4} wrap="wrap">
                         <Box flex="1">
                            <InputGroup>
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
                         <Button 
                            variant="outline"
                            colorScheme="gray"
                            leftIcon={<CopyIcon />}
                            onClick={handleCopyEmails}
                            size="md"
                        >
                            Copy Emails
                        </Button>
                    </Flex>

                    {loading ? (
                         <Flex justify="center" py={10}><Spinner /></Flex>
                    ) : (
                        <>
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
                                    borderWidth="1px"
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

                            {filteredAlumni.length === 0 && (
                                <Box textAlign="center" py={10}>
                                    <Text color="gray.500">No alumni found.</Text>
                                </Box>
                            )}
                        </>
                    )}
                </TabPanel>

                {/* --- Tab 2: Manage Registrations --- */}
                <TabPanel p={0}>
                    <AlumniRegistrationCodes />
                </TabPanel>
            </TabPanels>
          </Tabs>

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