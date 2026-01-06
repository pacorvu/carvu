import { Box, Heading, Text, VStack, Spinner, Badge, HStack, Card, CardBody, Stack, Divider, SimpleGrid, Icon, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { useEffect, useState } from "react"
import { PlacementService } from "../../../services/placement.service"
import { FaCheckCircle, FaBriefcase, FaMoneyBillWave, FaBuilding, FaTimesCircle, FaClock } from "react-icons/fa"
import { useAuth } from "../../../context/AuthContext"

export const StudentJobOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  const studentUSN = user?.usn; 

  useEffect(() => {
    if (authLoading) return;
    if (studentUSN) {
      loadOffers();
    } else {
      setLoading(false);
    }
  }, [studentUSN, authLoading]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const myOffers = await PlacementService.getStudentOffers(studentUSN);
      setOffers(myOffers);
    } catch (error) {
      console.error("Failed to load offers", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && studentUSN)) {
      return (
        <StudentProfileLayout>
           <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
             <Spinner size="xl" color="#d4a960" />
           </Box>
        </StudentProfileLayout>
      );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Accepted':
        return { color: 'green', icon: FaCheckCircle, label: 'Offer Accepted' };
      case 'Rejected':
        return { color: 'red', icon: FaTimesCircle, label: 'Offer Declined' };
      case 'Pending':
        return { color: 'orange', icon: FaClock, label: 'Offer Pending' };
      default:
        return { color: 'gray', icon: FaBriefcase, label: status };
    }
  };

  const OfferCard = ({ offer }) => {
    const { color, icon, label } = getStatusConfig(offer.offer_letter_status);
    
    return (
      <Card key={offer.id} variant="outline" borderColor={`${color}.200`} borderWidth="2px" _hover={{ shadow: "lg" }} transition="all 0.2s" bg={`${color}.50`}>
        <CardBody>
          <Stack spacing={4}>
            <HStack justify="space-between" align="start">
              <HStack spacing={4}>
                <Box 
                  p={3} 
                  bg="white" 
                  borderRadius="full" 
                  color={`${color}.500`}
                  shadow="sm"
                >
                  <Icon as={icon} boxSize={6} />
                </Box>
                <Box>
                  <Heading size="md" color="#20343c">{offer.company_name}</Heading>
                  <Text fontSize="sm" color="gray.600">{offer.designation}</Text>
                </Box>
              </HStack>
              <Badge 
                colorScheme={color}
                fontSize="0.9em" 
                px={3} 
                py={1} 
                borderRadius="full"
              >
                {label}
              </Badge>
            </HStack>

            <Divider borderColor={`${color}.200`} />

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
               <HStack>
                 <Icon as={FaBriefcase} color="gray.500" />
                 <Box>
                   <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase">Job Type</Text>
                   <Text fontWeight="medium">{offer.job_type}</Text>
                 </Box>
               </HStack>
               
               <HStack>
                 <Icon as={FaMoneyBillWave} color="gray.500" />
                 <Box>
                   <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase">CTC / Stipend</Text>
                   <Text fontWeight="medium">
                      {offer.ctc_min_lpa ? `${offer.ctc_min_lpa} - ${offer.ctc_max_lpa} LPA` : offer.internship_stipend}
                   </Text>
                 </Box>
               </HStack>

               <HStack>
                 <Icon as={FaBuilding} color="gray.500" />
                 <Box>
                   <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase">Department</Text>
                   <Text fontWeight="medium">{offer.school || "N/A"}</Text>
                 </Box>
               </HStack>
            </SimpleGrid>

            <Box bg="white" p={4} borderRadius="md" border="1px dashed" borderColor={`${color}.300`}>
               <Text fontSize="sm" fontWeight="bold" color={`${color}.700`} mb={1}>Remarks</Text>
               <Text fontSize="sm" color="gray.600">{offer.remarks || "No remarks available."}</Text>
            </Box>
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

  const acceptedOffers = offers.filter(o => o.offer_letter_status === 'Accepted');
  const pendingOffers = offers.filter(o => o.offer_letter_status === 'Pending');
  const rejectedOffers = offers.filter(o => o.offer_letter_status === 'Rejected');

  return (
    <StudentProfileLayout>
      <Box bg="white" p={8} borderRadius="xl" shadow="sm" minH="80vh">
        <HStack mb={6} justify="space-between">
           <Heading size="lg" color="#20343c">My Job Offers</Heading>
           <Badge colorScheme="blue" p={2} borderRadius="md" fontSize="md">
             Total Offers: {offers.length}
           </Badge>
        </HStack>
        
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={4}>
            <Tab>All ({offers.length})</Tab>
            <Tab>Accepted ({acceptedOffers.length})</Tab>
            <Tab>Pending ({pendingOffers.length})</Tab>
            <Tab>Rejected ({rejectedOffers.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {offers.length === 0 ? (
                   <EmptyState message="No offers found." />
                ) : (
                   offers.map(offer => <OfferCard key={offer.id} offer={offer} />)
                )}
              </VStack>
            </TabPanel>
            
            <TabPanel px={0}>
              <VStack gap={6} align="stretch">
                {acceptedOffers.length === 0 ? (
                   <EmptyState message="No accepted offers yet." />
                ) : (
                   acceptedOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
               <VStack gap={6} align="stretch">
                {pendingOffers.length === 0 ? (
                   <EmptyState message="No pending offers." />
                ) : (
                   pendingOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
               <VStack gap={6} align="stretch">
                {rejectedOffers.length === 0 ? (
                   <EmptyState message="No rejected offers." />
                ) : (
                   rejectedOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </StudentProfileLayout>
  )
}

const EmptyState = ({ message }) => (
  <Box textAlign="center" py={10} bg="gray.50" borderRadius="lg">
    <Icon as={FaBriefcase} boxSize={10} color="gray.300" mb={4} />
    <Heading size="md" color="gray.500" mb={2}>{message}</Heading>
    <Text color="gray.400">Keep working hard!</Text>
  </Box>
);
