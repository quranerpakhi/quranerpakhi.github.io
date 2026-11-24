// খোলা সেকশন বন্ধ করার সহায়ক ফাংশন
function closeOtherBoxes(keepId) {
    var ids = ['donate-modal', 'notes', 'dictionary-section', 'quran-section', 'dua-section', 'qa-section', 'about-section', 'contact-section', 'prayer-section', 'stopwatch-section', 'qibla-section', 'quiz-section'];
    ids.forEach(function(id) {
        if (id !== keepId) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        }
    });
}

// ১. প্রশ্ন ও উত্তর (Q&A) বাটন
function toggleQA() {
    var qa = document.getElementById('qa-section');
    if (!qa) return;
    if (qa.style.display === 'block') {
        qa.style.display = 'none';
    } else {
        closeOtherBoxes('qa-section');
        qa.style.display = 'block';
        qa.scrollIntoView({ behavior: 'smooth', block: 'start' });
        loadQAData();
    }
}

async function loadQAData() {
    var container = document.getElementById('qa-list-container');
    if (!container) return;
    var sheetPath = "/spreadsheets/d/e/2PACX-1vQ39VRDr-0qn2eLHOBvr2iG1jLcsE--KIgXyWiQCptoB-6_n7uls1oYPrZkyVfbwVlrUzOb1u23tl2n/pub";
    var url = new URL(sheetPath, "https://" + "docs." + "google." + "com");
    url.searchParams.set("gid", "652661096");
    url.searchParams.set("single", "true");
    url.searchParams.set("output", "csv");

    try {
        var res = await fetch(url.toString());
        var text = await res.text();
        var rows = text.split(/\r?\n/).slice(1);
        var html = "";
        rows.reverse().forEach(function(row) {
            if (!row.trim()) return;
            var cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            var name = (cols.at(1) || "শিক্ষার্থী").replace(/^"|"$/g, "");
            var q = (cols.at(2) || "").replace(/^"|"$/g, "");
            var a = (cols.at(3) || "").replace(/^"|"$/g, "");
            if (q && a) {
                html += '<div class="qa-card"><div class="qa-question">প্রশ্ন: ' + q + '</div><div class="qa-meta">প্রশ্নকারী: ' + name + '</div><div class="qa-answer"><strong>উত্তর:</strong> ' + a + '</div></div>';
            }
        });
        container.innerHTML = html || "<p style='text-align:center;'>এখনো কোনো প্রশ্নোত্তর প্রকাশিত হয়নি।</p>";
    } catch (e) {
        container.innerHTML = "<p style='text-align:center; color:red;'>প্রশ্নোত্তর লোড হতে সমস্যা হচ্ছে।</p>";
    }
}

// ২. নামাজের সময়সূচি বাটন
function togglePrayerTimes() {
    var pr = document.getElementById('prayer-section');
    if (!pr) return;
    if (pr.style.display === 'block') {
        pr.style.display = 'none';
    } else {
        closeOtherBoxes('prayer-section');
        pr.style.display = 'block';
        pr.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var city = document.getElementById('city-select') ? document.getElementById('city-select').value : 'Dhaka';
        loadPrayerTimes(city);
    }
}

function format12Hr(t24) {
    if (!t24) return "";
    var clean = t24.split(" ").shift();
    var p = clean.split(":");
    var h = parseInt(p.shift(), 10);
    var m = p.shift();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + ap;
}

// বাংলাদেশের সংশোধিত বাংলা পঞ্জিকা অনুযায়ী বাংলা তারিখ বের করার ফাংশন
function getBanglaDateString() {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1; // 1-12
    var year = today.getFullYear();

    var isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    var banglaMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
    var banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

    function toBnNum(num) {
        return num.toString().split("").map(function(d) {
            return banglaDigits.at(parseInt(d, 10)) || d;
        }).join("");
    }

    var banglaYear = (month < 4 || (month === 4 && day < 14)) ? year - 594 : year - 593;
    var bMonthIdx = 0;
    var bDay = 1;

    if ((month === 4 && day >= 14) || (month === 5 && day <= 14)) {
        bMonthIdx = 0; // বৈশাখ (৩১ দিন)
        bDay = (month === 4) ? day - 13 : day + 17;
    } else if ((month === 5 && day >= 15) || (month === 6 && day <= 14)) {
        bMonthIdx = 1; // জ্যৈষ্ঠ (৩১ দিন)
        bDay = (month === 5) ? day - 14 : day + 17;
    } else if ((month === 6 && day >= 15) || (month === 7 && day <= 15)) {
        bMonthIdx = 2; // আষাঢ় (৩১ দিন)
        bDay = (month === 6) ? day - 14 : day + 16;
    } else if ((month === 7 && day >= 16) || (month === 8 && day <= 15)) {
        bMonthIdx = 3; // শ্রাবণ (৩১ দিন)
        bDay = (month === 7) ? day - 15 : day + 16;
    } else if ((month === 8 && day >= 16) || (month === 9 && day <= 15)) {
        bMonthIdx = 4; // ভাদ্র (৩১ দিন)
        bDay = (month === 8) ? day - 15 : day + 16;
    } else if ((month === 9 && day >= 16) || (month === 10 && day <= 16)) {
        bMonthIdx = 5; // আশ্বিন (৩১ দিন)
        bDay = (month === 9) ? day - 15 : day + 15;
    } else if ((month === 10 && day >= 17) || (month === 11 && day <= 15)) {
        bMonthIdx = 6; // কার্তিক (৩০ দিন)
        bDay = (month === 10) ? day - 16 : day + 15;
    } else if ((month === 11 && day >= 16) || (month === 12 && day <= 15)) {
        bMonthIdx = 7; // অগ্রহায়ণ (৩০ দিন)
        bDay = (month === 11) ? day - 15 : day + 15;
    } else if ((month === 12 && day >= 16) || (month === 1 && day <= 14)) {
        bMonthIdx = 8; // পৌষ (৩০ দিন)
        bDay = (month === 12) ? day - 15 : day + 16;
    } else if ((month === 1 && day >= 15) || (month === 2 && day <= 13)) {
        bMonthIdx = 9; // মাঘ (৩০ দিন)
        bDay = (month === 1) ? day - 14 : day + 17;
    } else if ((month === 2 && day >= 14) || (month === 3 && day <= 14)) {
        bMonthIdx = 10; // ফাল্গুন (২৯/৩০ দিন)
        bDay = (month === 2) ? day - 13 : (isLeapYear ? day + 16 : day + 15);
    } else {
        bMonthIdx = 11; // চৈত্র (৩০ দিন)
        bDay = (month === 3) ? day - 14 : day + 17;
    }

    return toBnNum(bDay) + " " + banglaMonths.at(bMonthIdx) + ", " + toBnNum(banglaYear) + " বঙ্গাব্দ";
}

async function loadPrayerTimes(city) {
    var box = document.getElementById('prayer-cards-container');
    var bar = document.getElementById('sehri-iftar-bar');
    var dt = document.getElementById('prayer-date-display');
    if (!box) return;
    box.innerHTML = "<p style='text-align:center; color:#16a085; grid-column: 1/-1;'>সময়সূচি লোড হচ্ছে...</p>";

    try {
        var api = new URL("/v1/timingsByCity", "https://" + "api." + "aladhan." + "com");
        api.searchParams.set("city", city);
        api.searchParams.set("country", "Bangladesh");
        api.searchParams.set("method", "1");

        var res = await fetch(api.toString());
        var json = await res.json();
        if (json && json.data) {
            var t = json.data.timings;
            var d = json.data.date;
            var banglaDateText = getBanglaDateString();

            if (dt) {
                dt.innerText = "📅 " + d.readable + " | 🌙 " + d.hijri.day + " " + d.hijri.month.en + ", " + d.hijri.year + " হিজরি | 🇧🇩 " + banglaDateText;
            }
            if (bar) {
                bar.innerHTML = '<div class="special-time-card"><span>🌙 সেহরির শেষ সময়</span><strong>' + format12Hr(t.Imsak) + '</strong></div>' +
                                '<div class="special-time-card"><span>🌅 সূর্যোদয়</span><strong>' + format12Hr(t.Sunrise) + '</strong></div>' +
                                '<div class="special-time-card"><span>🌇 ইফতারের সময়</span><strong>' + format12Hr(t.Maghrib) + '</strong></div>';
            }
            var list = [
                { n: "ফজর (Fajr)", tm: t.Fajr, ic: "🌌" },
                { n: "যোহর (Dhuhr)", tm: t.Dhuhr, ic: "☀️" },
                { n: "আসর (Asr)", tm: t.Asr, ic: "🌤️" },
                { n: "মাগরিব (Maghrib)", tm: t.Maghrib, ic: "🌇" },
                { n: "ইশা (Isha)", tm: t.Isha, ic: "🌃" }
            ];
            var html = "";
            list.forEach(function(item) {
                html += '<div class="prayer-card"><div class="prayer-icon">' + item.ic + '</div><div class="prayer-name">' + item.n + '</div><div class="prayer-time">' + format12Hr(item.tm) + '</div></div>';
            });
            box.innerHTML = html;
        }
    } catch (e) {
        box.innerHTML = "<p style='text-align:center; color:red; grid-column: 1/-1;'>সময়সূচি লোড করতে সমস্যা হচ্ছে।</p>";
    }
}


// ৩. স্টপওয়াচ ও টাইমার বাটন
var swMode = 'stopwatch', swRun = false, swInt = null, swMs = 0, tmMs = 0, lastTick = 0, lapNo = 0;

