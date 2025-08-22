const commonPasswords = [
    "123456", "password", "123456789", "12345678", "12345",
    "111111", "1234567", "sunshine", "qwerty", "iloveyou",
    "password1", "123123", "admin", "welcome", "qwertyuiop",
    "abc123", "letmein", "monkey", "123qwe", "1q2w3e4r"
];

// Format BigInt numbers with 3 decimals, suffix, and scientific notation
function formatBigNumber(num) {
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
    let n = BigInt(num);
    const thousand = 1000n;
    let magnitude = 0;

    while (n >= thousand && magnitude < suffixes.length - 1) {
        n /= thousand;
        magnitude++;
    }

    // Calculate three decimals
    let factor = 1000n;
    let scaled = (BigInt(num) * factor) / (thousand ** BigInt(magnitude));
    let mainInt = scaled / factor;
    let decimalPart = (scaled % factor).toString().padStart(3, "0");

    let mainNumber = mainInt.toString();
    if (decimalPart !== "000") mainNumber += "." + decimalPart;

    // Scientific notation
    const sciStr = BigInt(num).toString();
    const sciExp = sciStr.length - 1;
    const sciBase = sciStr[0] + "." + sciStr.slice(1, 4);

    return `${mainNumber}${suffixes[magnitude]} (${sciBase}e${sciExp})`;
}

function calculateStrength() {
    const password = document.getElementById("password").value;
    const strengthEl = document.getElementById("passwordStrength");
    if (!password) return;

    // Reset classes
    strengthEl.className = "";

    // Dictionary attack check
    if (commonPasswords.includes(password)) {
        strengthEl.textContent = "Very Weak";
        strengthEl.classList.add("very-weak");
        document.getElementById("combinations").textContent = "-";
        document.getElementById("bruteTime").textContent = "Password is too common! Dictionary attack likely.";
        return;
    }

    // Character set calculation
    let charSet = 0;
    if (/[a-z]/.test(password)) charSet += 26;
    if (/[A-Z]/.test(password)) charSet += 26;
    if (/[0-9]/.test(password)) charSet += 10;
    if (/[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/.test(password)) charSet += 32;
    const unicodeChars = [...password].filter(c => !(/[\x00-\x7F]/.test(c)));
    if (unicodeChars.length > 0) charSet += 1000;
    if (charSet === 0) charSet = 95;

    const length = password.length;
    const totalCombinations = BigInt(charSet) ** BigInt(length);
    const guessesPerSecond = 1e11;
    const timeSeconds = Number(totalCombinations) / guessesPerSecond;

    // Brute-force time formatting
    function formatTime(seconds) {
        const minute = 60;
        const hour = 60 * minute;
        const day = 24 * hour;
        const month = 30 * day;
        const year = 365 * day;
        const century = 100 * year;
        const universeAge = 1.38e10 * year;

        if (seconds > universeAge * 1000) return "too long to show";
        if (seconds < minute) return `${seconds.toFixed(2)} seconds`;
        if (seconds < hour) return `${(seconds/minute).toFixed(2)} minutes`;
        if (seconds < day) return `${(seconds/hour).toFixed(2)} hours`;
        if (seconds < month) return `${(seconds/day).toFixed(2)} days`;
        if (seconds < year) return `${(seconds/month).toFixed(2)} months`;
        if (seconds < century) return `${(seconds/year).toFixed(2)} years`;
        if (seconds < universeAge) return `${(seconds/century).toFixed(2)} centuries`;
        return `${(seconds/universeAge).toFixed(2)} universe ages`;
    }

    // Password strength classification
    let strengthLabel = "";
    if (timeSeconds < 30) strengthLabel = "Very Weak";
    else if (timeSeconds < 60) strengthLabel = "Weak";
    else if (timeSeconds < 3600) strengthLabel = "Medium";
    else if (timeSeconds < 31536000) strengthLabel = "Strong";
    else if (timeSeconds < 1.38e10 * 100) strengthLabel = "Very Strong";
    else strengthLabel = "Unbreakable";

    strengthEl.textContent = strengthLabel;
    strengthEl.classList.add(strengthLabel.toLowerCase().replace(/\s+/g, "-"));

    document.getElementById("displayPassword").textContent = password;
    document.getElementById("combinations").textContent = formatBigNumber(totalCombinations);
    document.getElementById("bruteTime").textContent = formatTime(timeSeconds);
}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("password").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            calculateStrength();
        }
    });
});
