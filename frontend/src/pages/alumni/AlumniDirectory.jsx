import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  useToast,
  Badge,
  Icon,
  HStack
} from '@chakra-ui/react';
import { SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAlumni = alumni.filter(a => {
    const searchLower = searchQuery.toLowerCase();
    return (
      a.full_name?.toLowerCase().includes(searchLower) ||
      a.usn?.toLowerCase().includes(searchLower) ||
      a.current_company?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AlumniLayout>
      <Box mb={6}>
        <Heading color="#172e36">Alumni Directory</Heading>
        <Text color="gray.600">Connect with fellow alumni.</Text>
      </Box>

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
                  {/* USN removed as requested */}
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
    </AlumniLayout>
  );
};

export default AlumniDirectory;