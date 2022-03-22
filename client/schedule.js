/*
 * Script for ./schedule.html
 * Initializes Calendar with Actions and Sets Up Dialog Button Action Listeners
 */

document.addEventListener("DOMContentLoaded", function () {
    /*
     * Calendar Initialization
     * Initializes the calendar once the DOM has been loaded with action handlers attached to the calendar.
     */

    var calendarEl = document.getElementById("calendar");

    var startSelect, endSelect, currEvent;

    const refetchInterval = 500;

    // Select: When the user selects a range of time/date in the calendar
    const selectHandler = (selectInfo) => {
        $("#add-dialog").dialog();
        startSelect = selectInfo.start;
        endSelect = selectInfo.end;
    };

    // Click: When the user clicks on an event and releases
    const eventClickHandler = (clickInfo) => {
        clearInterval(refetching);
        currEvent = clickInfo.event;
        console.log(currEvent.color);
        console.log(currEvent.title);
        $("#edit-dialog-color").val(currEvent.backgroundColor);
        $("#edit-dialog-name").val(currEvent.title);
        $("#edit-dialog").dialog();
    };

    // Drag: When the user is dragging (moving) an event out of its original time slot
    const eventDragHandler = (info) => {
        info.event.remove();
        clearInterval(refetching); // Clear the refetching and set it up again when dropped
    };

    // Drop: When the user was dragging and drops an event to a different time slot
    const eventDropHandler = (info) => {
        let dropData = {
            id: info.event.id,
        };
        fetch("/schedule/move-resize", {
            method: "POST",
            body: JSON.stringify(dropData),
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log(dropData);
        var refetchInterval = window.setInterval(() => {
            calendar.refetchEvents();
        }, 5000);
    };

    // Event Resize Start: When the user starts to resize an event
    const eventResizeStartHandler = (info) => {
        info.event.remove();
        clearInterval(refetching); // Clear the refetching and set it up again when event resize ends
    };

    // Event Resize: When the user was resizing an event and releasing its mouse
    const eventResizeHandler = (info) => {
        let resizeData = {
            id: info.event.id,
            start: info.event.start,
            end: info.event.end,
        };
        fetch("/schedule/move-resize", {
            method: "POST",
            body: JSON.stringify(resizeData),
            headers: {
                "Content-Type": "application/json",
            },
        });
        var refetchInterval = window.setInterval(() => {
            calendar.refetchEvents();
        }, 5000);
    };

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "timeGridWeek",
        editable: true,
        selectable: true,
        nowIndicator: true,
        navLinks: true,
        customButtons: {
            // Back to main menu button
            backToMainMenu: {
                text: "↩",
                click: () => {
                    window.location.replace("index.html");
                },
            },
            // Button to toggle the child background
            childLayout: {
                text: "🚼",
                click: () => {
                    if (!$("body").attr("style")) {
                        $("body").attr(
                            "style",
                            'background: url("childbg_schedule.jpeg") no-repeat center center fixed; background-size: cover;'
                        );
                    } else {
                        $("body").removeAttr("style");
                    }
                },
            },
        },
        headerToolbar: {
            left: "backToMainMenu timeGridWeek dayGridMonth",
            center: "title",
            right: "childLayout",
        },
        // Fetching source of rendering and refetching events
        eventSources: { url: "/schedule/init", method: "GET" },
        // Add Event
        select: selectHandler,
        // Edit Event
        eventClick: eventClickHandler,
        // Move Event
        eventDragStart: eventDragHandler,
        eventDrop: eventDropHandler,
        // Resize Event
        eventResizeStart: eventResizeStartHandler,
        eventResize: eventResizeHandler,
    });

    calendar.render();

    // Sets up realtime refreshing (when the DOM is loaded)
    var refetching = window.setInterval(() => {
        calendar.refetchEvents();
    }, refetchInterval);

    /*
     * Dialog Button Actions
     * Declare action handlers and attach them to dialog buttons.
     * Note that extendedProps are used to fit the fetched event processing of the FullCalendar calendar
     * See: eventSources
     */

    // Create event
    const addEventFromDialog = () => {
        let addData = {
            title: $("#add-dialog-name").val(),
            color: $("#add-dialog-color").val(),
            start: startSelect,
            end: endSelect,
            // extendedProps: {
            //     colorLabel: $("#add-dialog-color").val(),
            // },
        };
        fetch("/schedule/add", {
            method: "POST",
            body: JSON.stringify(addData),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((addResponse) => addResponse.json())
            .then((parsedResponse) => {
                console.log(parsedResponse);
            });
        calendar.refetchEvents();
        $("#add-dialog").dialog("close");
    };

    // Edit event
    const editEventFromDialog = () => {
        const editData = {
            id: currEvent.id,
            title: $("#edit-dialog-name").val(),
            color: $("#edit-dialog-color").val(),
            // extendedProps: {
            //     colorLabel: $("#edit-dialog-color").val(),
            //     eid: currEvent.extendedProps.eid,
            // },
        };
        fetch("/schedule/edit", {
            method: "POST",
            body: JSON.stringify(editData),
            headers: {
                "Content-Type": "application/json",
            },
        });
        $("#edit-dialog").dialog("close");
        var refetching = window.setInterval(() => {
            calendar.refetchEvents();
        }, refetchInterval);
    };

    // Delete event
    const deleteEventFromDialog = () => {
        currEvent.remove();
        $("#edit-dialog").dialog("close");
        const deleteData = { id: currEvent.id };
        fetch("/schedule/delete", {
            method: "POST",
            body: JSON.stringify(deleteData),
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    $("#add-dialog-confirm").click(addEventFromDialog);

    $("#edit-dialog-cancel").click(function () {
        $("#edit-dialog").dialog("close");
    });

    $("#edit-dialog-confirm").click(editEventFromDialog);

    $("#edit-dialog-delete").click(deleteEventFromDialog);
});
