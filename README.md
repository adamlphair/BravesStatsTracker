# Atlanta Braves Stats Tracker 🔴

A real-time statistics and analytics dashboard for the Atlanta Braves 2026 MLB season.

## Features

- **Season Overview** — Live win-loss record, win percentage, playoff odds, and division rank
- **Team Predictions** — Projected final record and playoff probability based on current performance
- **Schedule & Results** — Next upcoming game and recent game results with scores
- **NL East Standings** — Complete division standings table
- **Player Stats Lookup** — Search any Braves player to view their stats and position
- **Auto-Refresh** — Updates every 6 hours with latest data

## Tech Stack

- **HTML5** — Semantic markup and structure
- **CSS3** — Responsive grid layout with Braves team colors (red & navy)
- **Vanilla JavaScript** — No dependencies, pure JS with async/await
- **MLB-StatsAPI** — Free, no API key required

## Getting Started

1. Open `index.html` in a web browser
2. The app automatically fetches current season data on load
3. Search for any Braves player name to view their stats
4. All data updates automatically every 6 hours

## Project Structure

```
BravesStatsTracker/
├── index.html      # Main HTML structure
├── styles.css      # Responsive styling with Braves colors
├── script.js       # MLB API integration & data handling
└── README.md       # Project documentation
```

## API Reference

- **Endpoint**: https://statsapi.mlb.com/api/v1
- **Team ID**: 144 (Atlanta Braves)
- **Division**: NL East (ID: 203)
- **Current Season**: 2026

## Data Updates

- Season stats update when games are completed
- Schedule data reflects real-time game times
- Division standings update after each game
- Data is cached for 6 hours to reduce API calls

## Features in Detail

### Season Overview
- **Record**: Current W-L standing
- **Win %**: Calculated from wins/(wins+losses)
- **Playoff Odds**: Based on projected wins and division rank
- **Division Rank**: Current placement in NL East

### Team Predictions
- **Projected Record**: Estimated final record based on current performance
- **Win Percentage**: Current winning percentage
- **Games Remaining**: Games left in 162-game season
- **Playoff Status**: Division leader/contention indicator

### Player Search
Search by player first or last name to find:
- Position and number
- Batting/throwing side (for pitchers)
- Current season stats (hits, RBIs, ERA, etc.)

## Future Enhancements

- Historical season comparisons
- Player comparison tools
- Game highlights and box scores
- Push notifications for game results
- Dark mode toggle
- Mobile app version

## Notes

- This is a fan project, not officially affiliated with MLB or the Atlanta Braves
- Data is pulled from the official MLB StatsAPI
- Some stats may have a slight delay during the season
