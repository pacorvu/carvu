import { Box, Heading, Text, Card, CardBody, Badge, Button, VStack, HStack, Icon, Flex } from '@chakra-ui/react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import CompanyLayout from '../../components/CompanyLayout';
import { useNavigate } from 'react-router-dom';

const CompanyDrives = () => {
    const navigate = useNavigate();

    // Dummy Drives Data
    const drives = [
        {
            id: '1',
            role: 'Software Engineer',
            date: '2024-05-15',
            location: 'Bangalore',
            applicants: 45,
            status: 'Active'
        },
        {
            id: '2',
            role: 'Product Manager',
            date: '2024-06-01',
            location: 'Remote',
            applicants: 32,
            status: 'Upcoming'
        },
        {
            id: '3',
            role: 'Data Scientist',
            date: '2024-04-20',
            location: 'Hyderabad',
            applicants: 68,
            status: 'Completed'
        }
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'Active': return 'green';
            case 'Upcoming': return 'blue';
            case 'Completed': return 'gray';
            default: return 'gray';
        }
    };

    return (
        <CompanyLayout>
             <Heading size="lg" color="#172e36" mb={6}>My Recruitment Drives</Heading>
             
             <VStack spacing={4} align="stretch">
                {drives.map((drive) => (
                    <Card key={drive.id} variant="outline" _hover={{ shadow: 'md' }}>
                        <CardBody>
                            <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                                <Box>
                                    <HStack mb={2}>
                                        <Heading size="md" color="#172e36">{drive.role}</Heading>
                                        <Badge colorScheme={getStatusColor(drive.status)}>{drive.status}</Badge>
                                    </HStack>
                                    <HStack spacing={6} color="gray.600" fontSize="sm">
                                        <HStack><Icon as={FaCalendarAlt} /><Text>{drive.date}</Text></HStack>
                                        <HStack><Icon as={FaMapMarkerAlt} /><Text>{drive.location}</Text></HStack>
                                        <HStack><Icon as={FaUsers} /><Text>{drive.applicants} Applicants</Text></HStack>
                                    </HStack>
                                </Box>
                                <Button colorScheme="blue" onClick={() => navigate(`/company/drive/${drive.id}`)}>
                                    View Applicants
                                </Button>
                            </Flex>
                        </CardBody>
                    </Card>
                ))}
             </VStack>
        </CompanyLayout>
    );
};

export default CompanyDrives;