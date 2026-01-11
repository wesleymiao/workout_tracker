// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// State Management
let currentWorkout = null;
let currentScreen = 'home-screen';
let workoutHistory = [];
let checklistConfig = ['Water bottle', 'Towel', 'Gym shoes', 'Phone & earbuds'];
let editingExerciseIndex = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    showScreen('home-screen');
});

// API Functions
async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/data`);
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();
        workoutHistory = data.workoutHistory || [];
        checklistConfig = data.checklistConfig || ['Water bottle', 'Towel', 'Gym shoes', 'Phone & earbuds'];
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data from server. Using defaults.');
    }
}

async function saveWorkout(workout) {
    try {
        const response = await fetch(`${API_BASE_URL}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
        });
        if (!response.ok) throw new Error('Failed to save workout');
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Failed to save workout to server');
        throw error;
    }
}

async function saveChecklistConfig() {
    try {
        const response = await fetch(`${API_BASE_URL}/checklist`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checklistConfig })
        });
        if (!response.ok) throw new Error('Failed to save checklist');
    } catch (error) {
        console.error('Error saving checklist:', error);
        alert('Failed to save checklist to server');
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

// Event Listeners
function initializeEventListeners() {
    // Home Screen
    document.getElementById('start-workout-btn').addEventListener('click', startWorkoutFlow);
    document.getElementById('view-stats-btn').addEventListener('click', showStatistics);
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    
    // Checklist Screen
    document.getElementById('checklist-continue-btn').addEventListener('click', () => {
        showScreen('workout-type-screen');
    });
    document.getElementById('checklist-back-btn').addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    // Workout Type Screen
    document.querySelectorAll('.workout-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const workoutType = e.target.dataset.type;
            selectWorkoutType(workoutType);
        });
    });
    document.getElementById('workout-type-back-btn').addEventListener('click', () => {
        showScreen('checklist-screen');
    });
    
    // Exercise Planning Screen
    document.getElementById('add-exercise-btn').addEventListener('click', openExerciseModal);
    document.getElementById('start-tracking-btn').addEventListener('click', startTracking);
    document.getElementById('planning-back-btn').addEventListener('click', () => {
        showScreen('workout-type-screen');
    });
    
    // During Workout Screen
    document.getElementById('finish-workout-btn').addEventListener('click', finishWorkout);
    
    // Summary Screen
    document.getElementById('summary-home-btn').addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    // Statistics Screen
    document.getElementById('stats-back-btn').addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    // Settings Screen
    document.getElementById('settings-back-btn').addEventListener('click', () => {
        showScreen('home-screen');
    });
    document.getElementById('add-checklist-item-btn').addEventListener('click', addChecklistItem);
    
    // Exercise Modal
    document.getElementById('exercise-type-select').addEventListener('change', (e) => {
        toggleExerciseFields(e.target.value);
    });
    document.getElementById('save-exercise-btn').addEventListener('click', saveExercise);
    document.getElementById('cancel-exercise-btn').addEventListener('click', closeExerciseModal);
}

// Start Workout Flow
function startWorkoutFlow() {
    renderChecklist();
    showScreen('checklist-screen');
}

