import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  VStack,
  Spinner,
  useColorModeValue,
  Flex,
  Icon,
  Tag
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const ParentEvents = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const fetchData = async () => {
      if (user?.childUsn) {
        try {
          const result = await PlacementService.getParentChildData(user.childUsn);
          // Now using parentEvents specifically
          setEvents(result.parentEvents || []);
        } catch (error) {
          console.error("Error fetching events:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

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
        <Heading size="lg" mb={2}>Parent Meetups & Schedules</Heading>
        <Text color={textColor}>Upcoming meetings, workshops, and orientation sessions for parents.</Text>
      </Box>

      {events.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {events.map((event, index) => (
            <Card key={index} bg={cardBg} boxShadow="md" borderRadius="xl" overflow="hidden">
              <Box h="6px" bgGradient="linear(to-r, teal.400, blue.500)" />
              <CardBody>
                <HStack justify="space-between" mb={3}>
                    <Badge colorScheme={event.type === 'Orientation' ? 'purple' : 'green'} borderRadius="full" px={2}>
                        {event.type}
                    </Badge>
                </HStack>
                
                <Heading size="md" mb={2}>{event.title}</Heading>
                
                <VStack align="start" spacing={3} fontSize="sm" color={textColor} mb={4}>
                    <HStack>
                        <CalendarIcon color="teal.500" />
                        <Text fontWeight="bold">
                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    </HStack>
                    <HStack>
                        <TimeIcon color="teal.500" />
                        <Text>
                            {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </HStack>
                    <HStack>
                        <Icon viewBox="0 0 24 24" color="teal.500" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </Icon>
                        <Text>{event.location}</Text>
                    </HStack>
                </VStack>

                <Divider mb={3} borderColor="gray.100" />
                
                <Text fontSize="sm" color="gray.500">
                    {event.description}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Flex direction="column" align="center" justify="center" h="300px" bg={cardBg} borderRadius="lg">
            <CalendarIcon boxSize={10} color="gray.300" mb={4} />
            <Text fontSize="lg" color="gray.500">No parent meetups scheduled currently.</Text>
        </Flex>
      )}
    </Box>
  );
};

// Helper for Divider since it wasn't imported
const Divider = (props) => <Box h="1px" bg="gray.200" w="100%" {...props} />;

export default ParentEvents;
