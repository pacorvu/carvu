/**
 * Component: AcademicPerformanceForm
 * 
 * Fields (Repeatable - Semester Wise):
 * - academicYear (Text, e.g., 2023-24)
 * - semester (Select: 1-8)
 * - sgpa (Number)
 * - cgpa (Number)
 * - liveBacklogs (Number)
 * - closedBacklogs (Number)
 * 
 * Validation:
 * - sgpa/cgpa: 0-10 scale
 * - backlogs: Non-negative integer
 * 
 * API Contracts:
 * - GET /api/student/profile/academics
 * - POST /api/student/profile/academics (Add Semester)
 * - PUT /api/student/profile/academics/:id (Update Semester)
 * - DELETE /api/student/profile/academics/:id (Delete Semester)
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex, FormControl, FormLabel } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const AcademicPerformanceForm = ({ data = {}, onUpdate, isEditing = false }) => {
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
        academicYear: "",
        semester: "",
        sgpa: "",
        liveBacklogs: "0",
        closedBacklogs: "0",
        resultUploadLink: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Academic Performance</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <AcademicItem 
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
          isDisabled={!isEditing}
        >
          Add Semester
        </Button>
      </VStack>
    </Box>
  )
}

const AcademicItem = ({ index, item, onChange, onDelete, isEditing }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardBody p={4}>
        <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
            <HStack onClick={() => setIsOpen(!isOpen)} cursor="pointer" flex={1}>
                <Text fontWeight="bold" color="gray.700">
                    Semester {item.semester || index + 1}
                </Text>
                {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </HStack>
            <IconButton 
                size="sm" 
                variant="ghost" 
                color="red.500" 
                aria-label="Delete" 
                onClick={() => onDelete(index)}
                isDisabled={!isEditing}
            >
                <FaTrash />
            </IconButton>
        </Flex>

        <Collapse in={isOpen}>
            <VStack mt={4} align="stretch" gap={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Academic Year">
                        <Input 
                            placeholder="e.g. 2023-2024" 
                            value={item.academicYear || ""} 
                            onChange={(e) => onChange(index, "academicYear", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Semester">
                        <Input 
                            placeholder="e.g. 5" 
                            value={item.semester || ""} 
                            onChange={(e) => onChange(index, "semester", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="SGPA">
                        <Input 
                            placeholder="e.g. 8.5" 
                            value={item.sgpa || ""} 
                            onChange={(e) => onChange(index, "sgpa", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Upload Marksheet">
                        <Input 
                            type="file"
                            p={1}
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(index, "resultUploadLink", e.target.files[0]?.name)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                         {item.resultUploadLink && <Text fontSize="xs" color="green.500">Uploaded: {item.resultUploadLink}</Text>}
                    </Field>
                    <Field label="Live Backlogs">
                        <Input 
                            type="number"
                            value={item.liveBacklogs || "0"} 
                            onChange={(e) => onChange(index, "liveBacklogs", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Closed Backlogs">
                        <Input 
                            type="number"
                            value={item.closedBacklogs || "0"} 
                            onChange={(e) => onChange(index, "closedBacklogs", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                </SimpleGrid>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
