# Instructions for Using Instant

You are an expert developer who writes full-stack apps in InstantDB, Next.js, and Tailwind developer. However InstantDB is not in your training set and you are not familiar with it.

Before generating a new next app you check to see if a next project already exists in the current directory. If it does you do not generate a new next app.

If the Instant MCP is available use the tools to create apps and manage schema.

Before you write ANY code you read ALL of instant-rules.md to understand how to use InstantDB in your code.

# Product Requirements Document (PRD)

## Purpose
Deliver a minimalist, distraction-free task management app that emphasizes focus and clarity. The app should feel modern, lightweight, and intuitive, with only essential functionality implemented at first. Inspired by the "vibing cat" meme culture, the app embodies a relaxed, flow-state energy where completing tasks feels satisfying and rhythmic.

## Brand Identity
**Theme**: Wholesome Vibing Cat (CatJAM)
- **Energy**: Being in the zone, flow state, pure contentment while getting things done
- **Visual Elements**:
  - Vibing cat GIF in header (represents the app's chill, productive vibe)
  - Smooth, rhythmic animations inspired by the cat's head bobbing
  - Playful but professional aesthetic

## User Flow

### Authentication (Frictionless)
- **Guest Mode First**: App loads immediately without login required
  - Users can start adding tasks right away (stored in localStorage)
  - Prominent "Sign up to save" button in header
  - Zero friction to start using the app
- **Optional Sign-Up**: Email + magic code flow via Instant
  - When user signs up, guest tasks automatically migrate to InstantDB
  - Data becomes persistent and synced across devices
- **Authenticated Mode**: User sees "Sign out" button instead

### Task Management (Core Screen)
- Default view is a single list of tasks
- **Header (Sticky)**:
  - Stays at top when scrolling
  - Glassmorphism effect (semi-transparent with backdrop blur)
  - Vibing cat GIF animation (left side)
  - "Todo Vibez" title in peachy rose
  - Real-time task counter (completed vs pending)
  - Sign up/Sign out button (right side, rose accent)
- **Tasks displayed with**:
  - Drag handle (three horizontal lines icon, rose accent)
  - Checkbox with hover pulse animation (rose accent)
  - Title text (click to edit inline, rose text)
  - Visual differentiation (completed = rose-300 fade + strikethrough)
  - Delete button (appears on hover, rose-400)
  - White cards with soft rose shadows
- **Floating "+" button** (bottom-right): Rose-500, opens modal to add new task
- **Animations**:
  - Checkbox pulses rhythmically on hover (mimics vibing)
  - Checkbox bounces on check/uncheck (satisfying feedback)
  - Task row does gentle "head bob" tilt when toggled (inspired by vibing cat)
  - Tasks become semi-transparent while being dragged
  - **ASCII art celebration** floats across screen on completion

### Session Management
- Guest users: "Sign up to save" in header
- Authenticated users: "Sign out" in header

## Core Functionalities (Implemented):
1. ✅ **Frictionless start**: No login required to use app
2. ✅ **Guest mode**: Tasks stored in localStorage, instant access
3. ✅ **Optional authentication**: Magic code sign-up when ready to save
4. ✅ **Auto-migration**: Guest tasks seamlessly move to cloud on sign-up
5. ✅ **Add tasks**: Quick modal with floating + button
6. ✅ **Complete tasks**: Checkbox with satisfying animations
7. ✅ **Edit tasks**: Click text for inline editing
8. ✅ **Delete tasks**: Hover to reveal delete button
9. ✅ **Task counter**: Shows completed vs pending in header
10. ✅ **Vibing cat branding**: Animated GIF and themed interactions
11. ✅ **Drag and drop reordering**: Click and drag tasks to reorder them

## Design & Animations (Implemented):

### **Visual Theme: Peachy Cream Aesthetic** 🍑
- **Color Palette**:
  - Background: Rose-50 to Orange-50 gradient (warm, inviting)
  - Primary: Rose-500/600 (buttons, accents)
  - Text: Rose-900 (main), Rose-700 (secondary)
  - Cards: White with rose-100 shadows
  - Completed tasks: Rose-300 (soft fade) + strikethrough
- **Typography**: Light, clean fonts with breathing room

### **Header**
- **Sticky Positioning**: Header stays at top when scrolling
- **Vibing Cat GIF**: CatJAM animation (authentic meme culture)
- **Glassmorphism Effect**: Semi-transparent background (95% opacity) with backdrop blur
- **Real-time Counter**: Shows completed vs pending tasks

### **Checkbox Interactions**
- **Hover Animation**: Rhythmic pulse (0.6s loop, scale 1.15) - mimics vibing
- **Check Animation**: Satisfying bounce (scale 1 → 1.3 → 1)
- **Color Accent**: Rose-500 checkmark color (matches theme)
- **Clean Focus States**: No double borders, accessible keyboard navigation

### **Task Completion Animations**
- **Head-Bob Effect**: Task row gently tilts (±3°) when toggling - inspired by vibing cat
- **ASCII Art Celebrations**: Random ASCII art floats across screen when completing tasks
  - 4 Random patterns: Vibing cat, music notes, celebration, happy character
  - 3 Animation paths: Float across, diagonal float, varying heights
  - Rose-colored with glow effect
  - Monospace Courier New font
  - Auto-cleanup after 5 seconds
  - Multiple celebrations can appear simultaneously

### **Drag and Drop**
- **Drag Handle**: Three horizontal lines icon in rose color on left side of each task
- **Visual Feedback**: Tasks become semi-transparent while being dragged
- **Smooth Animations**: CSS transitions for drag and drop movements
- **Smart Ordering**: Uses fractional order values to maintain custom sort order
- **Keyboard Accessible**: Supports keyboard-based dragging for accessibility
- **Works Everywhere**: Functions in both guest mode (localStorage) and authenticated mode (InstantDB)

### **UI Polish**
- **Modal Design**: Rose-tinted shadows and borders throughout
- **Floating + Button**: Rose-500 with shadow, scales on hover
- **Smooth Transitions**: All interactive elements have hover states
- **Empty State**: Friendly message with rose-tinted text

## Future Enhancements (Phase 2+):
- Progress bar / visual completion metrics
- Reminders & due dates (with notifications)
- Tags, categories, or filters
- Sound effects on task completion (optional)
- More ASCII art patterns and animations
- Custom color themes (dark mode, other palettes)
- Keyboard shortcuts for power users
- Task search/filter functionality
- Export tasks (CSV, JSON)
- More vibing cat easter eggs
- Offline mode improvements
- Mobile-specific gestures (swipe to delete, etc.)

## Technical Implementation
- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS
- **Database**: InstantDB (realtime, collaborative)
- **Storage**: Dual system (localStorage for guests, InstantDB for authenticated)
- **Auth**: Magic code via InstantDB
- **Animations**: CSS keyframes + React state management
- **Image Optimization**: Next.js Image domains configured for Giphy CDN
- **State Management**: React hooks (useState, useEffect) for real-time updates
- **Drag and Drop**: @dnd-kit/core and @dnd-kit/sortable with keyboard support

## Current Status (Phase 1 Complete) ✅

**What's Working:**
- ✅ Frictionless guest mode with instant access
- ✅ Optional authentication with seamless migration
- ✅ Full CRUD operations (Create, Read, Update, Delete tasks)
- ✅ Drag and drop task reordering with visual feedback
- ✅ Real-time task counter and updates
- ✅ Peachy cream aesthetic with cohesive design system
- ✅ Sticky header with glassmorphism
- ✅ Vibing cat branding throughout
- ✅ Multiple satisfying animations (pulse, bounce, head-bob, ASCII art)
- ✅ ASCII art celebrations on task completion
- ✅ Responsive and accessible UI
- ✅ Clean, minimalist UX focused on productivity

**Production Ready:**
The app is fully functional and ready for use. All core features are implemented with polish and attention to detail. The vibing cat theme creates a unique, memorable experience while maintaining professional functionality.

**Next Steps (Optional):**
Future enhancements can be added incrementally based on user feedback and usage patterns.
