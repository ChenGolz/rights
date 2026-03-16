
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
   ? "1" : "0");
};
if (null === "1") document.body.classList.add("dark");
document.getElementById("printPlanBtn").onclick = () => window.print();

// letter generator
function buildLetter(){
  const name = document.getElementById("letterName").value || "________";
  const id = document.getElementById("letterId").value || "________";
  const relation = document.getElementById("letterRelation").value || "בן/בת משפחה";
  const deceased = document.getElementById("letterDeceased").value || "________";
  const date = document.getElementById("letterDate").value || "________";
  const target = document.getElementById("letterTarget").value || "________";
  const need = document.getElementById("letterNeed").value || "מידע על זכויות וסיוע";
  const phone = document.getElementById("letterPhone").value || "________";
  const email = document.getElementById("letterEmail").value || "________";
  const text = `לכבוד ${target},

שלום רב,

שמי ${name}, ת"ז ${id}, ואני ${relation} של ${deceased}, אשר נפטר/ה בתאריך ${date}.

אני פונה אליכם בבקשה לקבל ${need}, וכן מידע נוסף על הזכויות, המסמכים והצעדים הבאים שעשויים להיות רלוונטיים עבורי ועבור משפחתי.

אשמח לקבל הכוונה להמשך טיפול.

בברכה,
${name}
טלפון: ${phone}
אימייל: ${email}`;
  document.getElementById("letterOutput").value = text;
}
document.getElementById("generateLetter").onclick = buildLetter;
document.getElementById("copyLetter").onclick = async () => {
  const out = document.getElementById("letterOutput");
  if (!out.value) buildLetter();
  await navigator.clipboard.writeText(out.value);
  const btn = document.getElementById("copyLetter");
  const old = btn.textContent;
  btn.textContent = "הועתק";
  setTimeout(() => btn.textContent = old, 2000);
};
document.getElementById("printLetter").onclick = () => {
  if (!document.getElementById("letterOutput").value) buildLetter();
  const printBlock = document.getElementById("printLetterBlock");
  printBlock.innerText = document.getElementById("letterOutput").value;
  window.print();
};

// benefits timeline
document.getElementById("buildTracker").onclick = () => {
  const track = document.getElementById("trackerTrack").value;
  const start = document.getElementById("trackerStart").value;
  const out = document.getElementById("trackerOutput");
  if (!start){ out.innerHTML = "<div class='timeline-item'>נא להזין תאריך התחלה.</div>"; return; }
  const base = new Date(start);
  const plus = days => { const d = new Date(base); d.setDate(d.getDate()+days); return d; };
  const fmt = d => d.toLocaleDateString('he-IL');
  const items = track === "משרד הביטחון"
    ? [
      ["בדיקת פתיחת תיק והכרה", plus(7)],
      ["בדיקת טיפול רגשי וליווי משפחתי", plus(30)],
      ["בדיקת זכויות לימודים / סיוע כלכלי", plus(180)],
      ["בדיקת חלונות זמן שיכולים לפוג", plus(365)]
    ]
    : [
      ["בדיקת פתיחת תיק והכרה", plus(7)],
      ["בדיקת מענק ראשוני והחזרים", plus(30)],
      ["בדיקת טיפול רגשי / סל סיוע", plus(180)],
      ["בדיקת זכויות שעלולות לפוג", plus(365)]
    ];
  out.innerHTML = items.map(([label, d]) => `<div class="timeline-item"><strong>${label}:</strong> ${fmt(d)}</div>`).join("");
};
document.getElementById("clearTracker").onclick = () => {
  document.getElementById("trackerStart").value = "";
  document.getElementById("trackerOutput").innerHTML = "";
};

