import React, { useState } from 'react';
import { 
    Box, 
    Heading, 
    Text, 
    Table, 
    Thead, 
    Tbody, 
    Tr, 
    Th, 
    Td, 
    Button, 
    Avatar, 
    Badge, 
    HStack, 
    Input,
    useToast,
    IconButton
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import CompanyLayout from '../../components/CompanyLayout';
import { useParams, useNavigate } from 'react-router-dom';

const CompanyDriveDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [applicants, setApplicants] = useState([]);

    const handleRemarkChange = (usn, value) => {
        setApplicants(applicants.map(app => 
            app.usn === usn ? { ...app, remark: value } : app
        ));
    };

    const saveRemark = (usn) => {
        // In a real app, this would make an API call
        toast({
            title: "Remark Saved",
            description: `Industry review for ${usn} has been updated.`,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    return (
        <CompanyLayout>
            <Box mb={6}>
                <Button variant="link" onClick={() => navigate('/company/drives')} mb={4}>&larr; Back to Drives</Button>
                <Heading size="lg" color="#172e36">Applicants for Software Engineer</Heading>
            </Box>

            <Box bg="white" borderRadius="lg" shadow="sm" overflowX="auto">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Student</Th>
                            <Th>USN</Th>
                            <Th>Branch</Th>
                            <Th>CGPA</Th>
                            <Th>Status</Th>
                            <Th>Industry Review / Remarks</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {applicants.length === 0 ? (
                            <Tr>
                                <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                                    No applicants found.
                                </Td>
                            </Tr>
                        ) : (
                            applicants.map((student) => (
                                <Tr key={student.usn}>
                                <Td>
                                    <HStack>
                                        <Avatar size="sm" name={student.name} />
                                        <Text fontWeight="medium">{student.name}</Text>
                                    </HStack>
                                </Td>
                                <Td>{student.usn}</Td>
                                <Td>{student.branch}</Td>
                                <Td>{student.gpa}</Td>
                                <Td>
                                    <Badge colorScheme={student.status === 'Shortlisted' ? 'green' : student.status === 'Rejected' ? 'red' : 'orange'}>
                                        {student.status}
                                    </Badge>
                                </Td>
                                <Td>
                                    <HStack>
                                        <Input 
                                            size="sm" 
                                            placeholder="Add review..." 
                                            value={student.remark}
                                            onChange={(e) => handleRemarkChange(student.usn, e.target.value)}
                                            bg="gray.50"
                                            borderRadius="md"
                                            width="200px"
                                        />
                                        <IconButton 
                                            aria-label="Save Remark" 
                                            icon={<CheckIcon />} 
                                            size="sm" 
                                            colorScheme="teal" 
                                            variant="ghost"
                                            onClick={() => saveRemark(student.usn)}
                                            isDisabled={!student.remark}
                                        />
                                    </HStack>
                                </Td>
                                <Td>
                                    <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => navigate(`/company/student/${student.usn}`)}>
                                        View Profile
                                    </Button>
                                </Td>
                            </Tr>
                        ))
                    )}
                    </Tbody>
                </Table>
            </Box>
        </CompanyLayout>
    );
};

export default CompanyDriveDetails;