# Workout Tracker

A mobile-first workout tracking application that helps users plan, execute, and analyze their fitness routines with intelligent pre-population and motivational features.

**Experience Qualities**:
1. **Effortless** - Minimal taps and typing during workouts; smart defaults reduce friction
2. **Motivating** - Progress visualization and gentle reminders keep users engaged and consistent
3. **Reliable** - Data persists locally; works offline; optimized for quick loading on mobile

**Complexity Level**: Light Application (multiple features with basic state)
This app manages workout sessions, exercise tracking, and historical data with straightforward CRUD operations and some smart auto-fill logic, but doesn't require complex algorithms or multi-user features. Data persists using browser localStorage for client-side storage.

## Essential Features

### Pre-Workout Checklist
- **Functionality**: Displays customizable checklist of items to bring (e.g., water bottle, towel, headphones)
- **Purpose**: Ensures user doesn't forget essentials before leaving for gym
- **Trigger**: User taps "Start Workout" from home screen
- **Progression**: Home → Checklist Modal → Check items → Select workout type → Exercise planning
- **Success criteria**: User can add/remove/check items; checklist state persists between sessions

### Workout Type Selection
- **Functionality**: Choose from 6 workout types: Pull, Push, Legs, Swim, Run (Gym), Run (Outdoor)
- **Purpose**: Categorizes workouts for smart pre-population and analytics
- **Trigger**: After reviewing checklist
- **Progression**: Checklist → Type selection cards → Exercise planning screen
- **Success criteria**: Selection determines which previous workout data to load

### Exercise Planning & Smart Pre-population
- **Functionality**: Set targets for equipment (weight/reps/sets) or cardio (distance/duration); auto-fills from last workout of same type
- **Purpose**: Speeds up planning while allowing progressive overload
- **Trigger**: After workout type selection
- **Progression**: Type selected → Previous data loads → User adjusts targets → Begins workout
- **Success criteria**: Last workout data appears instantly; edits save; different data per workout type

### Real-time Exercise Logging
- **Functionality**: Mark exercises complete; adjust actual values during workout (reps/sets/weight/distance/duration)
- **Purpose**: Captures what actually happened vs. what was planned
- **Trigger**: User completes a set or exercise
- **Progression**: During workout → Tap exercise card → Mark set complete or adjust values → Return to list
- **Success criteria**: Changes save immediately; visual feedback on completion; easy to undo mistakes

### Workout Summary & Completion
- **Functionality**: "Finish Workout" button; displays duration, exercises completed, and notable achievements
- **Purpose**: Provides closure and immediate feedback on session
- **Trigger**: User taps finish button
- **Progression**: Active workout → Finish button → Summary modal → Return to home
- **Success criteria**: Summary shows key metrics; data saved to history; workout clears from active state

### Analytics Dashboard
- **Functionality**: Charts showing workout frequency, volume progression, personal records
- **Purpose**: Visualizes progress to maintain motivation
- **Trigger**: User taps "Statistics" tab
- **Progression**: Tab navigation → Dashboard with charts → Drill down into specific exercises
- **Success criteria**: Charts render historical data; updates after each workout; highlights trends

### Smart Reminders
- **Functionality**: Detects declining workout frequency; displays motivational prompt on home screen
- **Purpose**: Re-engages users trending toward inactivity
- **Trigger**: User hasn't worked out in X days (configurable)
- **Progression**: Automatic detection → Banner appears on home → User dismisses or starts workout
- **Success criteria**: Reminder threshold configurable; message non-intrusive; disappears after workout

## Edge Case Handling

- **Empty History**: First-time users see empty exercise list with "Add Exercise" prompt
- **Mid-Workout Exit**: In-progress workout auto-saves; resume banner appears on return
- **Invalid Inputs**: Weight/rep/set fields validate for positive numbers; distance/duration require proper formats
- **Checklist Empty**: If no items configured, skip directly to workout type selection
- **Network Offline**: All features work offline since data persists in browser localStorage
- **Storage Limits**: Browser localStorage has 5-10MB limit; workout data optimized to stay well below threshold
- **Browser Data Clear**: User can export workout history; import on new device or after data loss
- **Long Exercise Names**: Text truncates with ellipsis; full name visible on tap

## Design Direction

The design should evoke **confidence, energy, and clarity**. Users are often checking this app mid-workout with sweaty hands and elevated heart rate—every element must be large, readable, and instantly actionable. The aesthetic should feel like premium athletic gear: bold, purposeful, and stripped of anything unnecessary.

## Color Selection

Athletic tech aesthetic with high contrast for outdoor/gym visibility.

- **Primary Color**: Deep electric blue `oklch(0.45 0.15 250)` - Conveys energy, focus, and technology; used for primary actions and active states
- **Secondary Colors**: 
  - Charcoal `oklch(0.25 0.01 250)` - Grounding neutral for cards and surfaces
  - Steel gray `oklch(0.65 0.02 250)` - For secondary text and inactive elements
