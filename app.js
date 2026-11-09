const answerKeys = {
  branca: {
    ingles: 'CBAED', espanhol: 'CAADB',
    regular: ['EABBADDBEDDBCBC','CBEACEACECEDEAC','AABCDABDCBCCDEC','DEBEDDAADEACBBA','EACABCAEBCDECBE','ABDEEDBEDA'].join('')
  },
  verde: {
    ingles: 'DBCAE', espanhol: 'BDCAA',
    regular: ['BEADDBBACEBCCDB','CEABACAEDECDCAB','CDDCBCEAABDECCC','AADAECBBEDDDECA','EDBEDACABCBEABA','EAACDEBDEE'].join('')
  },
  azul: {
    ingles: 'BAEDC', espanhol: 'AACBD',
    regular: ['DBCABDBDABEEDBE','ABCCCECCEAACADC','BABABCDEDECCCDE','BEDDDEAECBAADCA','BBAEAACDEDBEDAB','DEECBEACAE'].join('')
  },
  amarela: {
    ingles: 'ECDBA', espanhol: 'AADBC',
    regular: ['EDCDDBABBCBEAEA','BDBCEDEACACEAAB','CECDCBABCDCDCCA','EECBAADDEBEDDDB','EDACAEBAEABDEEA','CDECABCBEA'].join('')
  }
};

const colorNames = { branca: 'Branca', verde: 'Verde', azul: 'Azul', amarela: 'Amarela' };
const colors = Object.keys(answerKeys);
const storageKey = 'meu-gabarito-enem-2026-v2';
const blankAnswers = () => Array(90).fill(null);
const emptySheets = () => Object.fromEntries(colors.map(color => [color, blankAnswers()]));
let state = { color: 'branca', language: 'ingles', answersByColor: emptySheets() };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey)) || JSON.parse(localStorage.getItem('meu-gabarito-enem-2026-v1'));
  if (saved) {
    state.color = colors.includes(saved.color) ? saved.color : 'branca';
    state.language = ['ingles', 'espanhol'].includes(saved.language) ? saved.language : 'ingles';
    const sheets = emptySheets();
    if (saved.answersByColor) {
      for (const color of colors) {
        const answers = saved.answersByColor[color];
        if (Array.isArray(answers) && answers.length === 90) sheets[color] = answers;
      }
    } else if (Array.isArray(saved.answers) && saved.answers.length === 90) {
      sheets.branca = saved.answers;
    }
    state.answersByColor = sheets;
  }
} catch (_) {}

const grid = document.querySelector('#answer-grid');
const choices = ['A', 'B', 'C', 'D', 'E'];
const currentAnswers = () => state.answersByColor[state.color];
function keyFor(question) {
  const key = answerKeys[state.color];
  return question <= 5 ? key[state.language][question - 1] : key.regular[question - 6];
}
function render() {
  grid.innerHTML = '';
  for (let group = 0; group < 6; group++) {
    const column = document.createElement('section');
    column.className = 'question-column';
    const start = group * 15 + 1;
    const end = start + 14;
    column.innerHTML = `<div class="column-title"><span>QUESTÃO / RESPOSTA</span><span>${String(start).padStart(2, '0')}–${String(end).padStart(2, '0')}</span></div>`;
    for (let q = start; q <= end; q++) {
      const row = document.createElement('div');
      row.className = 'question-row';
      const number = document.createElement('span');
      number.className = 'question-number';
      number.textContent = String(q).padStart(2, '0');
      const optionList = document.createElement('div');
      optionList.className = 'option-list';
      const key = keyFor(q);
      for (const letter of choices) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'answer-option';
        button.textContent = letter;
        button.setAttribute('aria-label', `Questão ${q}, alternativa ${letter}`);
        button.setAttribute('aria-pressed', String(currentAnswers()[q - 1] === letter));
        if (currentAnswers()[q - 1] === letter) {
          button.classList.add('selected');
          if (letter === key) { button.classList.add('correct'); row.classList.add('is-correct'); }
          else { button.classList.add('wrong'); row.classList.add('is-wrong'); }
        }
        button.addEventListener('click', () => {
          currentAnswers()[q - 1] = currentAnswers()[q - 1] === letter ? null : letter;
          saveAndRender();
        });
        optionList.append(button);
      }
      row.append(number, optionList);
      column.append(row);
    }
    grid.append(column);
  }
  document.querySelectorAll('.booklet-option').forEach(button => {
    const active = button.dataset.color === state.color;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.language-option').forEach(button => {
    const active = button.dataset.language === state.language;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#color-label').textContent = `PROVA ${colorNames[state.color].toLocaleUpperCase('pt-BR')}`;
  updateScore();
}
function updateScore() {
  const answers = currentAnswers();
  const answered = answers.filter(Boolean).length;
  let score = 0;
  answers.forEach((answer, i) => { if (answer && answer === keyFor(i + 1)) score++; });
  const percentage = Math.round(score / 90 * 100);
  document.querySelector('#score').textContent = score;
  document.querySelector('#score-caption').textContent = answered === 90 ? 'acertos no gabarito' : 'acertos até agora';
  document.querySelector('#answered-count').textContent = `${answered} respondida${answered === 1 ? '' : 's'}`;
  document.querySelector('#percentage').textContent = `${percentage}%`;
  document.querySelector('#progress-fill').style.width = `${percentage}%`;
}
function saveAndRender() { localStorage.setItem(storageKey, JSON.stringify(state)); render(); }
document.querySelectorAll('.booklet-option').forEach(button => button.addEventListener('click', () => {
  state.color = button.dataset.color;
  saveAndRender();
}));
document.querySelectorAll('.language-option').forEach(button => button.addEventListener('click', () => {
  state.language = button.dataset.language;
  saveAndRender();
}));
document.querySelector('#clear-button').addEventListener('click', () => {
  state.answersByColor[state.color] = blankAnswers();
  saveAndRender();
});
render();
