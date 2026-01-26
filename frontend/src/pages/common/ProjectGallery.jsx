import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Card, CardBody, Image, Stack, Badge, IconButton, Link, Button, Flex, useToast, Switch, HStack,
  Tabs, TabList, TabPanels, Tab, TabPanel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Textarea,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Icon, Avatar, Tag, VStack
} from '@chakra-ui/react';
import { StarIcon, ExternalLinkIcon, ViewIcon } from '@chakra-ui/icons';
import { FaHeart, FaDownload, FaEye, FaGithub } from 'react-icons/fa';
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

  // Rating Modal State
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  const isCompany = user?.role === 'company';
  const isDean = user?.role === 'dean';
  const isParent = user?.role === 'parent';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const Wrapper = ({ children }) => {
    if (isDean || isParent) return <>{children}</>;
    if (isAdmin) return <AdminLayout>{children}</AdminLayout>;
    const LayoutComponent = isCompany ? CompanyLayout : AlumniLayout;
    return <LayoutComponent>{children}</LayoutComponent>;
  };

  useEffect(() => {
    if (user) {
        fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewFavorites]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      // If NOT admin (e.g. Alumni), only show rated projects
      if (!isAdmin) {
          params.rated = 'true';
      }

      const [projRes, favRes] = await Promise.all([
        PlacementService.getAllStudentProjects(params),
        PlacementService.getAlumniFavorites(user.id)
      ]);
      
      let fetchedProjects = [];
      if (projRes && Array.isArray(projRes)) {
         fetchedProjects = projRes;
      } else if (projRes && projRes.data && Array.isArray(projRes.data)) {
         fetchedProjects = projRes.data;
      }

      setProjects(fetchedProjects);
      
      let fetchedFavorites = [];
      if (favRes && Array.isArray(favRes)) {
        fetchedFavorites = favRes.map(f => f.project_id || f);
      } else if (favRes && favRes.data) {
        fetchedFavorites = favRes.data.map(f => f.project_id);
      }

      setFavorites(fetchedFavorites);
      
    } catch (error) {
      console.error("Error fetching projects", error);
      setProjects([]);
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

  const openRatingModal = (project) => {
      setSelectedProject(project);
      setRatingValue(project.admin_rating || 5);
      setRatingFeedback(project.admin_feedback || '');
      setIsRatingOpen(true);
  };

  const handleRateProject = async () => {
      if (!selectedProject) return;
      setRatingLoading(true);
      try {
          const res = await PlacementService.rateProject(selectedProject.id, ratingValue, ratingFeedback);
          toast({ title: "Project rated successfully", status: "success" });
          
          // Update local state
          setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, admin_rating: ratingValue, admin_feedback: ratingFeedback } : p));
          setIsRatingOpen(false);
      } catch (error) {
          toast({ title: "Failed to rate project", description: error.message, status: "error" });
      } finally {
          setRatingLoading(false);
      }
  };

  const filteredProjects = viewFavorites 
    ? projects.filter(p => favorites.includes(p.id))
    : projects;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats for Admin
  const topLikedProjects = [...projects].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  const topViewedProjects = [...projects].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const ProjectCard = ({ project }) => {
    // Parse snaps if needed
    const icon = (project.project_snaps && project.project_snaps.length > 0) 
        ? project.project_snaps[0] 
        : null;

    return (
      <Card 
          key={project.id}
          borderRadius="xl" 
          overflow="hidden" 
          shadow="sm" 
          _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} 
          transition="all 0.2s"
          cursor="pointer"
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          onClick={() => openRatingModal(project)}
          h="100%"
      >
        <CardBody p={4} display="flex" flexDirection="column">
          <HStack align="start" spacing={4} mb={3}>
              {icon ? (
                  <Image src={icon} boxSize="60px" borderRadius="xl" objectFit="cover" shadow="sm" />
              ) : (
                  <Box boxSize="60px" bg="gray.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                      <Icon as={StarIcon} boxSize={6} color="gray.400" />
                  </Box>
              )}
              
              <Box flex={1}>
                  <Heading size="sm" noOfLines={1} mb={1}>{project.title}</Heading>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {project.student_name || "Student"} • {project.branch || "Project"}
                  </Text>
                  <HStack spacing={2} mt={1}>
                      <Badge colorScheme={project.admin_rating ? "yellow" : "gray"} variant="solid" borderRadius="full" px={2} fontSize="xs">
                        {project.admin_rating ? <><Icon as={StarIcon} boxSize={2} mr={1}/>{project.admin_rating}</> : "Unrated"}
                      </Badge>
                      <HStack spacing={0.5} color="gray.500" fontSize="xs">
                         <Icon as={FaDownload} boxSize={2.5} />
                         <Text>{project.downloads || 0}</Text>
                      </HStack>
                  </HStack>
              </Box>
              
              <IconButton
                  icon={favorites.includes(project.id) ? <Icon as={FaHeart} /> : <Icon as={FaHeart} />}
                  color={favorites.includes(project.id) ? "pink.400" : "gray.200"}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(project.id); }}
                  aria-label="Favorite Project"
                  _hover={{ color: "pink.300", bg: "pink.50" }}
              />
          </HStack>
          
          <Text fontSize="sm" color="gray.600" mb={4} noOfLines={2} flex={1}>
              {project.full_description || project.one_line_description || "No description available."}
          </Text>

          <Flex gap={2} mt="auto">
            <Button 
                size="sm" 
                variant="outline" 
                colorScheme="orange" 
                width="full"
                onClick={(e) => { e.stopPropagation(); openRatingModal(project); }}
            >
                View Details
            </Button>
            {isAdmin && (
                 <Button 
                    size="sm" 
                    colorScheme="yellow" 
                    variant="solid" 
                    onClick={(e) => { e.stopPropagation(); openRatingModal(project); }}
                    leftIcon={<StarIcon />}
                    px={4}
                >
                    Rate
                </Button>
            )}
          </Flex>
        </CardBody>
      </Card>
    );
  };

  const ProjectList = () => (
      <>
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

        {currentProjects.length === 0 ? (
            <Flex justify="center" align="center" h="200px" direction="column">
                <Text color="gray.500" fontSize="lg">No projects found.</Text>
                {!isAdmin && <Text fontSize="sm" color="gray.400">Only rated projects are visible.</Text>}
            </Flex>
        ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {currentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </SimpleGrid>
        )}

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
      </>
  );

  return (
    <Wrapper>
      {isAdmin ? (
         <Tabs variant="soft-rounded" colorScheme="teal" mb={6}>
            <TabList mb={4}>
                <Tab>All Projects</Tab>
                <Tab>Analytics & Stats</Tab>
            </TabList>
            <TabPanels>
                <TabPanel px={0}>
                     <ProjectList />
                </TabPanel>
                <TabPanel px={0}>
                     <Heading size="md" mb={6} color="#172e36">Project Statistics</Heading>
                     
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                        <Box>
                            <Heading size="sm" mb={4} color="gray.600">Most Liked Projects</Heading>
                            <Stack spacing={4}>
                                {topLikedProjects.map((p, i) => (
                                    <Flex key={p.id} p={4} bg="white" shadow="sm" borderRadius="md" align="center" justify="space-between">
                                        <HStack spacing={4}>
                                            <Text fontWeight="bold" color="gray.400">#{i+1}</Text>
                                            <Avatar src={p.student_image} name={p.student_name} size="sm" borderRadius="md" />
                                            <Box>
                                                <Text fontWeight="bold" noOfLines={1}>{p.title}</Text>
                                                <Text fontSize="xs" color="gray.500">by {p.student_name}</Text>
                                            </Box>
                                        </HStack>
                                        <Badge colorScheme="pink" display="flex" alignItems="center">
                                            <Icon as={FaHeart} mr={1} /> {p.likes || 0}
                                        </Badge>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>
                        <Box>
                            <Heading size="sm" mb={4} color="gray.600">Most Viewed Projects</Heading>
                            <Stack spacing={4}>
                                {topViewedProjects.map((p, i) => (
                                    <Flex key={p.id} p={4} bg="white" shadow="sm" borderRadius="md" align="center" justify="space-between">
                                        <HStack spacing={4}>
                                            <Text fontWeight="bold" color="gray.400">#{i+1}</Text>
                                            <Avatar src={p.student_image} name={p.student_name} size="sm" borderRadius="md" />
                                            <Box>
                                                <Text fontWeight="bold" noOfLines={1}>{p.title}</Text>
                                                <Text fontSize="xs" color="gray.500">by {p.student_name}</Text>
                                            </Box>
                                        </HStack>
                                        <Badge colorScheme="blue" display="flex" alignItems="center">
                                            <Icon as={FaEye} mr={1} /> {p.views || 0}
                                        </Badge>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>
                     </SimpleGrid>
                </TabPanel>
            </TabPanels>
         </Tabs>
      ) : (
         <ProjectList />
      )}

      {/* Project Details & Rating Modal */}
      <Modal isOpen={isRatingOpen} onClose={() => setIsRatingOpen(false)} size="xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(5px)" />
          <ModalContent borderRadius="xl">
              <ModalHeader>
                  <HStack>
                      {(selectedProject?.project_snaps && selectedProject.project_snaps.length > 0) ? (
                          <Image src={selectedProject.project_snaps[0]} boxSize="40px" borderRadius="md" objectFit="cover" />
                      ) : (
                          <Box boxSize="40px" bg="orange.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                               <Icon as={StarIcon} color="orange.400" />
                          </Box>
                      )}
                      <Text>{selectedProject?.title}</Text>
                  </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                  {selectedProject && (
                      <VStack align="stretch" spacing={6}>
                          {/* Hero Image / Snaps */}
                          {selectedProject.project_snaps && selectedProject.project_snaps.length > 0 && (
                              <Box overflowX="auto" whiteSpace="nowrap" pb={2}>
                                  <HStack spacing={4}>
                                      {selectedProject.project_snaps.map((snap, i) => (
                                          <Image key={i} src={snap} h="200px" borderRadius="lg" objectFit="cover" shadow="sm" />
                                      ))}
                                  </HStack>
                              </Box>
                          )}

                          <Box>
                              <Heading size="sm" mb={2}>About this project</Heading>
                              <Text color="gray.600" whiteSpace="pre-wrap">
                                {selectedProject.full_description || selectedProject.one_line_description || selectedProject.description}
                              </Text>
                          </Box>

                          {/* Meta Info */}
                          <SimpleGrid columns={2} spacing={4}>
                              <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">ADMIN RATING</Text>
                                  <HStack>
                                      <Text fontWeight="bold" fontSize="lg">{selectedProject.admin_rating || "N/A"}</Text>
                                      <Icon as={StarIcon} color="orange.400" />
                                  </HStack>
                              </Box>
                               <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">DOWNLOADS</Text>
                                  <Text fontWeight="bold" fontSize="lg">{selectedProject.downloads || 0}</Text>
                              </Box>
                              <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">LIKES</Text>
                                  <Text fontWeight="bold" fontSize="lg">{selectedProject.likes || 0}</Text>
                              </Box>
                               <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">BRANCH</Text>
                                  <Text fontWeight="bold">{selectedProject.branch || "General"}</Text>
                              </Box>
                               <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">STUDENT</Text>
                                  <Text fontWeight="bold">{selectedProject.student_name || "Unknown"}</Text>
                              </Box>
                          </SimpleGrid>

                          {/* Tech Stack */}
                          <Box>
                               <Heading size="sm" mb={2}>Tech Stack</Heading>
                               <HStack wrap="wrap">
                                  {(() => {
                                      let skills = [];
                                      if (typeof selectedProject.technologies === 'string') {
                                          skills = selectedProject.technologies.split(',').map(s => s.trim()).filter(Boolean);
                                      } else if (Array.isArray(selectedProject.technologies)) {
                                          skills = selectedProject.technologies;
                                      }
                                      return skills.map((skill, i) => (
                                          <Tag key={i} colorScheme="orange" variant="subtle">{skill}</Tag>
                                      ));
                                  })()}
                               </HStack>
                          </Box>

                          {/* Admin Rating Form */}
                          {isAdmin && (
                              <Box p={4} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.300">
                                  <Heading size="sm" mb={3}>Admin Evaluation</Heading>
                                  <Stack spacing={4}>
                                      <FormControl>
                                          <FormLabel fontSize="sm">Rating (1-10)</FormLabel>
                                          <NumberInput 
                                              min={1} 
                                              max={10} 
                                              value={ratingValue} 
                                              onChange={(val) => setRatingValue(parseInt(val))}
                                              size="sm"
                                          >
                                              <NumberInputField bg="white" />
                                              <NumberInputStepper>
                                                  <NumberIncrementStepper />
                                                  <NumberDecrementStepper />
                                              </NumberInputStepper>
                                          </NumberInput>
                                      </FormControl>
                                      <FormControl>
                                          <FormLabel fontSize="sm">Feedback (Optional)</FormLabel>
                                          <Textarea 
                                              value={ratingFeedback} 
                                              onChange={(e) => setRatingFeedback(e.target.value)} 
                                              placeholder="Feedback for the student..."
                                              bg="white"
                                              size="sm"
                                          />
                                      </FormControl>
                                      <Button colorScheme="teal" size="sm" onClick={handleRateProject} isLoading={ratingLoading} width="full">
                                          Submit Rating
                                      </Button>
                                  </Stack>
                              </Box>
                          )}
                      </VStack>
                  )}
              </ModalBody>
              <ModalFooter bg="gray.50" borderBottomRadius="xl">
                 <HStack w="full" spacing={4}>
                    <Button
                        flex={1}
                        colorScheme="pink"
                        variant="ghost"
                        leftIcon={<FaHeart />}
                        onClick={() => handleToggleFavorite(selectedProject?.id)}
                        isDisabled={!selectedProject}
                    >
                        {favorites.includes(selectedProject?.id) ? "Unlike" : "Like"}
                    </Button>
                    {selectedProject?.hosted_link && (
                        <Button 
                            as={Link} 
                            href={selectedProject.hosted_link} 
                            isExternal 
                            flex={1} 
                            colorScheme="green" 
                            leftIcon={<ExternalLinkIcon />}
                            _hover={{ textDecoration: 'none' }}
                        >
                            Live Demo
                        </Button>
                    )}
                     {selectedProject?.github_repo && (
                        <Button 
                            as={Link} 
                            href={selectedProject.github_repo} 
                            isExternal 
                            flex={1} 
                            variant="outline" 
                            leftIcon={<FaGithub />}
                            _hover={{ textDecoration: 'none' }}
                        >
                            Source Code
                        </Button>
                    )}
                 </HStack>
              </ModalFooter>
          </ModalContent>
      </Modal>
    </Wrapper>
  );
};

export default ProjectGallery;