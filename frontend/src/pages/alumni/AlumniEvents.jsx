import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Icon,
  HStack,
  Button,
  VStack,
  Container,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, CheckCircleIcon } from '@chakra-ui/icons';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';

const AlumniEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAllEvents();
      // Ensure data is an array
      const fetchedEvents = Array.isArray(data) ? data : (data?.data || []);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (eventTitle) => {
    toast({
      title: "Registration Successful",
      description: `You have successfully registered for ${eventTitle}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
        <Heading color="#172e36" mb={2}>Alumni Events</Heading>
        <Text color="gray.600">Stay connected with upcoming meetups, reunions, and workshops.</Text>
      </Box>

      {events.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="xl" boxShadow="sm">
          <Icon as={CalendarIcon} w={10} h={10} color="gray.300" mb={4} />
          <Text color="gray.500">No upcoming events scheduled.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {events.map((event) => (
            <Card 
              key={event.id} 
              bg="white" 
              boxShadow="sm" 
              borderRadius="xl" 
              borderTop="4px solid" 
              borderColor={event.status === 'Upcoming' ? "green.400" : "gray.400"}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              <CardBody>
                <Badge 
                  colorScheme={event.status === 'Upcoming' ? "green" : "gray"} 
                  mb={3}
                  borderRadius="full"
                  px={3}
                >
                  {event.status}
                </Badge>
                <Heading size="md" mb={2} color="#172e36">{event.title}</Heading>
                <Text fontSize="sm" color="gray.600" mb={4} noOfLines={3}>
                  {event.description}
                </Text>
                
                <VStack align="start" spacing={3} fontSize="sm" color="gray.500">
                  <HStack>
                    <Icon as={CalendarIcon} color="orange.400" />
                    <Text>{new Date(event.event_date).toLocaleDateString()}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={TimeIcon} color="blue.400" />
                    <Text>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={CheckCircleIcon} color="purple.400" />
                    <Text>{event.location}</Text>
                  </HStack>
                </VStack>

                <Button 
                  mt={6} 
                  w="full" 
                  colorScheme="orange" 
                  variant="outline" 
                  isDisabled={event.status !== 'Upcoming'}
                  onClick={() => handleRegister(event.title)}
                >
                  {event.status === 'Upcoming' ? "Register Now" : "Event Ended"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </AlumniLayout>
  );
};

export default AlumniEvents;
