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
  Image,
  VStack,
  HStack,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { StarIcon, EmailIcon, ViewIcon, CalendarIcon, ArrowForwardIcon, BellIcon, CheckCircleIcon } from '@chakra-ui/icons';
import CompanyLayout from '../../components/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { PlacementService } from '../../services/placement.service';
import { useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [favStudents, setFavStudents] = useState([]);
  const [favProjects, setFavProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [favProjRes, favStudRes] = await Promise.all([
        PlacementService.getCompanyFavoriteProjects(user.id),
        PlacementService.getCompanyFavoriteStudents(user.id)
      ]);

      setStats({
          activeDrives: 0,
          totalApplicants: 0,
          shortlisted: 0,
          featuredProjects: []
      });

      if (favProjRes.success) setFavProjects(favProjRes.data);
      if (favStudRes.success) setFavStudents(favStudRes.data);

    } catch (error) {
      console.error("Error fetching company data", error);
      setStats({
          activeDrives: 0,
          totalApplicants: 0,
          shortlisted: 0,
          featuredProjects: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CompanyLayout>
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" color="#d4a960" />
        </Flex>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
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
          <Heading size="lg" mb={2}>Welcome, {user?.name}!</Heading>
          <Text fontSize="lg" opacity={0.9} mb={6}>
            Manage your recruitment drives, shortlist candidates, and explore student projects.
          </Text>
          <HStack spacing={4}>
            <Button 
              bg="#d4a960" 
              color="#172e36" 
              _hover={{ bg: "#e5b970" }} 
              leftIcon={<EmailIcon />}
              onClick={() => navigate('/company/refer-hr')}
            >
              Refer HR
            </Button>
            <Button 
              variant="outline" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }} 
              leftIcon={<ViewIcon />}
              onClick={() => navigate('/company/projects')}
            >
              Browse Projects
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
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <Card 
          borderLeft="4px solid #d4a960" 
          boxShadow="md" 
          cursor="pointer" 
          onClick={() => navigate('/company/favorites/students')}
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Favorite Students</StatLabel>
              <StatNumber fontSize="3xl" color="#172e36">{favStudents.length}</StatNumber>
              <StatHelpText><Icon as={CheckCircleIcon} color="green.500" mr={1} /> Shortlisted Profiles</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card 
          borderLeft="4px solid #172e36" 
          boxShadow="md"
          cursor="pointer" 
          onClick={() => navigate('/company/favorites/projects')}
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Favorite Projects</StatLabel>
              <StatNumber fontSize="3xl" color="#172e36">{favProjects.length}</StatNumber>
              <StatHelpText><StarIcon color="yellow.500" mr={1} /> Saved Projects</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card 
          borderLeft="4px solid #3182ce" 
          boxShadow="md"
          cursor="pointer" 
          onClick={() => navigate('/company/drives')}
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Active Drives</StatLabel>
              <StatNumber fontSize="3xl" color="#172e36">{stats?.activeDrives || 0}</StatNumber>
              <StatHelpText><Icon as={CalendarIcon} color="blue.500" mr={1} /> Ongoing Hiring</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Upcoming Drives & Events - Highlighted */}
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
              <Heading size="md" color="#172e36">Upcoming Drives & Events</Heading>
            </HStack>
            <Button 
              size="sm" 
              colorScheme="orange" 
              variant="outline" 
              rightIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/company/drives')}
            >
              View All Drives
            </Button>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
             <Text color="gray.500">No upcoming drives or events scheduled.</Text>
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
              <Heading size="md" color="#172e36" mb={4}>Featured Student Projects</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {stats?.featuredProjects?.map((project) => (
                  <Card key={project.id} w="full" overflow="hidden" boxShadow="md" cursor="pointer" onClick={() => navigate('/company/projects')}>
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
                ))}
              </SimpleGrid>
              <Button 
                w="full" 
                mt={4} 
                variant="outline" 
                colorScheme="blue" 
                size="sm"
                onClick={() => navigate('/company/projects')}
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
                <Heading size="sm" mb={3}>📢 Placement Cell Updates</Heading>
                <Text fontSize="sm" color="gray.500">No new updates.</Text>
              </CardBody>
            </Card>

            <Card variant="outline" borderColor="blue.100">
               <CardBody>
                 <Heading size="sm" mb={2}>Need Help?</Heading>
                 <Text fontSize="sm" color="gray.600" mb={3}>
                   Contact the Placement Officer for any assistance with your drives or student data.
                 </Text>
                 <Button size="sm" colorScheme="blue" variant="link">Contact TPO</Button>
               </CardBody>
            </Card>

          </VStack>
        </Box>
      </SimpleGrid>
    </CompanyLayout>
  );
};

export default CompanyDashboard;