(function () {
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealItems.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => io.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const form = document.getElementById('rsvpForm');
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbwP0ksM26KscrudRmFs7FgNFrGiyHzLsAsvgKIngCW4B1dUyao8FI7Lemmy7JVT3KA1/exec';
  const successMessage = document.getElementById('successMessage');
  const childrenYes = document.getElementById('childrenYes');
  const childrenNo = document.getElementById('childrenNo');
  const childrenFields = document.getElementById('childrenFields');
  const childrenList = document.getElementById('childrenList');
  const addChildBtn = document.getElementById('addChildBtn');

  let childCounter = 0;

  function syncChildTitles() {
    const cards = childrenList.querySelectorAll('.child-card');
    cards.forEach((card, index) => {
      const title = card.querySelector('.child-card__title');
      if (title) title.textContent = `Ребенок ${index + 1}`;
    });
  }

  function removeChildCard(card) {
    if (!card) return;
    card.remove();
    syncChildTitles();
  }

  function createChildCard() {
    childCounter += 1;

    const wrapper = document.createElement('article');
    wrapper.className = 'child-card';
    wrapper.dataset.childId = String(childCounter);

    wrapper.innerHTML = `
      <div class="child-card__header">
        <span class="child-card__title">Ребенок ${childrenList.children.length + 1}</span>
        <button type="button" class="child-card__remove" aria-label="Удалить ребенка">×</button>
      </div>
      <label>
        Имя ребенка
        <input type="text" name="child_name_${childCounter}" required />
      </label>
      <label>
        Возраст
        <input type="number" name="child_age_${childCounter}" min="0" max="18" required />
      </label>
    `;

    const removeBtn = wrapper.querySelector('.child-card__remove');
    removeBtn.addEventListener('click', () => removeChildCard(wrapper));

    childrenList.appendChild(wrapper);
  }

  if (childrenYes && childrenNo && childrenFields) {
    childrenYes.addEventListener('change', () => {
      if (!childrenYes.checked) return;
      childrenFields.hidden = false;
      if (!childrenList.children.length) createChildCard();
    });

    childrenNo.addEventListener('change', () => {
      if (!childrenNo.checked) return;
      childrenFields.hidden = true;
      childrenList.innerHTML = '';
    });
  }

  if (addChildBtn) {
    addChildBtn.addEventListener('click', createChildCard);
  }

  if (form) {
    const iframe = document.createElement('iframe');
    iframe.name = 'rsvpHiddenFrame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    let childrenDataInput = form.querySelector('input[name="childrenData"]');
    if (!childrenDataInput) {
      childrenDataInput = document.createElement('input');
      childrenDataInput.type = 'hidden';
      childrenDataInput.name = 'childrenData';
      form.appendChild(childrenDataInput);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!scriptUrl || scriptUrl.includes('PASTE_GOOGLE_SCRIPT_WEB_APP_URL_HERE')) {
        alert('Пожалуйста, вставьте URL веб-приложения Google Apps Script в js/script.js.');
        return;
      }

      const yesNoMap = {
        yes: 'Да',
        no: 'Нет'
      };

      const formData = new FormData(form);
      const rawChildren = formData.get('children');
      const result = {
        fullName: formData.get('fullName'),
        attendance: yesNoMap[formData.get('attendance')] || formData.get('attendance'),
        transfer: yesNoMap[formData.get('transfer')] || formData.get('transfer'),
        children: yesNoMap[formData.get('children')] || formData.get('children'),
        childrenData: []
      };

      if (rawChildren === 'yes') {
        const cards = childrenList.querySelectorAll('.child-card');
        cards.forEach((card) => {
          const id = card.dataset.childId;
          result.childrenData.push({
            name: formData.get(`child_name_${id}`),
            age: formData.get(`child_age_${id}`)
          });
        });
      }

      childrenDataInput.value = result.childrenData && result.childrenData.length ? JSON.stringify(result.childrenData) : '';

      const attendanceInput = form.querySelector('input[name="attendance"]:checked');
      if (attendanceInput) attendanceInput.value = result.attendance || attendanceInput.value;

      const transferInput = form.querySelector('input[name="transfer"]:checked');
      if (transferInput) transferInput.value = result.transfer || transferInput.value;

      const childrenInput = form.querySelector('input[name="children"]:checked');
      if (childrenInput) childrenInput.value = result.children || childrenInput.value;

      form.action = scriptUrl;
      form.method = 'POST';
      form.target = 'rsvpHiddenFrame';

      form.submit();

      form.hidden = true;
      if (successMessage) successMessage.hidden = false;
    });
  }
})();
