// Atlanta Braves Stats Tracker
// Using MLB-StatsAPI - free, no API key needed!
// https://statsapi.mlb.com/

const MLB_API = 'https://statsapi.mlb.com/api/v1';
const BRAVES_TEAM_ID = 144; // MLB team ID for Atlanta Braves
const NL_EAST_DIVISION_ID = 203; // NL East division ID
const CURRENT_SEASON = 2026;

// DOM Elements
const recordEl = document.getElementById('record');
const winPctgEl = document.getElementById('winPctg');
const playoffOddsEl = document.getElementById('playoffOdds');
const divisionRankEl = document.getElementById('divisionRank');
const predictionsEl = document.getElementById('predictions');
const nextGameEl = document.getElementById('nextGame');
const recentGamesEl = document.getElementById('recentGames');
const standingsEl = document.getElementById('standings');
const lastUpdateEl = document.getElementById('lastUpdate');
const playerSearchInput = document.getElementById('playerSearch');
const playerSearchBtn = document.getElementById('searchBtn');
const playerStatsEl = document.getElementById('playerStats');

// Event listeners
playerSearchBtn.addEventListener('click', handlePlayerSearch);
playerSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handlePlayerSearch();
});

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    loadAllData();
    // Refresh data every 6 hours
    setInterval(loadAllData, 6 * 60 * 60 * 1000);
});

