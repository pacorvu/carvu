import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Avatar,
  Icon,
  Spinner,
  useColorModeValue,
  Flex,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Select,
  Divider,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon, InfoIcon, ChatIcon } from '@chakra-ui/icons';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const ParentHRContact = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false); // Changed to false as we don't fetch contacts anymore
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State - Matches Alumni Referral Form
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    hr_name: '',
    hr_email: '',
    hr_phone: '',
    job_description: '',
    linkedin_link: '',
    additional_notes: ''
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.hr_name) {
      toast({
        title: "Required fields missing",
        description: "Please fill in Company Name and HR Name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const referralData = {
        ...formData,
        parent_id: user?.id,
        parent_name: user?.name,
        child_usn: user?.childUsn
      };

      await PlacementService.submitParentReferral(referralData);

      toast({
        title: "Referral Submitted Successfully",
        description: "Thank you for referring this contact! The placement team will reach out to them.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        company_name: '',
        role_title: '',
        hr_name: '',
        hr_email: '',
        hr_phone: '',
        job_description: '',
        linkedin_link: '',
        additional_notes: ''
      });

    } catch (error) {
      console.error("Error submitting referral:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Heading size="lg" mb={2}>Refer HR / Company</Heading>
        <Text color={textColor}>Help the placement cell by connecting us with HRs or Hiring Managers from your network.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        {/* Left Column: University Contact (Kept for reference, reduced width) */}
        <Box gridColumn={{ lg: "span 1" }}>
            <Card bg={cardBg} borderRadius="xl" boxShadow="sm" position="sticky" top="20px">
                <CardBody>
                    <Heading size="md" mb={4} color="blue.600">University Placement Cell</Heading>
                    <VStack spacing={6} align="stretch">
                        <HStack spacing={4}>
                            <Avatar name="Placement Officer" />
                            <Box>
                                <Text fontWeight="bold">Dr. Placement Officer</Text>
                                <Text fontSize="sm" color="gray.500">Head of Corporate Relations</Text>
                                <HStack fontSize="sm" mt={1}>
                                    <EmailIcon color="blue.500" />
                                    <Text>placement@rvu.edu.in</Text>
                                </HStack>
                            </Box>
                        </HStack>
                        <Divider />
                        <HStack spacing={4}>
                            <Avatar name="Admin" />
                            <Box>
                                <Text fontWeight="bold">Placement Admin</Text>
                                <Text fontSize="sm" color="gray.500">Coordinator</Text>
                                <HStack fontSize="sm" mt={1}>
                                    <PhoneIcon color="green.500" />
                                    <Text>+91 98765 43210</Text>
                                </HStack>
                            </Box>
                        </HStack>
                    </VStack>
                    <Box mt={6} p={4} bg="blue.50" borderRadius="md">
                        <Text fontSize="sm" color="blue.800" fontStyle="italic">
                            "Your network can open doors for the next generation. We appreciate your support in connecting us with potential recruiters."
                        </Text>
                    </Box>
                </CardBody>
            </Card>
        </Box>

        {/* Right Column: Referral Form (Expanded width) */}
        <Box gridColumn={{ lg: "span 2" }}>
            <Card bg={cardBg} borderRadius="xl" boxShadow="md" borderTop="4px solid" borderColor="blue.500">
                <CardBody p={6}>
                    <HStack mb={6} spacing={3}>
                        <Icon as={ChatIcon} color="blue.500" boxSize={6} />
                        <Heading size="md">Refer a Company / HR</Heading>
                    </HStack>
                    
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={5} align="stretch">
                            <Box>
                                <Heading size="sm" mb={4} color="gray.600">Company Details</Heading>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Company Name</FormLabel>
                                        <Input 
                                            name="company_name" 
                                            value={formData.company_name} 
                                            onChange={handleChange}
                                            placeholder="e.g. Google, Microsoft"
                                            borderRadius="md"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">Role / Position (If any)</FormLabel>
                                        <Input 
                                            name="role_title" 
                                            value={formData.role_title} 
                                            onChange={handleChange}
                                            placeholder="e.g. Software Engineer"
                                            borderRadius="md"
                                        />
                                    </FormControl>
                                </SimpleGrid>
                            </Box>

                            <Box>
                                <Heading size="sm" mb={4} color="gray.600" mt={2}>HR Contact Person</Heading>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">HR Name</FormLabel>
                                        <Input 
                                            name="hr_name" 
                                            value={formData.hr_name} 
                                            onChange={handleChange}
                                            placeholder="Name of the contact"
                                            borderRadius="md"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">HR Email</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" children={<EmailIcon color="gray.400" />} />
                                            <Input 
                                                name="hr_email" 
                                                type="email" 
                                                value={formData.hr_email} 
                                                onChange={handleChange}
                                                placeholder="hr@company.com"
                                                borderRadius="md"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">HR Phone</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" children={<PhoneIcon color="gray.400" />} />
                                            <Input 
                                                name="hr_phone" 
                                                value={formData.hr_phone} 
                                                onChange={handleChange}
                                                placeholder="+91 ..."
                                                borderRadius="md"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">LinkedIn Profile</FormLabel>
                                        <Input 
                                            name="linkedin_link" 
                                            value={formData.linkedin_link} 
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            borderRadius="md"
                                        />
                                    </FormControl>
                                </SimpleGrid>
                            </Box>

                            <FormControl>
                                <FormLabel fontSize="sm">Additional Notes</FormLabel>
                                <Textarea 
                                    name="additional_notes" 
                                    placeholder="Any specific context about this contact or company..." 
                                    value={formData.additional_notes} 
                                    onChange={handleChange}
                                    borderRadius="md"
                                    rows={3}
                                />
                            </FormControl>

                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                width="full" 
                                size="lg"
                                isLoading={isSubmitting}
                                loadingText="Submitting..."
                                mt={4}
                            >
                                Submit Referral
                            </Button>
                        </VStack>
                    </form>
                </CardBody>
            </Card>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default ParentHRContact;