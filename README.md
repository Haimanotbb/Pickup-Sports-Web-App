# Y-Pickup

Y-Pickup is a web application designed to help students (or any group of users) organize and join casual sports and games on campus. It enables users to create games, browse upcoming games, join games, and see who else is participating. Beyond traditional sports, the app also supports board and strategy games, making it a versatile solution for organizing possibly a wide range of meetups.

Link to presentation slides: https://gamma.app/docs/Y-Pickup-Campus-Pickup-Game-Scheduler-tjb785r18x2hsf8?mode=doc

## Deviation from Original Project Proposal (in consultation with advisor)

### Original Proposal Goals:
1. Finalized RSVP and player matching system (based on skill level and availability)  
2. Improved UI/UX for game creation and browsing  
3. Nice-to-haves:
   - Real-time updates for game hosts (e.g. who has joined, cancellations)
   - Push notifications for RSVPs and game reminders  

### Updated Goals:
Since we will **not be implementing skill level–based features for users**, we are updating our scope as follows:

1. Automatically changing game states (e.g. switching from **Open → In Progress → Completed/Cancelled** based on the timeline) and archiving past games in the **"My Games"** section of the user profile  
2. Functionality to **edit and delete** games created by the user  
3. Continued focus on **UI/UX improvements** and support for **custom game names** during game creation  

__Scroll to the bottom for set-up instructions.__

## Features

### User Authentication
- Log in with CAS (For Yale users only)
- First time users get directed to profile set up while returning users are directed to the games page. 

### Game Creation
⁠Authenticated users can create a new game by specifying:
  - Game name
  - Sport
  - Location (selection via GoogleMaps api)
  - Time/Date
  - Skill level
  - Capacity (limit of players to join you)

### Game Browsing
⁠View a list of all upcoming games with details such as:
  - Game member/player (can search friends' games!)
  - Game name
  - Location
  - Sport
  - Date

### Joining Games
⁠Authenticated users can join any available game that is not at capacity.
⁠The app prevents duplicate joins if the user is already a participant.
 - Participants are able to leave a game once they joined.
 - Creators of a game can edit, delete or cancel the game. Canceling results in the game still being viewable in the games list until the game event has passed (and thus no longer relevent). Deleting will permanently remove the game from the web app. A user's past created games will be archived on their personal profile for reference.

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

•⁠  ⁠*Authentication*: Token-based authentication via ⁠ rest_framework.authtoken

•⁠  ⁠*Database*: PostgreSQL
  - Models: ⁠ Game ⁠, ⁠ Sport ⁠, ⁠ Participant ⁠, Comment, and custom ⁠ User ⁠.

### Frontend
⁠*Framework*: React SPA using Create React App.

⁠*HTTP Requests*: Axios for interacting with the backend API.

⁠*Navigation*: React Router for client-side routing.

⁠*Styling*: Bootstrap for responsive UI design.

## Repository Structure

In the root directory, subdirectory frontend_pickup_sport holds the React app front end client and pickup_sports holds our Django backend.

### frontend_pickup_sport

In src/components, you will see the main components that mostly represent different pages in our app, here are a few: Games.js (game discovery & search filters, includes polling w axios requests to update results in real time), CreateGame.js (game creation form), GameDetail.js (detailed, dynamic display of single game), LocationPicker.js (uses Google Maps to allow game creator to select lat./long. in user friendly way), etc.

Dynamic game discovery + filtering to make a searchable, filterable list of games by sport, location, and time in the front end. Used React state hooks and polling + caching strategies to update fe in real time and avoids cold starts using cached state (frontend/src/components/Games.js).

### pickup_sports

The scheduler folder consists of models.py (Game, Sport, CustomUser, Comment), serializers.py (serializers for API data handling across client/server), views.py (core API logic for fetching all games, games with specific participant, details of a specific game, etc), urls.py (api endpoint routing).


## Setting up Evironment

Follow these steps to run the web app locally

### Prerequisites
•⁠  ⁠Ensure you have the following installed:
  - Python (for the backend)
  - Npm (for the frontend)

•⁠  ⁠Clone the repository to your local machine.

### Step 1: Set Up Env Files
Our code uses database urls and apis in env files. For best practice, we did not push these to our remote repo, but the actual values of the env variables can accessed in this private doc with limited access (you may request access): https://docs.google.com/document/d/1iC9pU08PqUrFrakgYVY4W7ed7HMKEow6stbiWBMh4YY

(from project root dir:)
1. ```cd frontend_pickup_sport```

2. ```touch .env.local```

3. In this file, add the following line with the value from the doc:
```
REACT_APP_GOOGLE_MAPS_KEY=
```
(from project root dir:)

4. ```cd pickup_sports```

5. ```touch .env```

6. In that file, add the following line with the value from the doc:
```
DATABASE_URL="postgresql://pickupdatabase_user:wEjhepLbpnqpu0qquxqSZU0vawVocmDK@dpg-d00p2d49c44c73cipb80-a.virginia-postgres.render.com/pickupdatabase"
```


### Step 2: Set Up and Run the Backend
(from project root dir:)

1. Open a terminal and navigate to the project root directory

2. Install the required Python dependencies: 
```pip install -r requirements.txt```

3. ```cd pickup_sports```

4. Run ```python manage.py runserver ```

### Step 3: Set Up and Run Frontend 
(from project root dir:)
1. ```cd frontend_pickup_sport/src```
2. ```npm install```
3. ```npm start```

Next, login with Yale CAS and use our app!


### Attribution
- Yale UI Component Library (https://yale-a11y.gitlab.io/ui-component-library/)
- YaleCAS code inspired by Spring 2025 CPSC 419 CAS Tutorials
- Google Maps API
