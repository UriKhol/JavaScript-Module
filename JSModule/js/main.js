let eventsBasket = document.querySelector('.events-basket'),
    changeSelect = document.querySelector(".change-event__select"),
    deleteSelect = document.querySelector(".delete-event__select"),
    deleteSelectForm = document.querySelector(".delete-event"),
    changeForm = document.querySelector('.change-event'),
    indicator = document.querySelector('.current-time'),
    trackEvents = document.querySelector('.track-events'),
    eventsList = document.querySelector('.events-list'),
    eventsArray = [];

//Draw Calendar
function drawCalendar(events) {

    //Clear Events
    eventsBasket.innerHTML = ''

    //Clone Events in new array
    let cloneEvents = [...events];

    //Sort new array
    cloneEvents.sort((firstEvent, secondEvent) => firstEvent.start[1] - secondEvent.start[1])

    //Find Events of the same period
    cloneEvents.forEach(currentEvent => {
        let startEvents = currentEvent.start[1],
            endEvents = currentEvent.start[1] + currentEvent.duration[1];
        let eventsInSamePeriod = cloneEvents.filter((currentEvent, index) => {
            let currentStartEvent = currentEvent.start[1],
                currentEndEvent = currentEvent.start[1] + currentEvent.duration[1];

            if (startEvents <= currentStartEvent && endEvents >= currentStartEvent) {
                if (endEvents < currentEndEvent) endEvents = currentEndEvent;
                delete cloneEvents[index]
                return true;
            }
        });

        //createEvent
        eventsInSamePeriod.forEach((currentEvent, index) => {
            let width = 200 / eventsInSamePeriod.length,
                position = index * width;
            createEvent(currentEvent, width, position);
        })
    })
}

//createEvent Function
function createEvent(object, width, position) {
    let event = document.createElement("div");
    event.setAttribute('class', 'event');
    event.innerHTML = `<p>${object.title}</p>`;
    event.style.top = `${object.start[1] * 2}px`;
    event.style.height = `${object.duration[1] * 2}px`;
    event.style.width = `${width}px`;
    event.style.right = `${position}px`;
    event.style.backgroundColor = "rgba(" + object.rgb[0] + "," + object.rgb[1] + "," + object.rgb[2] + ",0.5)";
    event.style.borderLeftColor = "rgb(" + object.rgb[0] + "," + object.rgb[1] + "," + object.rgb[2] + ")";
    eventsBasket.append(event)
}

// Create and Change form functions
function initEventForm(prefix) {
    let eventForm = document.querySelector(`${prefix}-event`),
        start = document.querySelector(`${prefix}-event__start`),
        duration = document.querySelector(`${prefix}-event__duration`),
        title = document.querySelector(`${prefix}-event__title`),
        color = document.querySelector(`${prefix}-event__color`);

    start.addEventListener('change', function () {
        if (transformTime(this.value) <= 1005) duration.setAttribute('min', changeTime(this.value, 15, '+'))
    })
    duration.addEventListener('change', function () {
        if (transformTime(this.value) <= 1020) start.setAttribute('max', changeTime(this.value, 15, '-'))
    })
    eventForm.addEventListener('submit', () => {

        event.preventDefault();

        let selectedEventId = changeSelect.options[changeSelect.selectedIndex].value,
            rgb = [
                parseInt(color.value.substr(1, 2), 16),
                parseInt(color.value.substr(3, 2), 16),
                parseInt(color.value.substr(5, 2), 16)
            ],
            startToMin = transformTime(start.value) - 480,
            durationToMin = transformTime(duration.value) - 480 - startToMin,
            id = prefix == '.create' ? eventsArray.length : selectedEventId,
            object = {
                start: [start.value, startToMin],
                duration: [duration.value, durationToMin],
                title: title.value,
                color: color.value,
                rgb: rgb,
                id: id
            };

        if (prefix == '.create') {
            createOptions(id, title.value)
            eventsArray.push(object)
            localStorage.setItem("events", JSON.stringify(eventsArray));

            // Reset values
            start.value = '';
            duration.value = '';
            title.value = '';
            color.value = '#E2ECF5';
        } else {
            eventsArray = eventsArray.map(event => event.id == id ? object : event)
            localStorage.setItem("events", JSON.stringify(eventsArray));
            for (let i = 0; i < changeSelect.length; i++) {
                if (changeSelect.options[i].value == id) {
                    deleteSelect.options[i].text = object.title
                    changeSelect.options[i].text = object.title
                }
            }
        }
        drawCalendar(eventsArray)
        currentEventsModal()
    })
}

