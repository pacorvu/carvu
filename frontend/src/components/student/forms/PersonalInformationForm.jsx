import React from "react";
import {
  Box,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  Avatar,
  Flex,
} from "@chakra-ui/react";

  const matchOption = (options, name) => {
    const n = String(name || "").trim().toLowerCase();
    if (!n) return null;
    return options.find((o) => String(o?.name || "").trim().toLowerCase() === n) || null;
  };

  const Section = ({ title, bg, children }) => (
    <Box
      bg={bg}
      borderRadius="xl"
      boxShadow="sm"
      p={{ base: 6, md: 8 }}
      border="1px solid"
      borderColor="gray.100"
    >
      <Heading size="md" mb={6} color="gray.700">{title}</Heading>
      {children}
    </Box>
  );

  const SelectFromOptions = ({ 
    label, 
    valueKey, 
    idKey, 
    options, 
    listId, 
    isEnabled,
    formData,
    handleChange,
    inputVariant,
    focusBorderColor,
    inputPadding
  }) => {
    const rawValue = String(formData[valueKey] || "");
    const allowed = !!isEnabled;
    return (
      <FormControl>
        <FormLabel fontWeight="semibold" color="gray.600">{label}</FormLabel>
        <Input
          value={rawValue}
          onChange={(e) => {
            const val = e.target.value;
            const m = matchOption(options, val);
            handleChange(valueKey, val);
            handleChange(idKey, m ? m.id : null);
          }}
          onBlur={(e) => {
            const val = e.target.value;
            const m = matchOption(options, val);
            if (!m && val.trim()) {
              handleChange(valueKey, "");
              handleChange(idKey, null);
            }
          }}
          list={listId}
          variant={inputVariant}
          focusBorderColor={focusBorderColor}
          px={inputPadding}
          isDisabled={!allowed}
          _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
        />
        <datalist id={listId}>
          {options.map((o) => (
            <option key={String(o.id)} value={String(o.name)} />
          ))}
        </datalist>
      </FormControl>
    );
  };

