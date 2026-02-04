# VOC Login Images

# VOC Login Images (POC)

## Project Summary
VOC Login Images is a small enhancement to the VOC login experience that displays a single background image per day.  
The image changes once every 24 hours and represents a meaningful location from the service’s operating area.  
The goal is to increase product loveability by creating a calm, familiar, and localized moment when operators start their shift.  
This is a static POC with a guaranteed fallback to the existing login image.  

---

## User Story & UX Behavior

### Primary Users
VOC operators:
- Dispatchers
- Reservationists
- Eligibility managers
- Admins

### Entry Point
- Every time a user enters the VOC login flow

### Core Behavior
- One background image is shown per calendar day
- The image is consistent across all logins on that day
- The image updates automatically at 00:00 (local time)

### States
- **Success:** Daily image is shown
- **Fallback:** Default VOC login image is shown

### Edge Cases
- Multiple logins in the same day → same image
- Image fails to load → fallback image

---

## Requirements

### Functional Requirements
- Display a background image on the VOC login screen
- Select exactly one image per calendar day
- Image selection is deterministic (date-based, not per-session random)
- Images rotate once every 24 hours at 00:00
- Images are sourced from a pre-generated static set (20+ images)
- Location metadata (name, lat, long) exists but is not shown to users in the POC

### Image Preparation (Offline)
- Choose meaningful locations per service:
  - Urban services: recognizable POIs
  - Rural / small-town services: town centers, landmarks, commonly used pickup/drop-off areas
- Source base images (e.g. Google Photos / Street View)
- Apply a consistent visual style using Nano Banana (style definition provided separately)
- Ensure images do not include identifiable people
- Store final images as static assets

### Non-Functional Requirements
- Image loading must not block login interaction
- Image size should be optimized for fast loading
- Login panel must remain readable at all times

### Content Rules
- Image covers ~75% of the screen
- Login panel remains on the left
- Image is edge-to-edge within its container
- Responsive behavior:
  - Image is center-cropped
  - On smaller screens, left/right edges may be trimmed
- Preferred formats:
  - WebP
  - JPEG fallback if needed

---

## System Design

### Source of Truth
- Static assets stored in the repository: