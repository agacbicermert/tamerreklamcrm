const STORAGE_KEY = "signage-crm-v1";
const locale = "tr-TR";
const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const hours = Array.from({ length: 24 }, (_, index) => index);

const typeLabels = {
  discovery: "Keşif / ölçü",
  design: "Tasarım",
  offer: "Teklif",
  production: "Üretim",
  install: "Montaj",
  collection: "Tahsilat",
};

const stageLabels = {
  prep: "Teklif hazırlanıyor",
  sent: "Teklif gönderildi",
  approved: "Onaylandı",
  production: "Üretimde",
  install: "Montajda",
};

const els = {
  todayBtn: document.querySelector("#todayBtn"),
  prevWeekBtn: document.querySelector("#prevWeekBtn"),
  nextWeekBtn: document.querySelector("#nextWeekBtn"),
  themeToggle: document.querySelector("#themeToggle"),
  summaryRow: document.querySelector("#summaryRow"),
  globalSearch: document.querySelector("#globalSearch"),
  companyList: document.querySelector("#companyList"),
  companyAvatar: document.querySelector("#companyAvatar"),
  companyName: document.querySelector("#companyName"),
  companyMeta: document.querySelector("#companyMeta"),
  companyFacts: document.querySelector("#companyFacts"),
  contactList: document.querySelector("#contactList"),
  opportunityList: document.querySelector("#opportunityList"),
  weekTitle: document.querySelector("#weekTitle"),
  weekHead: document.querySelector("#weekHead"),
  timeAxis: document.querySelector("#timeAxis"),
  calendarScroll: document.querySelector("#calendarScroll"),
  weekGrid: document.querySelector("#weekGrid"),
  editorEmpty: document.querySelector("#editorEmpty"),
  editorWidget: document.querySelector("#editorWidget"),
  eventForm: document.querySelector("#eventForm"),
  editorTitle: document.querySelector("#editorTitle"),
  closeEditorBtn: document.querySelector("#closeEditorBtn"),
  eventTitle: document.querySelector("#eventTitle"),
  eventDetail: document.querySelector("#eventDetail"),
  eventType: document.querySelector("#eventType"),
  eventProduct: document.querySelector("#eventProduct"),
  eventCompany: document.querySelector("#eventCompany"),
  eventContact: document.querySelector("#eventContact"),
  eventOpportunity: document.querySelector("#eventOpportunity"),
  eventEnd: document.querySelector("#eventEnd"),
  eventFiles: document.querySelector("#eventFiles"),
  filePreview: document.querySelector("#filePreview"),
  emptyStateTemplate: document.querySelector("#emptyStateTemplate"),
};

