import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Badge,
  Container,
  Spinner,
  useToast,
  Link,
  SimpleGrid,
  Card,
  CardBody,
  Divider,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure
} from '@chakra-ui/react';
import { ArrowBackIcon, ExternalLinkIcon, EditIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';

const AlumniDetails = () => {
  const { user } = useAuth();
  const { usn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const isAlumni = user?.role === 'alumni';
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchDetails();
  }, [usn]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAlumniByUsn(usn);
      if (!data) {
        toast({ title: "Alumni not found", status: "error" });
        navigate('/placement/alumni');
        return;
      }
      setAlumni(data);
      setEditData(data);
    } catch (error) {
      toast({ title: "Error loading data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await PlacementService.updateAlumni(usn, editData);
      setAlumni(editData);
      onClose();
      toast({ title: "Updated successfully", status: "success" });
    } catch (error) {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const Layout = isAlumni ? AlumniLayout : AdminLayout;

  if (loading) {
    return (
      <Layout>
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Layout>
    );
  }

  if (!alumni) return null;

  return (
    <Layout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="5xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          
          {/* Header */}
          <Flex mb={6} justify="space-between" align="center">
            <Box>
              <Button 
                leftIcon={<ArrowBackIcon />} 
                variant="link" 
                mb={2} 
                onClick={() => navigate(isAlumni ? '/placement/alumni-directory' : '/placement/alumni')}
              >
                Back to List
              </Button>
              <Heading size="lg" color="gray.800">{alumni.full_name}</Heading>
              <Text color="gray.500" fontSize="md">{alumni.usn} • Batch of {alumni.graduation_year}</Text>
            </Box>
            {!isAlumni && (
            <Button leftIcon={<EditIcon />} colorScheme="blue" variant="outline" onClick={onOpen}>
              Edit Profile
            </Button>
            )}
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            
            {/* Left Column: Personal Info */}
            <Box gridColumn={{ md: "span 1" }}>
              <Card borderRadius="xl" boxShadow="sm" bg="white">
                <CardBody>
                   <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Contact</Text>
                        <HStack mt={2}>
                           <EmailIcon color="gray.400" />
                           <Text fontSize="sm">{alumni.personal_email || "N/A"}</Text>
                        </HStack>
                        <HStack mt={2}>
                           <PhoneIcon color="gray.400" />
                           <Text fontSize="sm">{alumni.phone_number || "N/A"}</Text>
                        </HStack>
                      </Box>
                      <Divider />
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Social</Text>
                        {alumni.linkedin && (
                          <Link href={alumni.linkedin} isExternal color="blue.500" fontSize="sm" mt={2} display="block">
                            LinkedIn Profile <ExternalLinkIcon mx="2px" />
                          </Link>
                        )}
                        {alumni.other_links && (
                          <Link href={alumni.other_links} isExternal color="blue.500" fontSize="sm" mt={1} display="block">
                            Portfolio / Other <ExternalLinkIcon mx="2px" />
                          </Link>
                        )}
                      </Box>
                   </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* Right Column: Work Info */}
            <Box gridColumn={{ md: "span 2" }}>
              <Card borderRadius="xl" boxShadow="sm" bg="white" mb={6}>
                <CardBody>
                  <Heading size="md" mb={4} color="gray.700">Current Employment</Heading>
                  <SimpleGrid columns={2} spacing={6}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Company</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">{alumni.current_company}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Designation</Text>
                      <Text fontSize="lg" fontWeight="medium">{alumni.current_designation}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Work Location</Text>
                      <Text fontSize="md">{alumni.current_work_location}</Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
              
              {/* Placeholder for future sections like "Career History" or "Mentorship" */}
              <Card borderRadius="xl" boxShadow="sm" bg="white" border="1px dashed" borderColor="gray.200">
                <CardBody textAlign="center" py={8}>
                  <Text color="gray.400">Career history timeline coming soon...</Text>
                </CardBody>
              </Card>
            </Box>
          </SimpleGrid>

          {/* Edit Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Alumni Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl isReadOnly>
                      <FormLabel>USN</FormLabel>
                      <Input value={editData.usn} bg="gray.100" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input name="full_name" value={editData.full_name} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl>
                    <FormLabel>Graduation Year</FormLabel>
                    <Input name="graduation_year" type="number" value={editData.graduation_year} onChange={handleInputChange} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl>
                      <FormLabel>Current Company</FormLabel>
                      <Input name="current_company" value={editData.current_company} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Designation</FormLabel>
                      <Input name="current_designation" value={editData.current_designation} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Work Location</FormLabel>
                    <Input name="current_work_location" value={editData.current_work_location} onChange={handleInputChange} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl>
                      <FormLabel>Personal Email</FormLabel>
                      <Input name="personal_email" value={editData.personal_email} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input name="phone_number" value={editData.phone_number} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <Input name="linkedin" value={editData.linkedin} onChange={handleInputChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Other Links</FormLabel>
                    <Input name="other_links" value={editData.other_links} onChange={handleInputChange} />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleUpdate}>Update</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

        </Container>
      </Box>
    </Layout>
  );
};

export default AlumniDetails;
