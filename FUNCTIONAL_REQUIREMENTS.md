# ConnectPlus - Functional Requirements Document (FR)

## 1. Project Overview

**Project Name:** ConnectPlus  
**Type:** Exhibition Management Progressive Web Application  
**Platform:** Web (Mobile-First Responsive)  
**Tech Stack:** React, Node.js, MongoDB

---

## 2. User Roles

### 2.1 Visitor/User
- Browse exhibition booths
- View booth details
- Participate in quizzes
- Submit feedback
- View notifications
- Bookmark booths
- Track visited booths

### 2.2 Admin
- Manage booth content via CMS
- Create and manage quiz questions
- View feedback and analytics
- Manage notifications
- View user statistics

---

## 3. Functional Requirements

### 3.1 User Authentication Module

**FR-AUTH-001:** User Registration
- Users can register with email and password
- Email validation required
- Password strength validation (min 8 characters)
- Unique email constraint

**FR-AUTH-002:** User Login
- Login with email and password
- JWT token-based authentication
- Session persistence
- Remember me functionality

**FR-AUTH-003:** User Profile
- View and edit profile information
- Track bookmarked booths
- Track visited booths
- View quiz history

---

### 3.2 Exhibitor/Booth Module

**FR-BOOTH-001:** Booth Listing
- Display all booths in grid/card layout
- Show booth logo and name
- Responsive design (mobile-first)
- Search and filter functionality

**FR-BOOTH-002:** Booth Details View
- Display booth name and title
- Show HTML-formatted description
- Embed audio player (if audio available)
- Embed video player (if video available)
- List multiple resource links
- Download/open resource links

**FR-BOOTH-003:** Booth Navigation
- Easy navigation between booths
- Next/Previous booth buttons
- Back to listing functionality
- Smooth transitions

**FR-BOOTH-004:** Bookmark Functionality
- Toggle bookmark for any booth
- Persistent bookmark state
- View all bookmarked booths
- Remove bookmark option

**FR-BOOTH-005:** Visit Tracking
- Automatically mark booth as visited when viewed
- Display visited status
- View history of visited booths
- Visited count per booth

**FR-BOOTH-006:** CMS - Booth Management (Admin)
- Create new booth
- Edit existing booth
- Delete booth
- Upload booth logo
- Add/edit booth title and description (HTML editor)
- Upload audio file (MP3, WAV)
- Upload video file (MP4, WebM)
- Add multiple resource links with labels
- Publish/unpublish booth

---

### 3.3 Quiz Module

**FR-QUIZ-001:** Question Bank
- Each booth has 10 associated questions
- Questions stored per booth
- Multiple choice questions (4 options)
- One correct answer per question

**FR-QUIZ-002:** Quiz Attempt
- Random selection of 10 questions (1 from each booth)
- Display one question at a time
- Show 4 options per question
- Select one answer
- Next/Previous navigation
- Timer tracking for entire quiz
- Submit quiz

**FR-QUIZ-003:** Quiz Scoring
- Calculate total marks
- Record completion time
- Calculate accuracy percentage
- Store attempt history

**FR-QUIZ-004:** Daily Leaderboard
- Display top scorers for current day
- Rank by highest marks
- Tie-breaker: least time taken
- Show user rank, marks, and time
- Reset daily at midnight

**FR-QUIZ-005:** Quiz History
- View past quiz attempts
- Show marks and time for each attempt
- Display correct/incorrect answers
- View explanations

**FR-QUIZ-006:** CMS - Quiz Management (Admin)
- Create questions per booth
- Edit existing questions
- Delete questions
- Set correct answer
- Add explanations
- Manage question pool (minimum 10 per booth)

---

### 3.4 Feedback Module

**FR-FEED-001:** Text Feedback
- Submit text-based feedback
- Minimum 10 characters
- Maximum 500 characters
- Optional field

**FR-FEED-002:** Star Rating System
- Rate on multiple categories:
  - Overall Quality (1-5 stars)
  - Digital Presence (1-5 stars)
  - Facilities (1-5 stars)
- Visual star display
- Required field for submission

**FR-FEED-003:** Feedback Submission
- Submit feedback anonymously or with name
- One feedback per user per day
- Success confirmation message
- Clear form after submission

**FR-FEED-004:** CMS - Feedback Management (Admin)
- View all feedback submissions
- Filter by date range
- Filter by rating category
- Export feedback data (CSV)

**FR-FEED-005:** Feedback Analytics (Admin)
- Display average ratings per category
- Show rating distribution charts
- Display feedback count
- Trend analysis over time

---

### 3.5 Information/Notifications Module

**FR-INFO-001:** Notifications Display
- Display board/feed of notifications
- Show latest notifications first
- Display notification title and message
- Show timestamp
- Mark as read functionality

**FR-INFO-002:** Notification Categories
- General announcements
- Event updates
- Important notices
- Exhibition information

