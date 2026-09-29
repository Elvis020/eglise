const statusStyles = {
  now: {
    label: "Start now",
    className: "status-now",
    note: "Current discovery priority",
  },
  next: {
    label: "Next",
    className: "status-next",
    note: "Next discovery priority",
  },
  explore: {
    label: "Explore together",
    className: "status-explore",
    note: "Discovery area",
  },
};

const routeAliases = {
  discipleship: "school",
  digest: "bible-study",
};

const features = {
  people: {
    number: "01 / PEOPLE & MEMBERSHIP",
    status: "now",
    title: "A clearer record of the people in your church.",
    intro:
      "A shared directory is the first step toward welcoming people, keeping contact details current, and recognizing membership with care.",
    why: "When names, contact details, and membership recognition live in different places, a welcome can be missed and a team cannot tell which record to trust. The first need is a dependable shared picture that still leaves recognition in the church’s hands.",
    scope: [
      {
        title: "A directory the team can maintain",
        text: "Add people one at a time or bring in an agreed starting list, with clear ownership for keeping the record useful.",
      },
      {
        title: "A careful import review",
        text: "Flag duplicate-looking rows, missing essentials, and invalid values for a person to review before they become part of the directory.",
      },
      {
        title: "Contacts that reflect real households",
        text: "Allow an agreed shared phone number where that is how a household keeps in touch, without assuming every person has separate details.",
      },
      {
        title: "Membership recognition in context",
        text: "Show membership as a standing recorded after the church’s own recognition process, rather than inferring it from attendance.",
      },
    ],
    flow: [
      {
        title: "Bring together a starting list",
        text: "A designated team member adds a person or uploads an agreed file for review.",
      },
      {
        title: "Resolve what needs attention",
        text: "The reviewer checks duplicate-looking names, an invalid row, and any missing essentials before confirming the useful records.",
      },
      {
        title: "Keep the directory current",
        text: "As details change, the team updates the shared record and can see the information it has agreed to keep.",
      },
      {
        title: "Record recognition when it happens",
        text: "When the church completes its existing membership process, the designated person records that recognition with the appropriate evidence.",
      },
    ],
    decisions: [
      "Which fields are essential for a useful first directory, and which can wait?",
      "Which import format and review roles would fit the team’s current way of working?",
      "What evidence should support recording membership recognition?",
    ],
    validate: {
      title: "Begin with a small sample import.",
      text: "Review a shared household phone number and one invalid row, keeping the useful contact details and identifying what needs correction.",
    },
    boundary:
      "Attendance by itself never changes a person’s membership status.",
  },
  attendance: {
    number: "02 / ATTENDANCE",
    status: "next",
    title: "Find the clearest way to record a gathering.",
    intro:
      "The next conversation is about practical attendance across the services and events that matter to the church.",
    why: "A single gathering can be counted in more than one way, and late corrections are normal. Without a clear record of what was captured, totals can be added together by mistake or treated as more certain than they are.",
    scope: [
      {
        title: "Services and other gatherings",
        text: "Set up the recurring services and event types the church actually wants to understand, without forcing every gathering into one pattern.",
      },
      {
        title: "Named attendance",
        text: "Record individual attendance where a team can confidently identify who was present.",
      },
      {
        title: "Clearly labelled manual headcounts",
        text: "Keep a manual count visible as a separate source when a named record is not practical.",
      },
      {
        title: "Corrections and completion",
        text: "Let a responsible team member correct an entry, confirm when a gathering record is complete, and retain the context for that change.",
      },
    ],
    flow: [
      {
        title: "Set up the gathering",
        text: "A team member chooses the service or event type and checks the date before recording begins.",
      },
      {
        title: "Capture the available record",
        text: "The team records named attendance, a labelled manual headcount, or both when they are genuinely separate sources.",
      },
      {
        title: "Review before completion",
        text: "A designated reviewer checks that the sources are not being added together and makes any necessary correction.",
      },
      {
        title: "Close the record with its meaning intact",
        text: "The gathering is marked complete only when the team can see what each recorded number represents.",
      },
    ],
    decisions: [
      "Which service and event types are useful enough to record separately?",
      "When should named attendance and a manual headcount be reconciled, if at all?",
      "How should a late entry or correction be shown to the person reviewing the record?",
    ],
    validate: {
      title: "Start with one gathering.",
      text: "Compare its named list with a separately labelled headcount, so both meanings stay clear without being added together.",
    },
    boundary:
      "Recorded activity should be clear about what it includes and what it does not.",
  },
  growth: {
    number: "03 / REPORTS & FOLLOW-UP",
    status: "explore",
    title: "Make the next conversation easier to see.",
    intro:
      "Reports and follow-up are useful only when their definitions match the church’s real decisions.",
    why: "A weekly view is only helpful when everyone understands its definitions and can see what is incomplete. Otherwise a report can create confident-looking numbers without giving a leader a fair basis for a next conversation.",
    scope: [
      {
        title: "Weekly views with agreed definitions",
        text: "Present the weekly questions the church actually asks, alongside a plain explanation of how each measure is defined.",
      },
      {
        title: "Visible gaps in the record",
        text: "Show where a gathering is unfinished or a source is missing, rather than quietly treating incomplete data as a final total.",
      },
      {
        title: "A thoughtful follow-up handoff",
        text: "Give the right team a clear, limited handoff for a human conversation through the church’s existing approach.",
      },
    ],
    flow: [
      {
        title: "Agree the week’s questions",
        text: "Before viewing a report, the church confirms the attendance or membership definitions that are relevant for that week.",
      },
      {
        title: "Review the view and its caveats",
        text: "A leader sees the recorded activity together with unfinished gatherings and other clearly labelled limitations.",
      },
      {
        title: "Choose a human next step",
        text: "If a conversation is appropriate, the leader makes a considered handoff through the church’s normal follow-up process.",
      },
      {
        title: "Learn from the handoff",
        text: "The team uses what was useful or unclear to refine the next weekly view and its definitions.",
      },
    ],
    decisions: [
      "Which weekly views answer a real leadership question rather than merely adding another number?",
      "Which definitions need to sit beside every report so they are understood consistently?",
      "Who should receive a follow-up handoff, and what is the minimum context they need?",
    ],
    validate: {
      title: "Read one sample weekly report.",
      text: "Check that its definitions and gaps are understandable, then consider whether it points to a thoughtful human follow-up.",
    },
    boundary:
      "A report can describe recorded activity; it cannot measure every part of a person’s journey.",
  },
  finance: {
    number: "04 / WELFARE SUPPORT",
    status: "explore",
    title: "Explore support with care and clarity.",
    intro:
      "The church is considering a clearer view of recurring support and emergency help, shaped by the people who carry that responsibility.",
    why: "Recurring support and urgent assistance have different rhythms, yet both need a clear history of what was agreed and corrected. A shared view could reduce avoidable uncertainty without deciding how the church should approve or make payments.",
    scope: [
      {
        title: "Contributions and assistance kept distinct",
        text: "Describe incoming contributions separately from support the church provides, so the two are not confused in a review.",
      },
      {
        title: "Recurring home and mission support",
        text: "Record agreed recurring support for homes or mission work, including its frequency and any change to the arrangement.",
      },
      {
        title: "Emergency help with context",
        text: "Capture a request for urgent help as its own item, with only the information the responsible team agrees it needs.",
      },
      {
        title: "A correction history",
        text: "Make a correction understandable to a later reviewer instead of overwriting the fact that an earlier record changed.",
      },
    ],
    flow: [
      {
        title: "Record the kind of support",
        text: "The welfare team starts by distinguishing a recurring commitment from an urgent request for assistance.",
      },
      {
        title: "Review what is due or needs attention",
        text: "A responsible person looks at the agreed frequency, the supporting context, and any correction history.",
      },
      {
        title: "Follow the church’s chosen process",
        text: "The team uses its existing approval and payment process, while the concept keeps the record of the decision clear.",
      },
      {
        title: "Update the shared history",
        text: "A change, pause, or correction is recorded so the next review has the necessary context.",
      },
    ],
    decisions: [
      "Would reminders be useful, and which commitments should they cover?",
      "How should payment status be represented without replacing the church’s payment process?",
      "Which approvals, frequencies, and correction details need to be visible to the welfare team?",
    ],
    validate: {
      title: "Compare two kinds of support.",
      text: "Use a recurring commitment and an urgent request to see whether their different rhythms remain clear to the responsible team.",
    },
    boundary:
      "The right safeguards and process are still part of the discovery work.",
  },
  "bible-study": {
    number: "05 / BIBLE STUDY",
    status: "explore",
    title: "Let learning begin from the word already shared.",
    intro:
      "Bible study may grow from sermons, with materials and participation shaped around the church’s actual rhythm.",
    why: "A sermon can open a useful midweek conversation, but the people facilitating it need to find the right material without rebuilding it from memory. Participation also needs its own meaning instead of being treated as service attendance.",
    scope: [
      {
        title: "Sermon-derived midweek material",
        text: "Organise an agreed outline, prompts, or study resource around the word already shared with the church.",
      },
      {
        title: "Facilitator-ready access",
        text: "Let facilitators find the current material and the relevant link without searching through unrelated updates.",
      },
      {
        title: "A meaningful participation question",
        text: "Help each group decide what participation means for its setting, rather than applying a one-size-fits-all count.",
      },
    ],
    flow: [
      {
        title: "Prepare from the sermon",
        text: "After a sermon, a designated person gathers the agreed material, prompts, and resource link for the midweek group.",
      },
      {
        title: "Facilitators find what they need",
        text: "Before meeting, a facilitator opens the current material and checks the group’s participation question.",
      },
      {
        title: "Guide the conversation",
        text: "The group uses the material as a starting point and records only the kind of participation the church has agreed is meaningful.",
      },
      {
        title: "Refine the next session",
        text: "Facilitators feed back whether the material and participation question helped the next midweek gathering.",
      },
    ],
    decisions: [
      "Which sermon-derived material is useful enough to prepare for a midweek group?",
      "What access should a facilitator have to the material and its links?",
      "What does participation mean for each group, and how should it remain distinct from service attendance?",
    ],
    validate: {
      title: "Find the material for one session.",
      text: "Check that a facilitator can reach the current study material and link, with participation kept distinct from service attendance.",
    },
    boundary:
      "A useful learning journey needs the church’s own language and practice, not a fixed template.",
  },
  school: {
    number: "06 / CARE SCHOOL",
    status: "explore",
    title: "A considered path for care and readiness.",
    intro:
      "A future care-school experience could help the church organise learning topics, progress, readiness, and the next step.",
    why: "When a learning path has several topics and next steps, a coordinator needs enough context to guide someone without reducing their journey to a checkbox. The concept should make progress and readiness visible while leaving the church to define them.",
    scope: [
      {
        title: "Topics arranged into units",
        text: "Set out the agreed learning topics in understandable units, so a participant and coordinator can see the path ahead.",
      },
      {
        title: "Progress with context",
        text: "Show what has been covered and what remains without implying that partial progress is a final outcome.",
      },
      {
        title: "Readiness and the next step",
        text: "Give the coordinator a place to consider readiness for the next agreed step, using the church’s own criteria.",
      },
      {
        title: "A simple history",
        text: "Retain the learning path and scheduling context a later coordinator needs to understand what has already happened.",
      },
    ],
    flow: [
      {
        title: "Choose the agreed path",
        text: "A coordinator starts a participant on the relevant topics and units, with the current schedule in view.",
      },
      {
        title: "Record partial progress",
        text: "As units are covered, the coordinator marks the progress that has genuinely happened and leaves unfinished work visible.",
      },
      {
        title: "Consider readiness together",
        text: "At an agreed point, the coordinator uses the church’s criteria to discuss readiness for the next step.",
      },
      {
        title: "Plan what comes next",
        text: "The next session or action is scheduled with enough history for a later handover to make sense.",
      },
    ],
    decisions: [
      "What should count as completion for a topic, unit, or whole path?",
      "How should the church describe readiness for the next step?",
      "Which scheduling details and history are useful to retain for a coordinator?",
    ],
    validate: {
      title: "Follow an incomplete journey.",
      text: "Review remaining topics, discuss readiness, and make the next scheduling step easy for a coordinator to find.",
    },
    boundary: "The details are still being explored with the church.",
  },
  resources: {
    number: "07 / RESOURCES & ANNOUNCEMENTS",
    status: "explore",
    title: "Make the useful things easier to find.",
    intro:
      "Church Notes, sermon links, and announcements may become a simple shared place to return to what matters.",
    why: "An important announcement or useful sermon link can disappear into a fast-moving message thread. A simple, current place to look could help people find what the church has chosen to share without replacing its familiar channels.",
    scope: [
      {
        title: "Church Notes with their own purpose",
        text: "Keep edited Church Notes distinct from audio, so a reader knows whether they are opening a written reflection or listening to a recording.",
      },
      {
        title: "A starting set of Telegram links",
        text: "Bring together agreed links already shared through Telegram, with clear labels for what each one leads to.",
      },
      {
        title: "Current announcements that can be found",
        text: "Make the latest approved announcements discoverable, with a visible owner and a way to tell when they are no longer current.",
      },
      {
        title: "Clear access boundaries",
        text: "Explore which audience should see each item and how links should be reviewed over time.",
      },
    ],
    flow: [
      {
        title: "Prepare a useful item",
        text: "A designated owner labels a Church Note, an audio link, or an announcement clearly before sharing it.",
      },
      {
        title: "Publish the agreed link or update",
        text: "The item appears where the intended audience can find it, alongside any relevant Telegram link already in use.",
      },
      {
        title: "Find the current information",
        text: "After a gathering, someone can distinguish an edited note from audio and locate the latest approved announcement.",
      },
      {
        title: "Review what remains current",
        text: "The owner checks whether an announcement or link should remain visible, be updated, or expire.",
      },
    ],
    decisions: [
      "Which audience should be able to find each kind of note, audio link, or announcement?",
      "Who owns keeping an item current, and how should that ownership be shown?",
      "When should an announcement expire, and how should outgoing links be reviewed?",
    ],
    validate: {
      title: "Find the current essentials.",
      text: "Locate a Church Note, an audio link, and a current announcement, then make clear who owns keeping each one current.",
    },
    boundary:
      "This is about making existing resources easier to find, not replacing every communication channel.",
  },
};