function toggleStopwatch() {
    var sw = document.getElementById('stopwatch-section');
    if (!sw) return;
    if (sw.style.display === 'block') { sw.style.display = 'none'; }
    else { closeOtherBoxes('stopwatch-section'); sw.style.display = 'block'; sw.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

function switchSwMode(m) {
    resetSw();
    swMode = m;
    document.getElementById('sw-tab-stopwatch').classList.toggle('active', m === 'stopwatch');
    document.getElementById('sw-tab-timer').classList.toggle('active', m === 'timer');
    document.getElementById('timer-setup-area').style.display = m === 'timer' ? 'flex' : 'none';
    document.getElementById('sw-lap-btn').style.display = m === 'stopwatch' ? 'inline-block' : 'none';
}

function updateSwUI(ms) {
    if (ms < 0) ms = 0;
    var secTotal = Math.floor(ms / 1000);
    var m = Math.floor(secTotal / 60);
    var s = secTotal % 60;
    var cs = Math.floor((ms % 1000) / 10);
    document.getElementById('sw-min').innerText = m < 10 ? "0" + m : m;
    document.getElementById('sw-sec').innerText = s < 10 ? "0" + s : s;
    document.getElementById('sw-ms').innerText = "." + (cs < 10 ? "0" + cs : cs);
}

function setTimerDuration() {
    var m = parseInt(document.getElementById('timer-min-input').value, 10) || 0;
    var s = parseInt(document.getElementById('timer-sec-input').value, 10) || 0;
    tmMs = (m * 60 + s) * 1000;
    updateSwUI(tmMs);
}

function startPauseSw() {
    var btn = document.getElementById('sw-start-btn');
    if (!swRun) {
        if (swMode === 'timer' && tmMs <= 0) {
            setTimerDuration();
            if (tmMs <= 0) { alert("দয়া করে মিনিট বা সেকেন্ড সেট করুন!"); return; }
        }
        swRun = true;
        btn.innerText = "Pause";
        lastTick = Date.now();
        swInt = setInterval(function() {
            var now = Date.now();
            var d = now - lastTick;
            lastTick = now;
            if (swMode === 'stopwatch') { swMs += d; updateSwUI(swMs); }
            else {
                tmMs -= d;
                if (tmMs <= 0) { tmMs = 0; updateSwUI(0); clearInterval(swInt); swRun = false; btn.innerText = "Start"; playBeep(); }
                else { updateSwUI(tmMs); }
            }
        }, 30);
    } else {
        swRun = false; clearInterval(swInt); btn.innerText = "Continue";
    }
}

function resetSw() {
    swRun = false; clearInterval(swInt); swMs = 0; tmMs = 0; lapNo = 0; updateSwUI(0);
    document.getElementById('sw-start-btn').innerText = "Start";
    document.getElementById('sw-laps-list').innerHTML = "";
}

function recordLap() {
    if (swMode !== 'stopwatch' || swMs === 0) return;
    lapNo++;
    var row = document.createElement('div');
    row.className = 'sw-lap-row';
    row.innerHTML = '<span>Lap ' + lapNo + '</span><strong>' + document.getElementById('sw-min').innerText + ':' + document.getElementById('sw-sec').innerText + document.getElementById('sw-ms').innerText + '</strong>';
    var list = document.getElementById('sw-laps-list');
    list.insertBefore(row, list.firstChild);
}

function playBeep() {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var c = 0;
        var t = setInterval(function() {
            var osc = ctx.createOscillator(), g = ctx.createGain();
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            g.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.25);
            if (++c >= 5) clearInterval(t);
        }, 400);
    } catch (e) { alert("⏰ সময় শেষ হয়েছে!"); }
}
// ৪. ডোনেট (Donate) সেকশন ও পেমেন্ট ট্যাব পরিবর্তন
function openDonateModal() {
    var modal = document.getElementById('donate-modal');
    if (!modal) return;
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        closeOtherBoxes('donate-modal');
        modal.style.display = 'block';
        modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function closeDonateModal() {
    var modal = document.getElementById('donate-modal');
    if (modal) modal.style.display = 'none';
}

function switchPaymentTab(method) {
    var isBkash = method === 'bkash';
    var tabBkash = document.getElementById('tab-bkash');
    var tabBank = document.getElementById('tab-bank');
    var checkBkash = document.getElementById('check-bkash');
    var checkBank = document.getElementById('check-bank');
    var contentBkash = document.getElementById('content-bkash');
    var contentBank = document.getElementById('content-bank');

    if (tabBkash) tabBkash.classList.toggle('active', isBkash);
    if (tabBank) tabBank.classList.toggle('active', !isBkash);
    if (checkBkash) checkBkash.style.display = isBkash ? 'flex' : 'none';
    if (checkBank) checkBank.style.display = !isBkash ? 'flex' : 'none';
    if (contentBkash) contentBkash.style.display = isBkash ? 'block' : 'none';
    if (contentBank) contentBank.style.display = !isBkash ? 'block' : 'none';
}

function copyText(elementId, btnElement) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var text = el.innerText.trim();
    navigator.clipboard.writeText(text).then(function() {
        var orig = btnElement.innerText;
        btnElement.innerText = "✓ কপি হয়েছে";
        btnElement.style.backgroundColor = "#27ae60";
        btnElement.style.color = "#ffffff";
        setTimeout(function() {
            btnElement.innerText = orig;
            btnElement.style.backgroundColor = "";
            btnElement.style.color = "";
        }, 2000);
    });
}
// ৫. About Us এবং Contact বাটন সচল করা
function toggleAbout() {
    var about = document.getElementById('about-section');
    if (!about) return;
    if (about.style.display === 'block') {
        about.style.display = 'none';
    } else {
        closeOtherBoxes('about-section');
        about.style.display = 'block';
        about.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function toggleContact() {
    var contact = document.getElementById('contact-section');
    if (!contact) return;
    if (contact.style.display === 'block') {
        contact.style.display = 'none';
    } else {
        closeOtherBoxes('contact-section');
        contact.style.display = 'block';
        contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function copyEmail() {
    navigator.clipboard.writeText("quranerpakhi@protonmail.com").then(function() {
        var btn = document.getElementById('email-copy-btn');
        if (!btn) return;
        var orig = btn.innerText;
        btn.innerText = "✓ ইমেইল কপি হয়েছে!";
        btn.style.backgroundColor = "#27ae60";
        btn.style.color = "#ffffff";
        setTimeout(function() {
            btn.innerText = orig;
            btn.style.backgroundColor = "";
            btn.style.color = "";
        }, 2500);
    });
}
// ৬. আরবী ক্রিয়া রূপান্তর বা সরফ টেবিল (Qutrub + Apps Script API)
var SARF_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwE8Sp-n0ouvw_IE3m9nnyd_wE0--NLZvZYOmuQ21X7wOtx8nKsJKwhqTXodQEunV0O/exec";
var currentSarfData = null;

function toggleSarf() {
    var sarf = document.getElementById('sarf-section');
    if (!sarf) return;
    if (sarf.style.display === 'block') {
        sarf.style.display = 'none';
    } else {
        closeOtherBoxes('sarf-section');
        sarf.style.display = 'block';
        sarf.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!currentSarfData) {
            quickSarf('كَتَبَ');
        }
    }
}

function quickSarf(verb) {
    document.getElementById('sarf-root-input').value = verb;
    fetchSarfTable();
}

async function fetchSarfTable() {
    var verb = document.getElementById('sarf-root-input').value.trim();
    var area = document.getElementById('sarf-result-area');
    if (!verb) return;

    area.innerHTML = "<p style='text-align:center; color:#8e44ad; font-size:17px;'>⏳ বাব শনাক্ত করা হচ্ছে এবং সকল সিগাহ তৈরি হচ্ছে...</p>";

    try {
        var reqUrl = SARF_SCRIPT_URL + "?action=sarf&q=" + encodeURIComponent(verb);
        var res = await fetch(reqUrl);
        var data = await res.json();

        if (data && data.rows && data.rows.length > 0) {
            currentSarfData = data;
            renderSarfTabs('madi-mudari');
        } else {
            area.innerHTML = "<p style='color:red;'>ক্রিয়াপদটি বিশ্লেষণ করা যায়নি, আবার চেষ্টা করুন।</p>";
        }
    } catch (err) {
        area.innerHTML = "<p style='color:red;'>সার্ভারের সাথে সংযোগ হতে সমস্যা হচ্ছে, ইন্টারনেট চেক করুন।</p>";
    }
}

function renderSarfTabs(activeTab) {
    var area = document.getElementById('sarf-result-area');
    var d = currentSarfData;
    if (!d) return;

    var html = '<div class="sarf-meta-banner">' +
        '<strong>মূল ক্রিয়া:</strong> <span class="sarf-ar" style="font-size:22px;">' + d.verb + '</span> &nbsp;|&nbsp; ' +
        '<strong>অর্থ:</strong> ' + d.baseMeaningBn + ' &nbsp;|&nbsp; ' +
        '<strong>শনাক্তকৃত বাব:</strong> ' + d.baabName +
        '</div>';

    html += '<div class="sarf-tabs">' +
        '<button class="sarf-tab-btn ' + (activeTab === 'madi-mudari' ? 'active' : '') + '" onclick="renderSarfTabs(\'madi-mudari\')">মাদি ও মুদারে (অতীত ও বর্তমান)</button>' +
        '<button class="sarf-tab-btn ' + (activeTab === 'amr' ? 'active' : '') + '" onclick="renderSarfTabs(\'amr\')">আমর (আদেশসূচক ক্রিয়া)</button>' +
        '<button class="sarf-tab-btn ' + (activeTab === 'nahi' ? 'active' : '') + '" onclick="renderSarfTabs(\'nahi\')">নাহি (নিষেধসূচক ক্রিয়া)</button>' +
        '<button class="sarf-tab-btn ' + (activeTab === 'majhul' ? 'active' : '') + '" onclick="renderSarfTabs(\'majhul\')">মাজহুল (কর্মবাচ্য)</button>' +
        '</div>';

    html += '<div class="sarf-table-wrapper"><table class="sarf-table">';

    if (activeTab === 'madi-mudari') {
        html += '<thead><tr>' +
            '<th>সিগাহ (ব্যাকরণগত রূপ)</th>' +
            '<th>মাদি (অতীত কাল)</th>' +
            '<th>মাদি অর্থ</th>' +
            '<th>মুদারে (বর্তমান/ভবিষ্যৎ)</th>' +
            '<th>মুদারে অর্থ</th>' +
        '</tr></thead><tbody>';

        d.rows.forEach(function(r) {
            html += '<tr>' +
                '<td><strong>' + r.sigah + '</strong></td>' +
                '<td class="sarf-ar">' + r.madi + '</td>' +
                '<td style="color:#2c3e50; font-weight:500;">' + r.madiBn + '</td>' +
                '<td class="sarf-ar">' + r.mudari + '</td>' +
               '<td style="color:#1e8449; font-weight:500;">' + r.mudariBn + '</td>' +
            '</tr>';
        });
    } else if (activeTab === 'amr') {
        html += '<thead><tr><th>হাজির সিগাহ (আদেশ)</th><th>আমর (আদেশসূচক ক্রিয়া)</th><th>বাংলা অর্থ</th></tr></thead><tbody>';
        (d.amr || []).forEach(function(a) {
            html += '<tr><td><strong>' + a.sigah + '</strong></td><td class="sarf-ar" style="color:#b7950b;">' + a.word + '</td><td>' + a.bn + '</td></tr>';
        });
    } else if (activeTab === 'nahi') {
        html += '<thead><tr><th>সিগাহ (ব্যাকরণগত রূপ)</th><th>নাহি (নিষেধসূচক ক্রিয়া)</th><th>বাংলা অর্থ</th></tr></thead><tbody>';
        d.rows.forEach(function(r) {
            html += '<tr><td><strong>' + r.sigah + '</strong></td><td class="sarf-ar" style="color:#c0392b;">' + r.nahi + '</td><td>' + r.nahiBn + '</td></tr>';
        });
    } else if (activeTab === 'majhul') {
        html += '<thead><tr>' +
            '<th>সিগাহ (ব্যাকরণগত রূপ)</th>' +
            '<th>মাদি মাজহুল (অতীত)</th>' +
            '<th>মাদি মাজহুল অর্থ</th>' +
            '<th>মুদারে মাজহুল (বর্তমান/ভবিষ্যৎ)</th>' +
            '<th>মুদারে মাজহুল অর্থ</th>' +
        '</tr></thead><tbody>';

        d.rows.forEach(function(r) {
            html += '<tr>' +
                '<td><strong>' + r.sigah + '</strong></td>' +
                '<td class="sarf-ar" style="color:#1e8449;">' + r.madiMajhul + '</td>' +
                '<td style="color:#2c3e50; font-weight:500;">' + r.madiMajhulBn + '</td>' +
                '<td class="sarf-ar" style="color:#1e8449;">' + r.mudariMajhul + '</td>' +
                '<td style="color:#1e8449; font-weight:500;">' + r.mudariMajhulBn + '</td>' +
            '</tr>';
        });
    }

    html += '</tbody></table></div>';
    
    area.innerHTML = html;
}
// ৭. মডার্ন মিনিমালিস্ট কিবলা কম্পাস (Qibla Compass)
var qiblaBearing = 277.5; // ডিফল্ট ঢাকা, বাংলাদেশ
var qiblaVibrated = false;

function toggleQibla() {
    var sec = document.getElementById('qibla-section');
    if (!sec) return;
    if (sec.style.display === 'block') {
        sec.style.display = 'none';
    } else {
        closeOtherBoxes('qibla-section');
        sec.style.display = 'block';
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        initQiblaCompass();
    }
}

function toBanglaDigits(str) {
    var bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return str.toString().replace(/\d/g, function(d) { return bn.at(parseInt(d, 10)); });
}

// জিপিএস লোকেশন অনুযায়ী কাবা শরিফের (21.4225° N, 39.8262° E) সঠিক কোণ ও দূরত্ব নির্ণয়
function calculateQiblaFromCoords(lat, lon) {
    var kaabaLat = 21.422487 * Math.PI / 180;
    var kaabaLon = 39.826206 * Math.PI / 180;
    var userLat = lat * Math.PI / 180;
    var userLon = lon * Math.PI / 180;

    var dLon = kaabaLon - userLon;
    var y = Math.sin(dLon) * Math.cos(kaabaLat);
    var x = Math.cos(userLat) * Math.sin(kaabaLat) - Math.sin(userLat) * Math.cos(kaabaLat) * Math.cos(dLon);
    var bearing = Math.atan2(y, x) * 180 / Math.PI;
    qiblaBearing = (bearing + 360) % 360;

    // দূরত্ব নির্ণয় (Haversine formula)
    var R = 6371;
    var dLat = kaabaLat - userLat;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat) * Math.cos(kaabaLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distanceKm = Math.round(R * c);

    var pointerArm = document.getElementById('qibla-pointer-arm');
    if (pointerArm) {
        pointerArm.style.transform = "rotate(" + qiblaBearing + "deg)";
    }

    var angleEl = document.getElementById('qibla-angle-text');
    var distEl = document.getElementById('qibla-distance-text');
    if (angleEl) angleEl.innerText = toBanglaDigits(qiblaBearing.toFixed(1)) + "° (পশ্চিম)";
    if (distEl) distEl.innerText = toBanglaDigits(distanceKm.toLocaleString()) + " কি.মি.";
}

function initQiblaCompass() {
    // শুরুতে ডিফল্ট ঢাকা কোণ সেট করা
    calculateQiblaFromCoords(23.8103, 90.4125);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            calculateQiblaFromCoords(pos.coords.latitude, pos.coords.longitude);
            var status = document.getElementById('qibla-location-status');
            if (status) status.innerText = "✓ আপনার বর্তমান জিপিএস লোকেশন অনুযায়ী দিক নির্ধারিত হয়েছে";
        }, function() {
            var status = document.getElementById('qibla-location-status');
            if (status) status.innerText = "📍 ডিফল্ট লোকেশন (ঢাকা) অনুযায়ী দিক দেখানো হচ্ছে";
        });
    }

    startCompassListener();
}

