document.addEventListener('DOMContentLoaded', function() {
    const collection = JSON.parse(localStorage.getItem('clockCollection')) || [];
    const gridContainer = document.getElementById('gridContainer');

    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

    collection.forEach((clockData, index) => {
        const clockElem = document.createElement('div');
        clockElem.className = 'grid-item';

        let hourMarkersHTML = '';
        for (let i = 0; i < 12; i++) {
            const angle = i * 30; // 360 / 12
            hourMarkersHTML += `<div class="hour" style="transform: rotate(${angle}deg) translate(85px) rotate(-${angle}deg);">${romanNumerals[i]}</div>`;
        }

        clockElem.innerHTML = `
        <div id="clock-${index}">
            ${hourMarkersHTML}
            <div id="hour-hand-${index}" class="hand"></div>
            <div id="minute-hand-${index}" class="hand"></div>
            <div id="second-hand-${index}" class="hand"></div>
        </div>
      
        <div id="digitalTime-${index}"></div>
        <div id="cityCountry-${index}"></div>
        `;
        gridContainer.appendChild(clockElem);

        // Initialize this clock
        initializeClock(`clock-${index}`, clockData);
    });
});

function initializeClock(clockId, clockData) {
    const clockElement = document.getElementById(clockId);
    if (!clockElement) return;

    const globalTime = new Date(clockData.time);
    const hourHand = clockElement.querySelector('.hour-hand');
    const minuteHand = clockElement.querySelector('.minute-hand');
    const secondHand = clockElement.querySelector('.second-hand');
    const digitalTimeDisplay = document.getElementById(`digitalTime-${clockId.split('-')[1]}`);

    const updateClock = () => {
        const hours = globalTime.getHours();
        const minutes = globalTime.getMinutes();
        const seconds = globalTime.getSeconds();

        const hourDeg = (hours % 12) / 12 * 360 + (minutes / 60) * 30;
        const minuteDeg = (minutes / 60) * 360;
        const secondDeg = (seconds / 60) * 360;

        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `rotate(${secondDeg}deg)`;

        digitalTimeDisplay.textContent = globalTime.toLocaleTimeString();
    };

    updateClock(); // Initial update

    setInterval(() => {
        globalTime.setSeconds(globalTime.getSeconds() + 1);
        updateClock();
    }, 1000);
}