// Render Checklist
function renderChecklist() {
    const container = document.getElementById('checklist-items');
    container.innerHTML = '';
    
    if (checklistConfig.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No checklist items. Add some in Settings!</p></div>';
        return;
    }
    
    checklistConfig.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <input type="checkbox" id="check-${index}">
            <label for="check-${index}">${item}</label>
        `;
        
        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', () => {
            div.classList.toggle('checked', checkbox.checked);
        });
        
        container.appendChild(div);
    });
}

// Select Workout Type
function selectWorkoutType(type) {
    currentWorkout = {
        type: type,
        date: new Date().toISOString(),
        exercises: [],
        startTime: Date.now()
    };
    
    // Load previous exercises of same type for pre-population
    const previousWorkouts = workoutHistory.filter(w => w.type === type);
    if (previousWorkouts.length > 0) {
        const lastWorkout = previousWorkouts[previousWorkouts.length - 1];
        currentWorkout.exercises = lastWorkout.exercises.map(ex => ({
            ...ex,
            completed: false,
            actualReps: ex.actualReps || ex.targetReps,
            actualSets: ex.actualSets || ex.targetSets,
            actualWeight: ex.actualWeight || ex.weight,
            actualDistance: ex.actualDistance || ex.distance
        }));
    }
    
    const typeLabels = {
        'pull': 'Pull',
        'push': 'Push',
        'legs': 'Legs',
        'swim': 'Swim',
        'run-gym': 'Run (Gym)',
        'run-outdoor': 'Run (Outdoor)'
    };
    
    document.getElementById('planning-title').textContent = `Plan Your ${typeLabels[type]} Workout`;
    renderExercisePlanning();
    showScreen('exercise-planning-screen');
}

// Render Exercise Planning
function renderExercisePlanning() {
    const container = document.getElementById('exercise-list');
    container.innerHTML = '';
    
    if (currentWorkout.exercises.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏋️</div><p>No exercises added yet. Click Add Exercise to begin!</p></div>';
        return;
    }
    
    currentWorkout.exercises.forEach((exercise, index) => {
        const div = document.createElement('div');
        div.className = 'exercise-item';
        
        let details = '';
        if (exercise.exerciseType === 'equipment') {
            details = `Weight: ${exercise.weight}kg • Reps: ${exercise.targetReps} • Sets: ${exercise.targetSets}`;
        } else {
            details = `Distance: ${exercise.distance}km`;
        }
        
        div.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-name">${exercise.name}</div>
                <button class="delete-exercise-btn" data-index="${index}">×</button>
            </div>
            <div class="exercise-details">${details}</div>
        `;
        
        div.querySelector('.delete-exercise-btn').addEventListener('click', () => {
            currentWorkout.exercises.splice(index, 1);
            renderExercisePlanning();
        });
        
        container.appendChild(div);
    });
}

// Exercise Modal
function openExerciseModal() {
    editingExerciseIndex = null;
    document.getElementById('modal-title').textContent = 'Add Exercise';
    document.getElementById('exercise-type-select').value = 'equipment';
    toggleExerciseFields('equipment');
    clearExerciseForm();
    document.getElementById('exercise-modal').classList.add('active');
}

function closeExerciseModal() {
    document.getElementById('exercise-modal').classList.remove('active');
}

function toggleExerciseFields(type) {
    const equipmentFields = document.getElementById('equipment-fields');
    const cardioFields = document.getElementById('cardio-fields');
    
    if (type === 'equipment') {
        equipmentFields.style.display = 'block';
        cardioFields.style.display = 'none';
    } else {
        equipmentFields.style.display = 'none';
        cardioFields.style.display = 'block';
    }
}

function clearExerciseForm() {
    document.getElementById('equipment-name').value = '';
    document.getElementById('equipment-weight').value = '';
    document.getElementById('equipment-reps').value = '';
    document.getElementById('equipment-sets').value = '';
    document.getElementById('cardio-name').value = '';
    document.getElementById('cardio-distance').value = '';
}

function saveExercise() {
    const exerciseType = document.getElementById('exercise-type-select').value;
    
    let exercise = {
        exerciseType: exerciseType,
        completed: false
    };
    
    if (exerciseType === 'equipment') {
        const name = document.getElementById('equipment-name').value.trim();
        const weight = parseFloat(document.getElementById('equipment-weight').value);
        const reps = parseInt(document.getElementById('equipment-reps').value);
        const sets = parseInt(document.getElementById('equipment-sets').value);
        
        if (!name || !weight || !reps || !sets) {
            alert('Please fill in all fields');
            return;
        }
        
        exercise = {
            ...exercise,
            name: name,
            weight: weight,
            targetReps: reps,
            targetSets: sets,
            actualWeight: weight,
            actualReps: reps,
            actualSets: sets
        };
    } else {
        const name = document.getElementById('cardio-name').value.trim();
        const distance = parseFloat(document.getElementById('cardio-distance').value);
        
        if (!name || !distance) {
            alert('Please fill in all fields');
            return;
        }
        
        exercise = {
            ...exercise,
            name: name,
            distance: distance,
            actualDistance: distance
        };
    }
    
    if (editingExerciseIndex !== null) {
        currentWorkout.exercises[editingExerciseIndex] = exercise;
    } else {
        currentWorkout.exercises.push(exercise);
    }
    
    renderExercisePlanning();
    closeExerciseModal();
}