// Leaflet map
let map;
function initMap(){
  if (!window.L) return;
  map = L.map('helpMap').setView([31.8, 34.95], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  mapPoints.forEach(p => {
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    marker.bindPopup(`<strong>${p.name}</strong><br>${p.type}<br>${p.address || ""}<br><small>כתובת מתוך מקור רשמי; מיקום המפה הוא להמחשה.</small>`);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initMap();
});

// breathe tool (modal + inline share same logic)
function setupBreather(circleId, statusId, startId, stopId){
  const circle = document.getElementById(circleId);
  const status = document.getElementById(statusId);
  let interval = null;
  const cycle = [["שאיפה","inhale"],["החזקה","hold"],["נשיפה","exhale"],["החזקה","hold"]];
  function setPhase(phase){ circle.className = "breathe-circle " + phase; }
  function stop(){
    if (interval) clearInterval(interval);
    interval = null;
    setPhase("");
    status.textContent = "מוכנים להתחיל";
  }
  function start(){
    stop();
    let i = 0; let rounds = 4;
    function nextPhase(){
      if (rounds <= 0){ stop(); status.textContent = "סיימתם דקה של נשימה."; return; }
      const [label, phase] = cycle[i];
      status.textContent = label + " — 4 שניות";
      setPhase(phase);
      i = (i + 1) % cycle.length;
      if (i === 0) rounds -= 1;
    }
    nextPhase();
    interval = setInterval(nextPhase, 4000);
  }
  document.getElementById(startId).onclick = start;
  document.getElementById(stopId).onclick = stop;
  return {start, stop};
}
const modalBreather = setupBreather("breatheCircle", "breatheStatus", "startBreathe", "stopBreathe");
setupBreather("breatheCircleInline", "breatheStatusInline", "startBreatheInline", "stopBreatheInline");

const modal = document.getElementById("breatheModal");
document.getElementById("openBreatheTop").onclick = () => modal.classList.remove("hidden");
document.getElementById("closeBreathe").onclick = () => { modal.classList.add("hidden"); modalBreather.stop(); };

// candle
function updateCandleUI(){
  const until = Number(null || "0");
  const candle = document.getElementById("candle");
  const status = document.getElementById("candleStatus");
  if (!until || Date.now() > until){
    localStorage.removeItem("candle_until");
    candle.classList.remove("lit");
    status.textContent = "הנר כבוי.";
    return;
  }
  candle.classList.add("lit");
  status.textContent = "הנר דולק בדפדפן שלכם ל‑24 שעות.";
}
document.getElementById("lightCandle").onclick = () => {
   + 24*60*60*1000));
  updateCandleUI();
};
document.getElementById("clearCandle").onclick = () => {
  localStorage.removeItem("candle_until");
  updateCandleUI();
};
updateCandleUI();


// validation + persistence
const letterFieldIds = ["letterName","letterId","letterDeceased","letterDate","letterPhone","letterEmail"];
letterFieldIds.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const saved = null;
  if (saved) el.value = saved;
  el.addEventListener("input", () => );
});
["letterRelation","letterTarget","letterNeed","trackerTrack","trackerStart"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const saved = null;
  if (saved) el.value = saved;
  el.addEventListener("change", () => );
});

const originalBuildLetter = buildLetter;
buildLetter = function(){
  const dateVal = document.getElementById("letterDate").value;
  if (dateVal && new Date(dateVal) > new Date()){
    alert("נא להזין תאריך עבר תקין.");
    return;
  }
  originalBuildLetter();
}

const originalTrackerHandler = document.getElementById("buildTracker").onclick;
document.getElementById("buildTracker").onclick = () => {
  const start = document.getElementById("trackerStart").value;
  if (start && new Date(start) > new Date()){
    alert("נא להזין תאריך עבר תקין.");
    return;
  }
  originalTrackerHandler();
};

// accessibility: modal focus
const breatheModal = document.getElementById("breatheModal");
const closeBreatheBtn = document.getElementById("closeBreathe");
document.getElementById("openBreatheTop").addEventListener("click", () => {
  setTimeout(() => closeBreatheBtn.focus(), 0);
});
closeBreatheBtn.setAttribute("aria-label","סגירת חלון הנשימה");

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const ld = document.getElementById("letterDate");
  const ts = document.getElementById("trackerStart");
  if (ld) ld.max = today;
  if (ts) ts.max = today;
});


function setFieldError(id, msg){
  const el = document.getElementById(id + "Error");
  if (el) el.textContent = msg || "";
}
function isFutureDate(value){
  return value && new Date(value) > new Date();
}

// override validations to be inline
document.getElementById("generateLetter").addEventListener("click", () => {
  const dateVal = document.getElementById("letterDate").value;
  setFieldError("letterDate", "");
  if (isFutureDate(dateVal)){
    setFieldError("letterDate", "תאריך לא יכול להיות בעתיד.");
  }
}, true);

document.getElementById("buildTracker").addEventListener("click", () => {
  const dateVal = document.getElementById("trackerStart").value;
  setFieldError("trackerStart", "");
  if (isFutureDate(dateVal)){
    setFieldError("trackerStart", "תאריך לא יכול להיות בעתיד.");
  }
}, true);