const overview = document.querySelector(".overview");
const detailView = document.querySelector("#detail-view");
const detailContent = document.querySelector("#detail-content");
const overviewTitle = document.querySelector("#overview-title");
const backLink = document.querySelector("#back-link");
let originFeature = null;
let overviewScrollY = 0;

function showView(view) {
  overview.hidden = view !== "overview";
  detailView.hidden = view !== "detail";
  document.body.dataset.view = view;
}

function renderFeature(key) {
  if (!Object.hasOwn(features, key)) {
    return false;
  }

  const feature = features[key];
  const status = statusStyles[feature.status];

  if (!status) {
    return false;
  }

  detailContent.innerHTML = `
    <div class="detail-hero">
      <div>
        <p class="eyebrow">${feature.number}</p>
        <h1 id="detail-title" tabindex="-1">${feature.title}</h1>
        <p class="detail-intro">${feature.intro}</p>
      </div>
      <aside class="detail-stamp">
        <span class="release-tag ${status.className}">${status.label}</span>
        <p><strong>${status.note}</strong><br />Still in discovery</p>
      </aside>
    </div>
    <section class="detail-why" aria-labelledby="why-title">
      <h2 id="why-title">The need</h2>
      <p>${feature.why}</p>
    </section>
    <div class="detail-columns">
      <section class="detail-scope" aria-labelledby="scope-title">
        <h2 id="scope-title">Proposed features</h2>
        <dl class="scope-list">${feature.scope
          .map(
            (item) => `
              <div>
                <dt>${item.title}</dt>
                <dd>${item.text}</dd>
              </div>`,
          )
          .join("")}</dl>
      </section>
    </div>
    <section class="detail-flow" aria-labelledby="flow-title">
      <h2 id="flow-title">How it could work</h2>
      <ol class="flow-list">${feature.flow
        .map(
          (step) => `
            <li>
              <h3>${step.title}</h3>
              <p>${step.text}</p>
            </li>`,
        )
        .join("")}</ol>
    </section>
    <section class="detail-start" aria-labelledby="start-title">
      <h3 id="start-title">Start here</h3>
      <p><strong>${feature.validate.title}</strong> ${feature.validate.text}</p>
    </section>
    <section class="detail-decisions" aria-labelledby="decisions-title">
      <h2 id="decisions-title">Open questions</h2>
      <ul class="decision-list">${feature.decisions
        .map((decision) => `<li>${decision}</li>`)
        .join("")}</ul>
    </section>
    <section class="boundary-note" aria-labelledby="boundary-title">
      <h2 id="boundary-title">Limitations</h2>
      <p>${feature.boundary}</p>
    </section>`;

  return true;
}

