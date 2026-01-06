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
  Icon
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const AlumniList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
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
            <HStack spacing={3}>
              <Button 
                bg="#22c35e" 
                color="white" 
                _hover={{ bg: "#1da851" }}
                leftIcon={<AddIcon boxSize={3} />}
                onClick={onOpen}
                size="sm"
              >
                Add Alumni
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
                    <Text fontSize="md" fontWeight="medium" color="#20343c">{alum.current_designation}</Text>
                    <Text fontSize="sm" color="blue.600">{alum.current_company}</Text>
                  </Box>

                  <HStack mt={4} spacing={4} color="gray.400">
                    {alum.linkedin && <Icon as={ExternalLinkIcon} />}
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

          {/* Add Alumni Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Alumni</ModalHeader>
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