let state = loadState();
let weekStart = startOfWeek(new Date());
let selectedCompanyId = state.companies[0]?.id ?? null;
let searchTerm = "";
let draftSlot = null;
let selectedFiles = [];
let shouldScrollToWorkHours = true;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const ahmet = createId();
  const optik = createId();
  const fabrika = createId();
  const ahmetOwner = createId();
  const optikOwner = createId();
  const fabrikaOwner = createId();
  const today = new Date();

  return {
    theme: "dark",
    companies: [
      company(ahmet, "Ahmet Eczanesi", "Eczane LED tabela", "342 880 1294", "Kadıköy", {
        "Ürün ilgisi": "Eczane isimli LED tabela",
        "Cephe ölçüsü": "340 x 80 cm",
        "Montaj notu": "Ana cadde, akşam montajı uygun",
      }),
      company(optik, "Mavi Optik", "Optik vitrin tabelası", "184 330 9182", "Beykoz", {
        "Ürün ilgisi": "Gözlük çerçevesi LED",
        "Renk": "Beyaz + mavi",
      }),
      company(fabrika, "Atlas Fabrika", "Ramak kala kutusu", "774 610 3211", "Gebze", {
        "Ürün ilgisi": "İSG ramak kala kutusu",
        "Adet": "12",
      }),
    ],
    contacts: [
      contact(ahmetOwner, ahmet, "Ahmet Yılmaz", "Eczacı / karar verici", "0532 440 18 23"),
      contact(optikOwner, optik, "Selin Kara", "Mağaza sahibi", "0544 690 72 11"),
      contact(fabrikaOwner, fabrika, "Murat Demir", "İSG uzmanı", "0533 105 44 80"),
    ],
    opportunities: [
      opportunity(createId(), ahmet, ahmetOwner, "Eczane cephe LED tabela", "LED tabela", 14700, "prep"),
      opportunity(createId(), optik, optikOwner, "Optik vitrin LED çerçeve", "LED tabela", 9700, "sent"),
      opportunity(createId(), fabrika, fabrikaOwner, "12 adet ramak kala kutusu", "Ramak kala kutusu", 42000, "approved"),
    ],
    events: [
      calendarEvent(createId(), today, "09:30", "10:30", "discovery", ahmet, ahmetOwner, "Eczane cephe ölçüsü", "Cephe fotoğrafı ve elektrik hattı kontrolü.", "Eczane cephe LED tabela", ["cephe-foto.jpg"]),
      calendarEvent(createId(), today, "14:00", "15:30", "offer", ahmet, ahmetOwner, "Ahmet Eczanesi teklif revizyonu", "LED ürün fiyatı ve montaj hariç/dahil kalemleri ayrılacak.", "Eczane cephe LED tabela", ["revize-teklif.pdf"]),
      calendarEvent(createId(), addDays(today, 1), "11:00", "12:00", "design", optik, optikOwner, "Mavi Optik tasarım kontrolü", "Mavi beyaz ışık tonu, vitrin camı ölçüsü.", "Optik vitrin LED çerçeve", []),
      calendarEvent(createId(), addDays(today, 2), "13:00", "16:00", "install", fabrika, fabrikaOwner, "Atlas Fabrika montaj", "12 kutu üretimden çıkacak, sahada teslim.", "12 adet ramak kala kutusu", ["montaj-listesi.xlsx"]),
    ],
  };
}

function company(id, name, segment, taxNo, city, customFields) {
  return { id, name, segment, taxNo, city, customFields };
}

function contact(id, companyId, name, titleLine, phone) {
  return { id, companyId, name, titleLine, phone };
}

function opportunity(id, companyId, contactId, title, product, amount, stage) {
  return { id, companyId, contactId, title, product, amount, stage };
}

function calendarEvent(id, date, start, end, type, companyId, contactId, title, detail, opportunityTitle, files) {
  return { id, date: toISODate(date), start, end, type, companyId, contactId, title, detail, opportunityTitle, files };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  document.body.className = state.theme === "light" ? "theme-light" : "theme-dark";
  els.themeToggle.textContent = state.theme === "dark" ? "Gündüz modu" : "Gece modu";
  renderSummary();
  renderCompanies();
  renderCompany();
  renderOpportunities();
  renderWeek();
  renderSelects();
}

function renderSummary() {
  const weekDates = getWeekDates(weekStart).map(toISODate);
  const weekEvents = state.events.filter((event) => weekDates.includes(event.date));
  const openOffers = state.opportunities.filter((opp) => ["prep", "sent"].includes(opp.stage));
  const installJobs = state.events.filter((event) => event.type === "install");
  const files = state.events.flatMap((event) => event.files ?? []);
  const total = state.opportunities.reduce((sum, opp) => sum + opp.amount, 0);

  const cards = [
    ["Ş", state.companies.length, "Şirket"],
    ["T", weekEvents.length, "Haftalık kayıt"],
    ["F", openOffers.length, "Açık teklif"],
    ["M", installJobs.length, "Montaj işi"],
    ["₺", formatMoney(total), `${files.length} ek dosya`],
  ];

  els.summaryRow.innerHTML = cards
    .map(
      ([icon, value, label]) => `
        <article class="summary-card">
          <span class="summary-icon">${icon}</span>
          <div><strong>${value}</strong><p class="meta">${label}</p></div>
        </article>
      `,
    )
    .join("");
}

