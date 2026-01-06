/**
 * Component: ExtraCurricularForm
 * 
 * Fields (Repeatable):
 * - activityName (Text, Required)
 * - role (Text)
 * - organization (Text)
 * - startDate (Date)
 * - endDate (Date)
 * - description (Textarea)
 * 
 * Validation:
 * - activityName: Required
 * 
 * API Contracts:
 * - GET /api/student/profile/extra-curricular
 * - POST /api/student/profile/extra-curricular
 * - PUT /api/student/profile/extra-curricular/:id
 * - DELETE /api/student/profile/extra-curricular/:id
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const ExtraCurricularForm = ({ data = {}, onUpdate, isEditing = false }) => {
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
        activityName: "",
        role: "",
        achievement: "",
        date: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
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
          Add Activity
        </Button>
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
                    {item.activityName || `Activity ${index + 1}`}
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
            <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Activity Name">
                        <Input 
                            value={item.activityName || ""} 
                            onChange={(e) => onChange(index, "activityName", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Role">
                        <Input 
                            value={item.role || ""} 
                            onChange={(e) => onChange(index, "role", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Achievement / Description">
                        <Input 
                            value={item.achievement || ""} 
                            onChange={(e) => onChange(index, "achievement", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Date">
                        <Input 
                            type="date"
                            value={item.date || ""} 
                            onChange={(e) => onChange(index, "date", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Upload Certificate/Proof">
                        <Input 
                            type="file" 
                            p={1} 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(index, "proofFile", e.target.files[0]?.name)} 
                            variant="flushed" 
                            isDisabled={!isEditing} 
                        />
                        {item.proofFile && <Text fontSize="xs" color="green.500">Uploaded: {item.proofFile}</Text>}
                    </Field>
                </SimpleGrid>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