export const PersonalInformationForm = ({
  data = {},
  onUpdate,
  isEditing,
  mode = "student",
  majorOptions = [],
  minorOptions = [],
  specializationOptions = [],
  allowEditMajor = false,
  allowEditMinor = false,
  allowEditSpecialization = false,
}) => {
  const bg = "white"; // Clean white card
  const formData = data || {};
  // const borderColor = isEditing ? "#d4a960" : "gray.200";
  
  const inputVariant = isEditing ? "outline" : "unstyled";
  const inputPadding = isEditing ? 3 : 0;
  const focusBorderColor = "#d4a960";
  
  const isStudent = mode === "student";
  // const valueColor = useColorModeValue("gray.900", "gray.50");

  const toDdMmYyyy = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    const s = String(v);
    const mIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (mIso) return `${mIso[3]}-${mIso[2]}-${mIso[1]}`;
    const mDdMmYy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
    if (mDdMmYy) return s;
    return s;
  };
  const toYyyyMmDd = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    }
    const s = String(v);
    const mDdMmYy = /^(\d{2})-((\d{2}))-(\d{4})$/.exec(s);
    if (mDdMmYy) return `${mDdMmYy[3]}-${mDdMmYy[2]}-${mDdMmYy[1]}`;
    const mIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (mIso) return s;
    return s;
  };

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <VStack spacing={8} align="stretch">
      <Section title="Profile Details" bg={bg}>
        <Flex direction={{ base: "column", md: "row" }} align="center" gap={10}>
          <Box 
            p={2} 
            borderRadius="full" 
            borderWidth="1px" 
            borderColor="gray.200"
            bg="white"
            boxShadow="sm"
          >
            <Avatar 
              size="2xl" 
              name={formData.fullName} 
              src={formData.profileImage} 
              borderWidth="4px"
              borderColor="gray.50"
            />
          </Box>

          <VStack flex={1} w="full" spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                  Full Name
                </FormLabel>
                <Input
                  value={formData.fullName || ""}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  variant={inputVariant}
                  focusBorderColor={focusBorderColor}
                  px={isEditing ? 3 : 0}
                  fontSize="xl"
                  fontWeight="semibold"
                  isDisabled={!isEditing}
                  _disabled={{ opacity: 1, bg: "transparent", px: 0, color: "gray.900", cursor: "default" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                  USN
                </FormLabel>
                <Input
                  value={formData.usn || ""}
                  onChange={(e) => handleChange("usn", e.target.value)}
                  variant="unstyled"
                  fontSize="lg"
                  fontFamily="monospace"
                  isDisabled={true}
                  _disabled={{ opacity: 1, bg: "transparent", px: 0, color: "gray.900", cursor: "default" }}
                />
              </FormControl>
            </SimpleGrid>
            {/* Profile Image URL input removed as per request */}
          </VStack>
        </Flex>
      </Section>

      <Section title="Basic Details" bg={bg}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Gender</FormLabel>
            <Select
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default", bg: "transparent" }}
              value={formData.gender || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              icon={!isEditing ? "none" : undefined}
            >
              <option value="">Select</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="Other">Other</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Date of Birth</FormLabel>
            <Input
              type={isEditing ? "date" : "text"}
              value={isEditing ? toYyyyMmDd(formData.dateOfBirth || "") : toDdMmYyyy(formData.dateOfBirth || "")}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              px={inputPadding}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Blood Group</FormLabel>
            <Input
              value={formData.bloodGroup || ""}
              onChange={(e) => handleChange("bloodGroup", e.target.value)}
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              px={inputPadding}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Marital Status</FormLabel>
            <Select
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default", bg: "transparent" }}
              value={formData.maritalStatus || ""}
              onChange={(e) => handleChange("maritalStatus", e.target.value)}
              icon={!isEditing ? "none" : undefined}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Specially Abled</FormLabel>
            <Select
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default", bg: "transparent" }}
              value={formData.speciallyAbled ? "Yes" : "No"}
              onChange={(e) => handleChange("speciallyAbled", e.target.value === "Yes")}
              icon={!isEditing ? "none" : undefined}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Languages</FormLabel>
            <Input
              value={formData.languages || ""}
              onChange={(e) => handleChange("languages", e.target.value)}
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              px={inputPadding}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
            />
          </FormControl>
        </SimpleGrid>
      </Section>

      <Section title="Academic Details" bg={bg}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">School Name</FormLabel>
            <Input
              value={formData.schoolName || ""}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              px={inputPadding}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Year of Joining</FormLabel>
            <Input
              value={formData.yearOfJoining ?? ""}
              onChange={(e) => handleChange("yearOfJoining", e.target.value === "" ? "" : Number(e.target.value))}
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              px={inputPadding}
              type={isEditing ? "number" : "text"}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="semibold" color="gray.600">Program</FormLabel>
            <Input
              value={formData.programName || ""}
              onChange={(e) => handleChange("programName", e.target.value)}
              variant={inputVariant}
              focusBorderColor={focusBorderColor}
              px={inputPadding}
              isDisabled={!isEditing}
              _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }}
            />
          </FormControl>

          {isStudent ? (
            <SelectFromOptions
              label="Specialization"
              valueKey="specializationName"
              idKey="specializationId"
              options={specializationOptions}
              listId="specialization-options"
              isEnabled={isEditing}
              formData={formData}
              handleChange={handleChange}
              inputVariant={inputVariant}
              focusBorderColor={focusBorderColor}
              inputPadding={inputPadding}
            />
          ) : (
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.600">Specialization</FormLabel>
              <Input 
                value={formData.specializationName || ""} 
                onChange={(e) => handleChange("specializationName", e.target.value)}
                variant={inputVariant}
                isDisabled={!isEditing} 
                _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }} 
              />
            </FormControl>
          )}

          {isStudent ? (
            <SelectFromOptions
              label="Major"
              valueKey="majorName"
              idKey="majorId"
              options={majorOptions}
              listId="major-options"
              isEnabled={isEditing}
              formData={formData}
              handleChange={handleChange}
              inputVariant={inputVariant}
              focusBorderColor={focusBorderColor}
              inputPadding={inputPadding}
            />
          ) : (
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.600">Major</FormLabel>
              <Input 
                value={formData.majorName || ""} 
                onChange={(e) => handleChange("majorName", e.target.value)}
                variant={inputVariant}
                isDisabled={!isEditing} 
                _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }} 
              />
            </FormControl>
          )}

          {isStudent ? (
            <SelectFromOptions
              label="Minor"
              valueKey="minorName"
              idKey="minorId"
              options={minorOptions}
              listId="minor-options"
              isEnabled={isEditing}
              formData={formData}
              handleChange={handleChange}
              inputVariant={inputVariant}
              focusBorderColor={focusBorderColor}
              inputPadding={inputPadding}
            />
          ) : (
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.600">Minor</FormLabel>
              <Input 
                value={formData.minorName || ""} 
                onChange={(e) => handleChange("minorName", e.target.value)}
                variant={inputVariant}
                isDisabled={!isEditing} 
                _disabled={{ opacity: 1, color: "gray.800", cursor: "default" }} 
              />
            </FormControl>
          )}
        </SimpleGrid>
      </Section>
    </VStack>
  );
};