function renderCompanies() {
  const companies = getFilteredCompanies();
  els.companyList.innerHTML = "";

  if (!companies.length) {
    els.companyList.appendChild(emptyState("Eşleşen kayıt yok."));
    return;
  }

  companies.forEach((companyItem) => {
    const openCount = state.opportunities.filter((opp) => opp.companyId === companyItem.id && opp.stage !== "install").length;
    const button = document.createElement("button");
    button.className = `company-result${companyItem.id === selectedCompanyId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <div>
        <strong>${escapeHTML(companyItem.name)}</strong>
        <p class="meta">${escapeHTML(companyItem.segment)}</p>
      </div>
      <span class="stage-chip">${openCount}</span>
    `;
    button.addEventListener("click", () => {
      selectedCompanyId = companyItem.id;
      render();
    });
    els.companyList.appendChild(button);
  });
}

function renderCompany() {
  const companyItem = getSelectedCompany();
  const contacts = getCompanyContacts(companyItem.id);

  els.companyAvatar.textContent = getInitials(companyItem.name);
  els.companyName.textContent = companyItem.name;
  els.companyMeta.textContent = `${companyItem.segment} · ${companyItem.city}`;

  const facts = {
    "Vergi no": companyItem.taxNo,
    "Şehir": companyItem.city,
    ...companyItem.customFields,
  };

  els.companyFacts.innerHTML = Object.entries(facts)
    .map(([key, value]) => `<div><dt>${escapeHTML(key)}</dt><dd>${escapeHTML(value)}</dd></div>`)
    .join("");

  els.contactList.innerHTML = contacts
    .map(
      (person) => `
        <article class="contact-chip">
          <strong>${escapeHTML(person.name)}</strong>
          <p class="meta">${escapeHTML(person.titleLine)} · ${escapeHTML(person.phone)}</p>
        </article>
      `,
    )
    .join("");
}

