const isEnglishText = (text) => {
    // Регулярное выражение для проверки английских символов
    return /^[a-zA-Z0-9\s\.,!?;:'"@#$%^&*()_+\-=\[\]{}<>\\\/]+$/.test(text);
};

export default isEnglishText;