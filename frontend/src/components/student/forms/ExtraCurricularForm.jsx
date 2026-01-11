/**
 * Component: ExtraCurricularForm
 * 
 * Fields (Repeatable):
 * - activityName (Text, Required)
 * - activityType (Text, Required)
 * - role (Text)
 * - organization (Text)
 * - startDate (Date)
 * - endDate (Date)
 * - achievements (Text)
 * - skills (Text)
 * - description (Textarea)
 * - proofDocument (Link)
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex, Textarea, useColorModeValue } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const ExtraCurricularForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const items = Array.isArray(data) ? data : (data.extraCurricular || [])
  const bg = useColorModeValue("white", "gray.700")

  const handleChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onUpdate(newItems)
  }

  const handleAdd = () => {
    onUpdate([
      ...items,
      {
        activityName: "",
        role: "",
        organization: "",
        activityType: "",
        startDate: "",
        endDate: "",
        skills: "",
        achievements: "",
        description: "",
        proofDocument: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg={bg} p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Extra-Curricular Activities</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <ExtraCurricularItem 
            key={index} 
            index={index} 
            item={item} 
            onChange={handleChange} 
            onDelete={handleDelete}
            isEditing={isEditing} 
          />
        ))}

        {isEditing && (
          <Button 
            leftIcon={<FaPlus />} 
            onClick={handleAdd} 
            variant="outline" 
            colorScheme="orange" 
            borderColor="#d4a960" 
            color="#d4a960"
            _hover={{ bg: "#fff5e6" }}
          >
            Add Activity
          </Button>
        )}

        {items.length === 0 && (
            <Box p={8} textAlign="center" color="gray.500" border="1px dashed" borderColor="gray.300" borderRadius="xl">
                No extra-curricular activities added yet.
            </Box>
        )}
      </VStack>
    </Box>
  )
}

const ExtraCurricularItem = ({ index, item, onChange, onDelete, isEditing }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardBody p={4}>
        <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
            <HStack onClick={() => setIsOpen(!isOpen)} cursor="pointer" flex={1}>
                <Text fontWeight="bold" color="gray.700">
                    {item.activityName || "New Activity"}
                </Text>
                {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </HStack>
            {isEditing && (
                <IconButton 
                    icon={<FaTrash />} 
                    size="sm" 
                    colorScheme="red" 
                    variant="ghost" 
                    onClick={() => onDelete(index)}
                    aria-label="Delete activity"
                />
            )}
        </Flex>

        <Collapse in={isOpen} animateOpacity>
            <VStack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <Field label="Activity Name" required>
                        <Input 
                            value={item.activityName || ""} 
                            onChange={(e) => onChange(index, "activityName", e.target.value)}
                            placeholder="e.g. Hackathon, Debate Club"
                            readOnly={!isEditing}
                        />
                    </Field>
                    <Field label="Activity Type" required>
                        <Input 
                            value={item.activityType || ""} 
                            onChange={(e) => onChange(index, "activityType", e.target.value)}
                            placeholder="e.g. Competition, Club, Volunteering"
                            readOnly={!isEditing}
                        />
                    </Field>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <Field label="Role">
                        <Input 
                            value={item.role || ""} 
                            onChange={(e) => onChange(index, "role", e.target.value)}
                            placeholder="e.g. Participant, Organizer, Lead"
                            readOnly={!isEditing}
                        />
                    </Field>
                    <Field label="Organization">
                        <Input 
                            value={item.organization || ""} 
                            onChange={(e) => onChange(index, "organization", e.target.value)}
                            placeholder="e.g. College Name, IEEE"
                            readOnly={!isEditing}
                        />
                    </Field>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <Field label="Start Date">
                        <Input 
                            type="date" 
                            value={item.startDate ? item.startDate.split('T')[0] : ""} 
                            onChange={(e) => onChange(index, "startDate", e.target.value)}
                            readOnly={!isEditing}
                        />
                    </Field>
                    <Field label="End Date">
                        <Input 
                            type="date" 
                            value={item.endDate ? item.endDate.split('T')[0] : ""} 
                            onChange={(e) => onChange(index, "endDate", e.target.value)}
                            readOnly={!isEditing}
                        />
                    </Field>
                </SimpleGrid>

                <Field label="Achievements">
                    <Textarea 
                        value={item.achievements || ""} 
                        onChange={(e) => onChange(index, "achievements", e.target.value)}
                        placeholder="List your key achievements..."
                        readOnly={!isEditing}
                    />
                </Field>

                <Field label="Skills Developed">
                    <Input 
                        value={item.skills || ""} 
                        onChange={(e) => onChange(index, "skills", e.target.value)}
                        placeholder="e.g. Leadership, Public Speaking, Coding"
                        readOnly={!isEditing}
                    />
                </Field>

                <Field label="Description">
                    <Textarea 
                        value={item.description || ""} 
                        onChange={(e) => onChange(index, "description", e.target.value)}
                        placeholder="Brief description of the activity..."
                        readOnly={!isEditing}
                    />
                </Field>

                <Field label="Proof Document URL">
                    <Input 
                        value={item.proofDocument || ""} 
                        onChange={(e) => onChange(index, "proofDocument", e.target.value)}
                        placeholder="https://..."
                        readOnly={!isEditing}
                    />
                </Field>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