function requestCompassPermission() {
    initQiblaCompass();
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(function(state) {
            if (state === "granted") {
                startCompassListener();
            }
        }).catch(console.error);
    }
}

function startCompassListener() {
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
}

function handleOrientation(event) {
    var heading = null;
    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading; // iOS
    } else if (event.alpha !== null) {
        heading = 360 - event.alpha; // Android
    }

    if (heading === null) return;

    var dial = document.getElementById('compass-dial');
    var ring = document.getElementById('compass-ring');
    var badge = document.getElementById('qibla-match-badge');

    if (dial) {
        dial.style.transform = "rotate(" + (-heading) + "deg)";
    }

    // কিবলার সাথে ফোনটি মিলেছে কি না তা যাচাই (±৪ ডিগ্রি সীমার মধ্যে)
    var diff = Math.abs(((heading - qiblaBearing + 540) % 360) - 180);
    if (diff <= 4) {
        if (ring) ring.classList.add('aligned');
        if (badge) {
            badge.classList.add('aligned');
            badge.innerText = "✓ মাশাআল্লাহ! আপনি এখন সঠিক কিবলামুখী আছেন";
        }
        if (!qiblaVibrated && navigator.vibrate) {
            navigator.vibrate(100);
            qiblaVibrated = true;
        }
    } else {
        if (ring) ring.classList.remove('aligned');
        if (badge) {
            badge.classList.remove('aligned');
            badge.innerText = "ফোনটি ঘুরিয়ে কাবা আইকনকে ওপরের তীরের সাথে মেলান";
            
        }
        qiblaVibrated = false;

        
    }
}
// ৮. লাইভ এমসিকিউ কুইজ (Google Sheet নিয়ন্ত্রিত)
var QUIZ_QUESTIONS_CSV = "https://google.com";
var QUIZ_CONTROL_CSV = "https://google.com";

