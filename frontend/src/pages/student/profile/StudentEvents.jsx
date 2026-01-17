import { Box, Heading, Text, VStack, Badge, HStack, Card, CardBody, Stack, Divider, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Button, useToast } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useEffect, useState } from "react"
import { PlacementService } from "../../../services/placement.service"
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCheckCircle, FaHourglassHalf } from "react-icons/fa"

export const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await PlacementService.getAllEvents();
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to load events", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (event) => {
    toast({
      title: "Registration Successful",
      description: `You have successfully registered for ${event.title}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const now = new Date();
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const upcomingEvents = sortedEvents.filter(e => new Date(e.event_date) >= now);
  const pastEvents = sortedEvents.filter(e => new Date(e.event_date) < now).reverse(); // Most recent past event first
  const registeredEvents = events.filter(e => registeredEventIds.includes(e.id));

  const EventCard = ({ event, isPast }) => {
    const isRegistered = registeredEventIds.includes(event.id);
    
    return (
    <Card key={event.id} variant="outline" borderColor={isPast ? "gray.200" : isRegistered ? "green.200" : "blue.200"} _hover={{ shadow: "md" }} transition="all 0.2s" bg={isPast ? "gray.50" : "white"}>
      <CardBody>
        <Stack spacing={4}>
          <HStack justify="space-between" align="start">
            <Box>
              <Heading size="md" color="#20343c">{event.title}</Heading>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">{event.type}</Text>
            </Box>
            <HStack>
              {isRegistered && !isPast && (
                <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>Registered</Badge>
              )}
              <Badge 
                colorScheme={isPast ? "gray" : "blue"} 
                fontSize="0.8em" 
                px={2} 
                py={1} 
                borderRadius="full"
              >
                {isPast ? "Completed" : "Upcoming"}
              </Badge>
            </HStack>
          </HStack>

          <Divider />

          <Stack spacing={2}>
             <HStack>
               <Icon as={FaCalendarAlt} color="gray.400" />
               <Text fontSize="sm">{new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
             </HStack>
             <HStack>
               <Icon as={FaMapMarkerAlt} color="gray.400" />
               <Text fontSize="sm">{event.location}</Text>
             </HStack>
          </Stack>

          <Box bg={isPast ? "white" : "blue.50"} p={3} borderRadius="md">
            <Text fontSize="sm" color="gray.700">{event.description}</Text>
          </Box>

          {!isPast && (
            <Button 
              colorScheme={isRegistered ? "green" : "blue"} 
              variant={isRegistered ? "outline" : "solid"}
              size="sm" 
              width="full" 
              onClick={() => handleRegister(event)}
              isDisabled={isRegistered}
            >
              {isRegistered ? "Registered" : "Register Now"}
            </Button>
          )}
        </Stack>
      </CardBody>
    </Card>
    );
  };

  if (loading) {
    return (
      <StudentProfileLayout>
        <Box display="flex" justifyContent="center" alignItems="center" h="400px">
          <Spinner size="xl" color="#d4a960" />
        </Box>
      </StudentProfileLayout>
    )
  }

  return (
    <StudentProfileLayout>
      <Box bg="white" p={8} borderRadius="xl" shadow="sm" minH="80vh">
        <Heading size="lg" color="#20343c" mb={6}>Placement Events</Heading>
        
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={6}>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>Upcoming Events ({upcomingEvents.length})</Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>Past Events ({pastEvents.length})</Tab>
            <Tab _selected={{ color: 'white', bg: '#20343c' }}>Registered Events ({registeredEvents.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack gap={4} align="stretch">
                {upcomingEvents.length === 0 ? (
                   <Text color="gray.500">No upcoming events scheduled.</Text>
                ) : (
                   upcomingEvents.map(event => <EventCard key={event.id} event={event} isPast={false} />)
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack gap={4} align="stretch">
                {pastEvents.length === 0 ? (
                   <Text color="gray.500">No past events found.</Text>
                ) : (
                   pastEvents.map(event => <EventCard key={event.id} event={event} isPast={true} />)
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack gap={4} align="stretch">
                {registeredEvents.length === 0 ? (
                   <Text color="gray.500">You haven't registered for any events yet.</Text>
                ) : (
                   registeredEvents.map(event => <EventCard key={event.id} event={event} isPast={new Date(event.event_date) < now} />)
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </StudentProfileLayout>
  )
}
