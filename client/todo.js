/*
 * Script for ./todo.html
 * Initializes Calendar with Actions and Sets Up Dialog Button Action Listeners
 */

document.addEventListener("DOMContentLoaded", function () {
    var hasLoggedIn = false;

    /*
     * Check for the existence of parent account and login status
     * and subsequently update the UI forms
     */
    loginUpdate = () => {
        $(".forms").attr("hidden", "true");
        fetch("/todo/init")
            .then((response) => response.json())
            .then((parsedResponse) => {
                console.log(parsedResponse);
                if (parsedResponse.hasAcc) {
                    if (hasLoggedIn) {
                        $(".entry-form").removeAttr("hidden");
                        $(".settings").removeAttr("disabled");
                    } else {
                        $(".login").removeAttr("hidden");
                    }
                } else {
                    $(".new-login").removeAttr("hidden");
                }
            });
    };
    loginUpdate();

    // Create account
    $("#create-pw-submit").click(() => {
        // Update database with the password
        let input = $("#create-pw-input").val();
        if (input != "") {
            fetch("/todo/create-pw", {
                method: "POST",
                body: JSON.stringify({ pw: input }),
                headers: { "Content-Type": "application/json" },
            }).then((response) => {
                alert("Account created succesfully.");
                loginUpdate();
            });
        } else {
            alert("Password cannot be empty.");
        }
    });

    // Login Account
    $("#login-pw-submit").click(() => {
        let input = $("#login-pw-input").val();
        fetch("/todo/login", {
            method: "POST",
            body: JSON.stringify({ pw: input }),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((parsedResponse) => {
                if (parsedResponse.success) {
                    hasLoggedIn = true;
                    loginUpdate();
                } else {
                    alert("Wrong password.");
                }
            });
    });

    // Logout account
    $("#logout").click(() => {
        hasLoggedIn = false;
        loginUpdate();
        $(".settings").attr("disabled", "true");
    });

    // Loads/refreshes tasks and reloads the UI
    loadTasks = () => {
        fetch("/todo/load")
            .then((response) => response.json())
            .then((parsedResponse) => {
                // If there are any todolist items
                if (parsedResponse.length) {
                    // Clear the todo list
                    $(".empty-todo").attr("hidden", "true");
                    $(".todolist").removeAttr("hidden");
                    $(".todolist").empty();
                    // Generate each row of the todo list
                    for (const doc of parsedResponse) {
                        // Append a <tr> to the todo list with corresponding classes and ids
                        $(".todolist").append(
                            '<tr id="' +
                                doc._id +
                                '"><th class="todo-name">' +
                                doc.name +
                                '</th><th class="todo-pic">' +
                                doc.pic +
                                '</th><th> <input type="checkbox" class="check" id="' +
                                doc._id +
                                '" ' +
                                (doc.checked ? "checked" : "") +
                                '> </th><th> <button class="settings btn-secondary-outline" type="button" id="' +
                                doc._id +
                                '" disabled> ⚙ </button> </th></tr>'
                        );
                        // When the settings button is clicked, show the edit dialog and disable all setting buttons
                        // POST requests are done in the edit dialog button action handler
                        // When the edit dialog is closed, all setting buttons will be enabled again
                        $(".todolist")
                            .off("click", ".settings#" + doc._id)
                            .on("click", ".settings#" + doc._id, () => {
                                $(".edit-dialog").removeAttr("hidden");
                                $(".edit-dialog").attr("id", doc._id);
                                $(".settings").attr("disabled", true);
                                $("#edit-name").val(doc.name);
                                $("#edit-pic").val(doc.pic);
                                $(".edit-dialog").dialog({
                                    close: () => {
                                        $(".settings").removeAttr("disabled");
                                    },
                                });
                            });
                        // When the checkbox is clicked, push a POST request to update the todolist database
                        // Once pushed, refresh the todo list by called loadTasks()
                        $(".todolist")
                            .off("click", ".check#" + doc._id)
                            .on("click", ".check#" + doc._id, () => {
                                fetch("/todo/check", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        _id: doc._id
                                    }),
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                });
                            });
                    }
                    loginUpdate();
                } else {
                    // If there are no todolist items
                    // Show corresponding UI elements
                    $(".empty-todo").removeAttr("hidden");
                    $(".todolist").attr("hidden", "true");
                }
            });
    };
    loadTasks();

    // Create task upon form button press
    $("#task-submit").click(() => {
        let taskData = {
            name: $("#task-name").val(),
            pic: $("#task-pic").val(),
            checked: false,
        };
        fetch("/todo/add", {
            method: "POST",
            body: JSON.stringify(taskData),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((parsedResponse) => {
                $("#task-name").val("");
                $("#task-pic").val("");
                loadTasks();
            });
    });

    // Update tasks upon edit dialog button press
    $("#edit-submit").click(() => {
        let editData = {
            name: $("#edit-name").val(),
            pic: $("#edit-pic").val(),
            _id: $(".edit-dialog").attr("id"),
        };
        console.log(editData);
        fetch("/todo/edit", {
            method: "POST",
            body: JSON.stringify(editData),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => loadTasks());
        $(".edit-dialog").dialog("close");
    });

    $("#edit-delete").click(() => {
        let deleteData = {
            _id: $(".edit-dialog").attr("id"),
        };
        fetch("/todo/delete", {
            method: "POST",
            body: JSON.stringify(deleteData),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => loadTasks());
        $(".edit-dialog").dialog("close");
    });

    $("#edit-cancel").click(() => {
        $(".edit-dialog").dialog("close");
    });

    setTimeout(() => loadTasks(), 5000)

});
