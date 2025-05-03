# Pickup Sports

YPickup is a web application designed to help students (or any group of users) organize and join casual sports and games on campus (or in the local community). It enables users to create games, browse upcoming games, join games, and see who else is participating. Beyond traditional sports, the app also supports board and strategy games, making it a versatile solution for organizing all kinds of meetups.

__Scroll to the bottom for set-up instructions.__

## Features

### User Authentication
- Log in with CAS (For Yale users only)
- First time users get directed to profile set up while returnign users are directed to the games page. 

### Game Creation
⁠Authenticated users can create a new game by specifying:
  - Game member (search friends' games!)
  - Sport
  - Location
  - Date
  - Skill level

### Game Browsing
⁠View a list of all upcoming games with details such as:
  - Location
  - Time
  - Participants

### Joining Games
⁠Authenticated users can join any available game.
⁠The app prevents duplicate joins if the user is already a participant.
 - Participants are able to leave a game once they joined.
 - Creators of a game can delete or cancel the game. Canceling results in the game still being listed in the games list or archived games list. Deleting will permanently remove the game from the web app. 

### Participants List
•⁠  ⁠Each game detail page displays a list of participants who have joined.
 - Each participant's profiles are visible (clickable) from the game details page.

### Authomatic State Updates 
 - The state of games changes in real time from "Open" to "In progress" to "Completed"
 - Cancelled games and completed games are archived in the creator user's My Profile page.

### Backend
•⁠  ⁠*Framework*: Django (Python)
  - Custom user model for authentication.
•⁠  ⁠*API*: Django REST Framework (DRF) for building RESTful API endpoints.
•⁠  ⁠*Authentication*: Token-based authentication via ⁠ rest_framework.authtoken ⁠.
•⁠  ⁠*Database*: PostgreSQL
  - Models: ⁠ Game ⁠, ⁠ Sport ⁠, ⁠ Participant ⁠, and custom ⁠ User ⁠.

### Frontend
•⁠  ⁠*Framework*: React
  - Created using Create React App.
•⁠  ⁠*HTTP Requests*: Axios for interacting with the backend API.
•⁠  ⁠*Navigation*: React Router for client-side routing.
•⁠  ⁠*Styling*: Bootstrap / React Bootstrap for responsive UI design.

## Setting up Evironment

Follow these steps to run the web app locally

### Prerequisites
•⁠  ⁠Ensure you have the following installed:
  - Python (for the backend)
  - Node.js and npm (for the frontend)
•⁠  ⁠Clone the repository to your local machine.

### Step 1: Set Up and Run the Backend
(from project root dir:)
1.⁠ ⁠Open a terminal and navigate to the project root directory
2.⁠ ⁠Install the required Python dependencies: pip install -r requirements.txt
3. cd pickup_sports
4. Run python manage.py runserver 

### Step 2: Set Up and Run Frontend 
(from project root dir:)
1. cd frontend_pickup_sports
2. npm install
3. npm start

Next, login with Yale CAS and use our app!


### Attribution
- Yale UI Component Library (https://yale-a11y.gitlab.io/ui-component-library/) - We used it a bit and mostly used our own CSS on top
- YaleCAS code inspired by Spring 2025 CPSC 419 CAS Tutorials