var allQuizBank = [];
var activeQuizQuestions = [];
var userQuizAnswers = {};
var quizTimerInterval = null;
var quizSecondsLeft = 0;
var quizStudentName = "";
var quizSelectedCategory = "";
var quizIsSubmitted = false;

function toggleQuiz() {
    var sec = document.getElementById('quiz-section');
    if (!sec) return;
    if (sec.style.display === 'block') {
        sec.style.display = 'none';
    } else {
        closeOtherBoxes('quiz-section');
        sec.style.display = 'block';
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        initLiveQuizGate();
    }
}

function parseCsvRows(csvText) {
    var lines = csvText.split(/\r?\n/);
    var result = [];
    lines.forEach(function(line) {
        if (!line.trim()) return;
        var cols = [];
        var cur = "";
        var inQ = false;
        for (var i = 0; i < line.length; i++) {
            var ch = line.charAt(i);
            if (ch === '"') { inQ = !inQ; }
            else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; }
            else { cur += ch; }
        }
        cols.push(cur.trim());
        result.push(cols);
    });
    return result;
}

async function initLiveQuizGate() {
    var box = document.getElementById('quiz-main-container');
    if (!box) return;
    clearInterval(quizTimerInterval);
    box.innerHTML = "<p style='text-align:center; color:#e67e22; font-size:17px;'>⏳ লাইভ কুইজের অবস্থা যাচাই করা হচ্ছে...</p>";

    try {
        // ক্যাশ এড়াতে টাইমস্ট্যাম্প যোগ করা হলো যাতে ON/OFF সাথে সাথে কাজ করে
        var ctrlRes = await fetch(QUIZ_CONTROL_CSV + "&t=" + Date.now());
        var ctrlText = await ctrlRes.text();
        var ctrlRows = parseCsvRows(ctrlText);

        var quizStatus = "OFF";
        var questionLimit = 10;

        ctrlRows.forEach(function(r) {
            var key = (r.at(0) || "").toLowerCase();
            var val = (r.at(1) || "").trim();
            if (key === "status") quizStatus = val.toUpperCase();
            if (key === "questioncount") questionLimit = parseInt(val, 10) || 10;
        });

        // ক্লাস শুরু না হলে বা কুইজ OFF থাকলে লুকানো মেসেজ দেখাবে
        if (quizStatus !== "ON") {
            box.innerHTML = '<div class="quiz-setup-card">' +
                '<div style="font-size:42px; margin-bottom:10px;">⏳</div>' +
                '<h3 style="color:#2c3e50; margin-bottom:8px;">পরবর্তী লাইভ কুইজ এখনো শুরু হয়নি</h3>' +
                '<p style="color:#666666;">উস্তাদ/শিক্ষক ক্লাস চলাকালীন কুইজ চালু করলে এখানে পরীক্ষার প্রশ্ন চলে আসবে।</p>' +
                '<button onclick="initLiveQuizGate()" class="quiz-start-btn" style="margin-top:14px; background:#008080;">🔄 পুনরায় চেক করুন</button>' +
            '</div>';
            return;
        }

        // প্রশ্ন লোড করা
        var qRes = await fetch(QUIZ_QUESTIONS_CSV + "&t=" + Date.now());
        var qText = await qRes.text();
        var qRows = parseCsvRows(qText).slice(1);

        allQuizBank = [];
        var categories = [];

        qRows.forEach(function(r) {
            var cat = r.at(0) || "সাধারণ";
            var q = r.at(1) || "";
            var optA = r.at(2) || "";
            var optB = r.at(3) || "";
            var optC = r.at(4) || "";
            var optD = r.at(5) || "";
            var ans = (r.at(6) || "").toUpperCase();
            var exp = r.at(7) || "";

            if (q && optA && optB && ans) {
                allQuizBank.push({ category: cat, question: q, options: { A: optA, B: optB, C: optC, D: optD }, answer: ans, explanation: exp });
                if (categories.indexOf(cat) === -1) categories.push(cat);
            }
        });

        if (allQuizBank.length === 0) {
            box.innerHTML = "<p style='text-align:center; color:red;'>গুগল শিটে এখনো কোনো প্রশ্ন যোগ করা হয়নি।</p>";
            return;
        }

        var totalMinutes = Math.ceil((questionLimit * 30) / 60);
        var catOptionsHtml = '<option value="ALL">সকল বিষয় মিলিয়ে (Mix Quiz)</option>';
        categories.forEach(function(c) {
            catOptionsHtml += '<option value="' + c + '">' + c + '</option>';
        });

        box.innerHTML = '<div class="quiz-setup-card">' +
            '<span style="background:#d4efdf; color:#1e8449; padding:5px 14px; border-radius:20px; font-weight:bold; font-size:14px;">🟢 লাইভ কুইজ এখন চলছে!</span>' +
            '<h3 style="margin-top:12px; color:#2c3e50;">পরীক্ষার নিয়মাবলি</h3>' +
            '<p style="color:#555; font-size:15px;">মোট প্রশ্ন: <strong>' + questionLimit + 'টি</strong> | মোট সময়: <strong>' + totalMinutes + ' মিনিট</strong> (প্রতি প্রশ্নে ৩০ সেকেন্ড)<br>⚠️ একবার উত্তর সিলেক্ট করলে প্রশ্নটি লক হয়ে যাবে এবং পরিবর্তন করা যাবে না।</p>' +
            '<div class="quiz-input-group">' +
                '<input type="text" id="quiz-student-name" placeholder="আপনার পূর্ণ নাম লিখুন (যেমন: রাশেদ)">' +
                '<select id="quiz-category-select">' + catOptionsHtml + '</select>' +
                '<button onclick="startLiveQuiz(' + questionLimit + ')" class="quiz-start-btn">কুইজ শুরু করুন ▶</button>' +
            '</div>' +
        '</div>';

    } catch (e) {
        box.innerHTML = "<p style='text-align:center; color:red;'>কুইজ লোড করতে সমস্যা হচ্ছে, ইন্টারনেট সংযোগ চেক করুন।</p>";
    }
}

