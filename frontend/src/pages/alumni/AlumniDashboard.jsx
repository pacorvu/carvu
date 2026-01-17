import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Icon,
  Button,
  Flex,
  Badge,
  Divider,
  Image,
  VStack,
  HStack,
  Spinner,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar
} from '@chakra-ui/react';
import { StarIcon, EmailIcon, ViewIcon, CalendarIcon, ArrowForwardIcon, BellIcon, CheckCircleIcon } from '@chakra-ui/icons';
import AlumniLayout from '../../components/AlumniLayout';
import { useAuth } from '../../context/AuthContext';
import { PlacementService } from '../../services/placement.service';
import { useNavigate } from 'react-router-dom';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favStudents, setFavStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const [statsRes, favRes, favStudRes] = await Promise.all([
        PlacementService.getAlumniDashboardStats(),
        PlacementService.getAlumniFavorites(user.id),
        PlacementService.getAlumniFavoriteStudents(user.id)
      ]);

      if (statsRes && statsRes.success && statsRes.data) {
         setStats(statsRes.data);
      } else {
         setStats({
           totalStudents: 0,
           placedStudents: 0,
           activeDrives: 0,
           featuredProjects: []
         });
      }

      if (favRes.success) setFavorites(favRes.data);
      if (favStudRes.success) setFavStudents(favStudRes.data);
    } catch (error) {
      console.error("Error fetching alumni data", error);
      setStats({
        totalStudents: 0,
        placedStudents: 0,
        activeDrives: 0,
        featuredProjects: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AlumniLayout>
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" color="#d4a960" />
        </Flex>
      </AlumniLayout>
    );
  }

  return (
    <AlumniLayout>
      {/* Hero Section */}
      <Box 
        bgGradient="linear(to-r, #172e36, #2c5261)" 
        borderRadius="xl" 
        p={8} 
        mb={8} 
        color="white"
        boxShadow="xl"
        position="relative"
        overflow="hidden"
      >
        <Box position="relative" zIndex={1}>
          <Heading size="lg" mb={2}>Welcome back, {user?.name}!</Heading>
          <Text fontSize="lg" opacity={0.9} mb={6}>
            Connect with your alma mater, mentor juniors, and stay updated with campus placements.
          </Text>
          <HStack spacing={4}>
            <Button 
              bg="#d4a960" 
              color="#172e36" 
              _hover={{ bg: "#e5b970" }} 
              leftIcon={<EmailIcon />}
              onClick={() => navigate('/placement/alumni-referral')}
            >
              Refer HR
            </Button>
            <Button 
              variant="outline" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }} 
              leftIcon={<ViewIcon />}
              onClick={() => navigate('/placement/alumni-projects')}
            >
              View Projects
            </Button>
          </HStack>
        </Box>
        {/* Decorative Circle */}
        <Box 
          position="absolute" 
          top="-50%" 
          right="-10%" 
          w="400px" 
          h="400px" 
          bg="whiteAlpha.100" 
          borderRadius="full" 
        />
      </Box>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
        <Card 
          borderLeft="4px solid #d4a960" 
          boxShadow="md" 
          cursor="pointer" 
          onClick={() => navigate('/placement/alumni-fav-students')}
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Favorite Students</StatLabel>
              <StatNumber fontSize="3xl" color="#172e36">{favStudents.length}</StatNumber>
              <StatHelpText><Icon as={CheckCircleIcon} color="green.500" mr={1} /> Saved Profiles</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card 
          borderLeft="4px solid #172e36" 
          boxShadow="md"
          cursor="pointer" 
          onClick={() => navigate('/placement/alumni-projects?view=favorites')}
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Favorite Projects</StatLabel>
              <StatNumber fontSize="3xl" color="#172e36">{favorites.length}</StatNumber>
              <StatHelpText><StarIcon color="yellow.500" mr={1} /> Saved Projects</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Alumni Meetups & Events - Highlighted */}
      <Card 
        bgGradient="linear(to-br, #fff5e6, white)" 
        border="1px solid" 
        borderColor="#d4a960" 
        boxShadow="lg" 
        mb={10}
        overflow="hidden"
      >
        <Box position="absolute" top={0} right={0} p={4} opacity={0.1}>
           <Icon as={CalendarIcon} w={24} h={24} color="#d4a960" />
        </Box>
        <CardBody p={6}>
          <Flex justify="space-between" align="center" mb={6}>
            <HStack>
              <Icon as={BellIcon} w={6} h={6} color="#d4a960" />
              <Heading size="md" color="#172e36">Upcoming Alumni Meetups</Heading>
            </HStack>
            <Button 
              size="sm" 
              colorScheme="orange" 
              variant="outline" 
              rightIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/placement/alumni-events')}
            >
              View All Events
            </Button>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
             {/* Mock Event 1 */}
             <Card bg="white" variant="outline" borderColor="orange.200" boxShadow="sm">
               <CardBody>
                 <Badge colorScheme="purple" mb={2}>Reunion</Badge>
                 <Heading size="sm" mb={2} color="#172e36">Annual Alumni Reunion 2026</Heading>
                 <HStack fontSize="sm" color="gray.600" mb={3} spacing={4}>
                    <HStack><Icon as={CalendarIcon} color="orange.400" /><Text>Aug 15, 2026</Text></HStack>
                    <HStack><Icon as={CheckCircleIcon} color="green.400" /><Text>RSVP Open</Text></HStack>
                 </HStack>
                 <Text fontSize="sm" color="gray.500" noOfLines={2}>
                   Join us for a day of networking, fun, and nostalgia at the campus main auditorium.
                 </Text>
                 <Button mt={4} size="sm" w="full" colorScheme="orange" variant="ghost">Register Now</Button>
               </CardBody>
             </Card>

             {/* Mock Event 2 */}
             <Card bg="white" variant="outline" borderColor="orange.200" boxShadow="sm">
               <CardBody>
                 <Badge colorScheme="blue" mb={2}>Mentorship</Badge>
                 <Heading size="sm" mb={2} color="#172e36">Mentorship Kickoff</Heading>
                 <HStack fontSize="sm" color="gray.600" mb={3} spacing={4}>
                    <HStack><Icon as={CalendarIcon} color="blue.400" /><Text>Sep 10, 2026</Text></HStack>
                    <HStack><Icon as={CheckCircleIcon} color="green.400" /><Text>Online</Text></HStack>
                 </HStack>
                 <Text fontSize="sm" color="gray.500" noOfLines={2}>
                   Guide the next generation of students. Sign up to become a mentor today.
                 </Text>
                 <Button mt={4} size="sm" w="full" colorScheme="blue" variant="ghost">Join Session</Button>
               </CardBody>
             </Card>

             {/* Mock Event 3 */}
             <Card bg="white" variant="outline" borderColor="orange.200" boxShadow="sm">
               <CardBody>
                 <Badge colorScheme="green" mb={2}>Networking</Badge>
                 <Heading size="sm" mb={2} color="#172e36">Bangalore Tech Mixer</Heading>
                 <HStack fontSize="sm" color="gray.600" mb={3} spacing={4}>
                    <HStack><Icon as={CalendarIcon} color="green.400" /><Text>Oct 05, 2026</Text></HStack>
                    <HStack><Icon as={CheckCircleIcon} color="green.400" /><Text>In-Person</Text></HStack>
                 </HStack>
                 <Text fontSize="sm" color="gray.500" noOfLines={2}>
                   Exclusive networking event for alumni working in the tech sector in Bangalore.
                 </Text>
                 <Button mt={4} size="sm" w="full" colorScheme="green" variant="ghost">View Details</Button>
               </CardBody>
             </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        
        {/* Left Column: Featured Projects (Span 2) */}
        <Box gridColumn={{ lg: "span 2" }}>
          <VStack spacing={8} align="stretch">
            
            {/* Featured Projects */}
            <Box>
              <Heading size="md" color="#172e36" mb={4}>Featured Projects</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {stats?.featuredProjects?.length > 0 ? (
                  stats.featuredProjects.map((project) => (
                    <Card key={project.id} w="full" overflow="hidden" boxShadow="md" cursor="pointer" onClick={() => navigate('/placement/alumni-projects')}>
                      <Image 
                        src={project.image} 
                        h="150px" 
                        w="full" 
                        objectFit="cover" 
                        fallbackSrc="https://placehold.co/300x150?text=Project"
                      />
                      <CardBody p={3}>
                        <Heading size="xs" mb={1}>{project.title}</Heading>
                        <Text fontSize="xs" color="gray.500" noOfLines={2}>{project.description}</Text>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Text color="gray.500">No projects to show.</Text>
                )}
              </SimpleGrid>
              <Button 
                w="full" 
                mt={4} 
                variant="outline" 
                colorScheme="blue" 
                size="sm"
                onClick={() => navigate('/placement/alumni-projects')}
              >
                Browse All Projects
              </Button>
            </Box>

          </VStack>
        </Box>

        {/* Right Column: Notices */}
        <Box>
          <VStack spacing={8} align="stretch">
            
            {/* Quick Actions / Notices */}
            <Card bg="#f7fafc" variant="outline">
              <CardBody>
                <Heading size="sm" mb={3}>📢 Alumni Notice Board</Heading>
                <Stack spacing={3}>
                  <Flex align="start">
                    <Icon as={BellIcon} color="#d4a960" mt={1} mr={2} />
                    <Text fontSize="sm">Annual Alumni Meetup scheduled for Aug 15th. Save the date!</Text>
                  </Flex>
                  <Flex align="start">
                    <Icon as={BellIcon} color="#d4a960" mt={1} mr={2} />
                    <Text fontSize="sm">Mentorship program registration is now open.</Text>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>

          </VStack>
        </Box>
      </SimpleGrid>
    </AlumniLayout>
  );
};

export default AlumniDashboard;