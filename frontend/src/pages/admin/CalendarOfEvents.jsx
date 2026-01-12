import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  IconButton, 
  Grid, 
  GridItem, 
  Badge, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton,
  FormControl, 
  FormLabel, 
  Input as CInput, 
  Select, 
  Divider, 
  Switch, 
  InputGroup, 
  ButtonGroup, 
  useToast,
  Textarea,
  SimpleGrid,
  Input
} from '@chakra-ui/react';
import { SearchIcon, SettingsIcon, EditIcon } from '@chakra-ui/icons';
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const CalendarOfEvents = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Metadata for Placement Drive Form
  const [companyList, setCompanyList] = useState([]);
  const [schoolList, setSchoolList] = useState([]);
  const [programList, setProgramList] = useState([]);
  
  const [events, setEvents] = useState([]);
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  // Add Event State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    start_time: '', 
    end_time: '', 
    notification_remarks: '',
    type: 'Placement' // Placement or Alumni
  });

  // Placement Drive Form State (matching Events.jsx)
  const [placementForm, setPlacementForm] = useState({
    company_id: '',
    tpo: '',
    year: new Date().getFullYear().toString(),
    school_id: '',
    program_id: '',
    job_description: '',
    job_type: '',
    job_location: '',
    event_datetime: '',
    last_date_to_registration: '',
    type_of_hiring: '',
    number_of_openings: '',
    ctc: '',
    ctc_min: '',
    ctc_max: '',
    ctc_variable: '',
    ctc_stock: '',
    ctc_avg: '',
    ctc_final: '',
    min_cgpa: '',
    stipend: '',
    stipend_min: '',
    stipend_max: '',
    stipend_avg: '',
    placement_status: 'Scheduled',
    company_remarks: ''
  });

  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [startMeridiem, setStartMeridiem] = useState('AM');
  const [startTimeError, setStartTimeError] = useState('');

  // Calendar Logic
  const range = useMemo(() => {
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const startIdx = firstDay.getDay();
    const totalDays = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const weeks = Math.ceil((startIdx + totalDays) / 7);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - startIdx);
    const days = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    const end = days[days.length - 1];
    return { days, start, end, weeks };
  }, [current]);

  const monthEvents = useMemo(() => {
    const ym = current.getMonth();
    const yf = current.getFullYear();
    return events.filter(e => {
      const ed = new Date(e.event_date);
      return ed.getMonth() === ym && ed.getFullYear() === yf;
    });
  }, [events, current]);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatDMY = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${m}-${y}`;
  };

  const to24h = (hour12, minute, meridiem) => {
    let h = hour12 % 12;
    if (meridiem === 'PM') h += 12;
    if (meridiem === 'AM' && hour12 === 12) h = 0;
    return `${String(h).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
  };

  const dateColors = ['pink','blue','purple','orange','teal','cyan','red','yellow'];
  const getDateColorName = (d) => dateColors[(d.getDate() - 1) % dateColors.length];
  const now = new Date();
  const nowHour12 = ((now.getHours() + 11) % 12) + 1;
  const nowMinute = String(now.getMinutes()).padStart(2, '0');

  const validateStart = (hStr, mStr) => {
    const h = hStr === '' ? NaN : parseInt(hStr, 10);
    const m = mStr === '' ? NaN : parseInt(mStr, 10);
    if (hStr !== '' && (isNaN(h) || h < 1 || h > 12)) {
      setStartTimeError('Hour must be 1-12');
      return false;
    }
    if (mStr !== '' && (isNaN(m) || m < 0 || m > 59)) {
      setStartTimeError('Minute must be 00–59');
      return false;
    }
    setStartTimeError('');
    return hStr !== '' && mStr !== '';
  };

  // Fetch Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [companies, schools] = await Promise.all([
          PlacementService.getAllCompanies(),
          PlacementService.getSchools()
        ]);
        setCompanyList(companies);
        setSchoolList(schools);
      } catch (error) {
        console.error("Error fetching metadata", error);
        if (error.message === 'Forbidden' || error.message.includes('403')) {
           toast({ title: "Session expired", description: "Please login again", status: "error", duration: 3000 });
           logout();
           navigate('/login');
        }
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Programs when School changes
  useEffect(() => {
    if (placementForm.school_id) {
        PlacementService.getPrograms(placementForm.school_id)
            .then(data => {
                if (Array.isArray(data)) {
                    setProgramList(data);
                } else {
                    setProgramList([]);
                }
            })
            .catch(err => {
                console.error("Error fetching programs:", err);
                if (err.message === 'Forbidden' || err.message.includes('403')) {
                   toast({ title: "Session expired", description: "Please login again", status: "error", duration: 3000 });
                   logout();
                   navigate('/login');
                }
                setProgramList([]);
            });
    } else {
        setProgramList([]);
    }
  }, [placementForm.school_id]);

  // Data Fetching
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch Placement Drives
      const drives = await PlacementService.getAllDrives();
      const placementEvents = drives.map(drive => ({
        id: drive.id,
        title: `${drive.company_name} Drive`,
        description: drive.job_description || 'Placement Drive',
        event_date: drive.event_datetime,
        start_time: drive.event_datetime ? new Date(drive.event_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
        type: 'Placement',
        notification_remarks: drive.placement_status
      }));

      // 2. Mock Alumni Events - REMOVED
      const alumniEvents = [];

      // 3. Local manual events (if any)
      // For now, we just combine placement and mock alumni events
      setEvents([...placementEvents, ...alumniEvents]);
      
    } catch (err) {
      setError('Failed to load calendar events');
      console.error(err);
      if (err.message === 'Forbidden' || err.message.includes('403')) {
          toast({ title: "Session expired", description: "Please login again", status: "error", duration: 3000 });
          logout();
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openAddForDate = (d) => {
    setSelectedDate(d);
    const iso = formatDate(d);
    setForm({ 
      title: '', 
      description: '', 
      date: iso, 
      start_time: '', 
      end_time: '', 
      notification_remarks: '',
      type: 'Placement'
    });
    
    // Initialize Placement Form with date
    const dStr = new Date(d);
    // Adjust for timezone if needed, or just set time to 09:00 local
    dStr.setHours(9, 0, 0, 0);
    // Use local ISO string for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = dStr.getFullYear();
    const month = String(dStr.getMonth() + 1).padStart(2, '0');
    const day = String(dStr.getDate()).padStart(2, '0');
    const hour = String(dStr.getHours()).padStart(2, '0');
    const minute = String(dStr.getMinutes()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}T${hour}:${minute}`;
    
    setPlacementForm({
        company_id: '',
        tpo: '',
        year: new Date().getFullYear().toString(),
        school_id: '',
        program_id: '',
        job_description: '',
        job_type: '',
        job_location: '',
        event_datetime: dateStr,
        last_date_to_registration: '',
        type_of_hiring: '',
        number_of_openings: '',
        ctc: '',
        ctc_min: '',
        ctc_max: '',
        ctc_variable: '',
        ctc_stock: '',
        ctc_avg: '',
        ctc_final: '',
        min_cgpa: '',
        stipend: '',
        stipend_min: '',
        stipend_max: '',
        stipend_avg: '',
        placement_status: 'Scheduled',
        company_remarks: ''
    });

    setIsAddOpen(true);
    setStartHour('');
    setStartMinute('');
    setStartTimeError('');
  };

  const handleDayClick = (d) => {
    setSelectedDate(d);
    if (isAddOpen) {
      setForm(prev => ({ ...prev, date: formatDate(d) }));
      
      // Also update placement form date
      const dStr = new Date(d);
      dStr.setHours(9, 0, 0, 0);
      const year = dStr.getFullYear();
      const month = String(dStr.getMonth() + 1).padStart(2, '0');
      const day = String(dStr.getDate()).padStart(2, '0');
      const hour = String(dStr.getHours()).padStart(2, '0');
      const minute = String(dStr.getMinutes()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}T${hour}:${minute}`;
      
      setPlacementForm(prev => ({ ...prev, event_datetime: dateStr }));
    }
  };

  const handlePlacementInputChange = (e) => {
    const { name, value } = e.target;
    setPlacementForm(prev => {
      let updated = { ...prev, [name]: value };

      if (name === 'school_id') {
        updated.program_id = '';
      }

      // Auto-calculate averages and totals
      if (['ctc_min', 'ctc_max', 'ctc_variable', 'ctc_stock'].includes(name)) {
          const min = parseFloat(name === 'ctc_min' ? value : prev.ctc_min) || 0;
          const max = parseFloat(name === 'ctc_max' ? value : prev.ctc_max) || 0;
          const variablePercent = parseFloat(name === 'ctc_variable' ? value : prev.ctc_variable) || 0;
          const stock = parseFloat(name === 'ctc_stock' ? value : prev.ctc_stock) || 0;

          if ((name === 'ctc_min' && value && prev.ctc_max) || (name === 'ctc_max' && value && prev.ctc_min)) {
               updated.ctc_avg = ((min + max) / 2).toFixed(2);
          } else if (!min || !max) {
               updated.ctc_avg = '';
          }

          if ((name === 'ctc_max' ? value : prev.ctc_max) !== '' && ((name === 'ctc_variable' ? value : prev.ctc_variable) !== '' || (name === 'ctc_stock' ? value : prev.ctc_stock) !== '')) {
            const variableAmount = (max * variablePercent) / 100;
            updated.ctc_final = (max + variableAmount + stock).toFixed(2);
          } else {
            updated.ctc_final = '';
          }
      }

      if (['stipend_min', 'stipend_max'].includes(name)) {
          const min = parseFloat(name === 'stipend_min' ? value : prev.stipend_min) || 0;
          const max = parseFloat(name === 'stipend_max' ? value : prev.stipend_max) || 0;

          if ((name === 'stipend_min' && value && prev.stipend_max) || (name === 'stipend_max' && value && prev.stipend_min)) {
               updated.stipend_avg = ((min + max) / 2).toFixed(2);
          } else {
               updated.stipend_avg = '';
          }
      }

      return updated;
    });
  };

  const saveEvent = async () => {
    if (form.type === 'Placement') {
        // Handle Placement Drive Save
        const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';
        const missing = [];
        if (isBlank(placementForm.company_id)) missing.push('Company');
        if (isBlank(placementForm.school_id)) missing.push('School');
        if (isBlank(placementForm.event_datetime)) missing.push('Event Date');

        if (missing.length) {
            toast({ title: `${missing.join(', ')} are required`, status: "warning" });
            return;
        }

        const payload = {
            ...placementForm,
            number_of_openings: placementForm.number_of_openings === '' ? null : parseInt(placementForm.number_of_openings),
            program_id: placementForm.program_id === '' ? null : parseInt(placementForm.program_id),
            school_id: parseInt(placementForm.school_id),
            company_id: parseInt(placementForm.company_id),
            year: parseInt(placementForm.year),
            ctc_structure: { 
                package: placementForm.ctc,
                min: placementForm.ctc_min,
                max: placementForm.ctc_max,
                avg: placementForm.ctc_avg,
                variable: placementForm.ctc_variable,
                stock: placementForm.ctc_stock,
                final: placementForm.ctc_final
            },
            stipend_structure: { 
                stipend: placementForm.stipend,
                min: placementForm.stipend_min,
                max: placementForm.stipend_max,
                avg: placementForm.stipend_avg
            },
            eligibility_academics: { min_cgpa: placementForm.min_cgpa }
        };

        try {
            await PlacementService.addPlacementDrive(payload);
            toast({ title: "Placement Drive added successfully", status: "success" });
            setIsAddOpen(false);
            fetchEvents(); // Refresh calendar
        } catch (error) {
            console.error(error);
            toast({ title: "Error adding placement drive", status: "error" });
        }
        return;
    }

    // This would typically save to backend. 
    // Since we are using mock data and mixed sources, we will just update local state for now.
    const startValid = validateStart(startHour, startMinute);
    const startStr = startValid ? to24h(parseInt(startHour,10), parseInt(startMinute,10), startMeridiem) : null;
    
    const newEvent = {
      id: `MANUAL_${Date.now()}`,
      title: form.title,
      description: form.description,
      event_date: new Date(form.date).toISOString(),
      start_time: startStr,
      type: form.type,
      notification_remarks: form.notification_remarks
    };

    setEvents(prev => [...prev, newEvent]);
    setIsAddOpen(false);
    toast({
      title: "Event added",
      description: "This event is added locally.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const deleteEvent = (id) => {
    // Only allow deleting manual events for now, or just remove from view
    setEvents(prev => prev.filter(e => e.id !== id));
    toast({
      title: "Event removed",
      status: "info",
      duration: 2000,
    });
  };

  const dayEvents = (d) => {
    const iso = formatDate(d);
    return monthEvents.filter(e => {
        // Handle both full ISO strings and YYYY-MM-DD
        if (!e.event_date) return false;
        const eDate = new Date(e.event_date);
        return formatDate(eDate) === iso;
    });
  };

  return (
    <AdminLayout>
      <Box bg="#f7f7fa" minH="100vh" pb={10}>
        <Box maxW="100%" mx="auto" px={{ base: 4, sm: 6, lg: 10 }} pt={{ base: 4, sm: 6, lg: 10 }}>
          <VStack spacing={6} align="stretch">
            
            <HStack justifyContent="space-between">
                <Heading size="lg">Calendar of Events</Heading>
                <Button leftIcon={<FiPlus />} colorScheme="green" onClick={() => openAddForDate(selectedDate)}>
                    Add Event
                </Button>
            </HStack>

            {loading ? (
              <Box bg="white" borderRadius="xl" p={8} boxShadow="lg" textAlign="center">
                <Spinner size="lg" />
              </Box>
            ) : error ? (
              <Alert status="error" borderRadius="xl" variant="left-accent">
                <AlertIcon />
                {error}
              </Alert>
            ) : (
              <HStack align="stretch" spacing={6} flexDir={{ base: 'column', lg: 'row' }}>
                <Box flex="1" bg="white" borderRadius="xl" p={0} boxShadow="lg" height="100%" overflow="hidden">
                  <Box bg="green.700" px={6} py={4} color="white">
                    <HStack justify="center" align="center" spacing={4}>
                      <IconButton aria-label="Previous month" size="sm" variant="ghost" colorScheme="whiteAlpha" icon={<FiChevronLeft />} onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))} />
                      <Heading as="h1" fontSize={{ base: 'lg', sm: 'xl' }} fontWeight="bold" textTransform="uppercase">
                        {current.toLocaleString(undefined, { month: 'short' })} {current.getFullYear()}
                      </Heading>
                      <IconButton aria-label="Next month" size="sm" variant="ghost" colorScheme="whiteAlpha" icon={<FiChevronRight />} onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))} />
                    </HStack>
                  </Box>
                  <VStack spacing={3} align="stretch" height="100%">
                    <Grid templateColumns="repeat(7, 1fr)" gap={0}>
                      {['SU','MO','TU','WE','TH','FR','SA'].map((w) => (
                        <Box key={w} bg="#fad373" py={4} px={3}>
                          <Text textAlign="center" fontSize="md" fontWeight="bold" color="gray.900">{w}</Text>
                        </Box>
                      ))}
                    </Grid>
                    <Grid templateColumns="repeat(7, 1fr)" templateRows={`repeat(${range.weeks}, 12vh)`} gap={0} borderTop="1px solid" borderLeft="1px solid" borderColor="gray.200">
                      {range.days.map((d, idx) => {
                        const inMonth = d.getMonth() === current.getMonth();
                        const evs = dayEvents(d);
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        const isSunday = d.getDay() === 0;
                        const isToday = new Date().toDateString() === d.toDateString();
                        const colorName = getDateColorName(d);
                        const hasEvents = evs.length > 0;
                        return (
                          <GridItem key={idx} cursor="pointer" onClick={() => handleDayClick(d)} borderRight="1px solid" borderBottom="1px solid" borderColor="gray.200">
                            <Box position="relative" p={1} bg={hasEvents ? `${colorName}.50` : 'white'} opacity={inMonth ? 1 : 0.5} _hover={{ bg: hasEvents ? `${colorName}.100` : 'gray.50' }} display="flex" flexDir="column" alignItems="center" justifyContent="start" height="100%" w="100%" border={isSelected ? '2px solid' : 'none'} borderColor={isSelected ? 'green.500' : 'transparent'} borderRadius="sm">
                              <Text fontWeight="bold" fontSize="md" textAlign="center" color={isSelected ? 'green.600' : (isSunday ? 'red.500' : 'gray.800')}>{d.getDate()}</Text>
                              {isToday && (
                                <Box position="absolute" top={1} right={1} w="2" h="2" borderRadius="full" bg="green.500" />
                              )}
                              {hasEvents && (
                                <HStack spacing={1} mt={1} wrap="wrap" justify="center">
                                  {evs.slice(0, 3).map((e, i) => (
                                    <Box key={e.id || i} w="6px" h="6px" borderRadius="full" bg={e.type === 'Placement' ? 'blue.500' : 'orange.500'} />
                                  ))}
                                  {evs.length > 3 && <Text fontSize="xs">+{evs.length - 3}</Text>}
                                </HStack>
                              )}
                            </Box>
                          </GridItem>
                        );
                      })}
                    </Grid>
                  </VStack>
                </Box>
                
                {/* Simplified Sidebar */}
                <Box w={{ base: '100%', lg: 'sm' }} bg="white" borderRadius="xl" p={5} boxShadow="lg" height="auto" minH="500px" overflowY="auto">
                  <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.700" mb={3}>
                    {formatDMY(selectedDate)}
                  </Heading>
                  <Divider mb={3} />
                  
                  {/* Events List for Selected Date */}
                  <VStack align="stretch" spacing={3}>
                      {dayEvents(selectedDate).length === 0 ? (
                          <Text color="gray.500" fontSize="sm">No events for this date.</Text>
                      ) : (
                          dayEvents(selectedDate).map(e => (
                              <Box key={e.id} p={3} borderWidth="1px" borderRadius="md" bg="white" boxShadow="sm" borderLeft="4px solid" borderLeftColor={e.type === 'Placement' ? 'blue.500' : 'orange.500'} cursor="pointer" onClick={() => navigate(`/placement/events?highlight=${e.id}`)}>
                                  <HStack justifyContent="space-between" mb={1}>
                                      <Text fontWeight="bold" fontSize="sm">{e.title}</Text>
                                      <IconButton aria-label="Delete" icon={<FiTrash />} size="xs" colorScheme="red" variant="ghost" onClick={(ev) => { ev.stopPropagation(); deleteEvent(e.id); }} />
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600">{e.start_time ? `${e.start_time} - ` : ''}{e.type}</Text>
                                  {e.description && <Text fontSize="xs" mt={1} noOfLines={2}>{e.description}</Text>}
                              </Box>
                          ))
                      )}
                  </VStack>
                </Box>
              </HStack>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Add Event Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent bg="gray.50">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.200" bg="white" borderTopRadius="md">Add Event for {formatDMY(selectedDate)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8} pt={6}>
            <VStack spacing={6} align="stretch">
               <FormControl mb={4} bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <FormLabel fontWeight="medium" color="gray.600">Event Type</FormLabel>
                  <Select value={form.type} onChange={e => setForm({...form, type: e.target.value})} bg="gray.50" _focus={{ bg: 'white', borderColor: 'blue.500' }}>
                      <option value="Placement">Placement Drive</option>
                      <option value="Alumni">Alumni Event</option>
                      <option value="Other">Other</option>
                  </Select>
               </FormControl>

               {form.type === 'Placement' ? (
                  <>
                  {/* Section 1: Core Company Info */}
                  <Box bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <HStack mb={5} spacing={3} borderBottomWidth="1px" pb={3} borderColor="gray.100">
                      <Box bg="blue.50" p={2} borderRadius="md">
                         <SearchIcon color="blue.500" boxSize={4} />
                      </Box>
                      <Heading size="md" color="gray.700">Company & Role Details</Heading>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.600">Company</FormLabel>
                        <Select name="company_id" value={placementForm.company_id} onChange={handlePlacementInputChange} placeholder="Select Company" bg="gray.50" _focus={{ bg: 'white', borderColor: 'blue.500' }}>
                          {companyList.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.600">Job Type</FormLabel>
                        <Select name="job_type" value={placementForm.job_type} onChange={handlePlacementInputChange} placeholder="Select Job Type" bg="gray.50" _focus={{ bg: 'white', borderColor: 'blue.500' }}>
                           <option value="Full Time">Full Time</option>
                           <option value="Internship">Internship</option>
                           <option value="Internship + FTE">Internship + FTE</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">Type of Hiring</FormLabel>
                        <Select name="type_of_hiring" value={placementForm.type_of_hiring} onChange={handlePlacementInputChange} placeholder="Select Hiring Type" bg="gray.50" _focus={{ bg: 'white', borderColor: 'blue.500' }}>
                           <option value="On Campus">On Campus</option>
                           <option value="Off Campus">Off Campus</option>
                           <option value="Pool Campus">Pool Campus</option>
                           <option value="Virtual">Virtual</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">Job Location</FormLabel>
                        <Input name="job_location" value={placementForm.job_location} onChange={handlePlacementInputChange} placeholder="City/State" bg="gray.50" _focus={{ bg: 'white', borderColor: 'blue.500' }} />
                      </FormControl>

                      <FormControl gridColumn={{ md: "span 2" }}>
                        <FormLabel fontWeight="medium" color="gray.600">Job Description</FormLabel>
                        <Textarea name="job_description" value={placementForm.job_description} onChange={handlePlacementInputChange} placeholder="Job description..." rows={3} bg="gray.50" _focus={{ bg: 'white', borderColor: 'blue.500' }} />
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Section 2: Schedule & Logistics */}
                  <Box bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <HStack mb={5} spacing={3} borderBottomWidth="1px" pb={3} borderColor="gray.100">
                      <Box bg="purple.50" p={2} borderRadius="md">
                         <SettingsIcon color="purple.500" boxSize={4} />
                      </Box>
                      <Heading size="md" color="gray.700">Schedule & Logistics</Heading>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.600">Event Date</FormLabel>
                        <Input 
                          type="datetime-local" 
                          name="event_datetime" 
                          value={placementForm.event_datetime} 
                          onChange={handlePlacementInputChange} 
                          bg="gray.50" _focus={{ bg: 'white', borderColor: 'purple.500' }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">Last Date to Reg</FormLabel>
                        <Input 
                          type="date" 
                          name="last_date_to_registration" 
                          value={placementForm.last_date_to_registration} 
                          onChange={handlePlacementInputChange} 
                          bg="gray.50" _focus={{ bg: 'white', borderColor: 'purple.500' }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">Year (Batch)</FormLabel>
                        <Input name="year" value={placementForm.year} onChange={handlePlacementInputChange} placeholder="2024" bg="gray.50" _focus={{ bg: 'white', borderColor: 'purple.500' }} />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">TPO Name</FormLabel>
                        <Input name="tpo" value={placementForm.tpo} onChange={handlePlacementInputChange} bg="gray.50" _focus={{ bg: 'white', borderColor: 'purple.500' }} />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">Number of Openings</FormLabel>
                        <Input type="number" name="number_of_openings" value={placementForm.number_of_openings} onChange={handlePlacementInputChange} bg="gray.50" _focus={{ bg: 'white', borderColor: 'purple.500' }} />
                      </FormControl>
                      
                      <FormControl>
                         <FormLabel fontWeight="medium" color="gray.600">Placement Status</FormLabel>
                         <Select name="placement_status" value={placementForm.placement_status} onChange={handlePlacementInputChange} bg="gray.50" _focus={{ bg: 'white', borderColor: 'purple.500' }}>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                         </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Section 3: Eligibility & Target Audience */}
                  <Box bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <HStack mb={5} spacing={3} borderBottomWidth="1px" pb={3} borderColor="gray.100">
                      <Box bg="orange.50" p={2} borderRadius="md">
                         <EditIcon color="orange.500" boxSize={4} />
                      </Box>
                      <Heading size="md" color="gray.700">Target Audience</Heading>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="gray.600">School</FormLabel>
                        <Select name="school_id" value={placementForm.school_id} onChange={handlePlacementInputChange} placeholder="Select School" bg="gray.50" _focus={{ bg: 'white', borderColor: 'orange.500' }}>
                           {schoolList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                      </FormControl>

                      <FormControl>
                         <FormLabel fontWeight="medium" color="gray.600">Program</FormLabel>
                         <Select name="program_id" value={placementForm.program_id} onChange={handlePlacementInputChange} placeholder="Select Program" bg="gray.50" _focus={{ bg: 'white', borderColor: 'orange.500' }}>
                            {programList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" color="gray.600">Min CGPA</FormLabel>
                        <Input name="min_cgpa" value={placementForm.min_cgpa} onChange={handlePlacementInputChange} placeholder="e.g. 7.5" bg="gray.50" _focus={{ bg: 'white', borderColor: 'orange.500' }} />
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Section 4: Compensation */}
                  <Box bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <HStack mb={5} spacing={3} borderBottomWidth="1px" pb={3} borderColor="gray.100">
                      <Box bg="green.50" p={2} borderRadius="md">
                         <Text fontSize="lg" fontWeight="bold" color="green.600">₹</Text>
                      </Box>
                      <Heading size="md" color="gray.700">Compensation Details</Heading>
                    </HStack>
                    
                    <Box bg="gray.50" p={4} borderRadius="md" mb={6} borderWidth="1px" borderColor="gray.200">
                      <Text fontWeight="bold" fontSize="sm" mb={3} color="green.700" textTransform="uppercase" letterSpacing="wide">CTC Structure (LPA)</Text>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Minimum</FormLabel>
                          <Input type="number" name="ctc_min" value={placementForm.ctc_min} onChange={handlePlacementInputChange} placeholder="Min" bg="white" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Maximum</FormLabel>
                          <Input type="number" name="ctc_max" value={placementForm.ctc_max} onChange={handlePlacementInputChange} placeholder="Max" bg="white" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Average (Calc)</FormLabel>
                          <Input type="number" name="ctc_avg" value={placementForm.ctc_avg} isReadOnly bg="gray.100" color="gray.600" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Variable Pay (%)</FormLabel>
                          <Input type="number" name="ctc_variable" value={placementForm.ctc_variable} onChange={handlePlacementInputChange} placeholder="e.g. 10" bg="white" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Stock Options</FormLabel>
                          <Input type="number" name="ctc_stock" value={placementForm.ctc_stock} onChange={handlePlacementInputChange} placeholder="Stock" bg="white" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="green.600">Final CTC (Calc)</FormLabel>
                          <Input type="number" name="ctc_final" value={placementForm.ctc_final} isReadOnly bg="green.50" color="green.700" fontWeight="bold" borderColor="green.200" />
                        </FormControl>
                      </SimpleGrid>
                    </Box>

                    <Box bg="gray.50" p={4} borderRadius="md" mb={6} borderWidth="1px" borderColor="gray.200">
                      <Text fontWeight="bold" fontSize="sm" mb={3} color="blue.700" textTransform="uppercase" letterSpacing="wide">Stipend Structure (Monthly)</Text>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Minimum</FormLabel>
                          <Input type="number" name="stipend_min" value={placementForm.stipend_min} onChange={handlePlacementInputChange} placeholder="Min" bg="white" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Maximum</FormLabel>
                          <Input type="number" name="stipend_max" value={placementForm.stipend_max} onChange={handlePlacementInputChange} placeholder="Max" bg="white" />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">Average (Calc)</FormLabel>
                          <Input type="number" name="stipend_avg" value={placementForm.stipend_avg} isReadOnly bg="gray.100" color="gray.600" />
                        </FormControl>
                      </SimpleGrid>
                    </Box>

                  </Box>

                  {/* Section 5: Remarks */}
                  <Box bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <FormControl>
                      <FormLabel fontWeight="medium" color="gray.600">Company Remarks</FormLabel>
                      <Textarea name="company_remarks" value={placementForm.company_remarks} onChange={handlePlacementInputChange} rows={2} bg="gray.50" _focus={{ bg: 'white', borderColor: 'gray.500' }} />
                    </FormControl>
                  </Box>
                  </>
               ) : (
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <CInput value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Event Title" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Details" />
                    </FormControl>
                    <HStack>
                       <FormControl>
                           <FormLabel>Start Time</FormLabel>
                           <HStack>
                             <CInput placeholder="10" value={startHour} onChange={e => setStartHour(e.target.value)} w="60px" />
                             <Text>:</Text>
                             <CInput placeholder="00" value={startMinute} onChange={e => setStartMinute(e.target.value)} w="60px" />
                             <Select value={startMeridiem} onChange={e => setStartMeridiem(e.target.value)} w="80px">
                               <option value="AM">AM</option>
                               <option value="PM">PM</option>
                             </Select>
                           </HStack>
                       </FormControl>
                    </HStack>
                  </VStack>
               )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button colorScheme="blue" onClick={saveEvent}>Save Event</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default CalendarOfEvents;