function startLiveQuiz(questionLimit) {
    var nameInput = document.getElementById('quiz-student-name').value.trim();
    if (!nameInput) {
        alert("দয়া করে কুইজ শুরু করার আগে আপনার নাম লিখুন!");
        return;
    }

    quizStudentName = nameInput;
    quizSelectedCategory = document.getElementById('quiz-category-select').value;
    userQuizAnswers = {};
    quizIsSubmitted = false;

    var filtered = quizSelectedCategory === "ALL" ? allQuizBank.slice() : allQuizBank.filter(function(item) { return item.category === quizSelectedCategory; });
    if (filtered.length === 0) filtered = allQuizBank.slice();

    // প্রশ্ন এলোমেলো (Shuffle) করে নির্ধারিত সংখ্যায় নেওয়া
    filtered.sort(function() { return 0.5 - Math.random(); });
    activeQuizQuestions = filtered.slice(0, questionLimit);

    // প্রতি প্রশ্নে ৩০ সেকেন্ড হিসেবে মোট সেকেন্ড নির্ধারণ
    quizSecondsLeft = activeQuizQuestions.length * 30;
    renderActiveQuizQuestions();
    startQuizCountdown();
}

function renderActiveQuizQuestions() {
    var box = document.getElementById('quiz-main-container');
    var html = '<div class="quiz-sticky-bar">' +
        '<span>👤 ' + quizStudentName + ' (' + (quizSelectedCategory === "ALL" ? "সকল বিষয়" : quizSelectedCategory) + ')</span>' +
        '<span class="quiz-timer-badge" id="quiz-timer-display">⏱️ 05:00</span>' +
    '</div>';

    activeQuizQuestions.forEach(function(qObj, idx) {
        html += '<div class="quiz-q-card" id="q-card-' + idx + '">' +
            '<div class="quiz-q-title">' + (idx + 1) + '. ' + qObj.question + '</div>' +
            '<div class="quiz-opt-list">';

        ["A", "B", "C", "D"].forEach(function(optKey) {
            if (qObj.options[optKey]) {
                html += '<button class="quiz-opt-btn" id="opt-' + idx + '-' + optKey + '" onclick="selectAndLockOption(' + idx + ', \'' + optKey + '\')">' +
                    '<strong>' + optKey + '.</strong> ' + qObj.options[optKey] +
                '</button>';
            }
        });

        html += '</div></div>';
    });

    html += '<div style="text-align:center; margin: 20px 0;">' +
        '<button onclick="finishAndGradeQuiz(false)" class="quiz-start-btn" style="background:#27ae60; font-size:18px;">✓ কুইজ জমা দিন (Submit)</button>' +
    '</div>';

    box.innerHTML = html;
    updateQuizTimerUI();
}

