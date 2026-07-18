/* ===========================================================
   Auction Arena — app logic
   Thin rendering/event layer over the pure auction.js engine.
   =========================================================== */

(function () {
  'use strict';

  var auctionState = null;
  var bestXI = []; // array of squad entries { player, price }
  const activityEntries = [];

  // -----------------------------------------------------------
  // Team selection
  // -----------------------------------------------------------
  const teamSelectOverlay = document.getElementById('teamSelectOverlay');
  const teamSelectGrid = document.getElementById('teamSelectGrid');
  const mainApp = document.getElementById('mainApp');

  REAL_TEAM_NAMES.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'team-select-btn';
    btn.textContent = name;
    btn.addEventListener('click', () => startGame(name));
    teamSelectGrid.appendChild(btn);
  });

  function startGame(chosenTeam) {
    const otherTeams = REAL_TEAM_NAMES.filter(n => n !== chosenTeam);
    const orderedNames = [chosenTeam, ...otherTeams];

    auctionState = createAuctionState(orderedNames);
    bestXI = [];

    teamSelectOverlay.hidden = true;
    mainApp.hidden = false;
    renderAuctionView();
  }

  // -----------------------------------------------------------
  // Toast
  // -----------------------------------------------------------
  const toastEl = document.getElementById('toast');
  let toastTimeout = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatCr(value) {
    return '₹' + value.toFixed(2).replace(/\.00$/, '.0') + ' Cr';
  }

  // -----------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------
  const tabs = document.querySelectorAll('.tab');
  const views = document.querySelectorAll('.view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.view).classList.add('active');

      if (tab.dataset.view === 'squad') renderSquadView();
      if (tab.dataset.view === 'bestxi') renderBestXIView();
      if (tab.dataset.view === 'standings') renderStandingsView();
    });
  });

  // -----------------------------------------------------------
  // Auction view rendering
  // -----------------------------------------------------------
  const playerCard = document.getElementById('playerCard');
  const auctionProgress = document.getElementById('auctionProgress');
  const currentPriceValue = document.getElementById('currentPriceValue');
  const currentBidder = document.getElementById('currentBidder');
  const bidBtn = document.getElementById('bidBtn');
  const passBtn = document.getElementById('passBtn');
  const auctionCompleteNote = document.getElementById('auctionCompleteNote');
  const budgetValue = document.getElementById('budgetValue');

  function logActivity(text, cls) {
    activityEntries.push({ text, cls });
    const log = document.getElementById('activityLog');
    const entry = document.createElement('div');
    entry.className = 'activity-entry ' + cls;
    entry.textContent = text;
    log.appendChild(entry);
  }

  function renderAuctionView() {
    budgetValue.textContent = formatCr(remainingBudget(auctionState.teams[USER_INDEX]));

    if (auctionState.phase === 'complete') {
      playerCard.innerHTML = '<p class="empty-hint">Auction finished — no more players left.</p>';
      bidBtn.disabled = true;
      passBtn.disabled = true;
      auctionCompleteNote.hidden = false;
      auctionProgress.textContent = `All ${auctionState.auctionOrder.length} players auctioned`;
      return;
    }

    const player = currentPlayer(auctionState);
    auctionProgress.textContent = `Player ${auctionState.playerIndex + 1} of ${auctionState.auctionOrder.length}`;

    const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const roleIcon = { Batsman: '🏏', Bowler: '🎯', 'All-rounder': '⭐', Wicketkeeper: '🧤' }[player.role] || '🏏';

    playerCard.innerHTML = `
      <div class="player-card-top">
        <div class="player-avatar role-${player.role.replace(/[^a-zA-Z]/g, '')}">
          <span class="player-avatar-initials">${escapeHTML(initials)}</span>
          <span class="player-avatar-icon">${roleIcon}</span>
        </div>
        <div class="player-card-info">
          <h2 class="player-name">${escapeHTML(player.name)}</h2>
          <div class="player-meta-row">
            <span class="player-tag tier-${player.tier}">${player.tier === 'Icon' ? 'ICON' : 'Tier ' + player.tier}</span>
            <span class="player-tag">${escapeHTML(player.role)}</span>
            <span class="player-tag ${player.nationality === 'Overseas' ? 'overseas' : ''}">${escapeHTML(player.nationality)}</span>
          </div>
          <p class="player-rating">Rating: <strong>${player.rating}</strong> / 100 &nbsp;·&nbsp; Base price: <strong>${formatCr(player.basePrice)}</strong></p>
        </div>
      </div>
      <p class="player-description">${escapeHTML(player.description || '')}</p>
    `;

    currentPriceValue.textContent = formatCr(auctionState.currentPrice);
    const bidderIdx = auctionState.currentHighestBidderIndex;
    currentBidder.textContent = bidderIdx === null
      ? 'No bids yet'
      : `Highest bid: ${auctionState.teams[bidderIdx].name}`;

    const isUserActive = auctionState.activeIndices.includes(USER_INDEX);
    const isUserHighest = auctionState.currentHighestBidderIndex === USER_INDEX;

    const nextPrice = nextBid(auctionState.currentPrice);
    bidBtn.textContent = `Bid ${formatCr(nextPrice)}`;
    bidBtn.disabled = !isUserActive || isUserHighest || !canBid(auctionState.teams[USER_INDEX], player, nextPrice, auctionState.ruleOpts);
    passBtn.disabled = !isUserActive;

    auctionCompleteNote.hidden = true;
  }

  bidBtn.addEventListener('click', () => {
    const player = currentPlayer(auctionState);
    const playerIndexBefore = auctionState.playerIndex;
    const price = nextBid(auctionState.currentPrice);

    userBid(auctionState);

    logActivity(`You bid ${formatCr(price)} for ${player.name}`, 'bid user');
    afterUserAction(playerIndexBefore, player);
  });

  passBtn.addEventListener('click', () => {
    const player = currentPlayer(auctionState);
    const playerIndexBefore = auctionState.playerIndex;

    userPass(auctionState);

    logActivity(`You passed on ${player.name}`, 'pass user');
    afterUserAction(playerIndexBefore, player);
  });

  function afterUserAction(playerIndexBefore, playerBefore) {
    logBotActivitySinceUserAction(playerIndexBefore, playerBefore);
    renderAuctionView();
  }

  // Reconstructs a readable log of what happened after the user's action,
  // by comparing sold-log entries and simply announcing the resolution —
  // (bot-by-bot bidding isn't individually exposed by the engine, so we
  // log the outcome, which is what matters most to the player).
  function logBotActivitySinceUserAction(playerIndexBefore, playerBefore) {
    if (auctionState.playerIndex > playerIndexBefore) {
      // one or more players resolved since the user's last action
      const resolved = auctionState.soldLog.slice(playerIndexBefore, auctionState.playerIndex);
      resolved.forEach(entry => {
        if (entry.teamIndex === null) {
          logActivity(`${entry.player.name} went UNSOLD`, 'unsold');
        } else {
          const teamName = auctionState.teams[entry.teamIndex].name;
          const cls = entry.teamIndex === USER_INDEX ? 'sold user' : 'sold';
          logActivity(`SOLD! ${entry.player.name} → ${teamName} for ${formatCr(entry.price)}`, cls);
        }
      });
    } else if (auctionState.currentHighestBidderIndex !== null &&
               auctionState.currentHighestBidderIndex !== USER_INDEX &&
               currentPlayer(auctionState) === playerBefore) {
      const teamName = auctionState.teams[auctionState.currentHighestBidderIndex].name;
      logActivity(`${teamName} bids ${formatCr(auctionState.currentPrice)}`, 'bid');
    }
  }

  // -----------------------------------------------------------
  // Squad view
  // -----------------------------------------------------------
  function renderSquadView() {
    const team = auctionState.teams[USER_INDEX];
    document.getElementById('squadStats').innerHTML = `
      <span>Spent: <strong>${formatCr(team.spent)}</strong></span>
      <span>Remaining: <strong>${formatCr(remainingBudget(team))}</strong></span>
      <span>Squad: <strong>${team.squad.length}</strong></span>
    `;

    const validation = validateTeam(team, auctionState.ruleOpts);
    const validationList = document.getElementById('validationList');
    validationList.innerHTML = '';
    validation.checks.forEach(c => {
      const item = document.createElement('div');
      item.className = 'validation-item ' + (c.pass ? 'pass' : 'fail');
      item.innerHTML = `
        <span class="validation-icon">${c.pass ? '✓' : '✕'}</span>
        <span>${escapeHTML(c.label)}</span>
        <span class="validation-detail">${escapeHTML(c.detail)}</span>
      `;
      validationList.appendChild(item);
    });

    const tbody = document.getElementById('squadTableBody');
    tbody.innerHTML = '';
    document.getElementById('squadEmptyHint').style.display = team.squad.length === 0 ? 'block' : 'none';

    team.squad.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHTML(entry.player.name)}</td>
        <td>${escapeHTML(entry.player.role)}</td>
        <td>${escapeHTML(entry.player.tier)}</td>
        <td>${escapeHTML(entry.player.nationality)}</td>
        <td>${formatCr(entry.price)}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // -----------------------------------------------------------
  // Best XI view
  // -----------------------------------------------------------
  function renderBestXIView() {
    const team = auctionState.teams[USER_INDEX];
    const grid = document.getElementById('squadChipGrid');
    const emptyHint = document.getElementById('bestxiEmptyHint');
    grid.innerHTML = '';
    emptyHint.style.display = team.squad.length === 0 ? 'block' : 'none';

    team.squad.forEach(entry => {
      const chip = document.createElement('button');
      const isIn = bestXI.some(e => e.player.id === entry.player.id);
      chip.className = 'squad-chip' + (isIn ? ' in-xi' : '');
      chip.textContent = `${entry.player.name} (${entry.player.role})`;
      chip.addEventListener('click', () => toggleXI(entry));
      grid.appendChild(chip);
    });

    renderXISummary();
    renderCaptainSelects();
  }

  function toggleXI(entry) {
    const idx = bestXI.findIndex(e => e.player.id === entry.player.id);
    if (idx >= 0) {
      bestXI.splice(idx, 1);
    } else {
      if (bestXI.length >= 11) {
        showToast('Your XI already has 11 players — remove one first');
        return;
      }
      bestXI.push(entry);
    }
    renderBestXIView();
  }

  document.getElementById('autoPickBtn').addEventListener('click', () => {
    const team = auctionState.teams[USER_INDEX];
    if (team.squad.length === 0) {
      showToast('Buy some players first');
      return;
    }
    bestXI = pickBestXI(team);
    renderBestXIView();
    showToast('Best XI auto-picked');
  });

  function renderXISummary() {
    const overseas = bestXI.filter(e => e.player.nationality === 'Overseas').length;
    const keepers = bestXI.filter(e => e.player.role === 'Wicketkeeper').length;
    const avgRating = bestXI.length ? (bestXI.reduce((s, e) => s + e.player.rating, 0) / bestXI.length) : 0;

    document.getElementById('xiSummary').innerHTML = `
      <span class="xi-stat">Players: <strong>${bestXI.length}/11</strong></span>
      <span class="xi-stat">Overseas: <strong>${overseas}/4</strong></span>
      <span class="xi-stat">Keepers: <strong>${keepers}</strong></span>
      <span class="xi-stat">Avg rating: <strong>${avgRating.toFixed(1)}</strong></span>
    `;
  }

  function renderCaptainSelects() {
    const captainRow = document.getElementById('captainRow');
    const captainSelect = document.getElementById('captainSelect');
    const viceCaptainSelect = document.getElementById('viceCaptainSelect');

    if (bestXI.length < 2) {
      captainRow.hidden = true;
      return;
    }
    captainRow.hidden = false;

    [captainSelect, viceCaptainSelect].forEach(sel => {
      const prevValue = sel.value;
      sel.innerHTML = '';
      bestXI.forEach(entry => {
        const opt = document.createElement('option');
        opt.value = entry.player.id;
        opt.textContent = entry.player.name;
        sel.appendChild(opt);
      });
      if (bestXI.some(e => String(e.player.id) === prevValue)) sel.value = prevValue;
    });

    if (captainSelect.value === viceCaptainSelect.value && bestXI.length > 1) {
      viceCaptainSelect.selectedIndex = captainSelect.selectedIndex === 0 ? 1 : 0;
    }
  }

  // -----------------------------------------------------------
  // Standings view
  // -----------------------------------------------------------
  function renderStandingsView() {
    const tbody = document.getElementById('standingsTableBody');
    tbody.innerHTML = '';

    auctionState.teams.forEach(team => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHTML(team.name)}${team.isBot ? '' : ' (You)'}</td>
        <td>${formatCr(team.spent)}</td>
        <td>${formatCr(remainingBudget(team))}</td>
        <td>${team.squad.length}</td>
        <td>${overseasCount(team)}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // -----------------------------------------------------------
  // Init — nothing to render yet; waiting for team selection
  // -----------------------------------------------------------

})();
