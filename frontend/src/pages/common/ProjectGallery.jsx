import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Card, CardBody, Image, Stack, Badge, IconButton, Link, Button, Flex, useToast, Switch, HStack
} from '@chakra-ui/react';
import { StarIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlumniLayout from '../../components/AlumniLayout';
import CompanyLayout from '../../components/CompanyLayout';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const ProjectGallery = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [viewFavorites, setViewFavorites] = useState(searchParams.get('view') === 'favorites');
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 
  const toast = useToast();

  const isCompany = user?.role === 'company';
  const isDean = user?.role === 'dean';
  const isParent = user?.role === 'parent';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // If user is dean, we use a different layout logic or just render content
  // Since we wrap ProjectGallery in DeanLayout inside App.jsx, we might not need to wrap it here if we just return content.
  // However, the original code uses a Layout wrapper pattern.
  // Let's adapt:
  
  // For Dean, we don't want to double-wrap if App.jsx already wraps it.
  // But wait, the original code conditionally sets Layout.
  // If we want to use this component inside DeanLayout provided by App.jsx, we should probably avoid wrapping it again here.
  
  // Actually, look at App.jsx:
  // <DeanLayout><ProjectGallery /></DeanLayout>
  // So for Dean, this component just renders the inner content.
  // But for Alumni/Company, it seems this component MIGHT be responsible for layout?
  // Let's check how it's used for Alumni/Company in App.jsx.
  // <PlacementProtectedRoute requiredRole="alumni"><ProjectGallery /></PlacementProtectedRoute>
  // It seems for Alumni/Company, the Layout is APPLIED INSIDE this component.
  
  // So we need a conditional wrapper.
  const Wrapper = ({ children }) => {
    if (isDean || isParent) return <>{children}</>; // DeanLayout/ParentLayout is already applied in App.jsx
    if (isAdmin) return <AdminLayout>{children}</AdminLayout>;
    const LayoutComponent = isCompany ? CompanyLayout : AlumniLayout;
    return <LayoutComponent>{children}</LayoutComponent>;
  };

  useEffect(() => {
    if (user) {
        fetchProjects();
    }
  }, [user]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewFavorites]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projRes, favRes] = await Promise.all([
        PlacementService.getAllStudentProjects(),
        PlacementService.getAlumniFavorites(user.id)
      ]);
      
      let fetchedProjects = [];
      if (projRes && projRes.length) {
         // Handle case where API returns array directly
         fetchedProjects = projRes;
      } else if (projRes && projRes.success && projRes.data) {
         // Handle case where API returns object with data property
         fetchedProjects = projRes.data;
      } else if (Array.isArray(projRes)) {
         fetchedProjects = projRes;
      }

      setProjects(fetchedProjects);
      
      let fetchedFavorites = [];
      if (favRes && favRes.success && favRes.data) {
        fetchedFavorites = favRes.data.map(f => f.project_id);
      } else if (Array.isArray(favRes)) {
        fetchedFavorites = favRes.map(f => f.project_id || f);
      }

      setFavorites(fetchedFavorites);
      
    } catch (error) {
      console.error("Error fetching projects", error);
      setProjects([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (projectId) => {
    try {
      const res = await PlacementService.toggleFavorite(user.id, projectId);
      if (res.success) {
        if (res.isFavorited) {
          setFavorites([...favorites, projectId]);
          toast({ title: "Project favorited!", status: "success", duration: 2000 });
        } else {
          setFavorites(favorites.filter(id => id !== projectId));
          toast({ title: "Removed from favorites", status: "info", duration: 2000 });
        }
      }
    } catch (error) {
      toast({ title: "Action failed", status: "error" });
    }
  };

  const filteredProjects = viewFavorites 
    ? projects.filter(p => favorites.includes(p.id))
    : projects;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Wrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading color="#172e36">Student Projects Gallery</Heading>
          <Text color="gray.600">Explore innovative projects built by our students.</Text>
        </Box>
        <HStack>
          <Text fontWeight="medium" color="gray.600">Show Favorites Only</Text>
          <Switch 
            colorScheme="teal" 
            isChecked={viewFavorites} 
            onChange={(e) => setViewFavorites(e.target.checked)} 
          />
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {currentProjects.map((project) => (
          <Card key={project.id} boxShadow="md" borderRadius="lg" overflow="hidden" _hover={{ boxShadow: 'xl' }}>
            <Image 
              src={project.image} 
              alt={project.title} 
              height="200px" 
              objectFit="cover" 
              fallbackSrc="https://placehold.co/300x200?text=Project+Image"
            />
            <CardBody>
              <Flex justify="space-between" align="start" mb={2}>
                <Box>
                  <Heading size="md" mb={1} color="#172e36">{project.title}</Heading>
                  <Text fontSize="sm" color="gray.500">by {project.student_name}</Text>
                </Box>
                <IconButton
                  icon={<StarIcon />}
                  color={favorites.includes(project.id) ? "yellow.400" : "gray.300"}
                  variant="ghost"
                  onClick={() => handleToggleFavorite(project.id)}
                  aria-label="Favorite Project"
                  fontSize="xl"
                />
              </Flex>
              
              <Text fontSize="sm" color="gray.700" mb={4} noOfLines={3}>
                {project.description}
              </Text>
              
              <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
                {project.technologies.map(tech => (
                  <Badge key={tech} colorScheme="teal" variant="subtle" mb={2}>
                    {tech}
                  </Badge>
                ))}
              </Stack>
              
              <Link href={project.link} isExternal style={{ textDecoration: 'none' }}>
                <Button size="sm" rightIcon={<ExternalLinkIcon />} width="full" colorScheme="blue" variant="outline">
                  View Project
                </Button>
              </Link>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Flex justify="center" mt={10} gap={2}>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            colorScheme="teal"
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              colorScheme={currentPage === i + 1 ? "teal" : "gray"}
              variant={currentPage === i + 1 ? "solid" : "ghost"}
              size="sm"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            colorScheme="teal"
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </Flex>
      )}
    </Wrapper>
  );
};

export default ProjectGallery;