# Implementation Plan

- [x] 1. Database Schema Updates and Core Infrastructure




  - Update Prisma schema to add new models and fields for enhanced functionality
  - Add PaymentConfig model for dynamic pricing, AdminSettings model, and enrollmentDate field to Student model
  - Generate and apply database migrations for the new schema changes
  - _Requirements: 5.2, 5.3, 7.1, 7.2_


- [x] 2. Student Code Format Migration System




  - Create utility functions to generate new student code format (std1xxxx, std2xxxx, std3xxxx)
  - Implement backward compatibility layer to handle both old and new code formats
  - Update getNextStudentId function in data.ts to use new format based on grade
  - Write migration script to convert existing student codes from old format to new format
  - _Requirements: 1.1, 1.2, 1.3_





- [x] 3. Phone Number Validation Implementation

  - Create phone validation utility functions for Egyptian phone numbers (01xxxxxxxxx, 11 digits)
  - Implement real-time validation in student form with visual feedback
  - Add validation to both student phone and parent phone fields
  - Update form submission to prevent invalid phone numbers from being saved


  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. UI Theme and Card Visibility Fixes

  - Update card component styling to fix whitish background issues
  - Implement proper contrast ratios for text readability across all card components
  - Apply consistent styling to cards in add student form, attendance page, and payment page
  - Update CSS custom properties and Tailwind configuration for global theme consistency
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Dynamic Payment Configuration System




  - Create PaymentConfig model operations (CRUD) for managing grade/section pricing
  - Implement admin authentication system with password "admin000"
  - Build admin modal component for payment configuration management
  - Create payment calculator service that determines amount based on student grade/section
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Payment System QR Code Integration




  - Update payment scanner to automatically determine payment amount from student data
  - Remove manual amount entry prompt from payment processing
  - Integrate payment calculator with QR code scanning workflow
  - Add error handling for students without configured payment amounts
  - _Requirements: 5.4, 5.5_

- [ ] 7. Monthly Payment View Implementation

  - Replace yearly payment view with monthly navigation system
  - Implement next/previous month navigation buttons
  - Update payment data fetching to work with monthly periods instead of yearly
  - Modify payment table to display monthly student payment status
  - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [ ] 8. Non-Current Month Payment Confirmation

  - Add confirmation dialog for payments made in non-current months
  - Implement month awareness in QR code payment processing
  - Display clear indication of target month when processing non-current payments
  - Update payment recording to handle different month selections
  - _Requirements: 6.4, 6.5_

- [ ] 9. Historical Payment Logic Enhancement

  - Update payment history logic to respect student enrollment dates
  - Modify payment status calculation to exclude months before enrollment
  - Implement "Not Enrolled" status for pre-enrollment months
  - Update payment reports to only include relevant months for each student
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Student Table Enhancement - Remove Actions and Add Phone Columns

  - Remove actions column from students table component
  - Add student phone number column with clickable functionality
  - Add parent phone number column with clickable functionality
  - Implement WhatsApp integration for phone number clicks
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 11. Student Row Navigation and Editing System

  - Make student table rows clickable for navigation to edit mode
  - Update add student page to handle edit mode with pre-populated data
  - Implement edit mode detection and data loading from student ID
  - Add notification system to indicate edit mode vs add mode
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 12. Attendance Filter Dropdown Fix

  - Analyze and debug the grade selection dropdown issue in attendance page
  - Fix filter state management to properly update when grade is selected
  - Ensure filter combinations work correctly with multiple criteria
  - Test and verify proper student list filtering by grade
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 13. Form Validation and Error Handling Enhancement

  - Implement comprehensive client-side validation with real-time feedback
  - Add proper error messages in Arabic for all validation scenarios
  - Update form submission error handling with user-friendly messages
  - Add loading states and success feedback for better user experience
  - _Requirements: 3.4, 3.5, 9.5, 9.6_

- [ ] 14. Admin Panel UI Implementation

  - Create admin modal component with password authentication
  - Build payment configuration interface for grade/section pricing
  - Implement form handling for updating payment configurations
  - Add validation and error handling for admin operations
  - _Requirements: 5.1, 5.2, 5.3, 5.6_

- [ ] 15. WhatsApp Integration and Communication Features

  - Implement WhatsApp URL generation for phone numbers
  - Add click handlers for phone number columns in student table
  - Handle cases where phone numbers are invalid or missing
  - Test WhatsApp integration across different devices and browsers
  - _Requirements: 8.4, 8.5, 8.6_

- [ ] 16. Testing and Quality Assurance

  - Write unit tests for student code generation and validation functions
  - Create integration tests for payment calculation and processing
  - Test phone validation with various input scenarios
  - Verify monthly payment navigation and historical logic
  - _Requirements: All requirements - validation and testing_

- [ ] 17. Performance Optimization and Final Polish
  - Optimize database queries for improved performance with large datasets
  - Implement proper loading states and error boundaries
  - Add accessibility improvements (ARIA labels, keyboard navigation)
  - Test mobile responsiveness and RTL layout consistency
  - _Requirements: 2.4, 8.6, 9.6_