// Dark mode theme functions
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('dark');
    } else {
        updateThemeIcon('light');
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(currentTheme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Load all data
async function loadAllData() {
    try {
        await Promise.all([
            loadSeasonStats(),
            loadStandings(),
            loadSchedule(),
            loadPredictions()
        ]);
        lastUpdateEl.textContent = new Date().toLocaleString();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Load season statistics
async function loadSeasonStats() {
    try {
        const response = await fetch(`${MLB_API}/teams/${BRAVES_TEAM_ID}?hydrate=record`);
        const data = await response.json();
        const team = data.teams[0];
        const record = team.record[0];
        
        recordEl.textContent = `${record.wins}-${record.losses}`;
        const winPct = ((record.wins / (record.wins + record.losses)) * 100).toFixed(1);
        winPctgEl.textContent = `${winPct}%`;
        divisionRankEl.textContent = record.divisionRank || '-';
        
        // Calculate playoff odds (simplified: based on win percentage and remaining games)
        const gamesRemaining = 162 - (record.wins + record.losses);
        const projectedWins = record.wins + (gamesRemaining * (record.wins / (record.wins + record.losses)));
        const playoffProb = Math.min(100, Math.round((projectedWins / 162) * 100 + (record.divisionRank === 1 ? 15 : -10)));
        playoffOddsEl.textContent = `${Math.max(5, playoffProb)}%`;
    } catch (error) {
        console.error('Error loading season stats:', error);
    }
}

// Load divisions standings
async function loadStandings() {
    try {
        const response = await fetch(`${MLB_API}/divisions/${NL_EAST_DIVISION_ID}/standings`);
        const data = await response.json();
        
        let html = '<table><thead><tr><th>Team</th><th>W-L</th><th>Win %</th><th>GB</th><th>Streak</th></tr></thead><tbody>';
        
        data.records[0].teamRecords.forEach((team, index) => {
            const record = team.records[0];
            const gamesBack = team.gamesBack === '-' ? '-' : team.gamesBack;
            const isBraves = team.team.id === BRAVES_TEAM_ID;
            const rowClass = isBraves ? 'braves' : '';
            
            html += `
                <tr class="${rowClass}">
                    <td>${team.team.name}</td>
                    <td>${record.wins}-${record.losses}</td>
                    <td>${(record.wins / (record.wins + record.losses)).toFixed(3)}</td>
                    <td>${gamesBack}</td>
                    <td>${team.streak.streakCode}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        standingsEl.innerHTML = html;
    } catch (error) {
        console.error('Error loading standings:', error);
    }
}

// Load schedule and recent games
async function loadSchedule() {
    try {
        const response = await fetch(`${MLB_API}/teams/${BRAVES_TEAM_ID}/schedule?season=${CURRENT_SEASON}`);
        const data = response.ok ? await response.json() : { games: [] };
        const games = data.games || [];
        
        // Find next game
        const now = new Date();
        const nextGame = games.find(game => new Date(game.gameDateTime) > now);
        
        if (nextGame) {
            const gameDate = new Date(nextGame.gameDateTime);
            const opponent = nextGame.teams.away.team.id === BRAVES_TEAM_ID 
                ? `@ ${nextGame.teams.home.team.name}` 
                : `vs ${nextGame.teams.away.team.name}`;
            
            nextGameEl.innerHTML = `
                <div class="game-item">
                    <strong>${opponent}</strong><br>
                    ${gameDate.toLocaleDateString()} at ${gameDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}<br>
                    <small>Status: ${nextGame.status.abstractGameState}</small>
                </div>
            `;
        } else {
            nextGameEl.innerHTML = '<p>Season has ended or no games scheduled</p>';
        }
        
        // Show recent games
        const recentGames = games.filter(g => g.status.abstractGameState === 'Final').slice(-5).reverse();
        
        let recentHTML = '';
        recentGames.forEach(game => {
            const bravesIsHome = game.teams.home.team.id === BRAVES_TEAM_ID;
            const bravesRuns = bravesIsHome ? game.teams.home.score : game.teams.away.score;
            const oppRuns = bravesIsHome ? game.teams.away.score : game.teams.home.score;
            const oppName = bravesIsHome ? game.teams.away.team.name : game.teams.home.team.name;
            const result = bravesRuns > oppRuns ? 'W' : 'L';
            const gameDate = new Date(game.gameDateTime).toLocaleDateString();
            
            recentHTML += `
                <div class="game-item">
                    <strong>${result} vs ${oppName}</strong><br>
                    ${bravesRuns}-${oppRuns} | ${gameDate}
                </div>
            `;
        });
        
        recentGamesEl.innerHTML = recentHTML || '<p>No recent games</p>';
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Load predictions/analytics
async function loadPredictions() {
    try {
        const response = await fetch(`${MLB_API}/teams/${BRAVES_TEAM_ID}?hydrate=record`);
        const data = await response.json();
        const record = data.teams[0].record[0];
        
        const gamesRemaining = 162 - (record.wins + record.losses);
        const winPct = record.wins / (record.wins + record.losses);
        const projectedWins = record.wins + (gamesRemaining * winPct);
        const divisionRank = record.divisionRank || 5;
        
        // Generate simple predictions
        let predictions = `
            <p><strong>Projected Record:</strong> ${Math.round(projectedWins)}-${Math.round(162 - projectedWins)}</p>
            <p><strong>Current Win %:</strong> ${(winPct * 100).toFixed(1)}%</p>
            <p><strong>Games Remaining:</strong> ${gamesRemaining}</p>
        `;
        
        if (divisionRank === 1) {
            predictions += '<p>✅ <strong>Leading NL East!</strong></p>';
        } else if (divisionRank <= 3) {
            predictions += '<p>🎯 <strong>In playoff contention</strong></p>';
        } else {
            predictions += '<p>📊 <strong>Building for next season</strong></p>';
        }
        
        predictionsEl.innerHTML = predictions;
    } catch (error) {
        console.error('Error loading predictions:', error);
        predictionsEl.innerHTML = '<p>Unable to load predictions</p>';
    }
}

// Handle player search
async function handlePlayerSearch() {
    const playerName = playerSearchInput.value.trim().toLowerCase();
    if (!playerName) {
        playerStatsEl.innerHTML = '<p>Enter a player name to search</p>';
        return;
    }
    
    playerStatsEl.innerHTML = '<p>Searching...</p>';
    
    try {
        // Search for player in Braves roster
        const response = await fetch(`${MLB_API}/teams/${BRAVES_TEAM_ID}/roster`);
        const data = await response.json();
        
        const player = data.roster.find(p => 
            p.person.fullName.toLowerCase().includes(playerName)
        );
        
        if (!player) {
            playerStatsEl.innerHTML = '<p>❌ Player not found on Braves roster</p>';
            return;
        }
        
        // Get player stats
        const statsResponse = await fetch(`${MLB_API}/people/${player.person.id}?hydrate=stats`);
        const statsData = await statsResponse.json();
        const playerData = statsData.people[0];
        
        // Display player info
        let html = `
            <div class="player-info">
                <h3>${playerData.fullName}</h3>
                <p><strong>Position:</strong> ${player.position?.abbreviation || 'N/A'}</p>
                <p><strong>Number:</strong> ${player.jerseyNumber || 'N/A'}</p>
                <p><strong>Bats:</strong> ${playerData.batSide?.code || 'N/A'} | <strong>Throws:</strong> ${playerData.pitchHand?.code || 'N/A'}</p>
        `;
        
        // Add season stats if available
        if (playerData.stats && playerData.stats.length > 0) {
            const seasonStats = playerData.stats.find(s => s.group.displayName === 'hitting' || s.group.displayName === 'pitching');
            if (seasonStats && seasonStats.stats.length > 0) {
                const stats = seasonStats.stats[0].stats;
                html += `<p><strong>2026 Stats:</strong></p><ul>`;
                
                Object.entries(stats).slice(0, 8).forEach(([key, value]) => {
                    html += `<li>${key}: ${value}</li>`;
                });
                
                html += '</ul>';
            }
        }
        
        html += '</div>';
        playerStatsEl.innerHTML = html;
        playerSearchInput.value = '';
    } catch (error) {
        console.error('Error searching player:', error);
        playerStatsEl.innerHTML = '<p>❌ Error loading player stats</p>';
    }
}
