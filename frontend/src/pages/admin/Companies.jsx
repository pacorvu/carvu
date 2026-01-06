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
  Image,
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
  Textarea,
  Select,
  IconButton
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const Companies = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  // Form State
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    description: '',
    company_type: '',
    address: '',
    website: '',
    linkedin: '',
    logo: '',
    hr_email: '',
    contact_phone: '',
    contact_role: ''
  });
  const [remarksList, setRemarksList] = useState(['']);

  // School Stats (Mock for now, similar to Job Offers)
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
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      toast({
        title: "Error fetching companies",
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
    setNewCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleRemarkChange = (index, value) => {
    const updatedRemarks = [...remarksList];
    updatedRemarks[index] = value;
    setRemarksList(updatedRemarks);
  };

  const handleAddRemark = () => {
    setRemarksList([...remarksList, '']);
  };

  const handleRemoveRemark = (index) => {
    const updatedRemarks = remarksList.filter((_, i) => i !== index);
    setRemarksList(updatedRemarks);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCompany(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.company_name) {
      toast({ title: "Company Name is required", status: "warning" });
      return;
    }

    // Map remarks list to schema fields
    const companyData = {
      ...newCompany,
      remarks1: remarksList[0] || '',
      remarks2: remarksList[1] || '',
      remarks3: remarksList[2] || '',
      // Ensure we map logo to company_logo_link for backend compatibility if needed, 
      // but we are moving to 'logo' as requested. The service will handle it.
      company_logo_link: newCompany.logo // Temporarily map for backward compat until service is fully migrated
    };

    try {
      await PlacementService.addCompany(companyData);
      toast({ title: "Company added successfully", status: "success" });
      onClose();
      setNewCompany({
        company_name: '',
        description: '',
        company_type: '',
        address: '',
        website: '',
        linkedin: '',
        logo: '',
        hr_email: '',
        contact_phone: '',
        contact_role: ''
      });
      setRemarksList(['']);
      fetchCompanies();
    } catch (error) {
      toast({ title: "Error adding company", status: "error" });
    }
  };

  const filteredCompanies = companies.filter(company => {
    return company.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          {/* Header */}
          <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.800">All Companies</Heading>
              <Text color="gray.500" fontSize="sm">Browse hiring partners; click for full details</Text>
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
                Add Company
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
            <InputGroup maxW="100%">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Search companies" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="gray.50"
                border="none"
                _focus={{ bg: "white", boxShadow: "outline" }}
              />
            </InputGroup>
          </Box>

          {/* School Stats Filters */}
          <Box mb={8}>
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontWeight="bold" color="gray.700" fontSize="sm">Filter by School</Text>
              {selectedSchool && (
                 <Button size="xs" onClick={() => setSelectedSchool('')}>Clear School Filter</Button>
              )}
            </Flex>
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

          {/* Company Grid */}
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={6}>
            {filteredCompanies.map((company) => (
              <Flex 
                key={company.id} 
                direction="column" 
                align="center" 
                justify="center"
                p={4}
                bg="transparent"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => navigate(`/placement/company/${company.id}`)}
              >
                <Box 
                  boxSize="80px" 
                  bg="white" 
                  borderRadius="full" 
                  overflow="hidden" 
                  boxShadow="sm" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  mb={2}
                >
                   {company.logo || company.company_logo_link ? (
                      <Image src={company.logo || company.company_logo_link} alt={company.company_name} objectFit="contain" maxH="60%" maxW="60%" />
                   ) : (
                      <Text 
                        fontWeight="bold" 
                        fontSize="2xl" 
                        color={company.color || "gray.400"}
                        fontFamily={company.fontFamily || "serif"}
                      >
                        {company.company_name.substring(0, 2).toUpperCase()}
                      </Text>
                   )}
                </Box>
                <Text fontWeight="bold" fontSize="md" color="gray.800" textAlign="center" noOfLines={2}>
                  {company.company_name}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>

          {/* Add Company Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Company</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Company Name</FormLabel>
                    <Input name="company_name" value={newCompany.company_name} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea name="description" value={newCompany.description} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Company Type</FormLabel>
                    <Select name="company_type" placeholder="Select Company Type" value={newCompany.company_type} onChange={handleInputChange}>
                      <option value="Service">Service</option>
                      <option value="Product">Product</option>
                      <option value="Construction">Construction</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Startup">Startup</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>HR Email</FormLabel>
                    <Input name="hr_email" type="email" value={newCompany.hr_email} onChange={handleInputChange} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel>Contact Number</FormLabel>
                      <Input name="contact_phone" type="tel" value={newCompany.contact_phone} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Role / Designation</FormLabel>
                      <Input name="contact_role" value={newCompany.contact_role} onChange={handleInputChange} />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Textarea name="address" value={newCompany.address} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input name="website" value={newCompany.website} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>LinkedIn</FormLabel>
                    <Input name="linkedin" value={newCompany.linkedin} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Logo</FormLabel>
                    <Input type="file" accept="image/*" onChange={handleLogoChange} p={1} />
                    {newCompany.logo && <Image src={newCompany.logo} alt="Preview" boxSize="50px" mt={2} objectFit="contain" />}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <VStack spacing={2} align="stretch">
                      {remarksList.map((remark, index) => (
                        <HStack key={index}>
                          <Input 
                            value={remark} 
                            onChange={(e) => handleRemarkChange(index, e.target.value)} 
                            placeholder={`Remark ${index + 1}`}
                          />
                          {remarksList.length > 1 && (
                            <IconButton 
                              icon={<DeleteIcon />} 
                              colorScheme="red" 
                              variant="ghost" 
                              onClick={() => handleRemoveRemark(index)} 
                              aria-label="Remove remark"
                            />
                          )}
                        </HStack>
                      ))}
                      <Button leftIcon={<AddIcon />} size="sm" onClick={handleAddRemark} alignSelf="flex-start">
                        Add Remark
                      </Button>
                    </VStack>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="green" bg="#22c35e" onClick={handleAddCompany}>
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

export default Companies;