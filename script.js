let barId = parseInt(localStorage.getItem('barIdCounter')) || 0;

function saveAllBars() {
  const bars = [];
  document.querySelectorAll('.progress-container').forEach(container => {
    const id = container.id.replace('bar-', '');
    const name = container.querySelector("input[type='text']").value;
    const goal = parseInt(container.querySelector("input[type='number']").value, 10);
    const bar = container.querySelector('.progress-bar');
    const current = parseInt(bar.textContent.split('/')[0].trim(), 10);
    const color = bar.style.backgroundColor;
    const note = container.querySelector('textarea').value;

    bars.push({ id, name, goal, current, color, note });
  });
  localStorage.setItem('progressBars', JSON.stringify(bars));
}

function loadBars() {
  const saved = localStorage.getItem('progressBars');
  if (!saved) return;
  try {
    const bars = JSON.parse(saved);
    bars.forEach(bar => {
      addProgressBar(bar.name, bar.goal, bar.current, bar.color, bar.note, parseInt(bar.id));
    });
  } catch (e) {
    console.error('Error parsing saved progress bars', e);
  }
}

function promptAddBar() {
  const name = prompt('Enter the name of the progress bar:', 'My Progress');
  const goal = parseInt(prompt('Enter the goal (max value):'), 10);
  const current = parseInt(prompt('Enter the starting value:'), 10);
  const color = prompt('Enter the color (e.g., green, red, #ff0000):', 'green');
  if (isNaN(goal) || isNaN(current)) return alert('Invalid input.');
  addProgressBar(name, goal, current, color, '', barId++);
  localStorage.setItem('barIdCounter', barId);
  saveAllBars();
}

function addProgressBar(name, goal, current, color, noteValue = '', id = barId++) {
  const container = document.getElementById('container');
  const wrapper = document.createElement('div');
  wrapper.className = 'progress-container';
  wrapper.id = 'bar-' + id;

  const progressInfo = document.createElement('div');
  progressInfo.className = 'progress-info';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = name;
  nameInput.style.width = '200px';
  nameInput.oninput = saveAllBars;

  const goalInput = document.createElement('input');
  goalInput.type = 'number';
  goalInput.value = goal;
  goalInput.style.width = '80px';
  goalInput.oninput = () => {
    updateBar(bar, currentValue.val, parseInt(goalInput.value));
    saveAllBars();
  };

  const currentValue = { val: current };

  const barWrapper = document.createElement('div');
  barWrapper.className = 'bar-wrapper';

  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.backgroundColor = color;
  updateBar(bar, current, goal);

  barWrapper.appendChild(bar);

  const controls = document.createElement('div');
  const plus = document.createElement('button');
  plus.textContent = '+';
  plus.onclick = () => {
    const inc = parseInt(prompt('Increment by:'), 10);
    if (!isNaN(inc)) {
      currentValue.val += inc;
      updateBar(bar, currentValue.val, parseInt(goalInput.value));
      checkGoal(currentValue.val, parseInt(goalInput.value));
      saveAllBars();
    }
  };

  const minus = document.createElement('button');
  minus.textContent = '-';
  minus.onclick = () => {
    const dec = parseInt(prompt('Decrement by:'), 10);
    if (!isNaN(dec)) {
      currentValue.val -= dec;
      updateBar(bar, currentValue.val, parseInt(goalInput.value));
      saveAllBars();
    }
  };

  const del = document.createElement('button');
  del.textContent = '🗑️';
  del.onclick = () => {
    container.removeChild(wrapper);
    saveAllBars();
  };

  controls.appendChild(plus);
  controls.appendChild(minus);
  controls.appendChild(del);

  const note = document.createElement('textarea');
  note.className = 'note-box';
  note.placeholder = 'Notes...';
  note.value = noteValue;
  note.oninput = saveAllBars;

  progressInfo.appendChild(nameInput);
  progressInfo.appendChild(document.createTextNode(' | Goal: '));
  progressInfo.appendChild(goalInput);
  progressInfo.appendChild(barWrapper);
  progressInfo.appendChild(controls);

  wrapper.appendChild(progressInfo);
  wrapper.appendChild(note);
  container.appendChild(wrapper);
}

function updateBar(bar, current, goal) {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
  bar.style.width = percentage + '%';
  bar.textContent = `${current} / ${goal}`;
}

function checkGoal(current, goal) {
  if (current >= goal) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

window.onload = loadBars;

function downloadBackup() {
  const data = {
    barIdCounter: barId,
    progressBars: JSON.parse(localStorage.getItem('progressBars') || '[]')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'progress-bars-backup.json';
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById('importBackupInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.progressBars)) throw new Error("Invalid backup file");

      localStorage.setItem('progressBars', JSON.stringify(data.progressBars));
      localStorage.setItem('barIdCounter', data.barIdCounter || 0);
      barId = parseInt(localStorage.getItem('barIdCounter')) || 0;

      document.getElementById('container').innerHTML = '';
      loadBars();
    } catch (err) {
      alert('Failed to import backup: ' + err.message);
    }
  };
  reader.readAsText(file);
});