**FR-INFO-003:** CMS - Notification Management (Admin)
- Create new notification
- Edit existing notification
- Delete notification
- Set priority (normal, high, urgent)
- Schedule notification for future
- Publish/unpublish notification

**FR-INFO-004:** Notification Delivery
- Push notifications (PWA)
- In-app notification bell icon
- Unread count badge
- Real-time updates

---

### 3.6 Progressive Web App (PWA)

**FR-PWA-001:** Offline Functionality
- Cache booth data for offline viewing
- Cache images and media
- Offline indicator
- Sync data when online

**FR-PWA-002:** Install Prompt
- Add to Home Screen prompt
- Custom app icon
- Splash screen
- Standalone app experience

**FR-PWA-003:** Performance
- Fast loading times (<3 seconds)
- Lazy loading images
- Code splitting
- Optimized assets

---

### 3.7 CMS Dashboard (Admin)

**FR-CMS-001:** Admin Dashboard
- Overview statistics:
  - Total booths
  - Total users
  - Total quiz attempts
  - Total feedback received
- Recent activity feed
- Quick action buttons

**FR-CMS-002:** Content Management
- Unified interface for managing:
  - Booths
  - Quiz questions
  - Notifications
  - Feedback
- WYSIWYG HTML editor
- Media library for uploads
- Preview before publish

**FR-CMS-003:** User Management (Admin)
- View all registered users
- View user activity
- Export user data
- Ban/unban users

**FR-CMS-004:** Analytics Dashboard (Admin)
- Booth visit statistics
- Quiz participation rates
- Feedback sentiment analysis
- User engagement metrics
- Download reports

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time: <3 seconds
- API response time: <500ms
- Support 1000+ concurrent users

### 4.2 Security
- HTTPS encryption
- JWT authentication
- Input validation and sanitization
- XSS and CSRF protection
- Rate limiting on APIs

### 4.3 Scalability
- Horizontal scaling capability
- CDN for static assets
- Database indexing
- Caching strategy

### 4.4 Usability
- Mobile-first responsive design
- Intuitive navigation
- Accessibility compliance (WCAG 2.1)
- Support for multiple screen sizes

### 4.5 Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach

### 4.6 Data Management
- Regular database backups
- Data retention policy
- GDPR compliance
- Data export functionality

---

## 5. API Requirements

### 5.1 RESTful API Structure
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Proper status codes
- Error handling with meaningful messages

### 5.2 API Authentication
- JWT token in Authorization header
- Token expiration: 24 hours
- Refresh token mechanism
- Role-based access control

### 5.3 File Upload API
- Support image uploads (JPG, PNG, WebP)
- Support audio uploads (MP3, WAV)
- Support video uploads (MP4, WebM)
- File size limits:
  - Images: 5MB
  - Audio: 20MB
  - Video: 100MB

---

## 6. Database Schema Requirements

### 6.1 Collections
- Users
- Booths
- Questions
- QuizAttempts
- Feedback
- Notifications
- Bookmarks
- VisitHistory

### 6.2 Relationships
- User -> Bookmarks -> Booths (Many-to-Many)
- User -> VisitHistory -> Booths (Many-to-Many)
- Booth -> Questions (One-to-Many)
- User -> QuizAttempts (One-to-Many)
- User -> Feedback (One-to-Many)

---

## 7. UI/UX Requirements

### 7.1 Design Principles
- Mobile-first approach
- Clean and minimalist design
- Consistent color scheme
- Clear typography
- Touch-friendly elements (min 44x44px)

### 7.2 Navigation
- Bottom navigation bar for mobile
- Hamburger menu for additional options
- Breadcrumb navigation
- Clear back buttons

### 7.3 Feedback & Confirmation
- Loading indicators
- Success/error messages
- Confirmation dialogs for destructive actions
- Empty states with helpful messages

---

## 8. Testing Requirements

### 8.1 Unit Testing
- Backend API endpoints
- Frontend components
- Utility functions

### 8.2 Integration Testing
- API integration
- Database operations
- Authentication flow

### 8.3 E2E Testing
- Critical user flows
- Quiz submission
- Feedback submission

---

## 9. Deployment Requirements

### 9.1 Backend Deployment
- Node.js hosting (e.g., Railway, Render, AWS)
- Environment variable management
- Database hosted separately (MongoDB Atlas)
- HTTPS enabled

### 9.2 Frontend Deployment
- Static hosting (Vercel, Netlify, Cloudflare Pages)
- CDN integration
- HTTPS enabled
- PWA service worker enabled

---

## 10. Success Metrics

### 10.1 User Engagement
- Daily active users
- Average session duration
- Booth views per session
- Quiz participation rate

### 10.2 Content Metrics
- Total booths viewed
- Average feedback rating
- Quiz completion rate
- Bookmark usage

### 10.3 Technical Metrics
- Page load time
- API response time
- Error rate
- Uptime percentage

---

## Document Version
- Version: 1.0
- Date: January 9, 2026
- Status: Approved
