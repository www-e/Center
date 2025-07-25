# Requirements Document

## Introduction

This document outlines comprehensive improvements to the existing student management system, focusing on user experience enhancements, data validation, payment system overhaul, and interface improvements. The changes address critical usability issues, implement proper business logic for payments, and enhance the overall functionality of the student management platform.

## Requirements

### Requirement 1: Student Code Format Standardization

**User Story:** As an administrator, I want student codes to follow a consistent grade-based format (std1xxxx, std2xxxx, std3xxxx), so that I can easily identify student grades from their codes.

#### Acceptance Criteria

1. WHEN a new student is created THEN the system SHALL generate a student code in the format "std{grade}xxxx" where grade is 1, 2, or 3
2. WHEN displaying existing student codes THEN the system SHALL convert from old format (std-gx-xxxx) to new format (std{grade}xxxx)
3. WHEN searching for students THEN the system SHALL support both old and new code formats for backward compatibility

### Requirement 2: UI Component Visibility Enhancement

**User Story:** As a user, I want all card components to have proper contrast and readability, so that I can easily read all content without strain.

#### Acceptance Criteria

1. WHEN viewing student code cards in the add student form THEN the background SHALL have sufficient contrast for text readability
2. WHEN viewing cards in the attendance page THEN the background SHALL have proper contrast and not appear whitish
3. WHEN viewing cards in the payment page THEN the background SHALL maintain consistent styling with proper visibility
4. WHEN applying theme changes THEN all card components across the application SHALL maintain consistent styling

### Requirement 3: Phone Number Validation Implementation

**User Story:** As an administrator, I want phone number validation for Egyptian numbers, so that only valid phone numbers are stored in the system.

#### Acceptance Criteria

1. WHEN entering a student phone number THEN the system SHALL only accept numbers starting with "01"
2. WHEN entering a parent phone number THEN the system SHALL only accept numbers starting with "01"
3. WHEN entering phone numbers THEN the system SHALL limit input to exactly 11 digits
4. WHEN invalid phone numbers are entered THEN the system SHALL display clear validation error messages
5. WHEN submitting forms with invalid phone numbers THEN the system SHALL prevent form submission

### Requirement 4: Attendance Filter Functionality Fix

**User Story:** As a teacher, I want the grade filter in the attendance page to work correctly, so that I can filter students by their academic grade.

#### Acceptance Criteria

1. WHEN selecting a grade from the dropdown in attendance filters THEN the system SHALL properly filter students by the selected grade
2. WHEN applying grade filters THEN the system SHALL update the student list immediately
3. WHEN clearing grade filters THEN the system SHALL show all students again
4. WHEN multiple filters are applied THEN the system SHALL combine filters correctly

### Requirement 5: Dynamic Payment System Configuration

**User Story:** As an administrator, I want to configure payment amounts per grade and section dynamically, so that the system automatically applies correct fees without manual entry.

#### Acceptance Criteria

1. WHEN accessing the admin panel with password "admin000" THEN the system SHALL display payment configuration options
2. WHEN configuring payment amounts THEN the system SHALL allow setting different amounts for each grade (1, 2, 3)
3. WHEN configuring payment amounts THEN the system SHALL allow setting different amounts for each section (ادبي, علمي, etc.)
4. WHEN scanning a student barcode for payment THEN the system SHALL automatically determine the correct payment amount
5. WHEN processing payments THEN the system SHALL NOT prompt for manual amount entry
6. WHEN payment configuration is updated THEN the system SHALL apply changes immediately to new payments

### Requirement 6: Monthly Payment View Implementation

**User Story:** As an administrator, I want to view and manage payments on a monthly basis instead of yearly, so that I can better track monthly payment cycles.

#### Acceptance Criteria

1. WHEN viewing the payment page THEN the system SHALL display current month data by default
2. WHEN navigating payments THEN the system SHALL provide "Next Month" and "Previous Month" buttons
3. WHEN viewing monthly data THEN the system SHALL show student payment status for the selected month
4. WHEN scanning QR codes for non-current months THEN the system SHALL prompt for confirmation before processing
5. WHEN confirming non-current month payments THEN the system SHALL clearly indicate the target month
6. WHEN displaying student payment table THEN the system SHALL show student data with payment status for the selected month

### Requirement 7: Historical Payment Logic Enhancement

**User Story:** As an administrator, I want the system to respect student enrollment dates, so that students are not marked as late for months before they joined.

#### Acceptance Criteria

1. WHEN a student is enrolled THEN the system SHALL record their enrollment date
2. WHEN viewing payment history THEN the system SHALL only show payment records from the enrollment date forward
3. WHEN generating payment reports THEN the system SHALL exclude months before student enrollment
4. WHEN marking students as late THEN the system SHALL only consider months after their enrollment date
5. WHEN displaying payment status THEN the system SHALL indicate "Not Enrolled" for months before enrollment

### Requirement 8: Student Table Enhancement with Communication Features

**User Story:** As an administrator, I want to contact students and parents directly from the student table, so that I can communicate efficiently without leaving the application.

#### Acceptance Criteria

1. WHEN viewing the students table THEN the system SHALL remove the actions column
2. WHEN viewing the students table THEN the system SHALL display student phone number as a clickable column
3. WHEN viewing the students table THEN the system SHALL display parent phone number as a clickable column
4. WHEN clicking a student phone number THEN the system SHALL open WhatsApp with the student's number
5. WHEN clicking a parent phone number THEN the system SHALL open WhatsApp with the parent's number
6. WHEN phone numbers are not available THEN the system SHALL display appropriate placeholder text

### Requirement 9: Student Row Navigation and Editing

**User Story:** As an administrator, I want to edit student information by clicking on student rows, so that I can quickly access and modify student data.

#### Acceptance Criteria

1. WHEN clicking on a student row THEN the system SHALL navigate to the add student page
2. WHEN navigating to edit mode THEN the system SHALL pre-populate all student data fields
3. WHEN entering edit mode THEN the system SHALL display a notification indicating edit mode
4. WHEN in edit mode THEN the system SHALL allow modification of all student fields
5. WHEN saving changes in edit mode THEN the system SHALL update the student record
6. WHEN canceling edit mode THEN the system SHALL return to the students table without changes