function showCurrentRoute({ moveFocus = true } = {}) {
  const hashKey = window.location.hash.slice(1);
  const key = routeAliases[hashKey] ?? hashKey;

  if (hashKey === "" || hashKey === "overview") {
    showView("overview");

    if (moveFocus) {
      window.scrollTo({ top: overviewScrollY, behavior: "auto" });
      const target = originFeature
        ? document.querySelector(`[data-feature="${originFeature}"]`)
        : overviewTitle;
      target?.focus({ preventScroll: true });
    }

    originFeature = null;
    return;
  }

  if (!renderFeature(key)) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#overview`,
    );
    showView("overview");
    originFeature = null;
    return;
  }

  showView("detail");

  if (moveFocus) {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.querySelector("#detail-title")?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-feature]").forEach((link) => {
  link.addEventListener("click", () => {
    originFeature = link.dataset.feature;
    overviewScrollY = window.scrollY;
  });
});

document.querySelectorAll("[data-feature-link]").forEach((link) => {
  link.addEventListener("click", () => {
    originFeature = null;
    overviewScrollY = window.scrollY;
  });
});

backLink.addEventListener("click", () => {
  if (!originFeature) {
    originFeature = null;
  }
});

window.addEventListener("hashchange", () => showCurrentRoute());
showCurrentRoute({ moveFocus: false });