// Start Tracking
function startTracking() {
    if (currentWorkout.exercises.length === 0) {
        alert('Please add at least one exercise');
        return;
    }
    
    const typeLabels = {
        'pull': 'Pull',
        'push': 'Push',
        'legs': 'Legs',
        'swim': 'Swim',
        'run-gym': 'Run (Gym)',
        'run-outdoor': 'Run (Outdoor)'
    };
    
    document.getElementById('workout-title').textContent = `${typeLabels[currentWorkout.type]} Workout`;
    renderWorkoutTracking();
    showScreen('during-workout-screen');
}

// Render Workout Tracking
function renderWorkoutTracking() {
    const container = document.getElementById('workout-exercises');
    container.innerHTML = '';
    
    currentWorkout.exercises.forEach((exercise, index) => {
        const div = document.createElement('div');
        div.className = `workout-exercise-item ${exercise.completed ? 'completed' : ''}`;
        
        let controlsHtml = '';
        if (exercise.exerciseType === 'equipment') {
            controlsHtml = `
                <div class="exercise-controls">
                    <div class="exercise-control-row">
                        <label>Weight (kg):</label>
                        <input type="number" value="${exercise.actualWeight}" data-field="actualWeight" data-index="${index}">
                    </div>
                    <div class="exercise-control-row">
                        <label>Reps:</label>
                        <input type="number" value="${exercise.actualReps}" data-field="actualReps" data-index="${index}">
                    </div>
                    <div class="exercise-control-row">
                        <label>Sets:</label>
                        <input type="number" value="${exercise.actualSets}" data-field="actualSets" data-index="${index}">
                    </div>
                </div>
            `;
        } else {
            controlsHtml = `
                <div class="exercise-controls">
                    <div class="exercise-control-row">
                        <label>Distance (km):</label>
                        <input type="number" step="0.1" value="${exercise.actualDistance}" data-field="actualDistance" data-index="${index}">
                    </div>
                </div>
            `;
        }
        
        div.innerHTML = `
            <div class="exercise-name">${exercise.name}</div>
            ${controlsHtml}
            <button class="mark-done-btn" data-index="${index}">
                ${exercise.completed ? '✓ Completed' : 'Mark Done'}
            </button>
        `;
        
        // Add input change listeners
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const value = parseFloat(e.target.value);
                currentWorkout.exercises[idx][field] = value;
            });
        });
        
        // Add mark done listener
        div.querySelector('.mark-done-btn').addEventListener('click', () => {
            currentWorkout.exercises[index].completed = !currentWorkout.exercises[index].completed;
            renderWorkoutTracking();
        });
        
        container.appendChild(div);
    });
}

// Finish Workout
async function finishWorkout() {
    currentWorkout.endTime = Date.now();
    currentWorkout.duration = Math.round((currentWorkout.endTime - currentWorkout.startTime) / 1000 / 60);
    
    try {
        await saveWorkout(currentWorkout);
        workoutHistory.push(currentWorkout);
        renderSummary();
        showScreen('summary-screen');
    } catch (error) {
        console.error('Error finishing workout:', error);
    }
}

