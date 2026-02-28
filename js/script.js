(function () {
  const sections = Array.from(document.querySelectorAll('main section'));
  const revealSet = new Set();

  function addReveal(el) {
    if (!el) return;
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    revealSet.add(el);
  }

  sections.forEach((section) => {
    section.querySelectorAll(
      'h1, h2, h3, p, .btn, .program-item, .details-item, .field, .field-group, .children, .success, .dress-card__stroke'
    ).forEach(addReveal);
  });

  function setDelay(el, seconds) {
    el.style.setProperty('--reveal-delay', `${seconds.toFixed(2)}s`);
  }

  sections.forEach((section) => {
    const items = Array.from(section.querySelectorAll('.reveal'));
    items.forEach((item, idx) => setDelay(item, Math.min(idx * 0.08, 0.96)));
  });

  const dressSection = document.getElementById('dresscode');
  if (dressSection) {
    const dressOrder = [
      dressSection.querySelector('.dress-card__title'),
      dressSection.querySelector('.dress-card__text:first-of-type'),
      ...Array.from(dressSection.querySelectorAll('.dress-card__stroke')),
      dressSection.querySelector('.dress-card__text + .dress-card__text'),
      dressSection.querySelector('.dress-card .btn')
    ].filter(Boolean);

    dressOrder.forEach((item, idx) => setDelay(item, 0.12 + idx * 0.3));
  }

  const revealItems = Array.from(
    new Set([...document.querySelectorAll('.reveal'), ...revealSet])
  );

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
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
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
  const allergyYes = document.getElementById('allergyYes');
  const allergyNo = document.getElementById('allergyNo');
  const allergyFields = document.getElementById('allergyFields');
  const allergyDetails = document.getElementById('allergyDetails');

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

  if (allergyYes && allergyNo && allergyFields && allergyDetails) {
    allergyYes.addEventListener('change', () => {
      if (!allergyYes.checked) return;
      allergyFields.hidden = false;
      allergyDetails.required = true;
    });

    allergyNo.addEventListener('change', () => {
      if (!allergyNo.checked) return;
      allergyFields.hidden = true;
      allergyDetails.required = false;
      allergyDetails.value = '';
    });
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
        allergy: yesNoMap[formData.get('allergy')] || formData.get('allergy'),
        allergyDetails: formData.get('allergyDetails') || '',
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

      const allergyInput = form.querySelector('input[name="allergy"]:checked');
      if (allergyInput) allergyInput.value = result.allergy || allergyInput.value;

      form.action = scriptUrl;
      form.method = 'POST';
      form.target = 'rsvpHiddenFrame';

      form.submit();

      form.hidden = true;
      if (successMessage) {
        successMessage.hidden = false;
        successMessage.classList.add('is-visible');
      }
    });
  }
})();
