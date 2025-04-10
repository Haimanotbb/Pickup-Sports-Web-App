# Demo: https://drive.google.com/file/d/1S0pH4JFQLofogQUfVLGLRJ4LU0AAXgff/view?usp=sharing
# Pickup Sports

Pickup Sports is a web application designed to help students (or any group of users) organize and join casual sports and games on campus (or in the local community). It enables users to create games, browse upcoming games, join games, and see who else is participating. Beyond traditional sports, the app also supports board and strategy games, making it a versatile solution for organizing all kinds of meetups.

__Scroll to the bottom for testing instructions.__

## Features

### User Authentication
•⁠  ⁠*Login*: Log in with existing accounts using email and password.
•⁠  ⁠*Signup*: Create a new account and obtain an authentication token.

### Game Creation
•⁠  ⁠Authenticated users can create a new game by specifying:
  - Sport or game type
  - Location
  - Date and time
  - Status
  - Skill level

### Game Browsing
•⁠  ⁠View a list of all upcoming games with details such as:
  - Location
  - Time
  - Participants

### Joining Games
•⁠  ⁠Authenticated users can join any available game.
•⁠  ⁠The app prevents duplicate joins if the user is already a participant.

### Participants List
•⁠  ⁠Each game detail page displays a list of participants who have joined.

## Tech Stack

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

## Testing Alpha

Follow these steps to set up and test the Minimum Viable Product (MVP) locally.

### Prerequisites
•⁠  ⁠Ensure you have the following installed:
  - Python (for the backend)
  - Node.js and npm (for the frontend)

•⁠  ⁠Clone the repository to your local machine.

### Step 1: Set Up and Run the Backend (Server)
1.⁠ ⁠Open a terminal and navigate to the project root directory.
2.⁠ ⁠Install the required Python dependencies: pip install -r requirements.txt
3. cd pickup_sports
4. Run python manage.py runserver 

### IMPORTANT:
__If step 4 is not working please text us at 470-923-1554 to get new ip address.__ We are running the database server on a team-mates computer, whose ip address occasionally changes. We will provide you with the updated IP address. Then, from the project root directory, navigate to pickup_sports/settings.py and change the hostname address in the "Databases" object:

'HOST': 'ADD NEW IP ADDRESS HERE'

### Step 2: Set Up and Run Frontend
(from project root dir:)
1. cd frontend_pickup_sports
2. npm install
3. npm start