// friendly validation replacing alert behavior
const oldBuildLetterV15 = buildLetter;
buildLetter = function(){
  const dateVal = document.getElementById("letterDate").value;
  setFieldError("letterDate", "");
  if (isFutureDate(dateVal)) return;
  oldBuildLetterV15();
};

const oldTrackerBuildV15 = document.getElementById("buildTracker").onclick;
document.getElementById("buildTracker").onclick = () => {
  const start = document.getElementById("trackerStart").value;
  setFieldError("trackerStart", "");
  if (isFutureDate(start)) return;
  oldTrackerBuildV15();
};

// smart timeline
function calculateDates(deathDate) {
  const d = new Date(deathDate);
  const shivaEnd = new Date(d); shivaEnd.setDate(d.getDate() + 7);
  const thirtyDays = new Date(d); thirtyDays.setDate(d.getDate() + 30);
  const elevenMonths = new Date(d); elevenMonths.setMonth(d.getMonth() + 11);
  const oneYear = new Date(d); oneYear.setFullYear(d.getFullYear() + 1);
  return {
      shiva: shivaEnd.toLocaleDateString('he-IL'),
      shloshim: thirtyDays.toLocaleDateString('he-IL'),
      elevenMonths: elevenMonths.toLocaleDateString('he-IL'),
      year: oneYear.toLocaleDateString('he-IL')
  };
}
const smartDeathDate = document.getElementById("smartDeathDate");
const savedSmartDate = null;
if (savedSmartDate) smartDeathDate.value = savedSmartDate;
smartDeathDate.addEventListener("change", ()=> );

document.getElementById("buildSmartTimeline").onclick = () => {
  const val = smartDeathDate.value;
  setFieldError("smartDeathDate", "");
  if (!val) return;
  if (isFutureDate(val)){
    setFieldError("smartDeathDate", "תאריך לא יכול להיות בעתיד.");
    return;
  }
  const out = document.getElementById("smartTimelineOutput");
  const dates = calculateDates(val);
  out.innerHTML = `
    <div class="timeline-item"><strong>סיום השבעה:</strong> ${dates.shiva}</div>
    <div class="timeline-item"><strong>שלושים:</strong> ${dates.shloshim}</div>
    <div class="timeline-item"><strong>י״א חודש:</strong> ${dates.elevenMonths}</div>
    <div class="timeline-item"><strong>אזכרת שנה:</strong> ${dates.year}</div>
  `;
};
document.getElementById("clearSmartTimeline").onclick = () => {
  smartDeathDate.value = "";
  document.getElementById("smartTimelineOutput").innerHTML = "";
  localStorage.removeItem("persist_smartDeathDate");
};

