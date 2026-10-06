const fallbackStorage = {};

// Read one saved value from the browser.
function readSavedData(key, defaultValue) {
  let savedValue;

  try {
    savedValue = localStorage.getItem(key);
  } catch (error) {
    savedValue = fallbackStorage[key];
  }

  if (!savedValue) {
    return defaultValue;
  }

  try {
    return JSON.parse(savedValue);
  } catch (error) {
    return defaultValue;
  }
}

// Save one value in the browser.
function saveData(key, value) {
  const textValue = JSON.stringify(value);

  try {
    localStorage.setItem(key, textValue);
  } catch (error) {
    fallbackStorage[key] = textValue;
  }
}

// Show a short message at the bottom of the screen.
function showMessage(message) {
  const toast = document.querySelector("[data-toast]");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("visible");

  window.clearTimeout(showMessage.timer);
  showMessage.timer = window.setTimeout(function () {
    toast.classList.remove("visible");
  }, 2800);
}

// Open and close the small-screen navigation menu.
const menuButton = document.querySelector("[data-menu-button]");
const siteNav = document.querySelector("#site-nav");

if (menuButton && siteNav) {
  menuButton.addEventListener("click", function () {
    const menuIsOpen = siteNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", menuIsOpen);
    menuButton.querySelector(".sr-only").textContent = menuIsOpen
      ? "Close navigation"
      : "Open navigation";
  });
}

// Sign-in, sign-up, and contact forms only show a demo message.
document.querySelectorAll(".demo-form").forEach(function (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showMessage("This is a demo. Your information was not sent or saved.");
    form.reset();
  });
});

// Show a demo message for buttons like "Forgot password?"
document.querySelectorAll("[data-toast-message]").forEach(function (button) {
  button.addEventListener("click", function () {
    showMessage(button.dataset.toastMessage);
  });
});

// Switch between the sign-in and create-account examples.
const authTabs = document.querySelectorAll("[data-auth-tab]");

authTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    const selectedTab = tab.dataset.authTab;

    authTabs.forEach(function (otherTab) {
      const isSelected = otherTab === tab;
      otherTab.classList.toggle("active", isSelected);
      otherTab.setAttribute("aria-selected", isSelected);
    });

    document.querySelectorAll("[data-auth-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.authPanel !== selectedTab;
    });
  });
});

// Search the sample student list.
const friendSearch = document.querySelector("#friend-search");

if (friendSearch) {
  friendSearch.addEventListener("input", function () {
    const searchText = friendSearch.value.toLowerCase().trim();
    const people = document.querySelectorAll(".person-card");
    let matchingPeople = 0;

    people.forEach(function (person) {
      const nameMatches = person.textContent.toLowerCase().includes(searchText);
      person.hidden = !nameMatches;

      if (nameMatches) {
        matchingPeople += 1;
      }
    });

    document.querySelector("#no-people").hidden = matchingPeople > 0;
  });
}

// Connect or disconnect from one of the sample students.
const connectionButtons = document.querySelectorAll(".follow-button");

connectionButtons.forEach(function (button) {
  const personId = button.dataset.personId;
  const savedConnections = readSavedData("fitquest-connections", []);
  const isConnected = savedConnections.includes(personId);

  button.textContent = isConnected ? "✓ Connected" : "＋ Connect";
  button.classList.toggle("is-connected", isConnected);

  button.addEventListener("click", function () {
    const currentConnections = readSavedData("fitquest-connections", []);
    let updatedConnections;

    if (currentConnections.includes(personId)) {
      updatedConnections = currentConnections.filter(function (id) {
        return id !== personId;
      });
      showMessage("Connection removed from this browser.");
    } else {
      updatedConnections = currentConnections.concat(personId);
      showMessage("Connection saved in this browser.");
    }

    saveData("fitquest-connections", updatedConnections);

    const isNowConnected = updatedConnections.includes(personId);
    button.textContent = isNowConnected ? "✓ Connected" : "＋ Connect";
    button.classList.toggle("is-connected", isNowConnected);
  });
});

// Return a date as YYYY-MM-DD using the visitor's local time.
function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