// Render Summary
function renderSummary() {
    const container = document.getElementById('summary-content');
    
    const typeLabels = {
        'pull': 'Pull',
        'push': 'Push',
        'legs': 'Legs',
        'swim': 'Swim',
        'run-gym': 'Run (Gym)',
        'run-outdoor': 'Run (Outdoor)'
    };
    
    const date = new Date(currentWorkout.date);
    const completedCount = currentWorkout.exercises.filter(ex => ex.completed).length;
    
    let exercisesSummary = '';
    currentWorkout.exercises.forEach(exercise => {
        const status = exercise.completed ? '✓' : '○';
        let details = '';
        if (exercise.exerciseType === 'equipment') {
            details = `${exercise.actualWeight}kg × ${exercise.actualReps} reps × ${exercise.actualSets} sets`;
        } else {
            details = `${exercise.actualDistance}km`;
        }
        exercisesSummary += `
            <div class="summary-row">
                <span>${status} ${exercise.name}</span>
                <span>${details}</span>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="summary-section">
            <h3>Workout Details</h3>
            <div class="summary-row">
                <span class="summary-label">Type:</span>
                <span class="summary-value">${typeLabels[currentWorkout.type]}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Date:</span>
                <span class="summary-value">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${currentWorkout.duration} minutes</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Exercises:</span>
                <span class="summary-value">${completedCount}/${currentWorkout.exercises.length} completed</span>
            </div>
        </div>
        
        <div class="summary-section">
            <h3>Exercises</h3>
            ${exercisesSummary}
        </div>
    `;
}

// Show Statistics
async function showStatistics() {
    await loadData(); // Refresh data from server
    renderStatistics();
    showScreen('stats-screen');
}

function renderStatistics() {
    const container = document.getElementById('stats-content');
    
    if (workoutHistory.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>No workout history yet. Complete your first workout to see statistics!</p></div>';
        return;
    }
    
    const totalWorkouts = workoutHistory.length;
    const totalExercises = workoutHistory.reduce((sum, w) => sum + w.exercises.length, 0);
    const completedExercises = workoutHistory.reduce((sum, w) => 
        sum + w.exercises.filter(ex => ex.completed).length, 0);
    
    // Calculate workout frequency in last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workoutHistory.filter(w => new Date(w.date).getTime() > thirtyDaysAgo).length;
    
    // Check for declining trend (last 7 days vs previous 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const lastWeek = workoutHistory.filter(w => {
        const time = new Date(w.date).getTime();
        return time > sevenDaysAgo;
    }).length;
    const previousWeek = workoutHistory.filter(w => {
        const time = new Date(w.date).getTime();
        return time > fourteenDaysAgo && time <= sevenDaysAgo;
    }).length;
    
    let motivationMessage = '';
    if (lastWeek === 0 && previousWeek > 0) {
        motivationMessage = '<div class="stat-card" style="background-color: var(--danger-color); color: white;"><h3>⚠️ Reminder</h3><p>You haven\'t worked out this week! Don\'t give up on your goals!</p></div>';
    } else if (lastWeek < previousWeek && previousWeek > 0) {
        motivationMessage = '<div class="stat-card" style="background-color: #FF9500; color: white;"><h3>📉 Trend Alert</h3><p>Your workout frequency is declining. Stay consistent!</p></div>';
    } else if (lastWeek > previousWeek) {
        motivationMessage = '<div class="stat-card" style="background-color: var(--success-color); color: white;"><h3>🔥 Great Job!</h3><p>Your workout frequency is improving! Keep it up!</p></div>';
    }
    
    let historyHtml = '';
    const recentHistory = workoutHistory.slice(-10).reverse();
    recentHistory.forEach(workout => {
        const date = new Date(workout.date);
        const typeLabels = {
            'pull': 'Pull',
            'push': 'Push',
            'legs': 'Legs',
            'swim': 'Swim',
            'run-gym': 'Run (Gym)',
            'run-outdoor': 'Run (Outdoor)'
        };
        const completedCount = workout.exercises.filter(ex => ex.completed).length;
        
        historyHtml += `
            <div class="workout-history-item">
                <div class="workout-date">${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</div>
                <div class="workout-type-label">${typeLabels[workout.type]}</div>
                <div class="workout-summary-text">${completedCount}/${workout.exercises.length} exercises • ${workout.duration} min</div>
            </div>
        `;
    });
    
    container.innerHTML = `
        ${motivationMessage}
        
        <div class="stat-card">
            <div class="stat-number">${totalWorkouts}</div>
            <div class="stat-label">Total Workouts</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-number">${recentWorkouts}</div>
            <div class="stat-label">Workouts (Last 30 Days)</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-number">${completedExercises}</div>
            <div class="stat-label">Total Exercises Completed</div>
        </div>
        
        <h3 style="margin-top: 24px; margin-bottom: 16px;">Recent Workouts</h3>
        ${historyHtml}
    `;
}

// Settings
async function showSettings() {
    await loadData(); // Refresh data from server
    renderSettings();
    showScreen('settings-screen');
}

function renderSettings() {
    const container = document.getElementById('settings-checklist');
    container.innerHTML = '';
    
    checklistConfig.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'settings-checklist-item';
        div.innerHTML = `
            <input type="text" value="${item}" data-index="${index}">
            <button class="remove-item-btn" data-index="${index}">×</button>
        `;
        
        div.querySelector('input').addEventListener('change', async (e) => {
            checklistConfig[index] = e.target.value;
            await saveChecklistConfig();
        });
        
        div.querySelector('.remove-item-btn').addEventListener('click', async () => {
            checklistConfig.splice(index, 1);
            await saveChecklistConfig();
            renderSettings();
        });
        
        container.appendChild(div);
    });
}

async function addChecklistItem() {
    const newItem = prompt('Enter new checklist item:');
    if (newItem && newItem.trim()) {
        checklistConfig.push(newItem.trim());
        await saveChecklistConfig();
        renderSettings();
    }
}
