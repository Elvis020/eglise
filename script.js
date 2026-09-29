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
    overview:
      "People records give the church a dependable foundation for the conversations that follow. Membership remains a recognized standing, not an automatic result of attendance.",
    example:
      "A designated team member adds a new person or reviews an imported record, then the church can recognise membership through its existing process when that process is complete.",
    points: [
      "Build a usable shared directory.",
      "Review imports, missing details, and possible duplicates.",
      "Record membership after the church’s recognition process.",
    ],
    boundary:
      "Attendance by itself never changes a person’s membership status.",
  },
  attendance: {
    number: "02 / ATTENDANCE",
    status: "next",
    title: "Find the clearest way to record a gathering.",
    intro:
      "The next conversation is about practical attendance across the services and events that matter to the church.",
    overview:
      "A future workflow may bring together individual attendance and an agreed headcount, while keeping each source clear rather than pretending they mean the same thing.",
    example:
      "For one gathering, a team may record named attendance. For another, they may need a carefully labelled headcount. The church can decide the right pattern after trying the workflow.",
    points: [
      "Explore services and other event types together.",
      "Keep named records and headcounts clearly distinct.",
      "Make corrections and completion practical for the team.",
    ],
    boundary:
      "Recorded activity should be clear about what it includes and what it does not.",
  },
  growth: {
    number: "03 / REPORTS & FOLLOW-UP",
    status: "explore",
    title: "Make the next conversation easier to see.",
    intro:
      "Reports and follow-up are useful only when their definitions match the church’s real decisions.",
    overview:
      "The team can explore which attendance and membership patterns deserve attention, and what a thoughtful DigiReach follow-up handoff would need.",
    example:
      "A leader may review a clearly labelled view of recent activity, then decide whether a person or group needs a friendly follow-up through the church’s existing process.",
    points: [
      "Define useful reports before building them.",
      "Make incomplete records visible rather than misleading.",
      "Explore the right follow-up handoff with the church.",
    ],
    boundary:
      "A report can describe recorded activity; it cannot measure every part of a person’s journey.",
  },
  finance: {
    number: "04 / WELFARE SUPPORT",
    status: "explore",
    title: "Explore support with care and clarity.",
    intro:
      "The church is considering a clearer view of recurring support and emergency help, shaped by the people who carry that responsibility.",
    overview:
      "This conversation can include support for homes or missions and emergency assistance, without deciding the detailed process before it has been understood.",
    example:
      "A welfare team might map the information it needs to review a recurring commitment and the different information needed when urgent help is requested.",
    points: [
      "Explore recurring support and emergency help.",
      "Keep support records meaningful and appropriately private.",
      "Agree reminders and approvals only when they solve a real need.",
    ],
    boundary:
      "The right safeguards and process are still part of the discovery work.",
  },
  "bible-study": {
    number: "05 / BIBLE STUDY",
    status: "explore",
    title: "Let learning begin from the word already shared.",
    intro:
      "Bible study may grow from sermons, with materials and participation shaped around the church’s actual rhythm.",
    overview:
      "The church can discover how facilitators prepare or share study material and what participation should mean for each group.",
    example:
      "After a sermon, a facilitator could use an agreed study outline or resource link to guide a group and reflect on the participation the group finds meaningful.",
    points: [
      "Explore sermon-based study materials.",
      "Shape facilitator and group needs together.",
      "Keep learning activity distinct from service attendance.",
    ],
    boundary:
      "A useful learning journey needs the church’s own language and practice, not a fixed template.",
  },
  school: {
    number: "06 / CARE SCHOOL",
    status: "explore",
    title: "A considered path for care and readiness.",
    intro:
      "A future care-school experience could help the church organise learning topics, progress, readiness, and the next step.",
    overview:
      "This is an area to shape slowly with the people who lead it, keeping the experience compassionate and easy to understand.",
    example:
      "A coordinator may want to see where someone is in an agreed path and whether it is time to plan the next conversation or session.",
    points: [
      "Explore topics and learning paths.",
      "Consider progress and readiness together.",
      "Understand how booking or next steps should feel.",
    ],
    boundary: "The details are still being explored with the church.",
  },
  resources: {
    number: "07 / RESOURCES & ANNOUNCEMENTS",
    status: "explore",
    title: "Make the useful things easier to find.",
    intro:
      "Church Notes, sermon links, and announcements may become a simple shared place to return to what matters.",
    overview:
      "The first idea is to organise existing material and links, then learn who needs to see them and how the church wants to keep them current.",
    example:
      "After a gathering, someone could find an approved sermon-audio link or a current announcement without replacing the church’s familiar communication channels.",
    points: [
      "Bring useful notes and sermon links together.",
      "Explore a simple rhythm for announcements.",
      "Decide the right audience with the church.",
    ],
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
        <p>${status.note} · Still in discovery</p>
      </aside>
    </div>
    <div class="detail-columns">
      <div>
        <h2>What this could make easier</h2>
        <p>${feature.overview}</p>
        <div class="example-box"><p class="eyebrow">Everyday example</p><p>${feature.example}</p></div>
        <div class="boundary-note"><strong>A clear boundary</strong><p>${feature.boundary}</p></div>
      </div>
      <section class="capability-section" aria-labelledby="capability-title">
        <h2 id="capability-title">What to explore</h2>
        <ul class="detail-list">${feature.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      </section>
    </div>`;

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
