import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  Badge,
  useColorModeValue,
  Spinner,
  VStack,
  HStack,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Dummy Users
  const dummyUsers = [
    { id: 1, name: 'Placement Officer', email: 'admin@rvu.edu.in', role: 'admin', created_at: '2023-01-01', stakeholder: 'Placement Team' },
    { id: 2, name: 'Super Admin', email: 'superadmin@rvu.edu.in', role: 'superadmin', created_at: '2023-01-01', stakeholder: 'Placement Team' },
    { id: 3, name: 'John Doe', email: 'john@student.rvu.edu.in', role: 'student', created_at: '2023-06-15', stakeholder: 'Students' },
    { id: 4, name: 'Jane Smith', email: 'jane@student.rvu.edu.in', role: 'student', created_at: '2023-06-16', stakeholder: 'Students' },
    { id: 5, name: 'Alice Alumni', email: 'alice@alumni.rvu.edu.in', role: 'alumni', created_at: '2022-05-20', stakeholder: 'Alumni' },
    { id: 6, name: 'Bob Recruiter', email: 'bob@techcorp.com', role: 'company_rep', created_at: '2023-08-10', stakeholder: 'Company Reps' },
  ];

  const stakeholders = ['All', 'Placement Team', 'Students', 'Alumni', 'Company Reps'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(dummyUsers);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (userId) => {
    navigate(`/placement/change-password/${userId}`);
  };

  const handleAddUser = () => {
    navigate(`/placement/register`);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'purple';
      case 'admin': return 'blue';
      case 'student': return 'green';
      case 'alumni': return 'orange';
      case 'company_rep': return 'teal';
      default: return 'gray';
    }
  };

  const UserTable = ({ data }) => (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Stakeholder</Th>
            <Th>Created At</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((user) => (
            <Tr key={user.id}>
              <Td>{user.id}</Td>
              <Td fontWeight="600">{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge colorScheme={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </Td>
              <Td>{user.stakeholder}</Td>
              <Td>
                {new Date(user.created_at).toLocaleDateString()}
              </Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  aria-label="Change Password"
                  size="sm"
                  bg="#d1a85d"
                  color="white"
                  _hover={{ bg: '#c19a4d' }}
                  onClick={() => handleChangePassword(user.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <AdminLayout>
      <Box
        w="100%"
        minH="calc(100vh - 72px)"
        bg="#172e36"
        py={8}
        px={4}
      >
        <Container maxW="7xl">
          <Box
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="2xl"
            p={8}
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack justify="space-between" mb={6}>
              <Heading size="xl" color="#d1a85d" fontWeight="bold">
                User Management
              </Heading>
              <Button
                leftIcon={<AddIcon />}
                bg="#d1a85d"
                color="white"
                _hover={{ bg: '#c19a4d' }}
                onClick={handleAddUser}
              >
                Add New User
              </Button>
            </HStack>

            {error && (
              <Box
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="lg"
                p={4}
                mb={4}
              >
                <Text color="red.700" fontSize="sm">
                  {error}
                </Text>
              </Box>
            )}

            {loading ? (
              <VStack py={8}>
                <Spinner size="xl" color="#d1a85d" />
                <Text color="gray.600">Loading users...</Text>
              </VStack>
            ) : (
              <Tabs variant="soft-rounded" colorScheme="yellow">
                <TabList mb={4} overflowX="auto" py={2}>
                  {stakeholders.map(stakeholder => (
                    <Tab key={stakeholder} _selected={{ color: 'white', bg: '#d1a85d' }}>{stakeholder}</Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {stakeholders.map(stakeholder => (
                    <TabPanel key={stakeholder} px={0}>
                      {users.filter(u => stakeholder === 'All' || u.stakeholder === stakeholder).length > 0 ? (
                        <UserTable data={users.filter(u => stakeholder === 'All' || u.stakeholder === stakeholder)} />
                      ) : (
                        <Text color="gray.500" py={4} textAlign="center">No users found for {stakeholder}.</Text>
                      )}
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            )}
          </Box>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default UserManagement;
