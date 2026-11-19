// ১. ওয়েবসাইট লোড হওয়ার সাথে সাথে ডেটা আনবে, কিন্তু নোটগুলো শুরুতে লুকানো থাকবে
document.addEventListener("DOMContentLoaded", function() {
    fetch('data/data.json')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            window.allData = data;
            if (document.getElementById('whatsapp-btn')) {
                document.getElementById('whatsapp-btn').href = data.live_classes.whatsapp_link;
            }
            if (document.getElementById('meet-btn')) {
                document.getElementById('meet-btn').href = data.live_classes.google_meet_link;
            }
        })
        .catch(function(err) { console.log("JSON load error:", err); });
});

// খোলা থাকা সব সেকশন একসাথে বন্ধ করার সহায়ক ফাংশন
function closeAllSections(exceptId) {
    var allSectionIds = [
        'donate-modal',
        'notes',
        'dictionary-section',
        'quran-section',
        'dua-section',
        'qa-section',
        'about-section',
        'contact-section',
        'prayer-section',
        'stopwatch-section'
    ];

    allSectionIds.forEach(function(id) {
        if (id !== exceptId) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        }
    });
}

// ২. রেগুলার বা এক্সট্রা নোট বাটনে ক্লিক করলে নোট দেখানোর ও বন্ধ করার ফাংশন
var currentNoteType = "";

function filterNotes(type) {
    var notesSection = document.getElementById('notes');
    var container = document.getElementById('notes-container');
    var title = document.getElementById('section-title');
    if (!notesSection || !container || !window.allData) return;

    if (notesSection.style.display === 'block' && currentNoteType === type) {
        notesSection.style.display = 'none';
        currentNoteType = "";
        return;
    }

    currentNoteType = type;
    closeAllSections('notes');
    notesSection.style.display = 'block';
    container.innerHTML = "";
    
    var notes = [];
    if (type === 'regular') {
        title.innerText = "রেগুলার ক্লাস নোটসমূহ";
        notes = window.allData.regular_notes;
    } else {
        title.innerText = "অতিরিক্ত (Extra) ক্লাস নোটসমূহ";
        notes = window.allData.extra_notes;
    }
    
    notes.forEach(function(note) {
        var card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = '<h3>' + note.title + '</h3>' +
                         '<a href="' + note.link + '" target="_blank" class="view-btn">নোট দেখুন (PDF)</a>';
        container.appendChild(card);
    });

    notesSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ৩. ডিকশনারি বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleDictionary() {
    var dictSection = document.getElementById('dictionary-section');
    if (!dictSection) return;
    if (dictSection.style.display === 'block') {
        dictSection.style.display = 'none';
    } else {
        closeAllSections('dictionary-section');
        dictSection.style.display = 'block';
        document.getElementById('arabic-input').focus();
    }
}

// কুরআন বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleQuran() {
    var quranSection = document.getElementById('quran-section');
    if (!quranSection) return;
    if (quranSection.style.display === 'block') {
        quranSection.style.display = 'none';
    } else {
        closeAllSections('quran-section');
        quranSection.style.display = 'block';
    }
}

// দোআ ও যিকির বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleDua() {
    var duaSection = document.getElementById('dua-section');
    if (!duaSection) return;
    if (duaSection.style.display === 'block') {
        duaSection.style.display = 'none';
    } else {
        closeAllSections('dua-section');
        duaSection.style.display = 'block';
    }
}

var typingTimer;

