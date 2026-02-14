# VOC Login Visual (POC)

## Project Summary
VOC Login Visual is an enhancement to the VOC login experience that replaces the current static background image with a dynamic visual element.
The goal is to increase product loveability by creating a calm, engaging, and localized moment when operators start their shift.
The exact nature of the dynamic visual is TBD — specs to follow.

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
- A dynamic visual is displayed on the login screen background
- Specific behavior, animation, and content rules — TBD

### States
- **Success:** Dynamic visual is rendered
- **Fallback:** Default VOC login image is shown

---

## Requirements

### Functional Requirements
- Display a dynamic visual element on the VOC login screen
- Further functional specs — TBD

### Non-Functional Requirements
- Visual loading must not block login interaction
- Login panel must remain readable at all times
- Performance should be optimized for fast rendering

### Content Rules
- Visual covers ~75% of the screen
- Login panel remains on the left
- Responsive behavior must be maintained across screen sizes

---

## Dynamic Visual — Specs

> **Pending** — specs for the dynamic visual will be added here once defined.

---

## Pivot Note
This project originally scoped a static daily background image (one image per calendar day, sourced from local landmarks). The direction has shifted to a dynamic visual approach. Prior static-image specs have been archived.