//Transform time
function transformTime(value) {
    return Number(value.split(':')[0]) * 60 + Number(value.split(':')[1])
}

//Transform time
function changeTime(value, time, symbol) {
    let firstHalf = Number(value.split(':')[0]),
        secondHalf = Number(value.split(':')[1]);

    switch (symbol) {
        case '+':
            if (secondHalf + time > 60) {
                secondHalf = (secondHalf + time) % 60;
                firstHalf += 1;
            } else if (secondHalf + time == 60) {
                firstHalf += 1;
                secondHalf = '00';
            } else {
                secondHalf += time;
            }
            break;

        case '-':
            if (secondHalf - time < 0) {
                secondHalf = 60 - (time - secondHalf);
                firstHalf -= 1;
            } else {
                secondHalf -= time;
            }
            break;

    }

    if (String(firstHalf).length < 2) firstHalf = '0' + firstHalf;
    if (String(secondHalf).length < 2) secondHalf = '0' + secondHalf;

    return firstHalf + ':' + secondHalf;
}

//Create options in selects
function createOptions(id, title) {
    let option = document.createElement("option");
    option.text = title;
    option.value = id;

    let cloneOption = option.cloneNode(true);
    changeSelect.append(option);
    deleteSelect.append(cloneOption);
}

//Remove Event
function removeEvent() {
    event.preventDefault();
    let deleteSelectId = deleteSelect.options[deleteSelect.selectedIndex].value,
        changeSelectId = changeSelect.options[changeSelect.selectedIndex].value;

    if (deleteSelectId != 'empty') {
        let index = eventsArray.findIndex(event => event.id == deleteSelectId);
        delete eventsArray[index]
        eventsArray = eventsArray.filter(event => event != null);
        localStorage.setItem("events", JSON.stringify(eventsArray));
        drawCalendar(eventsArray)
        for (let i = 0; i < deleteSelect.length; i++) {
            if (deleteSelect.options[i].value == deleteSelectId) {
                deleteSelect.remove(i);
                changeSelect.remove(i);
            }
        }
        currentEventsModal()
    }

    if (deleteSelectId == changeSelectId) changeForm.style.display = 'none'
}

//Change Event
function changeEvent() {
    let id = this.options[this.selectedIndex].value;
    if (id != 'empty') {
        changeForm.style.display = 'block';
        let start = document.querySelector(`.change-event__start`),
            duration = document.querySelector(`.change-event__duration`),
            title = document.querySelector(`.change-event__title`),
            color = document.querySelector(`.change-event__color`),
            object = eventsArray.find(event => event.id == id);

        start.value = object.start[0];
        start.setAttribute('max', changeTime(object.duration[0], 15, '-'));
        duration.value = object.duration[0];
        duration.setAttribute('min', changeTime(object.start[0], 15, '+'));
        title.value = object.title;
        color.value = object.color;
    } else {
        changeForm.style.display = 'none'
    }
}

//Show Event in real time
function trackEvent() {
    let now = transformTime(new Date().toLocaleTimeString().slice(0, -3)) - 480;

    if (now >= 0 && now <= 540) {
        indicator.style.display = 'block';

        if (parseInt(indicator.style.top, 10) / 2 != now) {
            indicator.style.top = `${now * 2}px`;
            currentEventsModal(now)
        }
    } else {
        indicator.style.display = 'none';
    }
}

//Show Event in real time
function currentEventsModal(now) {

    if (now == undefined) now = transformTime(new Date().toLocaleTimeString().slice(0, -3)) - 480;

    let events = eventsArray.filter(event => {
        if (event.start[1] <= now && event.start[1] + event.duration[1] >= now) {
            return true;
        }
    })

    if (events.length == 0) {
        trackEvents.style.display = 'none'
    } else {
        eventsList.innerHTML = '';
        events.forEach((event, index) => {
            let li = document.createElement('li');
            li.innerHTML = (index + 1) + '.' + event.title;
            eventsList.append(li)
        })
        trackEvents.style.display = 'block';
    }
}

//Get Events from local storage
function getLocalStorageEvents() {
    let events = JSON.parse(localStorage.getItem("events"));
    if (events.length != 0) {
        events.forEach(event => {
            eventsArray.push(event);
            createOptions(event.id, event.title)
        })
        drawCalendar(eventsArray)
    }
}

function initApp() {
    changeSelect.addEventListener('change', changeEvent)
    deleteSelectForm.addEventListener('submit', removeEvent)

    initEventForm('.create')
    initEventForm('.change')

    getLocalStorageEvents()
    trackEvent()
    setInterval(trackEvent, 1000)
}

initApp()