var client = ZAFClient.init();

client.get('ticket').then((results) => {

    if (results.ticket.status !== "solved") {
        let ticketDate = results.ticket.createdAt;
        let ticket_id = results.ticket.id;
        let comment = "";

        //2660739083 is benson
        //332263405 is arnold
        //332269365 is yu
        let authorID = 332269365;
        let todayDate = new Date();

        function dateDiffInDays(a, b) {
            const _MS_PER_DAY = 1000 * 60 * 60 * 24;

            // Discard the time and time-zone information.
            const UTC1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            const UTC2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

            return Math.floor((UTC2 - UTC1) / _MS_PER_DAY);
        }

        let difference = dateDiffInDays(new Date(ticketDate), todayDate);
        let updateCheckpoint1 = false;
        let updateCheckpoint2 = false;
        let updateCheckpoint3 = false;
        let updateCheckpoint4 = false;
        let updateCheckpoint5 = false;
        let escalated = false;
        let escalatedAccepted = false;
        let tags = results.ticket.tags;

        tags.forEach(function (tag) {
            if (tag === 'checkpoint1') {
                updateCheckpoint1 = true;
            }
            if (tag === 'checkpoint2') {
                updateCheckpoint2 = true;
            }
            if (tag === 'esc_pending') {
                escalated = true;
            }
            if (tag === 'checkpoint3') {
                updateCheckpoint3 = true;
            }
            if (tag === 'esc_accepted') {
                escalatedAccepted = true;
            }
            if (tag === 'checkpoint4') {
                updateCheckpoint4 = true;
            }
            if (tag === 'checkpoint5') {
                updateCheckpoint5 = true;
            }
        });

        if (2 >= difference && difference >= 1) {
            comment = 'Phase 1: \n* Do you have a clear path to resolution? \n* What is the Client trying to achieve? What is the Client\'s use case? \n* Based on Time to Resolution, set expectations with Client (e.g. next steps, timeline)?\n    * If no resolution in sight, involve CS and Management Teams.';
            if (!updateCheckpoint1) {
                addTag(1, ticket_id).then(() => { addCheckPoint(comment, ticket_id) });
            }
        }

        if (7 >= difference && difference >= 3) {
            comment = 'Phase 2: \n* Has the ticket gone back and forth too many times?\n    * Involve Triage, CS or Management teams for advice.\n* Based on Client’s PING, temperature and frustration level, determine if outside help is needed.\n* Does the issue need to be escalated? Ask for required information to escalate.\n* Use Zoom to reduce back and forth.';
            if (!updateCheckpoint2) {
                addTag(2, ticket_id).then(() => { addCheckPoint(comment, ticket_id) });
            }
        }

        if (escalated === true && updateCheckpoint3 === false) {
            client.get('ticket.customField:custom_field_360017360791').then((result) => {
                let difference = 0;
                let escalation_submitted_date = Object.values(result)[1];
                escalation_submitted_date = new Date(escalation_submitted_date);
                difference = dateDiffInDays(escalation_submitted_date, todayDate);

                if (difference >= 1 && difference <= 3) {
                    comment = 'Phase 3: \n* Do you know the escalation timeline? \n* Do you have enough information from Triage to provide the client a meaningful update?';
                    addTag(3, ticket_id).then(() => { addCheckPoint(comment, ticket_id) });
                }
            })
        }

        if (escalatedAccepted === true && updateCheckpoint4 === false) {
            client.get('ticket.customField:custom_field_360018258912').then((result) => {
                let difference = 0;
                let escalation_accepted_date = Object.values(result)[1];
                escalation_accepted_date = new Date(escalation_accepted_date);
                difference = dateDiffInDays(escalation_accepted_date, todayDate);
                if (difference >= 1 && difference <= 3) {
                    comment = 'Phase 4: \n* Check on your Engineering escalation once per release to make sure clients are getting meaningful updates.\n    * Ask Triage for help if no update. \n* Unsure of a response from Engineering or Operations?\n    * Consult with Triage or CS team to revise messaging.\n* Do you need MTAM to assist in increasing the urgency for your case?';
                    addTag(4, ticket_id).then(() => { addCheckPoint(comment, ticket_id) });
                }
            })
        }

        if (escalatedAccepted === true && updateCheckpoint5 === false) {
            client.get('ticket.customField:custom_field_360018258912').then((result) => {
                let difference = 0;
                let escalation_accepted_date = Object.values(result)[1];
                escalation_accepted_date = new Date(escalation_accepted_date);
                difference = dateDiffInDays(escalation_accepted_date, todayDate);
                if (difference >= 5 && difference <= 14) {
                    comment = 'Phase 5: \n* Do you have an ETA? Is the Client asking about an ETA?\n    * Involve CSM and Triage';
                    addTag(5, ticket_id).then(() => { addCheckPoint(comment, ticket_id) });
                }
            })
        }

        function addCheckPoint(comment, ticket_id) {
            return (
                client.request({
                    url: `/api/v2/tickets/${ticket_id}.json`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "ticket": {
                            "comment": {
                                "body": comment,
                                "public": false,
                                "author_id": authorID
                            }
                        }
                    })
                }).catch(function (error) {
                    console.log("Checkpoint ZD App - there was an error with addCheckPoint:", error);
                })
            );
        }

        function addTag(phase, ticket_id) {
            return (
                client.request({
                    url: `/api/v2/tickets/${ticket_id}/tags.json`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "tags": `checkpoint${phase}`
                    })
                })
                    .catch(function (error) {
                        console.log("Checkpoint ZD App - there was an error with addTag:", error);
                    })
            );
        }
    }

});
