import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Image,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Container,
  Spinner,
  useToast,
  Link,
  Icon,
  Divider,
  SimpleGrid
} from '@chakra-ui/react';
import { ArrowBackIcon, ExternalLinkIcon, EditIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [company, setCompany] = useState(null);
  const [drives, setDrives] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch Company Info
      const companyData = await PlacementService.getCompanyById(id);
      if (!companyData) {
        toast({ title: "Company not found", status: "error" });
        navigate('/placement/companies');
        return;
      }
      setCompany(companyData);

      // 2. Fetch Placements (Drives)
      const drivesData = await PlacementService.getCompanyDrives(id);
      setDrives(drivesData);

      // 3. Fetch Job Offers (Students)
      const offersData = await PlacementService.getCompanyOffers(id);
      setOffers(offersData);

    } catch (error) {
      console.error("Error fetching details:", error);
      toast({ title: "Error loading data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </AdminLayout>
    );
  }

  if (!company) return null;

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          
          {/* Header */}
          <Flex mb={6} justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="gray.800">Company Details</Heading>
              <Text color="gray.500" fontSize="sm">Full company info with placements and offers</Text>
            </Box>
            <HStack spacing={3}>
               {/* Placeholder for edit functionality if needed */}
              <Button leftIcon={<EditIcon />} size="sm" variant="outline" colorScheme="blue">Edit</Button>
              <Button leftIcon={<ArrowBackIcon />} size="sm" variant="outline" onClick={() => navigate(-1)} bg="white">
                Back
              </Button>
            </HStack>
          </Flex>

          {/* Company Info Card */}
          <Card mb={8} borderRadius="xl" shadow="sm" overflow="hidden">
            <CardBody p={6}>
              <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="start">
                {/* Logo */}
                <Box 
                  boxSize="100px" 
                  bg="white" 
                  border="1px solid" 
                  borderColor="gray.100" 
                  borderRadius="lg" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  flexShrink={0}
                >
                   {company.logo || company.company_logo_link ? (
                      <Image src={company.logo || company.company_logo_link} alt={company.company_name} objectFit="contain" maxH="80%" maxW="80%" />
                   ) : (
                      <Text 
                        fontWeight="bold" 
                        fontSize="3xl" 
                        color={company.color || "gray.300"}
                        fontFamily={company.fontFamily || "serif"}
                      >
                        {company.company_name.substring(0, 2).toUpperCase()}
                      </Text>
                   )}
                </Box>

                {/* Details */}
                <Box flex="1">
                  <Flex justify="space-between" align="start">
                    <Heading size="md" mb={2}>{company.company_name}</Heading>
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="md">{company.company_type}</Badge>
                  </Flex>
                  
                  <Text color="gray.600" mb={4} fontSize="sm">
                    {company.description || "No description available."}
                  </Text>

                  <HStack spacing={6} fontSize="sm">
                    {company.website && (
                      <Link href={company.website} isExternal color="blue.500" fontWeight="medium">
                        Website <ExternalLinkIcon mx="2px" />
                      </Link>
                    )}
                    {company.linkedin && (
                      <Link href={company.linkedin} isExternal color="blue.600" fontWeight="medium">
                        LinkedIn <ExternalLinkIcon mx="2px" />
                      </Link>
                    )}
                  </HStack>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Placements (Drives) Section */}
          <Box mb={8}>
            <Heading size="md" mb={4} color="gray.700">Placements</Heading>
            <Card borderRadius="xl" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#172e36">
                    <Tr>
                      <Th color="white">TPO</Th>
                      <Th color="white">Year</Th>
                      <Th color="white">School</Th>
                      <Th color="white">Course</Th>
                      <Th color="white">Job Profile</Th>
                      <Th color="white">Job Type</Th>
                      <Th color="white">Avg Internship Stipend</Th>
                      <Th color="white">CTC in LPA</Th>
                      <Th color="white">Final Selects</Th>
                      <Th color="white">Company Remarks</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {drives.length > 0 ? (
                      drives.map((drive) => (
                        <Tr key={drive.id} _hover={{ bg: "gray.50" }}>
                          <Td>{drive.tpo}</Td>
                          <Td>{drive.year}</Td>
                          <Td>{drive.school}</Td>
                          <Td>{drive.course}</Td>
                          <Td fontWeight="medium">{drive.job_profile}</Td>
                          <Td>{drive.job_type}</Td>
                          <Td>{drive.internship_stipend}</Td>
                          <Td>{drive.ctc}</Td>
                          <Td>
                             <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>
                               {drive.no_shortlisted}
                             </Badge>
                          </Td>
                          <Td color="gray.500" fontSize="xs" maxW="200px" isTruncated>{drive.company_remarks || "-"}</Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={10} textAlign="center" py={4} color="gray.500">
                          No placement drives found.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Card>
          </Box>

          {/* Students & Job Offers Section */}
          <Box>
            <Heading size="md" mb={4} color="gray.700">Students & Job Offers</Heading>
            <Card borderRadius="xl" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#172e36">
                    <Tr>
                      <Th color="white">USN</Th>
                      <Th color="white">Student Name</Th>
                      <Th color="white">School</Th>
                      <Th color="white">CTC</Th>
                      <Th color="white">Job Type</Th>
                      <Th color="white">Designation</Th>
                      <Th color="white">Offer Letter Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {offers.length > 0 ? (
                      offers.map((offer) => (
                        <Tr 
                          key={offer.id} 
                          _hover={{ bg: "gray.50", cursor: "pointer" }}
                          onClick={() => navigate(`/placement/students/${offer.usn}`)}
                        >
                          <Td>
                            <Badge variant="subtle" colorScheme="blue">{offer.usn}</Badge>
                          </Td>
                          <Td fontWeight="medium">{offer.student_name}</Td>
                          <Td>{offer.school || "-"}</Td>
                          <Td>{offer.ctc}</Td>
                          <Td>{offer.job_type}</Td>
                          <Td>{offer.designation}</Td>
                          <Td>
                            <Badge 
                              colorScheme={offer.offer_letter_status === 'Issued' ? 'green' : 'orange'}
                            >
                              {offer.offer_letter_status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={4} color="gray.500">
                          No students hired yet.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Card>
          </Box>

        </Container>
      </Box>
    </AdminLayout>
  );
};

export default CompanyDetails;