// সাইলেন্ট লকিং: উত্তর দেওয়ার সাথে সাথে প্রশ্নটি লক হবে, লাল/সবুজ দেখাবে না
function selectAndLockOption(qIndex, chosenOpt) {
    if (quizIsSubmitted || userQuizAnswers.hasOwnProperty(qIndex)) return;

    userQuizAnswers[qIndex] = chosenOpt;

    ["A", "B", "C", "D"].forEach(function(key) {
        var btn = document.getElementById("opt-" + qIndex + "-" + key);
        if (btn) {
            btn.disabled = true; // প্রশ্নটি লক হয়ে গেল
            if (key === chosenOpt) {
                btn.classList.add("silent-selected");
            }
        }
    });
}

function startQuizCountdown() {
    clearInterval(quizTimerInterval);
    quizTimerInterval = setInterval(function() {
        quizSecondsLeft--;
        updateQuizTimerUI();
        if (quizSecondsLeft <= 0) {
            clearInterval(quizTimerInterval);
            finishAndGradeQuiz(true); // সময় শেষ হলে অটো লক ও সাবমিট
        }
    }, 1000);
}

function updateQuizTimerUI() {
    var el = document.getElementById('quiz-timer-display');
    if (!el) return;
    var mins = Math.floor(quizSecondsLeft / 60);
    var secs = quizSecondsLeft % 60;
    el.innerText = "⏱️ " + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
}

