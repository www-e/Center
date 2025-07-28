# Auto-Absence System Requirements

## Introduction

This document outlines the requirements for implementing an automatic absence marking system that will mark students as absent if they don't attend within a configurable time window after their scheduled session time.

## Requirements

### Requirement 1: Auto-Absence Marking

**User Story:** As a teacher, I want students to be automatically marked as absent if they don't attend within a specified time window, so that I don't have to manually track and mark absences.

#### Acceptance Criteria

1. WHEN a student's scheduled session time passes by more than the configured grace period THEN the system SHALL automatically create an absence record
2. WHEN the grace period is set to 15 minutes AND a student's session starts at 2:00 PM THEN the system SHALL mark them absent at 2:15 PM if not already marked present
3. WHEN a student is marked present before the grace period expires THEN the system SHALL NOT create an absence record
4. WHEN a student is already marked absent automatically THEN the system SHALL allow manual override to mark them present
5. WHEN the auto-absence job runs THEN it SHALL only process students who have scheduled sessions for that day

### Requirement 2: Configurable Grace Period

**User Story:** As an admin, I want to configure the grace period for auto-absence marking, so that I can adjust it based on our center's policies.

#### Acceptance Criteria

1. WHEN an admin accesses the admin dashboard THEN they SHALL see a setting for "Auto-Absence Grace Period"
2. WHEN an admin changes the grace period THEN the new setting SHALL be applied to all future auto-absence checks
3. WHEN the grace period is set THEN it SHALL be stored in minutes and accept values between 5 and 60 minutes
4. IF no grace period is configured THEN the system SHALL use a default of 15 minutes
5. WHEN the grace period is updated THEN the system SHALL validate the input and show appropriate error messages

### Requirement 3: Absence Record Management

**User Story:** As a teacher, I want to see which students were marked absent automatically vs manually, so that I can understand attendance patterns better.

#### Acceptance Criteria

1. WHEN viewing attendance records THEN the system SHALL distinguish between manual and automatic absence marking
2. WHEN a student is marked absent automatically THEN the record SHALL include a timestamp and "auto" flag
3. WHEN viewing the attendance table THEN automatic absences SHALL be visually distinct from manual entries
4. WHEN an automatically marked absent student arrives late THEN the teacher SHALL be able to override the absence to present
5. WHEN an absence is overridden THEN the system SHALL log the change with timestamp and reason

### Requirement 4: Background Job Processing

**User Story:** As a system administrator, I want the auto-absence marking to run automatically in the background, so that it doesn't require manual intervention.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL initialize a background job scheduler
2. WHEN the scheduled time arrives THEN the auto-absence job SHALL run every 5 minutes
3. WHEN the job runs THEN it SHALL process all students with sessions in the current time window
4. IF the job fails THEN it SHALL log the error and retry after the next interval
5. WHEN processing students THEN the job SHALL be efficient and not impact system performance

### Requirement 5: Admin Dashboard Integration

**User Story:** As an admin, I want to monitor and configure the auto-absence system from the admin dashboard, so that I can ensure it's working correctly.

#### Acceptance Criteria

1. WHEN accessing the admin dashboard THEN there SHALL be an "Auto-Absence Settings" section
2. WHEN viewing the settings THEN the admin SHALL see the current grace period and job status
3. WHEN the admin updates settings THEN changes SHALL take effect immediately
4. WHEN viewing job logs THEN the admin SHALL see recent auto-absence processing history
5. WHEN there are system issues THEN the admin SHALL see error notifications and troubleshooting options