# Workout Tracker - Product Requirements Document

## Overview
A mobile-optimized web application for tracking personal workouts, primarily used on iPhone browser.

## Core Features

### 1. Pre-Workout Setup
**Checklist Reminder**
- Display configurable checklist of items to bring before starting workout
- User can customize checklist items

**Workout Type Selection**
- Pull
- Push
- Legs
- Swim
- Run (Gym)
- Run (Outdoor)

### 2. Exercise Planning (Pull/Push/Legs)
**Target Setting**
- Equipment-based exercises: Equipment type, weight (kg), target reps, target sets
  - Example: "Chest press machine, 15 reps at 100kg for 3 sets"
- Non-equipment exercises: Activity type and distance/duration
  - Example: "Run: 1km", "Bicycle: 3km"

**Smart Pre-population**
- Auto-fill targets based on previous workout of same type
- User can edit pre-populated values

### 3. During Workout Tracking
**Real-time Exercise Logging**
- Mark done each completed exercise/equipment
- Adjust actual values during workout:
  - Modify reps, sets, and weights
  - Update distance/duration for non-equipment exercises

### 4. Workout Completion
- "Finish" button to end workout
- Summary view of completed workout details

### 5. Analytics & Motivation
**Statistics**
- Historical workout data visualization
- Progress tracking

**Engagement Features**
- Detect declining workout frequency
- Send reminders when user trends toward inactivity
- Motivational prompts for persistence

## User Flow
1. Start workout → View checklist
2. Select workout type
3. Set/review exercise targets
4. During workout → Mark completed exercises and adjust actual values
5. Finish workout → View summary
6. Access statistics anytime

## Technical Requirements
- Mobile-responsive web interface
- Optimized for iPhone Safari
- Remote hosting with public URL access
- Data persistence (simple storage)
- Configurable user settings
