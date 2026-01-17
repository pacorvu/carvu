import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Avatar,
  Divider,
  Container
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon } from '@chakra-ui/icons';

const HRContact = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Mock Placement Team Data
  const contacts = [
    {
        name: "Dr. Placement Officer",
        role: "Head, Career Support Center",
        email: "placement.head@rvu.edu.in",
        phone: "+91 98765 43210",
        image: "" 
    },
    {
        name: "Ms. Coordinator",
        role: "Placement Coordinator (SoCSE)",
        email: "socse.placement@rvu.edu.in",
        phone: "+91 98765 43211",
        image: ""
    },
    {
        name: "Mr. Relations",
        role: "Corporate Relations Manager",
        email: "relations@rvu.edu.in",
        phone: "+91 98765 43212",
        image: ""
    }
  ];

  return (
    <Box pb={10}>
      <Box mb={8} textAlign="center">
        <Heading size="xl" mb={3} color="blue.700">Placement Cell Contacts</Heading>
        <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
            Get in touch with our dedicated team for any queries regarding your child's placement and internship opportunities.
        </Text>
      </Box>

      <Container maxW="6xl">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {contacts.map((contact, index) => (
                <Card key={index} bg={cardBg} boxShadow="lg" borderRadius="2xl" _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s' }}>
                    <CardBody textAlign="center" py={8}>
                        <Avatar 
                            size="2xl" 
                            name={contact.name} 
                            src={contact.image} 
                            mb={4} 
                            border="4px solid" 
                            borderColor="blue.100"
                        />
                        <Heading size="md" mb={1}>{contact.name}</Heading>
                        <Text color="blue.500" fontWeight="bold" fontSize="sm" mb={4}>{contact.role}</Text>
                        
                        <Divider mb={4} />

                        <VStack spacing={3} align="center">
                            <HStack>
                                <EmailIcon color="gray.400" />
                                <Text fontSize="sm" color={textColor}>{contact.email}</Text>
                            </HStack>
                            <HStack>
                                <PhoneIcon color="gray.400" />
                                <Text fontSize="sm" color={textColor}>{contact.phone}</Text>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>
            ))}
        </SimpleGrid>

        <Box mt={12} bg="blue.50" p={8} borderRadius="xl" textAlign="center">
            <Heading size="md" mb={2} color="blue.800">Office Hours</Heading>
            <Text color="blue.600">Monday - Friday: 9:00 AM - 5:00 PM</Text>
            <Text color="blue.600">Saturday: 9:00 AM - 1:00 PM</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default HRContact;
