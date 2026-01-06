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
  FormControl, 
  FormLabel, 
  Input as CInput, 
  Select, 
  Divider, 
  Switch, 
  InputGroup, 
  ButtonGroup, 
  useToast
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';

const CalendarOfEvents = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
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
    setIsAddOpen(true);
  };

  const handleDayClick = (d) => {
    setSelectedDate(d);
    if (isAddOpen) {
      setForm(prev => ({ ...prev, date: formatDate(d) }));
    }
  };

  const saveEvent = () => {
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
                <Box w={{ base: '100%', lg: 'sm' }} bg="white" borderRadius="xl" p={5} boxShadow="lg" height="auto" minH="500px" overflowY="auto">
                  <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.700" mb={3}>
                    {formatDMY(selectedDate)}
                  </Heading>
                  <Divider mb={3} />
                  {isAddOpen ? (
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" fontSize="md" color="gray.700">Add Event</Heading>
                      <FormControl isRequired>
                        <FormLabel>Title</FormLabel>
                        <CInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                      </FormControl>
                      <FormControl>
                          <FormLabel>Type</FormLabel>
                          <Select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                              <option value="Placement">Placement Drive</option>
                              <option value="Alumni">Alumni Event</option>
                              <option value="Other">Other</option>
                          </Select>
                      </FormControl>
                      <VStack spacing={3} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Date</FormLabel>
                          <CInput type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <HStack spacing={3}>
                          <FormControl flex="1">
                            <FormLabel>Start Time</FormLabel>
                            <InputGroup size="sm">
                              <CInput w="70px" type="number" inputMode="numeric" min={1} max={12} placeholder={String(nowHour12)} value={startHour} onChange={e => { const v = e.target.value.replace(/[^0-9]/g,''); setStartHour(v); const ok = validateStart(v, startMinute); if (ok) setForm({ ...form, start_time: to24h(parseInt(v||'0',10), parseInt(startMinute||'0',10), startMeridiem) }); }} />
                              <CInput w="70px" type="number" inputMode="numeric" min={0} max={59} placeholder={nowMinute} value={startMinute} onChange={e => { const v = e.target.value.replace(/[^0-9]/g,''); setStartMinute(v); const ok = validateStart(startHour, v); if (ok) setForm({ ...form, start_time: to24h(parseInt(startHour||'0',10), parseInt(v||'0',10), startMeridiem) }); }} />
                              <ButtonGroup isAttached size="sm">
                                <Button variant={startMeridiem==='AM' ? 'solid' : 'outline'} colorScheme="green" onClick={() => { setStartMeridiem('AM'); const ok = validateStart(startHour, startMinute); if (ok) setForm({ ...form, start_time: to24h(parseInt(startHour||'0',10), parseInt(startMinute||'0',10), 'AM') }); }}>AM</Button>
                                <Button variant={startMeridiem==='PM' ? 'solid' : 'outline'} colorScheme="green" onClick={() => { setStartMeridiem('PM'); const ok = validateStart(startHour, startMinute); if (ok) setForm({ ...form, start_time: to24h(parseInt(startHour||'0',10), parseInt(startMinute||'0',10), 'PM') }); }}>PM</Button>
                              </ButtonGroup>
                            </InputGroup>
                            {startTimeError && (<Text fontSize="xs" color="red.500" mt={1}>{startTimeError}</Text>)}
                          </FormControl>
                        </HStack>
                      </VStack>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <CInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Remarks</FormLabel>
                        <CInput value={form.notification_remarks} onChange={e => setForm({ ...form, notification_remarks: e.target.value })} />
                      </FormControl>
                      
                      <HStack mt={2} spacing={3}>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button colorScheme="green" onClick={saveEvent}>Save</Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <>
                      <VStack spacing={4} align="stretch">
                        <Heading as="h3" fontSize="md" color="gray.700">Events</Heading>
                        {dayEvents(selectedDate).length === 0 ? (
                          <Text color="gray.500">No events</Text>
                        ) : (
                          dayEvents(selectedDate).map(e => {
                            const colorName = getDateColorName(selectedDate);
                            return (
                              <HStack key={e.id} p={3} borderRadius="md" bg={`${colorName}.50`} border="1px solid" borderColor={`${colorName}.200`} justifyContent="space-between" alignItems="center">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="semibold" color={`${colorName}.800`}>{e.title}</Text>
                                  <Badge colorScheme={e.type === 'Placement' ? 'blue' : 'orange'} fontSize="xs">{e.type}</Badge>
                                  {e.start_time && <Text fontSize="xs" color="gray.600">{e.start_time}</Text>}
                                  {e.notification_remarks && (<Text fontSize="xs" color={`${colorName}.700`}>{e.notification_remarks}</Text>)}
                                </VStack>
                                <IconButton aria-label="Delete" icon={<FiTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => deleteEvent(e.id)} />
                              </HStack>
                            );
                          })
                        )}
                      </VStack>
                    </>
                  )}
                </Box>
              </HStack>
            )}
          </VStack>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default CalendarOfEvents;
