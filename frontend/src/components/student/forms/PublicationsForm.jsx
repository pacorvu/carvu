/**
 * Component: PublicationsForm
 * 
 * Fields (Repeatable):
 * - title (Text, Required)
 * - journalConference (Text)
 * - publicationDate (Date)
 * - link (Url)
 * - description (Textarea)
 * 
 * Validation:
 * - title: Required
 * - link: Valid URL
 * 
 * API Contracts:
 * - GET /api/student/profile/publications
 * - POST /api/student/profile/publications
 * - PUT /api/student/profile/publications/:id
 * - DELETE /api/student/profile/publications/:id
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex, Textarea } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const PublicationsForm = ({ data = {}, onUpdate, isEditing = false }) => {
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
        journalConferenceName: "",
        publicationDate: "",
        link: "",
        description: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Publications</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <PublicationItem 
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
          Add Publication
        </Button>
      </VStack>
    </Box>
  )
}

const PublicationItem = ({ index, item, onChange, onDelete, isEditing }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardBody p={4}>
        <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
            <HStack onClick={() => setIsOpen(!isOpen)} cursor="pointer" flex={1}>
                <Text fontWeight="bold" color="gray.700">
                    {item.title || `Publication ${index + 1}`}
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
            <VStack gap={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Title">
                        <Input 
                            value={item.title || ""} 
                            onChange={(e) => onChange(index, "title", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Journal / Conference Name">
                        <Input 
                            value={item.journalConferenceName || ""} 
                            onChange={(e) => onChange(index, "journalConferenceName", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Publication Date">
                        <Input 
                            type="date"
                            value={item.publicationDate || ""} 
                            onChange={(e) => onChange(index, "publicationDate", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Link (DOI / URL)">
                        <Input 
                            value={item.link || ""} 
                            onChange={(e) => onChange(index, "link", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                </SimpleGrid>
                <Field label="Description">
                    <Textarea 
                        value={item.description || ""} 
                        onChange={(e) => onChange(index, "description", e.target.value)} 
                        variant="flushed"
                        rows={3}
                        isDisabled={!isEditing}
                    />
                </Field>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