function renderOpportunities() {
  const items = state.opportunities.filter((opp) => opp.companyId === selectedCompanyId);
  els.opportunityList.innerHTML = "";

  if (!items.length) {
    els.opportunityList.appendChild(emptyState("Bu şirkette fırsat yok."));
    return;
  }

  items.forEach((opp) => {
    const item = document.createElement("article");
    item.className = "opportunity-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHTML(opp.title)}</strong>
        <p class="meta">${escapeHTML(opp.product)} · ${formatMoney(opp.amount)}</p>
      </div>
      <span class="stage-chip ${opp.stage}">${stageLabels[opp.stage]}</span>
    `;
    els.opportunityList.appendChild(item);
  });
}

function renderWeek() {
  const dates = getWeekDates(weekStart);
  els.weekTitle.textContent = `${formatShortDate(toISODate(dates[0]))} - ${formatShortDate(toISODate(dates[6]))}`;

  els.weekHead.innerHTML = dates
    .map((date, index) => {
      const iso = toISODate(date);
      return `
        <div class="week-day${iso === toISODate(new Date()) ? " today" : ""}">
          <span>${dayNames[index]}</span>
          <strong>${date.getDate()}</strong>
        </div>
      `;
    })
    .join("");

  els.timeAxis.innerHTML = hours.map((hour) => `<span>${formatHour(hour)}</span>`).join("");
  els.weekGrid.innerHTML = "";

  dates.forEach((date) => {
    const iso = toISODate(date);
    const lane = document.createElement("div");
    lane.className = "day-lane";

    hours.forEach((hour) => {
      const button = document.createElement("button");
      button.className = "slot-cell";
      button.type = "button";
      button.setAttribute("aria-label", `${formatLongDate(iso)} ${formatHour(hour)}`);
      button.addEventListener("click", () => openEditor(iso, `${String(hour).padStart(2, "0")}:00`));
      lane.appendChild(button);
    });

    state.events
      .filter((event) => event.date === iso)
      .sort((a, b) => a.start.localeCompare(b.start))
      .forEach((event) => lane.appendChild(renderCalendarEvent(event)));

    els.weekGrid.appendChild(lane);
  });

  if (shouldScrollToWorkHours) {
    requestAnimationFrame(() => {
      els.calendarScroll.scrollTop = 8 * 36;
      shouldScrollToWorkHours = false;
    });
  }
}

function renderCalendarEvent(event) {
  const companyItem = getCompany(event.companyId);
  const top = minutesFromStart(event.start);
  const duration = Math.max(30, minutesBetween(event.start, event.end));
  const card = document.createElement("button");
  card.className = `calendar-event ${event.type}`;
  card.type = "button";
  card.style.top = `${(top / 60) * 36}px`;
  card.style.height = `${(duration / 60) * 36 - 6}px`;
  card.innerHTML = `
    <span>${escapeHTML(event.title)}</span>
    <span class="event-time">${event.start} - ${event.end}</span>
    <span>${escapeHTML(companyItem?.name ?? "")}</span>
  `;
  card.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();
    openEditorForEvent(event.id);
  });
  return card;
}

function renderSelects() {
  const companyOptions = state.companies.map((companyItem) => `<option value="${companyItem.id}">${escapeHTML(companyItem.name)}</option>`).join("");
  els.eventCompany.innerHTML = companyOptions;
  els.eventCompany.value = selectedCompanyId;
  renderDependentSelects();
}

function renderDependentSelects() {
  const companyId = els.eventCompany.value || selectedCompanyId;
  const contacts = getCompanyContacts(companyId);
  const opps = state.opportunities.filter((opp) => opp.companyId === companyId);

  els.eventContact.innerHTML = contacts.map((person) => `<option value="${person.id}">${escapeHTML(person.name)}</option>`).join("");
  els.eventOpportunity.innerHTML = [
    `<option value="">Potansiyel iş yok</option>`,
    ...opps.map((opp) => `<option value="${opp.id}">${escapeHTML(opp.title)}</option>`),
  ].join("");
}

function openEditor(date, start) {
  const startDate = new Date(`${date}T${start}`);
  const end = toTime(addMinutes(startDate, 60));
  draftSlot = { date, start };
  selectedFiles = [];

  els.editorWidget.classList.add("open");
  els.editorEmpty.classList.add("hidden");
  els.eventForm.classList.remove("hidden");
  els.editorTitle.textContent = `${formatLongDate(date)} · ${start}`;
  els.eventEnd.value = end;
  els.eventTitle.value = "";
  els.eventDetail.value = "";
  els.filePreview.innerHTML = "";
  els.eventFiles.value = "";
  renderSelects();
}

function openEditorForEvent(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;

  draftSlot = { date: event.date, start: event.start, eventId };
  selectedFiles = [...(event.files ?? [])];
  selectedCompanyId = event.companyId;

  els.editorWidget.classList.add("open");
  els.editorEmpty.classList.add("hidden");
  els.eventForm.classList.remove("hidden");
  els.editorTitle.textContent = `${formatLongDate(event.date)} · ${event.start} düzenle`;
  els.eventTitle.value = event.title;
  els.eventDetail.value = event.detail ?? "";
  els.eventType.value = event.type;
  els.eventProduct.value = event.product ?? "LED tabela";
  els.eventEnd.value = event.end;
  els.eventFiles.value = "";
  renderSelects();
  els.eventCompany.value = event.companyId;
  renderDependentSelects();
  els.eventContact.value = event.contactId;
  const relatedOpp = state.opportunities.find((opp) => opp.title === event.opportunityTitle && opp.companyId === event.companyId);
  els.eventOpportunity.value = relatedOpp?.id ?? "";
  renderFilePreview();
}

function closeEditor() {
  draftSlot = null;
  selectedFiles = [];
  els.editorWidget.classList.remove("open");
  els.eventForm.classList.add("hidden");
  els.editorEmpty.classList.remove("hidden");
}

function wireEvents() {
  els.globalSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    const first = getFilteredCompanies()[0];
    if (first) selectedCompanyId = first.id;
    render();
  });

  els.todayBtn.addEventListener("click", () => {
    weekStart = startOfWeek(new Date());
    shouldScrollToWorkHours = true;
    render();
  });

  els.prevWeekBtn.addEventListener("click", () => {
    weekStart = addDays(weekStart, -7);
    shouldScrollToWorkHours = true;
    render();
  });

  els.nextWeekBtn.addEventListener("click", () => {
    weekStart = addDays(weekStart, 7);
    shouldScrollToWorkHours = true;
    render();
  });

  els.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    render();
  });

  els.closeEditorBtn.addEventListener("click", closeEditor);
  els.eventCompany.addEventListener("change", () => {
    selectedCompanyId = els.eventCompany.value;
    renderDependentSelects();
    renderCompanies();
    renderCompany();
    renderOpportunities();
  });

  els.eventFiles.addEventListener("change", () => {
    selectedFiles = Array.from(els.eventFiles.files).map((file) => file.name);
    renderFilePreview();
  });

  els.eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!draftSlot) return;

    const opportunityId = els.eventOpportunity.value;
    const relatedOpp = state.opportunities.find((opp) => opp.id === opportunityId);
    const payload = {
      date: draftSlot.date,
      start: draftSlot.start,
      end: els.eventEnd.value,
      type: els.eventType.value,
      companyId: els.eventCompany.value,
      contactId: els.eventContact.value,
      title: els.eventTitle.value.trim(),
      detail: els.eventDetail.value.trim(),
      product: els.eventProduct.value,
      opportunityTitle: relatedOpp?.title ?? "",
      files: selectedFiles,
    };

    if (draftSlot.eventId) {
      const existing = state.events.find((item) => item.id === draftSlot.eventId);
      Object.assign(existing, payload);
    } else {
      state.events.push({ id: createId(), ...payload });
    }

    saveState();
    closeEditor();
    render();
  });
}

function getFilteredCompanies() {
  const query = normalize(searchTerm);
  if (!query) return state.companies;

  return state.companies.filter((companyItem) => {
    const contacts = getCompanyContacts(companyItem.id).map((person) => `${person.name} ${person.titleLine} ${person.phone}`).join(" ");
    const opps = state.opportunities.filter((opp) => opp.companyId === companyItem.id).map((opp) => `${opp.title} ${opp.product}`).join(" ");
    const custom = Object.entries(companyItem.customFields).map(([key, value]) => `${key} ${value}`).join(" ");
    return normalize(`${companyItem.name} ${companyItem.segment} ${companyItem.taxNo} ${companyItem.city} ${contacts} ${opps} ${custom}`).includes(query);
  });
}

function getSelectedCompany() {
  return getCompany(selectedCompanyId) ?? state.companies[0];
}

function getCompany(id) {
  return state.companies.find((companyItem) => companyItem.id === id);
}

function getCompanyContacts(companyId) {
  return state.contacts.filter((person) => person.companyId === companyId);
}

function emptyState(message) {
  const node = els.emptyStateTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector("p").textContent = message;
  return node;
}

function renderFilePreview() {
  els.filePreview.innerHTML = selectedFiles.map((name) => `<span class="file-chip">${escapeHTML(name)}</span>`).join("");
}

function normalize(value) {
  return String(value).toLocaleLowerCase(locale).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getInitials(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase(locale);
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toISODate(date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMinutes(date, minutes) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function startOfWeek(date) {
  const copy = new Date(date);
  const diff = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function getWeekDates(start) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function formatShortDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function formatLongDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

function formatMoney(value) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function toTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function minutesFromStart(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesBetween(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return (endHour - startHour) * 60 + (endMinute - startMinute);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

wireEvents();
render();