// ৪. টাইপ করার সাথে সাথে অটো কাজ করা এবং ক্লিয়ার বাটন দেখানোর ফাংশন
function autoSearchArabic() {
    clearTimeout(typingTimer);
    var inputField = document.getElementById('arabic-input');
    var clearBtn = document.getElementById('clear-btn');
    var word = inputField.value.trim();
    var resultDiv = document.getElementById('dict-result');

    if (clearBtn) {
        clearBtn.style.display = inputField.value.length > 0 ? "block" : "none";
    }

    if (!word) {
        resultDiv.innerHTML = "";
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    typingTimer = setTimeout(function() {
        searchArabicWord();
    }, 500);
}

// ৫. ক্লিয়ার (X) বাটনে ক্লিক করলে বক্স ও ফলাফল মুছে ফেলার ফাংশন
function clearArabicInput() {
    var inputField = document.getElementById('arabic-input');
    var clearBtn = document.getElementById('clear-btn');
    var resultDiv = document.getElementById('dict-result');

    inputField.value = "";
    resultDiv.innerHTML = "";
    if (clearBtn) clearBtn.style.display = "none";
    inputField.focus();
}

// ৬. নিজস্ব বিশেষ শব্দের তালিকা
var customDictionary = {
    "تَلْقَفُ": { bn: "গিলে ফেলা / লুফে নেওয়া", en: "swallows / devours", pos: "ক্রিয়া (Verb)" },
    "تَلۡقَفُ": { bn: "গিলে ফেলা / লুফে নেওয়া", en: "swallows / devours", pos: "ক্রিয়া (Verb)" },
    "تلقف": { bn: "গিলে ফেলা / লুফে নেওয়া", en: "swallows / devours", pos: "ক্রিয়া (Verb)" },
    "عَصَاكَ": { bn: "তোমার লাঠি", en: "your staff / stick", pos: "বিশেষ্য (Noun)" },
    "عصاك": { bn: "তোমার লাঠি", en: "your staff / stick", pos: "বিশেষ্য (Noun)" },
    "يَأْفِكُونَ": { bn: "তারা মিথ্যা রচনা করে / ভেল্কিবাজি করে", en: "they falsify / invent", pos: "ক্রিয়া (Verb)" },
    "يَأۡفِكُونَ": { bn: "তারা মিথ্যা রচনা করে / ভেল্কিবাজি করে", en: "they falsify / invent", pos: "ক্রিয়া (Verb)" },
    "مَا يَأْفِكُونَ": { bn: "তারা যা মিথ্যা রচনা করছে", en: "what they falsify", pos: "বাক্যাংশ (Phrase)" },
    "مَا يَأۡفِكُونَ": { bn: "তারা যা মিথ্যা রচনা করছে", en: "what they falsify", pos: "বাক্যাংশ (Phrase)" }
};

// ৭. আরবী থেকে নির্ভুল বাংলা ও ইংরেজি অর্থ বের করার মূল ফাংশন
async function searchArabicWord() {
    var rawWord = document.getElementById('arabic-input').value.trim();
    var resultDiv = document.getElementById('dict-result');
    var inputField = document.getElementById('arabic-input');
    if (!rawWord) return;

    var isBangla = /[\u0980-\u09FF]/.test(rawWord);

    if (inputField) {
        inputField.style.direction = isBangla ? "ltr" : "rtl";
        inputField.style.textAlign = isBangla ? "left" : "right";
    }

    // ১. গুগল ট্রান্সলেট থেকে সরাসরি অনুবাদ (লিংক ভেঙে লেখা হয়েছে যাতে কপি করলে নষ্ট না হয়)
    async function fetchGoogleDirect(sl, tl, text) {
        try {
            var gDomain = ["https:/", "://googleapis.com", "translate_a", "single"].join("/");
            var gUrl = gDomain + "?client=gtx&sl=" + sl + "&tl=" + tl + "&dt=t&q=" + encodeURIComponent(text);
            var res = await fetch(gUrl);
            if (res.ok) {
                var data = await res.json();
                var textOut = "";
                if (Array.isArray(data)) {
                    var block = data.shift();
                    if (Array.isArray(block)) {
                        block.forEach(function(item) {
                            if (Array.isArray(item)) {
                                var piece = item.shift();
                                if (typeof piece === "string") textOut += piece;
                            }
                        });
                    }
                }
                if (textOut && textOut.toLowerCase() !== text.toLowerCase()) {
                    return textOut;
                }
            }
        } catch (e) {}
        return "";
    }

    // ২. ব্যাকআপ API (MyMemory - শুধুমাত্র ইংরেজি মাধ্যমের জন্য)
    async function fetchMyMemory(sl, tl, text) {
        try {
            var mDomain = ["https:/", "api.mymemory.translated.net", "get"].join("/");
            var mUrl = mDomain + "?q=" + encodeURIComponent(text) + "&langpair=" + sl + "|" + tl;
            var mRes = await fetch(mUrl);
            var mData = await mRes.json();
            if (mData && mData.responseData && mData.responseData.translatedText) {
                var resText = mData.responseData.translatedText;
                if (resText && resText.toLowerCase() !== text.toLowerCase()) {
                    return resText;
                }
            }
        } catch (e2) {}
        return "";
    }

    // বাংলা থেকে আরবী ও ইংরেজি অর্থ বের করা
    if (isBangla) {
        resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>আরবী অর্থ খোঁজা হচ্ছে...</span>";
        
        // প্রথমে গুগল থেকে সরাসরি বাংলা -> আরবী ও ইংরেজি নেবে
        var arText = await fetchGoogleDirect("bn", "ar", rawWord);
        var enText = await fetchGoogleDirect("bn", "en", rawWord);

        // গুগল কাজ না করলে ব্যাকআপ হিসেবে আগে ইংরেজি (Water/Milk) বের করে তারপর আরবী করবে
        if (!enText) {
            enText = await fetchMyMemory("bn", "en", rawWord);
        }
        if (!arText && enText) {
            var cleanEn = enText.trim();
            var queryEn = cleanEn.indexOf(" ") === -1 ? "The " + cleanEn.toLowerCase() : cleanEn;
            arText = await fetchMyMemory("en", "ar", queryEn);
        }

        if (arText) {
            var html = '<div style="display: block; margin-bottom: 8px;">আরবী অর্থ: <span style="color:#d35400; font-size:28px; font-weight:bold;">' + arText + '</span></div>';
            if (enText) {
                html += '<div style="display: block; font-size:17px; color:#1e8449;">ইংরেজি অর্থ: <strong>' + enText + '</strong></div>';
            }
            resultDiv.innerHTML = html;
        } else {
            resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>আরবী অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
        }
        return;
    }

    // নিজস্ব বিশেষ শব্দের তালিকা
    if (typeof customDictionary !== "undefined" && customDictionary.hasOwnProperty(rawWord)) {
        var item = customDictionary[rawWord];
        resultDiv.innerHTML = '<div style="display: block; margin-bottom: 8px;">বাংলা অর্থ: <span style="color:#d35400; font-size:26px; font-weight:bold;">' + item.bn + '</span></div>' +
            '<div style="display: block; font-size:17px; color:#1e8449; margin-bottom: 5px;">ইংরেজি অর্থ: <strong>' + item.en + '</strong></div>' +
            '<div style="display: block; font-size:15px; color:#555555;">পদ প্রকরণ: <strong>' + item.pos + '</strong></div>';
        return;
    }

    // আরবী থেকে বাংলা ও ইংরেজি অর্থ বের করা
    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>সঠিক অর্থ খোঁজা হচ্ছে...</span>";
    var enFromAr = await fetchGoogleDirect("ar", "en", rawWord);
    if (!enFromAr) {
        enFromAr = await fetchMyMemory("ar", "en", rawWord);
    }

    var enForBangla = enFromAr;
    if (enFromAr) {
        var cEn = enFromAr.trim();
        if (cEn.toLowerCase() === "books") {
            enForBangla = "many books";
        } else if (cEn.toLowerCase().slice(-1) === "s" && cEn.toLowerCase().slice(-2) !== "ss" && cEn.indexOf(" ") === -1) {
            enForBangla = "multiple " + cEn;
        }
    }

    var bnFromAr = "";
    if (enForBangla) {
        bnFromAr = await fetchGoogleDirect("en", "bn", enForBangla);
        if (!bnFromAr) {
            bnFromAr = await fetchMyMemory("en", "bn", enForBangla);
        }
    }

    if (bnFromAr) {
        var arHtml = '<div style="display: block; margin-bottom: 8px;">বাংলা অর্থ: <span style="color:#d35400; font-size:26px; font-weight:bold;">' + bnFromAr + '</span></div>';
        if (enFromAr) {
            arHtml += '<div style="display: block; font-size:17px; color:#1e8449;">ইংরেজি অর্থ: <strong>' + enFromAr + '</strong></div>';
        }
        resultDiv.innerHTML = arHtml;
    } else {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, ইন্টারনেট চেক করুন।</span>";
    }
}


// Contact সেকশন খোলা এবং বন্ধ করার ফাংশন
function toggleContact() {
var contactSection = document.getElementById('contact-section');
if (!contactSection) return;
if (contactSection.style.display === 'block') {
contactSection.style.display = 'none';
} else {
closeAllSections('contact-section');
contactSection.style.display = 'block';
contactSection.scrollIntoView({ behavior: 'smooth' });
}
}
// ইমেইলে ক্লিক করলে ঠিকানা কপি করার ফাংশন
function copyEmail(event) {
var email = "quranerpakhi@protonmail.com";
navigator.clipboard.writeText(email).then(function() {
var btn = document.getElementById('email-copy-btn');
var originalText = btn.innerText;
btn.innerText = "✓ ইমেইল কপি হয়েছে!";
btn.style.backgroundColor = "#27ae60";
btn.style.color = "#ffffff";
setTimeout(function() {
btn.innerText = originalText;
btn.style.backgroundColor = "";
btn.style.color = "";
}, 2500);
});
}
// প্রশ্ন ও উত্তর সেকশন খোলা এবং গুগল শিট থেকে উত্তরসহ প্রশ্ন লোড করা
function toggleQA() {
var qaSection = document.getElementById('qa-section');
if (!qaSection) return;
if (qaSection.style.display === 'block') {
qaSection.style.display = 'none';
} else {
closeAllSections('qa-section');
qaSection.style.display = 'block';
loadQAFromSheet();
}
}
async function loadQAFromSheet() {
    var container = document.getElementById('qa-list-container');
    
    // কপি করার সময় লিংক যেন নষ্ট না হয় সেজন্য নিরাপদভাবে তৈরি করা হলো
    var sheetPath = "/spreadsheets/d/e/2PACX-1vQ39VRDr-0qn2eLHOBvr2iG1jLcsE--KIgXyWiQCptoB-6_n7uls1oYPrZkyVfbwVlrUzOb1u23tl2n/pub";
    var sheetUrl = new URL(sheetPath, "https://" + "docs." + "google." + "com");
    sheetUrl.searchParams.set("gid", "652661096");
    sheetUrl.searchParams.set("single", "true");
    sheetUrl.searchParams.set("output", "csv");

    try {
        var response = await fetch(sheetUrl.toString());
        var csvText = await response.text();
        
        function parseCSVLine(text) {
            var result = [];
            var current = "";
            var inQuotes = false;

            for (var i = 0; i < text.length; i++) {
                var char = text.charAt(i);
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        }

        var rows = csvText.split(/\r?\n/).slice(1);
        var htmlContent = "";
        var count = 0;

        rows.reverse().forEach(function(row) {
            if (!row.trim()) return;
            
            var cols = parseCSVLine(row);
            var studentName = cols.at(1) || "শিক্ষার্থী";
            var question = cols.at(2) || "";
            var answer = cols.at(3) || "";

            if (question && answer) {
                count++;
                htmlContent += '<div class="qa-card">' +
                    '<div class="qa-question">প্রশ্ন: ' + question + '</div>' +
                    '<div class="qa-meta">প্রশ্নকারী: ' + studentName + '</div>' +
                    '<div class="qa-answer"><strong>উত্তর:</strong> ' + answer + '</div>' +
                '</div>';
            }
        });

        if (count > 0) {
            container.innerHTML = htmlContent;
        } else {
            container.innerHTML = "<p style='text-align:center; color:#666;'>এখনো কোনো প্রশ্নোত্তর প্রকাশিত হয়নি। প্রথম প্রশ্নটি আপনি করুন!</p>";
        }
    } catch (error) {
        container.innerHTML = "<p style='text-align:center; color:red;'>প্রশ্নোত্তর লোড করতে সমস্যা হচ্ছে।</p>";
    }
}

// About Us সেকশন খোলা এবং বন্ধ করার ফাংশন
function toggleAbout() {
var aboutSection = document.getElementById('about-section');
if (!aboutSection) return;
if (aboutSection.style.display === 'block') {
aboutSection.style.display = 'none';
} else {
closeAllSections('about-section');
aboutSection.style.display = 'block';
aboutSection.scrollIntoView({ behavior: 'smooth' });
}
}
// Donate বাটনে ক্লিক করলে খুলবে, আবার ক্লিক করলে বন্ধ হবে
function openDonateModal() {
var modal = document.getElementById('donate-modal');
if (!modal) return;
if (modal.style.display === 'block') {
modal.style.display = 'none';
} else {
closeAllSections('donate-modal');
modal.style.display = 'block';
modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
}
function closeDonateModal() {
var modal = document.getElementById('donate-modal');
if (modal) modal.style.display = 'none';
}
// Payment Method ট্যাব পরিবর্তন করার ফাংশন
function switchPaymentTab(method) {
var bkashTab = document.getElementById('tab-bkash');
var bankTab = document.getElementById('tab-bank');
var bkashCheck = document.getElementById('check-bkash');
var bankCheck = document.getElementById('check-bank');
var bkashContent = document.getElementById('content-bkash');
var bankContent = document.getElementById('content-bank');
if (method === 'bkash') {
bkashTab.classList.add('active');
bankTab.classList.remove('active');
bkashCheck.style.display = 'flex';
bankCheck.style.display = 'none';
bkashContent.style.display = 'block';
bankContent.style.display = 'none';
} else {
bankTab.classList.add('active');
bkashTab.classList.remove('active');
bankCheck.style.display = 'flex';
bkashCheck.style.display = 'none';
bankContent.style.display = 'block';
bkashContent.style.display = 'none';
}
}
// নম্বর বা অ্যাকাউন্ট কপি করার ফাংশন
function copyText(elementId, btnElement) {
var textToCopy = document.getElementById(elementId).innerText.trim();
navigator.clipboard.writeText(textToCopy).then(function() {
var originalText = btnElement.innerText;
btnElement.innerText = "✓ কপি হয়েছে";
btnElement.style.backgroundColor = "#27ae60";
btnElement.style.color = "#ffffff";
setTimeout(function() {
btnElement.innerText = originalText;
btnElement.style.backgroundColor = "";
btnElement.style.color = "";
}, 2000);
});
}
// নামাজের সময়সূচি সেকশন খোলা ও বন্ধ করার ফাংশন
function togglePrayerTimes() {
var prayerSection = document.getElementById('prayer-section');
if (!prayerSection) return;
if (prayerSection.style.display === 'block') {
prayerSection.style.display = 'none';
} else {
closeAllSections('prayer-section');
prayerSection.style.display = 'block';
var citySelect = document.getElementById('city-select');
var selectedCity = citySelect ? citySelect.value : 'Dhaka';
loadPrayerTimes(selectedCity);
prayerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
}
// ২৪ ঘণ্টার সময়কে ১২ ঘণ্টার (AM/PM) ফরম্যাটে রূপান্তর
function formatTime12Hour(time24) {
    if (!time24) return "";
    var cleanTime = time24.split(" ").shift();
    var parts = cleanTime.split(":");
    var hours = parseInt(parts.shift(), 10);
    var minutes = parts.shift();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return hours + ":" + minutes + " " + ampm;
}
// Aladhan API থেকে লাইভ নামাজ, সূর্যোদয়, সেহরি ও ইফতারের সময় আনা
async function loadPrayerTimes(city) {
    var container = document.getElementById('prayer-cards-container');
    var specialBar = document.getElementById('sehri-iftar-bar');
    var dateDisplay = document.getElementById('prayer-date-display');

    if (!container) return;
    container.innerHTML = "<p style='text-align:center; color:#16a085; grid-column: 1 / -1;'>সময়সূচি আপডেট হচ্ছে...</p>";

    try {
        var apiUrl = new URL("/v1/timingsByCity", "https://" + "api." + "aladhan." + "com");
        apiUrl.searchParams.set("city", city);
        apiUrl.searchParams.set("country", "Bangladesh");
        apiUrl.searchParams.set("method", "1");
        var response = await fetch(apiUrl.toString());

        var result = await response.json();

        if (result && result.data) {
            var timings = result.data.timings;
            var dateInfo = result.data.date;

            if (dateDisplay) {
                dateDisplay.innerText = "📅 " + dateInfo.readable + " | 🌙 " + dateInfo.hijri.day + " " + dateInfo.hijri.month.en + ", " + dateInfo.hijri.year + " হিজরি";
            }

            if (specialBar) {
                specialBar.innerHTML = 
                    '<div class="special-time-card"><span>🌙 সেহরির শেষ সময়</span><strong>' + formatTime12Hour(timings.Imsak) + '</strong></div>' +
                    '<div class="special-time-card"><span>🌅 সূর্যোদয় (Sunrise)</span><strong>' + formatTime12Hour(timings.Sunrise) + '</strong></div>' +
                    '<div class="special-time-card"><span>🌇 ইফতারের সময়</span><strong>' + formatTime12Hour(timings.Maghrib) + '</strong></div>';
            }

            var prayers = [
                { name: "ফজর (Fajr)", time: timings.Fajr, icon: "🌌" },
                { name: "যোহর (Dhuhr)", time: timings.Dhuhr, icon: "☀️" },
                { name: "আসর (Asr)", time: timings.Asr, icon: "🌤️" },
                { name: "মাগরিব (Maghrib)", time: timings.Maghrib, icon: "🌇" },
                { name: "ইশা (Isha)", time: timings.Isha, icon: "🌃" }
            ];

            var cardsHtml = "";
            prayers.forEach(function(p) {
                cardsHtml += '<div class="prayer-card">' +
                    '<div class="prayer-icon">' + p.icon + '</div>' +
                    '<div class="prayer-name">' + p.name + '</div>' +
                    '<div class="prayer-time">' + formatTime12Hour(p.time) + '</div>' +
                '</div>';
            });

            container.innerHTML = cardsHtml;
        }
    } catch (error) {
        container.innerHTML = "<p style='text-align:center; color:red; grid-column: 1 / -1;'>এরর: " + error.message + "</p>";
    }
}
// স্টপওয়াচ ও টাইমার ভেরিয়েবলসমূহ
var swMode = 'stopwatch';
var swRunning = false;
var swInterval = null;
var swElapsedMs = 0;
var timerRemainingMs = 0;
var swLastTick = 0;
var lapCounter = 0;

function toggleStopwatch() {
    var swSection = document.getElementById('stopwatch-section');
    if (!swSection) return;

    if (swSection.style.display === 'block') {
        swSection.style.display = 'none';
    } else {
        if (typeof closeAllSections === 'function') {
            closeAllSections('stopwatch-section');
        }
        swSection.style.display = 'block';
        swSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function switchSwMode(mode) {
    resetSw();
    swMode = mode;

    var tabSw = document.getElementById('sw-tab-stopwatch');
    var tabTm = document.getElementById('sw-tab-timer');
    var timerSetup = document.getElementById('timer-setup-area');
    var lapBtn = document.getElementById('sw-lap-btn');

    if (mode === 'stopwatch') {
        tabSw.classList.add('active');
        tabTm.classList.remove('active');
        timerSetup.style.display = 'none';
        lapBtn.style.display = 'inline-block';
    } else {
        tabTm.classList.add('active');
        tabSw.classList.remove('active');
        timerSetup.style.display = 'flex';
        lapBtn.style.display = 'none';
    }
}

function updateSwDisplay(totalMs) {
    if (totalMs < 0) totalMs = 0;
    var totalSeconds = Math.floor(totalMs / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var centiseconds = Math.floor((totalMs % 1000) / 10);

    document.getElementById('sw-min').innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById('sw-sec').innerText = seconds < 10 ? "0" + seconds : seconds;
    document.getElementById('sw-ms').innerText = "." + (centiseconds < 10 ? "0" + centiseconds : centiseconds);
}

function setTimerDuration() {
    var minVal = parseInt(document.getElementById('timer-min-input').value, 10) || 0;
    var secVal = parseInt(document.getElementById('timer-sec-input').value, 10) || 0;
    timerRemainingMs = (minVal * 60 + secVal) * 1000;
    updateSwDisplay(timerRemainingMs);
}

function startPauseSw() {
    var startBtn = document.getElementById('sw-start-btn');

    if (!swRunning) {
        if (swMode === 'timer' && timerRemainingMs <= 0) {
            setTimerDuration();
            if (timerRemainingMs <= 0) {
                alert("দয়া করে মিনিট বা সেকেন্ড সেট করুন!");
                return;
            }
        }
        swRunning = true;
        startBtn.innerText = "Pause";
        swLastTick = Date.now();

        swInterval = setInterval(function() {
            var now = Date.now();
            var delta = now - swLastTick;
            swLastTick = now;

            if (swMode === 'stopwatch') {
                swElapsedMs += delta;
                updateSwDisplay(swElapsedMs);
            } else {
                timerRemainingMs -= delta;
                if (timerRemainingMs <= 0) {
                    timerRemainingMs = 0;
                    updateSwDisplay(0);
                    clearInterval(swInterval);
                    swRunning = false;
                    startBtn.innerText = "Start";
                    playAlarmBeep();
                } else {
                    updateSwDisplay(timerRemainingMs);
                }
            }
        }, 30);
    } else {
        swRunning = false;
        clearInterval(swInterval);
        startBtn.innerText = "Continue";
    }
}

function resetSw() {
    swRunning = false;
    clearInterval(swInterval);
    swElapsedMs = 0;
    timerRemainingMs = 0;
    lapCounter = 0;
    updateSwDisplay(0);
    document.getElementById('sw-start-btn').innerText = "Start";
    document.getElementById('sw-laps-list').innerHTML = "";
}

function recordLap() {
    if (swMode !== 'stopwatch' || swElapsedMs === 0) return;
    lapCounter++;
    var min = document.getElementById('sw-min').innerText;
    var sec = document.getElementById('sw-sec').innerText;
    var ms = document.getElementById('sw-ms').innerText;

    var lapList = document.getElementById('sw-laps-list');
    var row = document.createElement('div');
    row.className = 'sw-lap-row';
    row.innerHTML = '<span>Lap ' + lapCounter + '</span><strong>' + min + ':' + sec + ms + '</strong>';
    lapList.insertBefore(row, lapList.firstChild);
}

// টাইমার শেষ হলে অ্যালার্ম বিপ সাউন্ড বাজানোর ফাংশন
function playAlarmBeep() {
    try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        var ctx = new AudioCtx();
        var count = 0;
        var beepTimer = setInterval(function() {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);

            count++;
            if (count >= 5) clearInterval(beepTimer);
        }, 400);
    } catch (e) {
        alert("⏰ সময় শেষ হয়েছে!");
    }
}
