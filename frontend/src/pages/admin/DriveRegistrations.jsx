import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Flex,
  useToast,
  Container,
  Spinner,
  Button,
  Checkbox,
  HStack,
  Spacer,
  Input
} from '@chakra-ui/react';
import { ArrowBackIcon, DownloadIcon, AttachmentIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const DriveRegistrations = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [driveId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driveData, appsData] = await Promise.all([
        PlacementService.getDriveById(driveId),
        PlacementService.getDriveProcesses(driveId)
      ]);
      setDrive(driveData);
      setApplications(appsData);
    } catch (error) {
      console.error(error);
      toast({ title: "Error fetching data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(applications.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExport = () => {
    // Export functionality
    const dataToExport = selectedIds.length > 0 
      ? applications.filter(app => selectedIds.includes(app.id))
      : applications;

    if (dataToExport.length === 0) {
      toast({ title: "No data to export", status: "warning" });
      return;
    }

    // Convert to CSV
    const headers = [
      "USN", "Name", "Eligible", "Reg Status", "Approved", 
      "OA Status", "GD Status", "Tech Round", "Interview", 
      "HR Round", "Final Select", "Malpractice", "Remarks"
    ];

    const csvContent = [
      headers.join(","),
      ...dataToExport.map(app => [
        app.usn,
        `"${app.student_name || ''}"`,
        app.is_eligible,
        app.registration_status,
        app.approved_status,
        app.oa_status,
        app.gd_status,
        app.technical_round_status,
        app.interview_status,
        app.hr_round_status,
        app.final_select_status,
        app.malpractice,
        `"${app.remarks || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `registrations_${drive?.company_name || 'drive'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mock Import logic
      toast({ 
        title: "Import Initiated", 
        description: `Importing from ${file.name}... (This is a mock)`, 
        status: "info",
        duration: 2000 
      });
      // Here you would parse CSV and call API
      setTimeout(() => {
          toast({ title: "Import Successful", status: "success" });
          // Refresh data if needed
      }, 1000);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          
          <Flex justify="space-between" align="center" mb={4}>
            <Button 
              leftIcon={<ArrowBackIcon />} 
              variant="ghost" 
              onClick={() => navigate('/placement/events')}
            >
              Back to Drives
            </Button>
            <HStack>
              <Input 
                type="file" 
                display="none" 
                ref={fileInputRef} 
                accept=".csv,.xlsx" 
                onChange={handleFileChange} 
              />
              <Button leftIcon={<AttachmentIcon />} onClick={handleImportClick} colorScheme="blue" variant="outline" size="sm">
                Bulk Import
              </Button>
              <Button leftIcon={<DownloadIcon />} onClick={handleExport} colorScheme="green" size="sm">
                Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'}
              </Button>
            </HStack>
          </Flex>

          {loading ? (
             <Flex justify="center" p={10}><Spinner /></Flex>
          ) : (
            <>
              <Heading size="lg" color="gray.800" mb={2}>
                Manage Drive: {drive?.company_name}
              </Heading>
              <Text color="gray.500" mb={6}>
                Registered Students: {applications.length}
              </Text>

              <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th px={2} width="40px">
                          <Checkbox 
                            isChecked={applications.length > 0 && selectedIds.length === applications.length}
                            isIndeterminate={selectedIds.length > 0 && selectedIds.length < applications.length}
                            onChange={handleSelectAll}
                          />
                        </Th>
                        <Th whiteSpace="nowrap">USN</Th>
                        <Th whiteSpace="nowrap">Name</Th>
                        <Th whiteSpace="nowrap">Eligible?</Th>
                        <Th whiteSpace="nowrap">Reg. Status</Th>
                        <Th whiteSpace="nowrap">Approved?</Th>
                        <Th whiteSpace="nowrap">OA Status</Th>
                        <Th whiteSpace="nowrap">GD Status</Th>
                        <Th whiteSpace="nowrap">Tech Round</Th>
                        <Th whiteSpace="nowrap">Interview</Th>
                        <Th whiteSpace="nowrap">HR Round</Th>
                        <Th whiteSpace="nowrap">Final Select</Th>
                        <Th whiteSpace="nowrap">Malpractice</Th>
                        <Th whiteSpace="nowrap">Remarks</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {applications.length === 0 ? (
                        <Tr><Td colSpan={14} textAlign="center">No registrations yet.</Td></Tr>
                      ) : (
                        applications.map(app => (
                          <Tr key={app.id} _hover={{ bg: "gray.50" }}>
                            <Td px={2}>
                              <Checkbox 
                                isChecked={selectedIds.includes(app.id)}
                                onChange={() => handleSelectRow(app.id)}
                              />
                            </Td>
                            <Td fontWeight="medium" whiteSpace="nowrap">{app.usn}</Td>
                            <Td whiteSpace="nowrap">{app.student_name || "N/A"}</Td>
                            <Td whiteSpace="nowrap">{app.is_eligible}</Td>
                            <Td whiteSpace="nowrap">{app.registration_status}</Td>
                            <Td whiteSpace="nowrap">{app.approved_status}</Td>
                            <Td whiteSpace="nowrap">{app.oa_status}</Td>
                            <Td whiteSpace="nowrap">{app.gd_status}</Td>
                            <Td whiteSpace="nowrap">{app.technical_round_status}</Td>
                            <Td whiteSpace="nowrap">{app.interview_status}</Td>
                            <Td whiteSpace="nowrap">{app.hr_round_status}</Td>
                            <Td whiteSpace="nowrap">{app.final_select_status}</Td>
                            <Td whiteSpace="nowrap">{app.malpractice}</Td>
                            <Td whiteSpace="nowrap" maxW="200px" isTruncated title={app.remarks}>{app.remarks}</Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default DriveRegistrations;