- **Accent Color**: Vibrant cyan `oklch(0.75 0.13 210)` - Energetic highlight for completed items, achievements, CTAs
- **Foreground/Background Pairings**:
  - Primary (Deep Blue `oklch(0.45 0.15 250)`): White text `oklch(0.98 0 0)` - Ratio 6.8:1 ✓
  - Accent (Vibrant Cyan `oklch(0.75 0.13 210)`): Charcoal text `oklch(0.25 0.01 250)` - Ratio 5.2:1 ✓
  - Background (Near-black `oklch(0.15 0.01 250)`): White text `oklch(0.98 0 0)` - Ratio 14.2:1 ✓
  - Card (Charcoal `oklch(0.25 0.01 250)`): White text `oklch(0.98 0 0)` - Ratio 10.1:1 ✓

## Font Selection

Typefaces should feel technical yet approachable—like a high-performance sports watch interface.

- **Primary**: **Space Grotesk** (Bold weights for headers, Regular for UI) - Geometric sans with slight quirkiness; athletic tech vibe
- **Secondary**: **JetBrains Mono** (for numerical displays) - Monospaced clarity for reps, sets, weights

- **Typographic Hierarchy**:
  - H1 (Screen Titles): Space Grotesk Bold / 32px / -0.02em letter spacing / 1.1 line-height
  - H2 (Section Headers): Space Grotesk Semibold / 24px / -0.01em / 1.2
  - H3 (Exercise Names): Space Grotesk Medium / 18px / 0em / 1.3
  - Body (Instructions): Space Grotesk Regular / 16px / 0em / 1.5
  - Numbers (Reps/Sets/Weight): JetBrains Mono Medium / 18px / 0.02em / 1.2
  - Small Labels: Space Grotesk Regular / 14px / 0em / 1.4

## Animations

Animations should feel responsive and energetic—quick transitions that provide feedback without slowing the user down. Think of a stopwatch: precise, immediate, purposeful.

- **Micro-interactions**: Checkbox checks, button presses, and set completions use spring physics (bounce) for satisfying tactile feedback
- **Transitions**: Screen changes slide horizontally (workout flow feels progressive); modals scale up from center with slight overshoot
- **Progress indicators**: Smooth counter animations when stats update; progress bars fill with easing curve
- **List items**: Stagger animation on load (20ms delay between items) for polished appearance
- **Exercise completion**: Brief scale pulse + color shift to accent when marked done

## Component Selection

- **Components**:
  - `Card` - Exercise cards, workout type selection tiles, stat summaries (with hover:scale-[1.02] transition)
  - `Button` - Primary actions sized at min 48px height for thumb targets; variants: default (primary), outline (secondary), ghost (tertiary)
  - `Checkbox` - Checklist items with custom accent color on checked state
  - `Input` - Weight/rep entry fields with numerical keyboard trigger (type="number")
  - `Tabs` - Bottom navigation between Home, Active Workout, Statistics
  - `Dialog` - Checklist modal, workout summary, exercise detail editing
  - `Badge` - Workout type labels, PR indicators, completion counts
  - `Progress` - Set completion indicators, overall workout progress bar
  - `ScrollArea` - Exercise lists, history scrolling
  - `Separator` - Visual breaks between workout sections

- **Customizations**:
  - Custom "floating action button" component (large circular button with shadow) for "Start Workout" and "Finish Workout"
  - Exercise card component with expandable details section and swipe-to-complete gesture
  - Stat card component with icon, large number display, and trend indicator arrow
  - Bottom sheet component for quick edits during workout (alternative to full dialog)

- **States**:
  - Buttons: Rest (solid), Hover (brightness increase), Active (scale 0.98), Disabled (50% opacity)
  - Inputs: Default (border-input), Focus (ring-2 ring-accent), Error (border-destructive with shake animation), Success (border-accent)
  - Exercise cards: Pending (card background), In Progress (accent border), Completed (accent background with checkmark overlay)
  - Checkboxes: Unchecked (border), Checked (accent fill with scale animation)

- **Icon Selection**:
  - `Barbell` - Strength exercises (Pull/Push/Legs)
  - `Waves` - Swimming
  - `Sneaker` - Running
  - `CheckCircle` - Completed exercises
  - `Plus` - Add exercise, add checklist item
  - `PencilSimple` - Edit values
  - `ChartLine` - Analytics/statistics
  - `Fire` - Streaks and motivation indicators
  - `Target` - Goal setting
  - `Timer` - Workout duration

- **Spacing**:
  - Container padding: `px-4 py-6` (16px/24px) on mobile
  - Card internal spacing: `p-4` (16px)
  - Element gaps: `gap-2` (8px) for related items, `gap-4` (16px) between sections, `gap-6` (24px) between major groups
  - Button padding: `px-6 py-3` (24px/12px) for minimum thumb target
  - Bottom navigation height: `h-16` (64px) with safe-area-inset

- **Mobile**:
  - Single column layout throughout; no multi-column grids
  - Bottom navigation (tabs) instead of sidebar
  - Large touch targets (minimum 44x44px, preferably 48x48px)
  - Sticky header with screen title; sticky bottom nav
  - Modals/dialogs use 90% of screen height on mobile; full-screen on small devices
  - Swipeable cards for quick actions (swipe right to complete exercise)
  - Pull-to-refresh on history and statistics screens
  - Number inputs open numeric keyboard automatically
  - Increased font sizes: body text 16px minimum for readability in gym lighting
