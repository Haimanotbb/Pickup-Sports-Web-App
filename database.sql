-- Create the Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- NOT NULL forces each user to have an associated name and email
    email VARCHAR(100) UNIQUE NOT NULL --Unique key word forces all values in the column to be different from each other
);

-- Create the Games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    skill_level VARCHAR(50) --Entering a skill level is kept optional
);

-- Create a table for the user who created the game
--Relational Table
CREATE TABLE games_to_user (
    game_id INTEGER NOT NULL REFERENCES games(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (game_id, user_id)
);

-- Create the Sport table
CREATE TABLE sport (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Create the linking table between Sport and Game
--Relational Table
CREATE TABLE sport_to_game (
    sport_id INTEGER NOT NULL REFERENCES sport(id),
    game_id INTEGER NOT NULL REFERENCES games(id),
    PRIMARY KEY (sport_id, game_id)
);

-- Create the Participants table (for users joining games)
--Relational Table 
CREATE TABLE participants (
    user_id INTEGER NOT NULL REFERENCES users(id),
    game_id INTEGER NOT NULL REFERENCES games(id),
    PRIMARY KEY (user_id, game_id)
);
