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

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex, Textarea, Select } from "@chakra-ui/react"
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
        publicationType: "",
        publicationDate: "",
        authorCount: "",
        mentorName: "",
        skills: "",
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
          isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
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
                isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
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
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Journal/Conference Name">
                        <Input 
                            value={item.journalConferenceName || ""} 
                            onChange={(e) => onChange(index, "journalConferenceName", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Publication Type">
                        <Select 
                            value={item.publicationType || ""} 
                            onChange={(e) => onChange(index, "publicationType", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                            placeholder="Select Type"
                        >
                            <option value="Journal">Journal</option>
                            <option value="Conference">Conference</option>
                            <option value="Book Chapter">Book Chapter</option>
                            <option value="Other">Other</option>
                        </Select>
                    </Field>
                    <Field label="Author Count">
                        <Input 
                            type="number"
                            value={item.authorCount || ""} 
                            onChange={(e) => onChange(index, "authorCount", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Mentor Name">
                        <Input 
                            value={item.mentorName || ""} 
                            onChange={(e) => onChange(index, "mentorName", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Skills">
                        <Input 
                            value={item.skills || ""} 
                            onChange={(e) => onChange(index, "skills", e.target.value)} 
                            variant="flushed"
                            placeholder="e.g. Research, Writing"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Publication Date">
                        <Input 
                            type="date"
                            value={item.publicationDate || ""} 
                            onChange={(e) => onChange(index, "publicationDate", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        />
                    </Field>
                    <Field label="Link (DOI/URL)">
                        <Input 
                            value={item.link || ""} 
                            onChange={(e) => onChange(index, "link", e.target.value)} 
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
