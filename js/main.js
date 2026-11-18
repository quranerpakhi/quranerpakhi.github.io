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

    // ইনপুটটি বাংলা অক্ষর দিয়ে লেখা কি না তা চেক করা (Unicode range: \u0980-\u09FF)
    var isBangla = /[\u0980-\u09FF]/.test(rawWord);

    // বাংলা লিখলে লেখা বাম দিক থেকে, আরবী লিখলে ডান দিক থেকে দেখাবে
    if (inputField) {
        inputField.style.direction = isBangla ? "ltr" : "rtl";
        inputField.style.textAlign = isBangla ? "left" : "right";
    }

    // ১ম ধাপ: বাংলা থেকে আরবী ও ইংরেজি অর্থ বের করা
    if (isBangla) {
        resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>আরবী অর্থ খোঁজা হচ্ছে...</span>";
        try {
            var googleHost = "https://" + "translate." + "googleapis." + "com";

            // বাংলা থেকে আরবী (হরকতসহ)
            var arUrl = new URL("/translate_a/single", googleHost);
            arUrl.searchParams.set("client", "gtx");
            arUrl.searchParams.set("sl", "bn");
            arUrl.searchParams.set("tl", "ar");
            arUrl.searchParams.set("dt", "t");
            arUrl.searchParams.set("q", rawWord);

            // বাংলা থেকে ইংরেজি
            var enUrl = new URL("/translate_a/single", googleHost);
            enUrl.searchParams.set("client", "gtx");
            enUrl.searchParams.set("sl", "bn");
            enUrl.searchParams.set("tl", "en");
            enUrl.searchParams.set("dt", "t");
            enUrl.searchParams.set("q", rawWord);

            var responses = await Promise.all([
                fetch(arUrl.toString()),
                fetch(enUrl.toString())
            ]);

            var arData = await responses.at(0).json();
            var enData = await responses.at(1).json();

            var arabicResult = "";
            if (Array.isArray(arData) && Array.isArray(arData.at(0))) {
                arData.at(0).forEach(function(item) {
                    if (Array.isArray(item) && typeof item.at(0) === "string") {
                        arabicResult += item.at(0);
                    }
                });
            }

            var englishResult = "";
            if (Array.isArray(enData) && Array.isArray(enData.at(0))) {
                enData.at(0).forEach(function(item) {
                    if (Array.isArray(item) && typeof item.at(0) === "string") {
                        englishResult += item.at(0);
                    }
                });
            }

            if (arabicResult && arabicResult !== rawWord) {
                var bnOut = 'আরবী অর্থ: <span style="color:#d35400; font-size:28px; font-weight:bold;">' + arabicResult + '</span>';
                if (englishResult) {
                    bnOut += '<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>' + englishResult + '</strong></div>';
                }
                resultDiv.innerHTML = bnOut;
                return;
            } else {
                resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>আরবী অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
                return;
            }
        } catch (bnErr) {
            resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
            return;
        }
    }

    // ২য় ধাপ: নিজস্ব বিশেষ শব্দের তালিকায় আরবী শব্দটি খোঁজা
    if (customDictionary.hasOwnProperty(rawWord)) {
        var item = customDictionary[rawWord];
        resultDiv.innerHTML = 'বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">' + item.bn + '</span>' +
            '<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>' + item.en + '</strong></div>' +
            '<div style="font-size:14px; color:#555; margin-top:5px;">পদ প্রকরণ: <strong>' + item.pos + '</strong></div>';
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>সঠিক অর্থ খোঁজা হচ্ছে...</span>";

    var normalizedWord = rawWord
        .replace(/\u06E1/g, "\u0652")
        .replace(/[\u06D6-\u06E0\u06E2-\u06ED]/g, "");

    var stripAll = function(str) {
        return str
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
            .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
            .replace(/\u0649/g, "\u064A")
            .replace(/\u0629/g, "\u0647");
    };

    var cleanRoot = stripAll(normalizedWord);
    var wordBn = "";
    var wordEn = "";

    // ৩য় ধাপ: কুরআনিক শব্দ খোঁজা
    try {
        var alQuranUrl = new URL("/v1/search/" + encodeURIComponent(cleanRoot) + "/all/quran-simple-clean", "https://" + "api." + "alquran." + "cloud");
        var searchRes = await fetch(alQuranUrl.toString());
        var searchData = await searchRes.json();

        if (searchData && searchData.data && Array.isArray(searchData.data.matches) && searchData.data.matches.length > 0) {
            var firstMatch = searchData.data.matches.at(0);
            var surahNum = firstMatch.surah.number;
            var ayahNum = firstMatch.numberInSurah;

            var quranApiPath = new URL("/api/v4/verses/by_key/" + surahNum + ":" + ayahNum, "https://" + "api." + "quran." + "com");
            quranApiPath.searchParams.set("words", "true");
            quranApiPath.searchParams.set("word_fields", "text_imlaei_simple");

            var bnTarget = new URL(quranApiPath.toString());
            bnTarget.searchParams.set("language", "bn");

            var enTarget = new URL(quranApiPath.toString());
            enTarget.searchParams.set("language", "en");

            var proxyBase = "https://" + "corsproxy." + "io/?";
            var qResponses = await Promise.all([
                fetch(proxyBase + encodeURIComponent(bnTarget.toString())),
                fetch(proxyBase + encodeURIComponent(enTarget.toString()))
            ]);

            if (qResponses.at(0).ok && qResponses.at(1).ok) {
                var bnData = await qResponses.at(0).json();
                var enData = await qResponses.at(1).json();

                if (bnData && bnData.verse && Array.isArray(bnData.verse.words)) {
                    for (var i = 0; i < bnData.verse.words.length; i++) {
                        var w = bnData.verse.words.at(i);
                        if (w.char_type_name !== "word") continue;

                        if (stripAll(w.text_imlaei_simple || "") === cleanRoot) {
                            wordBn = (w.translation && w.translation.text) ? w.translation.text : "";
                            if (enData && enData.verse && Array.isArray(enData.verse.words)) {
                                var wEn = enData.verse.words.at(i);
                                wordEn = (wEn && wEn.translation && wEn.translation.text) ? wEn.translation.text : "";
                            }
                            break;
                        }
                    }
                }
            }
        }
    } catch (qErr) {
        console.log("Quran lookup skipped.");
    }

    if (wordBn && wordBn !== rawWord) {
        var qOut = 'বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">' + wordBn + '</span>';
        if (wordEn) {
            qOut += '<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>' + wordEn + '</strong></div>';
        }
        resultDiv.innerHTML = qOut;
        return;
    }

    // ৪র্থ ধাপ: সাধারণ আরবী থেকে বাংলা ও ইংরেজি অর্থ বের করা
    try {
        var googleHostAr = "https://" + "translate." + "googleapis." + "com";
        var isDefinitelyNoun = /[\u064B\u064C\u064D]/.test(normalizedWord) || normalizedWord.indexOf("\u0627\u0644") === 0;

        var checkUrl = new URL("/translate_a/single", googleHostAr);
        checkUrl.searchParams.set("client", "gtx");
        checkUrl.searchParams.set("sl", "ar");
        checkUrl.searchParams.set("tl", "en");
        checkUrl.searchParams.append("dt", "t");
        checkUrl.searchParams.append("dt", "bd");
        checkUrl.searchParams.set("q", normalizedWord);

        var checkRes = await fetch(checkUrl.toString());
        var checkData = await checkRes.json();

        var posTag = "";
        var isVerb = false;

        if (isDefinitelyNoun) {
            posTag = "বিশেষ্য (Noun)";
        } else if (Array.isArray(checkData) && Array.isArray(checkData.at(1))) {
            var firstCat = checkData.at(1).at(0);
            if (Array.isArray(firstCat)) {
                var rawPos = firstCat.at(0);
                if (rawPos === "verb") {
                    isVerb = true;
                    posTag = "ক্রিয়া (Verb)";
                } else if (rawPos === "noun") {
                    posTag = "বিশেষ্য (Noun)";
                } else if (typeof rawPos === "string") {
                    posTag = rawPos;
                }
            }
        }

        var queryWord = normalizedWord;
        if (normalizedWord.indexOf(" ") === -1) {
            var endsWithSukun = normalizedWord.slice(-1) === "\u0652";
            var startsWithAlif = /^[\u0627\u0623\u0625\u0671]/.test(normalizedWord);
            var startsWithTa = normalizedWord.indexOf("\u062A") === 0;

            if (endsWithSukun && (startsWithAlif || startsWithTa)) {
                queryWord = "\u0623\u0646\u062A " + normalizedWord;
                posTag = "আদেশসূচক ক্রিয়া (Amr / Imperative)";
            } else if (isVerb) {
                queryWord = "\u0647\u0648 " + normalizedWord;
            } else if (isDefinitelyNoun) {
                queryWord = "\u0628\u0639\u0636 " + normalizedWord;
            }
        }

        var enUrlAr = new URL("/translate_a/single", googleHostAr);
        enUrlAr.searchParams.set("client", "gtx");
        enUrlAr.searchParams.set("sl", "ar");
        enUrlAr.searchParams.set("tl", "en");
        enUrlAr.searchParams.set("dt", "t");
        enUrlAr.searchParams.set("q", queryWord);

var enResAr = await fetch(enUrlAr.toString());
var enDataAr = await enResAr.json();
var englishMeaning = "";
if (Array.isArray(enDataAr) && Array.isArray(enDataAr.at(0))) {
enDataAr.at(0).forEach(function(item) {
if (Array.isArray(item) && typeof item.at(0) === "string") {
englishMeaning += item.at(0);
}
});
}
if (isDefinitelyNoun && englishMeaning) {
englishMeaning = englishMeaning.replace(/^some\s+/gi, "").trim();
}
var englishForBangla = englishMeaning;
var lowerEn = englishMeaning.toLowerCase();
var isEnglishPlural = isDefinitelyNoun && lowerEn.slice(-1) === "s" && lowerEn.slice(-2) !== "ss";
if (isEnglishPlural) {
englishForBangla = "many " + englishMeaning;
}
var finalBangla = "";
if (englishForBangla && englishForBangla.toLowerCase() !== normalizedWord.toLowerCase()) {
var bnUrlAr = new URL("/translate_a/single", googleHostAr);
bnUrlAr.searchParams.set("client", "gtx");
bnUrlAr.searchParams.set("sl", "en");
bnUrlAr.searchParams.set("tl", "bn");
bnUrlAr.searchParams.set("dt", "t");
bnUrlAr.searchParams.set("q", englishForBangla);
var bnResAr = await fetch(bnUrlAr.toString());
var bnDataAr = await bnResAr.json();
if (Array.isArray(bnDataAr) && Array.isArray(bnDataAr.at(0))) {
bnDataAr.at(0).forEach(function(item) {
if (Array.isArray(item) && typeof item.at(0) === "string") {
finalBangla += item.at(0);
}
});
}
}
        if (finalBangla) {
            var outputHTML = '<div style="display: block; margin-bottom: 6px;">বাংলা অর্থ: <span style="color:#d35400; font-size:26px; font-weight:bold;">' + finalBangla + '</span></div>';
            if (englishMeaning) {
                outputHTML += '<div style="display: block; font-size:17px; color:#1e8449; margin-bottom: 5px;">ইংরেজি অর্থ: <strong>' + englishMeaning + '</strong></div>';
            }
            if (posTag) {
                outputHTML += '<div style="display: block; font-size:15px; color:#555555;">পদ প্রকরণ: <strong>' + posTag + '</strong></div>';
            }
            resultDiv.innerHTML = outputHTML;
            return;
        } else {
            resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
        }
    } catch (e) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
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
