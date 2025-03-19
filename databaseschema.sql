CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE
);
CREATE TABLE sport (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id),
    location VARCHAR(100),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20),
    skill_level VARCHAR(20),
    sport_id INTEGER REFERENCES sport(id)
);
CREATE TABLE participants (
    user_id INTEGER REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    PRIMARY KEY (user_id, game_id)
);