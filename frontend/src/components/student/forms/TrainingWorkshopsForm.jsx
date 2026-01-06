/**
 * Component: TrainingWorkshopsForm
 * 
 * Fields (Repeatable):
 * - title (Text, Required)
 * - organization (Text)
 * - startDate (Date)
 * - endDate (Date)
 * - description (Textarea)
 * 
 * Validation:
 * - title: Required
 * - endDate: After startDate
 * 
 * API Contracts:
 * - GET /api/student/profile/trainings
 * - POST /api/student/profile/trainings
 * - PUT /api/student/profile/trainings/:id
 * - DELETE /api/student/profile/trainings/:id
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex, Textarea } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const TrainingWorkshopsForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const items = Array.isArray(data) ? data : []

  const handleChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onUpdate(newItems)
  }

  const handleAdd = () => {
    onUpdate([
      ...items,
      {
        title: "",
        organization: "",
        startDate: "",
        endDate: "",
        description: "",
        certificateLink: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Training & Workshops</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <TrainingItem 
            key={index} 
            index={index} 
            item={item} 
            onChange={handleChange} 
            onDelete={handleDelete} 
            isEditing={isEditing}
          />
        ))}

        <Button 
          leftIcon={<FaPlus />} 
          onClick={handleAdd} 
          variant="outline" 
          colorScheme="orange" 
          borderColor="#d4a960" 
          color="#d4a960"
          _hover={{ bg: "#fff5e6" }}
          isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
        >
          Add Training / Workshop
        </Button>
      </VStack>
    </Box>
  )
}

const TrainingItem = ({ index, item, onChange, onDelete, isEditing }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardBody p={4}>
        <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
            <HStack onClick={() => setIsOpen(!isOpen)} cursor="pointer" flex={1}>
                <Text fontWeight="bold" color="gray.700">
                    {item.title || `Training ${index + 1}`}
                </Text>
                {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </HStack>
            <IconButton 
                size="sm" 
                variant="ghost" 
                color="red.500" 
                aria-label="Delete" 
                onClick={() => onDelete(index)}
                isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
            >
                <FaTrash />
            </IconButton>
        </Flex>

        <Collapse in={isOpen}>
            <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Title / Topic">
                        <Input 
                            value={item.title || ""} 
                            onChange={(e) => onChange(index, "title", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Organization / Institute">
                        <Input 
                            value={item.organization || ""} 
                            onChange={(e) => onChange(index, "organization", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Upload Certificate">
                        <Input 
                            type="file"
                            p={1}
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(index, "certificateLink", e.target.files[0]?.name)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                        {item.certificateLink && <Text fontSize="xs" color="green.500">Uploaded: {item.certificateLink}</Text>}
                    </Field>
                    <Field label="Start Date">
                        <Input 
                            type="date"
                            value={item.startDate || ""} 
                            onChange={(e) => onChange(index, "startDate", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="End Date">
                        <Input 
                            type="date"
                            value={item.endDate || ""} 
                            onChange={(e) => onChange(index, "endDate", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                </SimpleGrid>
                <Field label="Description">
                    <Textarea 
                        value={item.description || ""} 
                        onChange={(e) => onChange(index, "description", e.target.value)} 
                        variant="flushed"
                        rows={3}
                        isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                    />
                </Field>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
