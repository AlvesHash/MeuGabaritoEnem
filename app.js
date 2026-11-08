const regularAnswers = [
  'E','A','B','B','A','D','D','B','E','D','D','B','C','B','C',
  'D','B','E','A','C','E','A','C','E','C','E','D','E','A','C',
  'A','A','B','C','D','A','B','D','C','B','C','C','D','E','D',
  'D','E','B','E','D','D','A','A','D','A','E','C','B','B','A',
  'E','A','C','A','B','C','A','E','B','C','D','E','C','B','E',
  'A','B','D','E','E','D','B','E','D','A'
];
const languageAnswers = {
  ingles: ['C','B','A','E','D'],
  espanhol: ['C','A','A','D','B']
};
const storageKey = 'meu-gabarito-enem-2026-v1';
let state = { language: 'ingles', answers: Array(90).fill(null) };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.answers) && saved.answers.length === 90 && ['ingles','espanhol'].includes(saved.language)) state = saved;
} catch (_) {}

const grid = document.querySelector('#answer-grid');
const choices = ['A','B','C','D','E'];
function keyFor(question) { return question <= 5 ? languageAnswers[state.language][question - 1] : regularAnswers[question - 6]; }
function render() {
  grid.innerHTML = '';
  for (let group = 0; group < 6; group++) {
    const column = document.createElement('section');
    column.className = 'question-column';
    const start = group * 15 + 1;
    const end = start + 14;
    column.innerHTML = `<div class="column-title"><span>QUESTÃO / RESPOSTA</span><span>${String(start).padStart(2,'0')}–${String(end).padStart(2,'0')}</span></div>`;
    for (let q = start; q <= end; q++) {
      const row = document.createElement('div');
      row.className = 'question-row';
      row.dataset.question = q;
      const number = document.createElement('span');
      number.className = 'question-number';
      number.textContent = String(q).padStart(2,'0');
      const optionList = document.createElement('div');
      optionList.className = 'option-list';
      const key = keyFor(q);
      for (const letter of choices) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'answer-option';
        button.textContent = letter;
        button.setAttribute('aria-label', `Questão ${q}, alternativa ${letter}`);
        button.setAttribute('aria-pressed', String(state.answers[q - 1] === letter));
        if (state.answers[q - 1] === letter) {
          button.classList.add('selected');
          if (letter === key) { button.classList.add('correct'); row.classList.add('is-correct'); }
          else { button.classList.add('wrong'); row.classList.add('is-wrong'); }
        }
        button.addEventListener('click', () => {
          state.answers[q - 1] = state.answers[q - 1] === letter ? null : letter;
          saveAndRender();
        });
        optionList.append(button);
      }
      row.append(number, optionList);
      column.append(row);
    }
    grid.append(column);
  }
  document.querySelectorAll('.language-option').forEach(button => {
    const active = button.dataset.language === state.language;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateScore();
}
function updateScore() {
  const answered = state.answers.filter(Boolean).length;
  let score = 0;
  state.answers.forEach((answer, i) => { if (answer && answer === keyFor(i + 1)) score++; });
  const percentage = Math.round(score / 90 * 100);
  document.querySelector('#score').textContent = score;
  document.querySelector('#score-caption').textContent = answered === 90 ? 'acertos no gabarito' : 'acertos até agora';
  document.querySelector('#answered-count').textContent = `${answered} respondida${answered === 1 ? '' : 's'}`;
  document.querySelector('#percentage').textContent = `${percentage}%`;
  document.querySelector('#progress-fill').style.width = `${percentage}%`;
}
function saveAndRender() { localStorage.setItem(storageKey, JSON.stringify(state)); render(); }
document.querySelectorAll('.language-option').forEach(button => button.addEventListener('click', () => {
  state.language = button.dataset.language;
  saveAndRender();
}));
document.querySelector('#clear-button').addEventListener('click', () => {
  state.answers = Array(90).fill(null);
  saveAndRender();
});
render();
