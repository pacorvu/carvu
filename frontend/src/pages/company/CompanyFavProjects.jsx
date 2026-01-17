import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Stack,
  Badge,
  Button,
  Spinner,
  useToast,
  Flex
} from '@chakra-ui/react';
import { ViewIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlacementService } from '../../services/placement.service';
import CompanyLayout from '../../components/CompanyLayout';

const CompanyFavProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await PlacementService.getCompanyFavoriteProjects(user.id);
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (error) {
      console.error("Error fetching favorite projects", error);
      toast({
        title: "Error",
        description: "Failed to fetch favorite projects.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (projectId) => {
    try {
        const res = await PlacementService.toggleCompanyProjectFavorite(user.id, projectId);
        if (res.success && !res.isFavorited) {
             setFavorites(prev => prev.filter(f => f.project_id !== projectId));
             toast({
                title: "Removed",
                description: "Project removed from favorites.",
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
        <Heading color="#172e36" mb={2}>Favorite Projects</Heading>
        <Text color="gray.600">Student projects you have bookmarked.</Text>
      </Box>

      {favorites.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="xl" boxShadow="sm">
          <Text color="gray.500">No favorite projects yet.</Text>
           <Button mt={4} colorScheme="blue" variant="outline" onClick={() => navigate('/placement/projects')}>
            Browse Projects
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {favorites.map((fav) => {
             const project = fav.project;
             if (!project) return null; // Skip if project data missing
             
             return (
            <Card 
              key={fav.id} 
              bg="white" 
              boxShadow="sm" 
              borderRadius="xl" 
              overflow="hidden"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              <Image 
                src={project.image || 'https://placehold.co/600x400?text=Project'} 
                alt={project.title}
                h="180px"
                w="100%"
                objectFit="cover"
              />
              <CardBody>
                <Stack spacing={3}>
                  <Heading size="md" noOfLines={1} title={project.title}>{project.title}</Heading>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {project.description}
                  </Text>
                  
                  <Flex wrap="wrap" gap={2}>
                    {(project.technologies || []).slice(0, 3).map((tech, i) => (
                      <Badge key={i} colorScheme="blue" variant="subtle">{tech}</Badge>
                    ))}
                  </Flex>

                  <Flex justify="space-between" mt={4} gap={2}>
                     <Button 
                      flex={1}
                      size="sm"
                      leftIcon={<ViewIcon />} 
                      colorScheme="teal" 
                      variant="solid"
                      // Assuming project details page or gallery modal. For now navigating to gallery or specific project page if exists
                      // Using gallery for now as we haven't seen a dedicated project details page in file list yet
                      onClick={() => navigate(`/placement/projects`)} 
                    >
                      View
                    </Button>
                     <Button 
                      size="sm"
                      leftIcon={<StarIcon />} 
                      colorScheme="yellow" 
                      variant="outline"
                      onClick={() => handleRemoveFavorite(project.id)}
                    >
                      Remove
                    </Button>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          )})}
        </SimpleGrid>
      )}
    </CompanyLayout>
  );
};

export default CompanyFavProjects;
