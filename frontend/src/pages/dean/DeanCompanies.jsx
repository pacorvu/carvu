import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Badge,
  HStack,
  Spinner,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Container
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const DeanCompanies = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const inputFocusBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchCompanies = async () => {
      if (user?.school) {
        try {
          const result = await PlacementService.getCompaniesBySchool(user.school);
          setCompanies(result);
        } catch (error) {
          console.error("Error fetching school companies:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompanies();
  }, [user]);

  const filteredCompanies = companies.filter(company => 
    company.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.company_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box pb={10}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>{user.school} - Recruiting Partners</Heading>
        <Text color={textColor}>Companies visiting or hiring from your school</Text>
      </Box>

      {/* Search */}
      <Box bg={cardBg} p={4} borderRadius="xl" shadow="sm" mb={6}>
        <InputGroup maxW="100%">
            <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
            placeholder="Search companies by name or industry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={inputBg}
            border="none"
            _focus={{ bg: inputFocusBg, boxShadow: "outline" }}
            />
        </InputGroup>
      </Box>

      {filteredCompanies.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {filteredCompanies.map((company, index) => (
            <Card key={index} bg={cardBg} boxShadow="md" _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
              <CardBody>
                <Flex align="center" mb={4}>
                  <Box 
                    w="50px" 
                    h="50px" 
                    bg={company.color || 'gray.200'} 
                    borderRadius="md" 
                    mr={4} 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="xl"
                    color="white"
                    boxShadow="sm"
                  >
                    {company.logo ? (
                        <img src={company.logo} alt={company.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                        company.company_name ? company.company_name.substring(0, 1) : 'C'
                    )}
                  </Box>
                  <Box overflow="hidden">
                    <Heading size="md" noOfLines={1}>{company.company_name}</Heading>
                    <Text fontSize="sm" color="gray.500">{company.company_type}</Text>
                  </Box>
                </Flex>
                
                <HStack spacing={2} mb={3}>
                  {company.remarks1 && <Badge colorScheme="green">{company.remarks1}</Badge>}
                  {company.remarks2 && <Badge colorScheme="blue">{company.remarks2}</Badge>}
                </HStack>
                
                <Text fontSize="sm" color={textColor} noOfLines={3} mb={4}>
                  {company.description || "No description available."}
                </Text>

                <HStack fontSize="xs" color="gray.500" spacing={4}>
                    {company.website && (
                        <Text as="a" href={company.website} target="_blank" rel="noopener noreferrer" _hover={{ color: 'blue.500', textDecoration: 'underline' }}>
                            Website
                        </Text>
                    )}
                    {company.location && <Text>📍 {company.location}</Text>}
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Flex direction="column" align="center" justify="center" h="200px" bg={cardBg} borderRadius="lg">
            <Text fontSize="lg" color="gray.500">No companies found for your school yet.</Text>
            <Text fontSize="sm" color="gray.400">Companies will appear here once they schedule drives or hire students.</Text>
        </Flex>
      )}
    </Box>
  );
};

export default DeanCompanies;