// Update the seven-day activity chart and recent workout list.
function displayWorkouts() {
  const chart = document.querySelector("#week-chart");

  if (!chart) {
    return;
  }

  const savedWorkouts = readSavedData("fitquest-workouts", []);
  const workouts = Array.isArray(savedWorkouts) ? savedWorkouts : [];
  const dailyMinutes = {};
  const activeDates = {};
  const today = new Date();
  const days = [];

  // Create a list of the last seven days, starting six days ago.
  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    days.push(date);
    dailyMinutes[getDateKey(date)] = 0;
  }

  // Add each workout's minutes to the correct day.
  workouts.forEach(function (workout) {
    const workoutDate = new Date(workout.date);

    if (Number.isNaN(workoutDate.getTime())) {
      return;
    }

    const dateKey = getDateKey(workoutDate);
    activeDates[dateKey] = true;

    if (dailyMinutes[dateKey] !== undefined) {
      dailyMinutes[dateKey] += Number(workout.amount) || 0;
    }
  });

  const weeklyWorkouts = workouts.filter(function (workout) {
    const workoutDate = new Date(workout.date);
    return !Number.isNaN(workoutDate.getTime())
      && dailyMinutes[getDateKey(workoutDate)] !== undefined;
  });

  const weeklyMinutes = weeklyWorkouts.reduce(function (total, workout) {
    return total + (Number(workout.amount) || 0);
  }, 0);

  // Count consecutive active days, starting with today or yesterday.
  const streakStart = new Date(today);
  streakStart.setHours(0, 0, 0, 0);

  if (!activeDates[getDateKey(streakStart)]) {
    streakStart.setDate(streakStart.getDate() - 1);
  }

  let streak = 0;
  const streakDate = new Date(streakStart);

  while (activeDates[getDateKey(streakDate)]) {
    streak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  document.querySelector("#workout-count").textContent = weeklyWorkouts.length;
  document.querySelector("#weekly-minutes").textContent = weeklyMinutes;
  document.querySelector("#streak-count").textContent = streak;

  let largestDay = 1;
  Object.keys(dailyMinutes).forEach(function (dateKey) {
    if (dailyMinutes[dateKey] > largestDay) {
      largestDay = dailyMinutes[dateKey];
    }
  });
  chart.textContent = "";

  days.forEach(function (date) {
    const dateKey = getDateKey(date);
    const minutes = dailyMinutes[dateKey];
    const day = document.createElement("div");
    const amount = document.createElement("span");
    const barTrack = document.createElement("div");
    const bar = document.createElement("span");
    const label = document.createElement("span");

    day.className = "chart-day";
    amount.className = "chart-minutes";
    amount.textContent = minutes + " min";

    barTrack.className = "bar-track";
    bar.className = "bar";
    bar.style.height = minutes === 0
      ? "4px"
      : Math.max(10, (minutes / largestDay) * 100) + "%";
    barTrack.appendChild(bar);

    label.textContent = date.toLocaleDateString(undefined, { weekday: "short" });
    day.setAttribute("aria-label", label.textContent + ": " + minutes + " minutes");
    day.appendChild(amount);
    day.appendChild(barTrack);
    day.appendChild(label);
    chart.appendChild(day);
  });

  const activityList = document.querySelector("#activity-list");
  const emptyMessage = document.querySelector("#empty-workouts");
  const recentWorkouts = workouts.slice(0, 5);

  activityList.textContent = "";
  emptyMessage.hidden = recentWorkouts.length > 0;

  recentWorkouts.forEach(function (workout) {
    const item = document.createElement("div");
    const activityName = document.createElement("span");
    const activityTime = document.createElement("small");

    item.className = "activity-item";
    activityName.textContent = workout.type;
    activityTime.textContent = workout.amount + " minutes";
    item.appendChild(activityName);
    item.appendChild(activityTime);
    activityList.appendChild(item);
  });
}

// Save the workout entered on the home page.
const workoutForm = document.querySelector("#workout-form");

if (workoutForm) {
  workoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const activityType = document.querySelector("#workout-type").value;
    const minutes = Number(document.querySelector("#workout-amount").value);
    const workouts = readSavedData("fitquest-workouts", []);

    workouts.unshift({
      type: activityType,
      amount: minutes,
      date: new Date().toISOString()
    });

    saveData("fitquest-workouts", workouts);
    workoutForm.reset();
    displayWorkouts();
    showMessage("Workout saved in this browser. Nice work!");
  });
}

displayWorkouts();
