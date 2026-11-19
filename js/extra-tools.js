// খোলা সেকশন বন্ধ করার সহায়ক ফাংশন
function closeOtherBoxes(keepId) {
    var ids = ['donate-modal', 'notes', 'dictionary-section', 'quran-section', 'dua-section', 'qa-section', 'about-section', 'contact-section', 'prayer-section', 'stopwatch-section'];
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
            if (dt) dt.innerText = "📅 " + d.readable + " | 🌙 " + d.hijri.day + " " + d.hijri.month.en + ", " + d.hijri.year + " হিজরি";
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