// কুইজ শেষে অভিনন্দন কার্ড এবং সবুজ-লাল রঙ ও ব্যাখ্যাসহ রিভিউ
function finishAndGradeQuiz(isTimeUp) {
    if (quizIsSubmitted) return;
    quizIsSubmitted = true;
    clearInterval(quizTimerInterval);

    var score = 0;
    var total = activeQuizQuestions.length;

    activeQuizQuestions.forEach(function(qObj, idx) {
        if (userQuizAnswers[idx] === qObj.answer) {
            score++;
        }
    });

    var percent = Math.round((score / total) * 100);
    var greetingTitle = percent >= 80 ? "মাশাআল্লাহ, অসাধারণ ফলাফল!" : (percent >= 50 ? "আলহামদুলিল্লাহ, ভালো চেষ্টা!" : "বারাকাল্লাহু ফীক, আরও অনুশীলন করুন!");

    var box = document.getElementById('quiz-main-container');
    var html = '';

    if (isTimeUp) {html += '⏰ নির্ধারিত সময় শেষ হয়ে গেছে! আপনার উত্তরগুলো স্বয়ংক্রিয়ভাবে লক ও জমা নেওয়া হয়েছে।';
}
// হোয়াটসঅ্যাপে স্ক্রিনশট শেয়ার করার উপযোগী অভিনন্দন কার্ড
html += '' +
'🕌 কুরআনের পাখি — লাইভ কুইজ ফলাফল' +
'' + greetingTitle + '' +
'' + quizStudentName + '! আপনার স্কোর' +
'' + score + ' / ' + total + ' (' + percent + '%)' +
'বিষয়: ' + (quizSelectedCategory === "ALL" ? "সকল বিষয়" : quizSelectedCategory) + '' +
'📸 এই কার্ডটির স্ক্রিনশট নিয়ে হোয়াটসঅ্যাপ গ্রুপে শেয়ার করুন' +
'';
html += '📋 উত্তরপত্র ও ব্যাখ্যা (Review):';
activeQuizQuestions.forEach(function(qObj, idx) {
var userChoice = userQuizAnswers[idx] || "উত্তর দেওয়া হয়নি";
html += '' +
'' + (idx + 1) + '. ' + qObj.question + '' +
'';
["A", "B", "C", "D"].forEach(function(optKey) {
if (qObj.options[optKey]) {
var btnClass = "quiz-opt-btn";
var badgeText = "";
if (optKey === qObj.answer) {
btnClass += " review-correct";
badgeText = " ✅ (সঠিক উত্তর)";
} else if (optKey === userChoice && userChoice !== qObj.answer) {
btnClass += " review-wrong";
badgeText = " ❌ (আপনার উত্তর)";
}
html += '' +
'' + optKey + '. ' + qObj.options[optKey] + badgeText +
'';
}
});
html += '';
if (qObj.explanation) {
html += '💡 ব্যাখ্যা: ' + qObj.explanation + '';
}
html += '';
});
html += '' +
'🔄 হোমে ফিরে যান' +
'';
box.innerHTML = html;
box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
