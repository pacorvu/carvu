I will implement the Top-Right "Edit/Save" workflow with an inline OTP experience that minimizes clicks.

### **Planned Changes**

**1. Top-Right Action Bar (`EditProfile.jsx`)**
*   **Header:** Add a header area with the title and a single action button.
*   **Logic:**
    *   **Default:** Button says **"Edit"**.
    *   **Editing:** Button becomes **"Save Changes"** (and a "Cancel" button appears).
*   **Smart Save Action:**
    *   When **"Save Changes"** is clicked:
        1.  **If Email Unchanged:** Saves the profile immediately.
        2.  **If Email Changed & No OTP Sent:** Automatically **sends OTP**, reveals the OTP field in the form, and prompts user to check email.
        3.  **If Email Changed & OTP Entered:** Verifies OTP and **saves the profile** in one go.

**2. Contact Form Improvements (`ContactLinksForm.jsx`)**
*   **Cleaner UI:** Remove the "Email Verification Status" badge as requested.
*   **Inline OTP:** The OTP input field will only appear (with a smooth animation) inside the Contact container *after* the user tries to save a changed email.
*   **Input Styling:** Apply the "View" (text) vs "Edit" (outline) styling to all fields.

**3. Personal Information Form (`PersonalInformationForm.jsx`)**
*   **Styling:** Apply the same "View vs Edit" styling and Card container look for consistency.

**Files to Modify:**
*   `frontend/src/pages/student/profile/EditProfile.jsx` (Header, Save/OTP Logic)
*   `frontend/src/components/student/forms/ContactLinksForm.jsx` (OTP UI, Styling)
*   `frontend/src/components/student/forms/PersonalInformationForm.jsx` (Styling)
