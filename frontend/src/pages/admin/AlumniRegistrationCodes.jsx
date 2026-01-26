import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  useDisclosure,
  Flex,
  Tooltip,
  Spinner
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CopyIcon } from '@chakra-ui/icons';
import { PlacementService } from '../../services/placement.service';

const AlumniRegistrationCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [filterText, setFilterText] = useState('');

  const [formData, setFormData] = useState({
    batch_year: new Date().getFullYear(),
    institution_name: 'RV University',
    remarks: '',
    max_uses: 0 // 0 means unlimited
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getRegistrationCodes();
      setCodes(data);
    } catch (error) {
      toast({ title: "Error fetching codes", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    try {
        if (!formData.batch_year || !formData.institution_name) {
            toast({ title: "Batch Year and Institution are required", status: "warning" });
            return;
        }
        await PlacementService.generateRegistrationCode(formData);
        toast({ title: "Code generated successfully", status: "success" });
        onClose();
        fetchCodes();
    } catch (error) {
        toast({ title: error.message || "Error generating code", status: "error" });
    }
  };

  const handleDeactivate = async (id) => {
    if(!window.confirm("Are you sure you want to deactivate this code?")) return;
    try {
        await PlacementService.deleteRegistrationCode(id);
        toast({ title: "Code deactivated", status: "success" });
        fetchCodes();
    } catch (error) {
        toast({ title: "Error deactivating code", status: "error" });
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied!", status: "success", duration: 1500 });
  };

  const filteredCodes = codes.filter(code => 
    (code.remarks || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (code.code || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box>
      <Flex justify="space-between" mb={4} gap={4}>
        <Input 
            placeholder="Filter by Batch / Remarks..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            maxW="400px"
            bg="white"
        />
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Generate New Code
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center"><Spinner /></Flex>
      ) : (
        <Box overflowX="auto">
            <Table variant="simple" bg="white" borderRadius="md" shadow="sm">
            <Thead bg="gray.50">
                <Tr>
                <Th>Code</Th>
                <Th>Batch</Th>
                <Th>Usage</Th>
                <Th>Status</Th>
                <Th>Created At</Th>
                <Th>Actions</Th>
                </Tr>
            </Thead>
            <Tbody>
                {filteredCodes.map((code) => (
                <Tr key={code.id} opacity={code.is_active ? 1 : 0.6}>
                    <Td fontWeight="bold">
                        {code.code}
                        <Tooltip label="Copy Code">
                            <IconButton 
                                icon={<CopyIcon />} 
                                size="xs" 
                                ml={2} 
                                onClick={() => copyToClipboard(code.code)}
                                aria-label="Copy"
                            />
                        </Tooltip>
                    </Td>
                    <Td>{code.remarks || '-'}</Td>
                    <Td>
                        {code.used_count} / {code.max_uses === 0 ? '∞' : code.max_uses}
                    </Td>
                    <Td>
                        <Badge colorScheme={code.is_active ? 'green' : 'red'}>
                            {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </Td>
                    <Td fontSize="sm" color="gray.500">
                        {new Date(code.created_at).toLocaleDateString()}
                    </Td>
                    <Td>
                        {code.is_active && (
                            <IconButton 
                                icon={<DeleteIcon />} 
                                colorScheme="red" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeactivate(code.id)}
                                aria-label="Deactivate"
                            />
                        )}
                    </Td>
                </Tr>
                ))}
                {filteredCodes.length === 0 && (
                    <Tr>
                        <Td colSpan={6} textAlign="center" py={4}>
                            {codes.length === 0 ? "No codes generated yet." : "No matching codes found."}
                        </Td>
                    </Tr>
                )}
            </Tbody>
            </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Registration Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Batch Year</FormLabel>
              <NumberInput 
                value={formData.batch_year} 
                onChange={(val) => setFormData({...formData, batch_year: val})}
                min={2000} max={2100}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={4} isRequired>
                <FormLabel>Institution Name</FormLabel>
                <Input 
                    name="institution_name" 
                    value={formData.institution_name} 
                    onChange={handleInputChange} 
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Remarks (Optional)</FormLabel>
                <Textarea 
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleInputChange} 
                    placeholder="E.g., For Class of 2024 (CSE)"
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Max Uses (0 for unlimited)</FormLabel>
                <NumberInput 
                    value={formData.max_uses} 
                    onChange={(val) => setFormData({...formData, max_uses: parseInt(val) || 0})}
                    min={0}
                >
                    <NumberInputField />
                </NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleGenerate}>Generate</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AlumniRegistrationCodes;