// vCard contacts
function downloadVCard(name, phone){
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${phone}
END:VCARD`;
  const blob = new Blob([vcard], {type: "text/vcard;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
document.querySelectorAll(".save-contact-btn").forEach(btn => {
  btn.addEventListener("click", () => downloadVCard(btn.dataset.name, btn.dataset.phone));
});

// private journal
const journal = document.getElementById("privateJournal");
const journalStatus = document.getElementById("journalStatus");
const savedJournal = null;
if (savedJournal) journal.value = savedJournal;
document.getElementById("saveJournalBtn").onclick = () => {
  
  journalStatus.textContent = "נשמר רק בדפדפן שלך.";
};
document.getElementById("clearJournalBtn").onclick = () => {
  journal.value = "";
  localStorage.removeItem("privateJournal");
  journalStatus.textContent = "נמחק מהדפדפן.";
};

// auto dark mode suggestion
document.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  if (hour >= 19 && !null && !document.body.classList.contains("dark")){
    const should = confirm("השעה מאוחרת. לעבור למצב לילה כדי להקל על העיניים?");
    
    if (should){
      document.body.classList.add("dark");
      
    }
  }
});

// put text inside breath circles
function attachBreathInnerText(startId, stopId, innerId, statusId){
  const inner = document.getElementById(innerId);
  const status = document.getElementById(statusId);
  const origStart = document.getElementById(startId).onclick;
  const origStop = document.getElementById(stopId).onclick;
  if (origStart){
    document.getElementById(startId).onclick = () => {
      origStart();
      const observer = new MutationObserver(() => {
        const t = status.textContent.split("—")[0].trim() || "נשימה";
        inner.textContent = t;
      });
      observer.observe(status, {childList:true, characterData:true, subtree:true});
      document.getElementById(stopId)._observer = observer;
    };
  }
  document.getElementById(stopId).onclick = () => {
    if (document.getElementById(stopId)._observer) document.getElementById(stopId)._observer.disconnect();
    inner.textContent = "נשימה";
    origStop && origStop();
  };
}
attachBreathInnerText("startBreathe", "stopBreathe", "breatheInnerText", "breatheStatus");
attachBreathInnerText("startBreatheInline", "stopBreatheInline", "breatheInnerTextInline", "breatheStatusInline");


document.getElementById("downloadPdfBtn").onclick = () => {
  if (!document.getElementById("letterOutput").value) buildLetter();
  const wrapper = document.createElement("div");
  wrapper.style.padding = "32px";
  wrapper.style.fontFamily = "Arial, sans-serif";
  wrapper.style.direction = "rtl";
  wrapper.style.lineHeight = "1.8";
  wrapper.innerText = document.getElementById("letterOutput").value;
  html2pdf().set({
    margin: 10,
    filename: "letter.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }).from(wrapper).save();
};


function setError(id, message){
  const el = document.getElementById(id + "Error");
  if (el) el.textContent = message || "";
}
function isFutureDateValue(v){
  if (!v) return false;
  const d = new Date(v);
  const now = new Date();
  d.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return d > now;
}

// make max dates current
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  ["letterDate","trackerStart","smartDeathDate"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.max = today;
  });
});

// inline validation for letter date
const letterDateEl = document.getElementById("letterDate");
if (letterDateEl){
  letterDateEl.addEventListener("input", () => {
    setError("letterDate", isFutureDateValue(letterDateEl.value) ? "נא להזין תאריך מהעבר." : "");
  });
}

// preserve / sync date into smart timeline
const smartDateEl = document.getElementById("smartDeathDate");
if (smartDateEl){
  const saved = null;
  if (saved) smartDateEl.value = saved;
  smartDateEl.addEventListener("input", () => {
    
    setError("smartDeathDate", isFutureDateValue(smartDateEl.value) ? "נא להזין תאריך מהעבר." : "");
  });
}
if (letterDateEl && smartDateEl){
  letterDateEl.addEventListener("change", function(e){
    if (e.target.value && !smartDateEl.value) {
      smartDateEl.value = e.target.value;
      
    } else if (e.target.value) {
      smartDateEl.value = e.target.value;
      
    }
    if (e.target.value && !isFutureDateValue(e.target.value)) {
      buildSmartTimelineFromDate(e.target.value);
    }
  });
}

// override letter generation validation if needed
const originalGenerateLetterHandler = document.getElementById("generateLetter").onclick;
document.getElementById("generateLetter").onclick = () => {
  setError("letterDate", "");
  if (isFutureDateValue(letterDateEl.value)) {
    setError("letterDate", "נא להזין תאריך מהעבר.");
    return;
  }
  originalGenerateLetterHandler && originalGenerateLetterHandler();
};

// tracker validation without alerts
const trackerStartEl = document.getElementById("trackerStart");
const oldTrackerBtnHandler = document.getElementById("buildTracker").onclick;
document.getElementById("buildTracker").onclick = () => {
  setError("trackerStart", "");
  if (isFutureDateValue(trackerStartEl.value)) {
    setError("trackerStart", "נא להזין תאריך מהעבר.");
    return;
  }
  oldTrackerBtnHandler && oldTrackerBtnHandler();
};

// smart timeline
function calculateDates(deathDate) {
  const d = new Date(deathDate);
  const shiva = new Date(d); shiva.setDate(d.getDate() + 7);
  const shloshim = new Date(d); shloshim.setDate(d.getDate() + 30);
  const elevenMonths = new Date(d); elevenMonths.setMonth(d.getMonth() + 11);
  const oneYear = new Date(d); oneYear.setFullYear(d.getFullYear() + 1);
  return {
    shiva: shiva.toLocaleDateString('he-IL'),
    shloshim: shloshim.toLocaleDateString('he-IL'),
    elevenMonths: elevenMonths.toLocaleDateString('he-IL'),
    year: oneYear.toLocaleDateString('he-IL'),
    yearDate: oneYear
  };
}
function buildSmartTimelineFromDate(value){
  const out = document.getElementById("smartTimelineOutput");
  const dates = calculateDates(value);
  out.innerHTML = `
    <div class="timeline-item"><strong>סיום השבעה:</strong> ${dates.shiva}</div>
    <div class="timeline-item"><strong>שלושים:</strong> ${dates.shloshim}</div>
    <div class="timeline-item"><strong>י״א חודש:</strong> ${dates.elevenMonths}</div>
    <div class="timeline-item"><strong>אזכרת שנה:</strong> ${dates.year}</div>
  `;
}
document.getElementById("buildSmartTimeline").onclick = () => {
  const value = smartDateEl.value;
  setError("smartDeathDate", "");
  if (!value) return;
  if (isFutureDateValue(value)) {
    setError("smartDeathDate", "נא להזין תאריך מהעבר.");
    return;
  }
  buildSmartTimelineFromDate(value);
};
document.getElementById("clearSmartTimeline").onclick = () => {
  smartDateEl.value = "";
  localStorage.removeItem("persist_smartDeathDate");
  document.getElementById("smartTimelineOutput").innerHTML = "";
  setError("smartDeathDate", "");
};

function generateGoogleCalendarLink(deathDate) {
  const memorialDate = new Date(deathDate);
  memorialDate.setFullYear(memorialDate.getFullYear() + 1);
  const start = memorialDate.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0,15) + "Z";
  const endDate = new Date(memorialDate);
  endDate.setHours(endDate.getHours() + 1);
  const end = endDate.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0,15) + "Z";
  const title = encodeURIComponent("אזכרת שנה ליקירנו");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
}
document.getElementById("addMemorialCalendarBtn").onclick = () => {
  const value = smartDateEl.value || letterDateEl.value;
  setError("smartDeathDate", "");
  if (!value) {
    setError("smartDeathDate", "נא להזין תאריך קודם.");
    return;
  }
  if (isFutureDateValue(value)) {
    setError("smartDeathDate", "נא להזין תאריך מהעבר.");
    return;
  }
  window.open(generateGoogleCalendarLink(value), "_blank");
};

// map geolocation
function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
document.addEventListener("DOMContentLoaded", () => {
  const locateBtn = document.getElementById("locateMeBtn");
  const mapStatus = document.getElementById("mapStatus");
  if (locateBtn) {
    locateBtn.addEventListener("click", () => {
      mapStatus.textContent = "";
      mapStatus.className = "note";
      if (!navigator.geolocation) {
        mapStatus.textContent = "הדפדפן לא תומך באיתור מיקום.";
        mapStatus.classList.add("map-status-error");
        return;
      }
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        if (window.map) {
          map.setView([userLat, userLng], 10);
          if (window._userMarker) map.removeLayer(window._userMarker);
          window._userMarker = L.marker([userLat, userLng]).addTo(map).bindPopup("מצא מרכז קרוב אליי");
        }
        const nearest = mapPoints
          .map(p => ({...p, distance: haversineKm(userLat, userLng, p.lat, p.lng)}))
          .sort((a,b) => a.distance - b.distance)[0];
        if (nearest) {
          mapStatus.textContent = `מתוך הנקודות שכבר הוזנו במפה, הקרוב ביותר הוא: ${nearest.name} (${nearest.distance.toFixed(1)} ק״מ)`;
          mapStatus.classList.add("map-status-ok");
        }
      }, () => {
        mapStatus.textContent = "לא הצלחנו לקבל גישה למיקום.";
        mapStatus.classList.add("map-status-error");
      });
    });
  }
});

// first 72h checklist persistence
document.querySelectorAll("[data-checklist]").forEach(box => {
  const key = box.dataset.checklist;
  box.checked = null === "true";
  box.addEventListener("change", () => ));
});

// true PDF download for generated letter
const pdfBtn = document.getElementById("downloadPdfBtn");
if (pdfBtn) {
  pdfBtn.addEventListener("click", () => {
    if (!document.getElementById("letterOutput").value && typeof buildLetter === "function") buildLetter();
    const wrapper = document.createElement("div");
    wrapper.style.padding = "32px";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.direction = "rtl";
    wrapper.style.lineHeight = "1.8";
    wrapper.innerText = document.getElementById("letterOutput").value || "";
    html2pdf().set({
      margin: 10,
      filename: "letter.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(wrapper).save();
  });
}


// quick bereavement-type filters
document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("quickFilterStatus");
  document.querySelectorAll(".quick-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.quick;
      document.querySelectorAll(".quick-filter-btn").forEach(b => {
        b.classList.remove("btn-primary");
        b.classList.add("btn-secondary");
      });
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary");

      document.querySelectorAll(".quick-target").forEach(sec => {
        const kinds = (sec.dataset.kind || "").split(" ");
        const show = kind === "all" || kinds.includes(kind) || kinds.includes("all");
        sec.classList.toggle("hidden-by-filter", !show);
      });

      if (status){
        status.textContent = kind === "all"
          ? "מציג את כל התוכן."
          : kind === "military"
            ? "מציג כעת בעיקר תוכן רלוונטי לשכול צבאי / כוחות הביטחון."
            : kind === "terror"
              ? "מציג כעת בעיקר תוכן רלוונטי לנפגעי איבה / טרור."
              : "מציג כעת בעיקר תוכן רלוונטי לשכול אזרחי / פלילי / פתאומי.";
      }
    });
  });
});

// PWA service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

// improved geolocation button feedback
document.addEventListener("DOMContentLoaded",()=>{
  const geoBtn = document.getElementById("locateMeBtn");
  if(!geoBtn) return;

  geoBtn.addEventListener("click",()=>{
    geoBtn.textContent = "מאתר מיקום... ⏳";
    geoBtn.disabled = true;

    navigator.geolocation.getCurrentPosition((pos)=>{
      geoBtn.textContent = "מצא מרכז קרוב אליי";
      geoBtn.disabled = false;
    },()=>{
      geoBtn.textContent = "שגיאה באיתור מיקום";
      geoBtn.disabled = false;
    });
  });
});

document.addEventListener("DOMContentLoaded",()=>{
 const btn=document.getElementById("shareSiteBtn");
 if(!btn) return;
 btn.onclick=()=>{
   const url=window.location.href;
   const text=encodeURIComponent("מצאתי אתר שעוזר למשפחות שכולות להתמודד עם הבירוקרטיה: "+url);
   window.open("https://wa.me/?text="+text,"_blank");
 };
});

document.addEventListener("DOMContentLoaded",()=>{
const fb=document.getElementById("floatingBreathe");
if(!fb) return;
fb.onclick=()=>{
 const el=document.getElementById("breatheSection")||document.getElementById("breathe");
 if(el) el.scrollIntoView({behavior:"smooth"});
};
});

document.addEventListener("DOMContentLoaded",()=>{
 const geoBtn=document.getElementById("locateMeBtn");
 if(!geoBtn) return;

 geoBtn.addEventListener("click",()=>{
  geoBtn.textContent="מאתר מיקום... ⏳";
  geoBtn.disabled=true;

  navigator.geolocation.getCurrentPosition(()=>{
    geoBtn.textContent="מצא מרכז קרוב אליי";
    geoBtn.disabled=false;
  },()=>{
    geoBtn.textContent="שגיאה באיתור מיקום";
    geoBtn.disabled=false;
  });
 });
});


document.addEventListener("DOMContentLoaded",()=>{

const mailBtn=document.getElementById("generateMailBtn");
const output=document.getElementById("letterOutput");

if(mailBtn && output){

mailBtn.onclick=()=>{

let text=output.value || "שלום, אני מבקש/ת מידע וסיוע בנוגע לזכויות למשפחה שכולה.";
let subject=encodeURIComponent("בקשה למידע וסיוע למשפחה שכולה");
let body=encodeURIComponent(text);

window.location.href=`mailto:?subject=${subject}&body=${body}`;

};

}

});

document.addEventListener("DOMContentLoaded",()=>{

const gen=document.getElementById("generateLetter");
const output=document.getElementById("letterOutput");

if(!gen || !output) return;

gen.onclick=()=>{

const name=document.getElementById("letterName")?.value || "";
const deceased=document.getElementById("letterDeceased")?.value || "";

let text="לכבוד הגורם המטפל,\n\n";

if(name) text+="שמי "+name+".\n";

text+="אני פונה לקבלת מידע וסיוע בנוגע לזכויות למשפחה שכולה.\n";

if(deceased) text+="מדובר במקרה של "+deceased+".\n";

text+="\nאודה להכוונה לגבי הזכויות והשלבים הבאים.\n\nבתודה.";

output.value=text;

};

});
