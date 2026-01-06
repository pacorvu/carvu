import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Avatar,
  Badge,
  Button,
  Spinner,
  useToast,
  Icon
} from '@chakra-ui/react';
import { ViewIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlacementService } from '../../services/placement.service';
import CompanyLayout from '../../components/CompanyLayout';

const CompanyFavStudents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await PlacementService.getCompanyFavoriteStudents(user.id);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (error) {
      console.error("Error fetching favorite students", error);
      toast({
        title: "Error",
        description: "Failed to fetch favorite students.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (studentUsn) => {
    try {
        const res = await PlacementService.toggleCompanyStudentFavorite(user.id, studentUsn);
        if (res.success && !res.isFavorited) {
             setStudents(prev => prev.filter(s => s.usn !== studentUsn));
             toast({
                title: "Removed",
                description: "Student removed from favorites.",
                status: "info",
                duration: 2000,
                isClosable: true,
             });
        }
    } catch (error) {
        console.error("Error removing favorite", error);
    }
  };

  if (loading) {
    return (
      <CompanyLayout>
        <Container centerContent py={20}>
          <Spinner size="xl" color="#d4a960" />
        </Container>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <Box mb={8}>
        <Heading color="#172e36" mb={2}>Favorite Students</Heading>
        <Text color="gray.600">Students you have bookmarked for recruitment.</Text>
      </Box>

      {students.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="xl" boxShadow="sm">
          <Text color="gray.500">No favorite students yet.</Text>
          <Button mt={4} colorScheme="blue" variant="outline" onClick={() => navigate('/company/dashboard')}>
            Browse Students via Drives
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {students.map((student) => (
            <Card 
              key={student.usn} 
              bg="white" 
              boxShadow="sm" 
              borderRadius="xl" 
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack spacing={4}>
                  <Avatar size="xl" name={student.name} src={student.profile_image} bg="#172e36" color="white" />
                  <VStack spacing={1}>
                    <Heading size="md" textAlign="center" color="#172e36">{student.name}</Heading>
                    <Text fontSize="sm" color="gray.500">{student.usn}</Text>
                  </VStack>
                  
                  <Badge colorScheme="blue" borderRadius="full" px={3}>
                    {student.specialization || student.program}
                  </Badge>

                  <VStack w="full" pt={4}>
                    <Button 
                      w="full" 
                      leftIcon={<ViewIcon />} 
                      colorScheme="teal" 
                      variant="solid"
                      onClick={() => navigate(`/placement/students/${student.usn}`)}
                    >
                      View Profile
                    </Button>
                     <Button 
                      w="full" 
                      leftIcon={<StarIcon />} 
                      colorScheme="yellow" 
                      variant="outline"
                      onClick={() => handleRemoveFavorite(student.usn)}
                    >
                      Remove Favorite
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </CompanyLayout>
  );
};

export default CompanyFavStudents;
