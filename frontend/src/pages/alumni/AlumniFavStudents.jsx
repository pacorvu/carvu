import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  Container,
  Icon
} from '@chakra-ui/react';
import { ViewIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AlumniFavStudents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await PlacementService.getAlumniFavoriteStudents(user.id);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (error) {
      console.error("Error fetching favorite students", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AlumniLayout>
        <Container centerContent py={20}>
          <Spinner size="xl" color="#d4a960" />
        </Container>
      </AlumniLayout>
    );
  }

  return (
    <AlumniLayout>
      <Box mb={8}>
        <Heading color="#172e36" mb={2}>Favorite Students</Heading>
        <Text color="gray.600">Students you have bookmarked or are mentoring.</Text>
      </Box>

      {students.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="xl" boxShadow="sm">
          <Text color="gray.500">No favorite students yet.</Text>
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
                      variant="outline"
                      onClick={() => navigate(`/placement/students/${student.usn}`)}
                    >
                      View Profile
                    </Button>
                    {/* Private details are handled in StudentDetails, but we can show basic contact if public? 
                        User said "only shown academic no personal private details" on details page. 
                        Usually favorites implies some level of connection, but let's stick to strict privacy first.
                    */}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </AlumniLayout>
  );
};

export default AlumniFavStudents;
